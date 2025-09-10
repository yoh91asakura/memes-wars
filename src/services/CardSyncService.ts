/**
 * CardSyncService - Service for backend synchronization
 * 
 * This service handles offline/online synchronization, conflict resolution,
 * and real-time sync status tracking with robust error handling.
 */

import type { SyncStatus, SyncChange, SyncConflict, ConflictResolution } from '@/models/SyncStatus'
import { SyncStatusFactory, ConflictResolver } from '@/models/SyncStatus'
import { apiClient } from './BaseAPIClient'
import { CardUtils } from '../utils/cardUtils'
import { openDB, IDBPDatabase } from 'idb'

export interface SyncOptions {
  onProgress?: (progress: {
    completed: number
    total: number
    percentage: number
    currentItem?: string
  }) => void
  retryAttempts?: number
  exponentialBackoff?: boolean
  batchSize?: number
  timeout?: number
}

export interface SyncResult {
  syncStatus: 'success' | 'partial' | 'conflict' | 'deferred'
  syncedItems: Record<string, number>
  failedItems?: Record<string, string[]>
  conflicts: SyncConflict[]
  errors: string[]
  serverTimestamp: string
  reason?: string
}

export interface ConflictResolutionResult {
  resolution: ConflictResolution
  resolvedData: any
  reason: string
}

// IndexedDB database interface
interface SyncDatabase {
  changes: SyncChange[]
  status: SyncStatus[]
  conflicts: SyncConflict[]
}

export class CardSyncService {
  private dbName = 'CardSyncDB'
  private dbVersion = 1
  private db: IDBPDatabase<SyncDatabase> | null = null
  
  constructor() {
    this.initializeDatabase()
  }
  
  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await openDB<SyncDatabase>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Changes store
          if (!db.objectStoreNames.contains('changes')) {
            const changesStore = db.createObjectStore('changes', { keyPath: 'id' })
            changesStore.createIndex('playerId', 'playerId')
            changesStore.createIndex('timestamp', 'timestamp')
            changesStore.createIndex('status', 'status')
          }
          
          // Status store
          if (!db.objectStoreNames.contains('status')) {
            const statusStore = db.createObjectStore('status', { keyPath: 'playerId' })
          }
          
          // Conflicts store
          if (!db.objectStoreNames.contains('conflicts')) {
            const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'itemId' })
            conflictsStore.createIndex('playerId', 'playerId')
            conflictsStore.createIndex('resolved', 'resolved')
          }
        },
      })
    } catch (error) {
      console.error('Failed to initialize sync database:', error)
      throw error
    }
  }
  
  /**
   * Queue a change for synchronization
   */
  async queueChange(playerId: string, change: Omit<SyncChange, 'id' | 'status' | 'attempts'>): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase()
    }
    
    const syncChange: SyncChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      attempts: 0,
      ...change
    }
    
    try {
      await this.db!.add('changes', syncChange)
      
      // Update sync status
      await this.updateSyncStatusWithChange(playerId, syncChange)
      
    } catch (error) {
      console.error('Failed to queue change:', error)
      throw error
    }
  }
  
  /**
   * Get all queued changes for a player
   */
  async getQueuedChanges(playerId: string): Promise<SyncChange[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }
    
    try {
      const tx = this.db!.transaction('changes', 'readonly')
      const index = tx.store.index('playerId')
      const changes = await index.getAll(playerId)
      
      return changes.filter(change => change.status === 'pending')
    } catch (error) {
      console.error('Failed to get queued changes:', error)
      return []
    }
  }
  
  /**
   * Synchronize changes with server
   */
  async syncChanges(playerId: string, options: SyncOptions = {}): Promise<SyncResult> {
    // Check if online
    if (!navigator.onLine) {
      return {
        syncStatus: 'deferred',
        syncedItems: {},
        conflicts: [],
        errors: [],
        serverTimestamp: new Date().toISOString(),
        reason: 'Device is offline'
      }
    }
    
    try {
      // Update sync status to syncing
      await this.updateSyncStatusForOperation(playerId, 'sync', 'Synchronizing changes...')
      
      // Get pending changes
      const pendingChanges = await this.getQueuedChanges(playerId)
      
      if (pendingChanges.length === 0) {
        return {
          syncStatus: 'success',
          syncedItems: {},
          conflicts: [],
          errors: [],
          serverTimestamp: new Date().toISOString()
        }
      }
      
      // Process changes in batches
      const batchSize = options.batchSize || 10
      const batches = this.createBatches(pendingChanges, batchSize)
      
      let totalSynced = 0
      let totalErrors: string[] = []
      let allConflicts: SyncConflict[] = []
      const syncedItemTypes: Record<string, number> = {}
      const failedItemTypes: Record<string, string[]> = {}
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        // Report progress
        if (options.onProgress) {
          options.onProgress({
            completed: i * batchSize,
            total: pendingChanges.length,
            percentage: (i / batches.length) * 100,
            currentItem: `Processing batch ${i + 1} of ${batches.length}`
          })
        }
        
        try {
          const batchResult = await this.syncBatch(playerId, batch, options)
          
          totalSynced += batchResult.syncedCount
          totalErrors.push(...batchResult.errors)
          allConflicts.push(...batchResult.conflicts)
          
          // Update counters
          Object.entries(batchResult.syncedByType).forEach(([type, count]) => {
            syncedItemTypes[type] = (syncedItemTypes[type] || 0) + count
          })
          
          Object.entries(batchResult.failedByType).forEach(([type, items]) => {
            if (!failedItemTypes[type]) failedItemTypes[type] = []
            failedItemTypes[type].push(...items)
          })
          
        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error)
          totalErrors.push(`Batch ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      // Final progress report
      if (options.onProgress) {
        options.onProgress({
          completed: pendingChanges.length,
          total: pendingChanges.length,
          percentage: 100,
          currentItem: 'Sync completed'
        })
      }
      
      // Determine overall sync status
      let syncStatus: SyncResult['syncStatus'] = 'success'
      if (allConflicts.length > 0) {
        syncStatus = 'conflict'
      } else if (totalErrors.length > 0) {
        syncStatus = 'partial'
      }
      
      // Update sync status
      await this.updateSyncStatusWithResult(playerId, {
        success: syncStatus === 'success',
        syncedItems: totalSynced,
        conflicts: allConflicts,
        errors: totalErrors,
        syncTime: 1000, // Would be calculated from actual time
        transferTime: 500
      })
      
      return {
        syncStatus,
        syncedItems: syncedItemTypes,
        failedItems: Object.keys(failedItemTypes).length > 0 ? failedItemTypes : undefined,
        conflicts: allConflicts,
        errors: totalErrors,
        serverTimestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Sync failed:', error)
      
      await this.updateSyncStatusWithResult(playerId, {
        success: false,
        syncedItems: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        syncTime: 0,
        transferTime: 0
      })
      
      throw error
    }
  }
  
  /**
   * Sync a batch of changes
   */
  private async syncBatch(playerId: string, changes: SyncChange[], options: SyncOptions): Promise<{
    syncedCount: number
    syncedByType: Record<string, number>
    failedByType: Record<string, string[]>
    conflicts: SyncConflict[]
    errors: string[]
  }> {
    try {
      CardUtils.Validation.validatePlayerId(playerId)
      
      const response = await apiClient.post(`/cards/collection/${playerId}/sync`, {
        changes: changes.map(change => ({
          type: change.type,
          itemType: change.itemType,
          itemId: change.itemId,
          data: change.data,
          previousData: change.previousData,
          timestamp: change.timestamp,
          clientId: change.clientId
        })),
        clientTimestamp: new Date().toISOString()
      }, {
        timeout: options.timeout,
        signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined
      })
      
      if (!response.success) {
        if (response.error?.code === 'CONFLICT') {
          // Handle conflicts
          return {
            syncedCount: 0,
            syncedByType: {},
            failedByType: {},
            conflicts: response.data?.conflicts || [],
            errors: []
          }
        }
        
        throw new Error(response.error?.message || 'Sync request failed')
      }
      
      const result = response.data
      
      // Mark changes as synced
      await this.markChangesAsSynced(changes.map(c => c.id))
      
      return {
        syncedCount: result.syncedItems?.total || changes.length,
        syncedByType: result.syncedItems || { cards: changes.length },
        failedByType: result.failedItems || {},
        conflicts: result.conflicts || [],
        errors: result.errors || []
      }
      
    } catch (error) {
      // Mark changes as failed
      await this.markChangesAsFailed(changes.map(c => c.id), error instanceof Error ? error.message : 'Unknown error')
      
      return {
        syncedCount: 0,
        syncedByType: {},
        failedByType: { error: changes.map(c => c.itemId) },
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }
  
  /**
   * Resolve a conflict
   */
  async resolveConflict(
    playerId: string,
    conflict: SyncConflict,
    resolution: ConflictResolution,
    customData?: any
  ): Promise<ConflictResolutionResult> {
    try {
      let resolvedData: any
      let reason: string
      
      if (resolution === 'manual' && customData) {
        resolvedData = customData
        reason = 'Manually resolved by user'
      } else {
        const autoResolution = ConflictResolver.resolve(conflict, resolution)
        resolvedData = autoResolution.resolvedData
        reason = autoResolution.reason
      }
      
      // Send resolution to server
      const response = await apiClient.post(`/conflicts/${conflict.itemId}/resolve`, {
        resolution,
        resolvedData,
        playerId
      })
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Conflict resolution failed')
      }
      
      // Update local conflict status
      await this.markConflictAsResolved(conflict.itemId, resolution, playerId)
      
      return {
        resolution,
        resolvedData,
        reason
      }
      
    } catch (error) {
      console.error('Conflict resolution failed:', error)
      throw error
    }
  }
  
  /**
   * Get current sync status
   */
  async getSyncStatus(playerId: string): Promise<SyncStatus> {
    if (!this.db) {
      await this.initializeDatabase()
    }
    
    try {
      const status = await this.db!.get('status', playerId)
      
      if (!status) {
        const newStatus = SyncStatusFactory.createInitial(playerId)
        await this.db!.put('status', newStatus)
        return newStatus
      }
      
      return status
    } catch (error) {
      console.error('Failed to get sync status:', error)
      return SyncStatusFactory.createInitial(playerId)
    }
  }
  
  /**
   * Set conflict resolution preference
   */
  async setConflictPreference(playerId: string, preference: ConflictResolution): Promise<void> {
    const status = await this.getSyncStatus(playerId)
    
    const updatedStatus = {
      ...status,
      conflictResolutionStrategy: preference,
      lastUpdated: new Date().toISOString()
    }
    
    await this.db!.put('status', updatedStatus)
  }
  
  /**
   * Helper methods
   */
  
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    
    return batches
  }
  
  private async markChangesAsSynced(changeIds: string[]): Promise<void> {
    if (!this.db) return
    
    const tx = this.db.transaction('changes', 'readwrite')
    
    for (const id of changeIds) {
      const change = await tx.store.get(id)
      if (change) {
        change.status = 'synced'
        await tx.store.put(change)
      }
    }
    
    await tx.done
  }
  
  private async markChangesAsFailed(changeIds: string[], error: string): Promise<void> {
    if (!this.db) return
    
    const tx = this.db.transaction('changes', 'readwrite')
    
    for (const id of changeIds) {
      const change = await tx.store.get(id)
      if (change) {
        change.status = 'failed'
        change.error = error
        change.attempts += 1
        change.lastAttempt = new Date().toISOString()
        await tx.store.put(change)
      }
    }
    
    await tx.done
  }
  
  private async markConflictAsResolved(itemId: string, resolution: ConflictResolution, resolvedBy: string): Promise<void> {
    if (!this.db) return
    
    const conflict = await this.db.get('conflicts', itemId)
    if (conflict) {
      conflict.resolved = true
      conflict.resolution = resolution
      conflict.resolvedAt = new Date().toISOString()
      conflict.resolvedBy = resolvedBy
      
      await this.db.put('conflicts', conflict)
    }
  }
  
  private async updateSyncStatusWithChange(playerId: string, change: SyncChange): Promise<void> {
    const status = await this.getSyncStatus(playerId)
    const updatedStatus = SyncStatusFactory.addChange(status, change)
    await this.db!.put('status', updatedStatus)
  }
  
  private async updateSyncStatusWithResult(playerId: string, result: {
    success: boolean
    syncedItems: number
    conflicts: SyncConflict[]
    errors: string[]
    syncTime: number
    transferTime: number
  }): Promise<void> {
    const status = await this.getSyncStatus(playerId)
    const updatedStatus = SyncStatusFactory.updateWithSyncResult(status, result)
    await this.db!.put('status', updatedStatus)
  }
  
  private async updateSyncStatusForOperation(playerId: string, operationType: string, description: string): Promise<void> {
    const status = await this.getSyncStatus(playerId)
    
    const updatedStatus = {
      ...status,
      status: 'syncing' as const,
      currentOperation: {
        type: operationType as any,
        startedAt: new Date().toISOString(),
        progress: 0,
        currentItem: description
      },
      lastUpdated: new Date().toISOString()
    }
    
    await this.db!.put('status', updatedStatus)
  }
  
  /**
   * Public utility methods
   */
  
  public async clearSyncData(playerId: string): Promise<void> {
    if (!this.db) return
    
    const tx = this.db.transaction(['changes', 'conflicts'], 'readwrite')
    
    // Clear all changes for player
    const changesIndex = tx.objectStore('changes').index('playerId')
    const changes = await changesIndex.getAllKeys(playerId)
    
    for (const key of changes) {
      await tx.objectStore('changes').delete(key)
    }
    
    // Clear all conflicts for player
    const conflictsIndex = tx.objectStore('conflicts').index('playerId')
    const conflicts = await conflictsIndex.getAllKeys(playerId)
    
    for (const key of conflicts) {
      await tx.objectStore('conflicts').delete(key)
    }
    
    await tx.done
    
    // Reset sync status
    const newStatus = SyncStatusFactory.createInitial(playerId)
    await this.db.put('status', newStatus)
  }
  
  public async exportSyncData(playerId: string): Promise<{
    changes: SyncChange[]
    conflicts: SyncConflict[]
    status: SyncStatus
  }> {
    const [changes, conflicts, status] = await Promise.all([
      this.getQueuedChanges(playerId),
      this.getUnresolvedConflicts(playerId),
      this.getSyncStatus(playerId)
    ])
    
    return { changes, conflicts, status }
  }
  
  private async getUnresolvedConflicts(playerId: string): Promise<SyncConflict[]> {
    if (!this.db) return []
    
    const tx = this.db.transaction('conflicts', 'readonly')
    const index = tx.store.index('playerId')
    const conflicts = await index.getAll(playerId)
    
    return conflicts.filter(conflict => !conflict.resolved)
  }
}