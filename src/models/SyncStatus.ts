/**
 * SyncStatus Model with Conflict Resolution
 * 
 * This model manages synchronization between client and server,
 * including conflict detection, resolution strategies, and status tracking.
 */

export type SyncStatusType = 'synced' | 'pending' | 'syncing' | 'error' | 'offline' | 'conflict'
export type ConflictResolution = 'client_wins' | 'server_wins' | 'merge' | 'manual' | 'latest_timestamp' | 'user_preference'
export type SyncItemType = 'card' | 'filter' | 'collection' | 'image' | 'settings'

export interface SyncConflict {
  itemId: string
  itemType: SyncItemType
  conflictType: 'data' | 'deletion' | 'version'
  
  // Conflict data
  clientVersion: number
  serverVersion: number
  clientData: any
  serverData: any
  clientTimestamp: string
  serverTimestamp: string
  
  // Resolution options
  resolutionOptions: ConflictResolution[]
  recommendedResolution?: ConflictResolution
  
  // Status
  resolved: boolean
  resolution?: ConflictResolution
  resolvedAt?: string
  resolvedBy?: string
  
  // Metadata
  detectedAt: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

export interface SyncChange {
  id: string
  type: 'create' | 'update' | 'delete'
  itemType: SyncItemType
  itemId: string
  
  // Change data
  data: any
  previousData?: any
  
  // Timestamps
  timestamp: string
  clientId: string
  
  // Status
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflicted'
  attempts: number
  lastAttempt?: string
  
  // Error handling
  error?: string
  retryAfter?: string
  
  // Metadata
  source: 'user' | 'system' | 'auto'
  priority: 'low' | 'normal' | 'high'
  batchId?: string
}

export interface SyncBatch {
  id: string
  changes: SyncChange[]
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial'
  startedAt?: string
  completedAt?: string
  
  // Progress
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  
  // Performance
  transferTime: number
  processingTime: number
  totalTime: number
  
  // Results
  conflicts: SyncConflict[]
  errors: string[]
  warnings: string[]
}

export interface SyncStatistics {
  // Counters
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  conflictsResolved: number
  
  // Timing
  averageSyncTime: number
  lastSuccessfulSync?: string
  lastFailedSync?: string
  
  // Data volume
  totalDataSynced: number // bytes
  totalItemsSynced: number
  
  // By item type
  itemTypeStats: Record<SyncItemType, {
    synced: number
    failed: number
    conflicts: number
    lastSync?: string
  }>
  
  // Performance metrics
  averageTransferSpeed: number // bytes/second
  peakTransferSpeed: number
  averageBatchSize: number
}

export interface SyncStatus {
  // Basic status
  playerId: string
  status: SyncStatusType
  
  // Current state
  pendingChanges: number
  lastSync?: string
  lastFullSync?: string
  nextScheduledSync?: string
  
  // Current operation
  currentOperation?: {
    type: 'sync' | 'conflict_resolution' | 'full_sync'
    startedAt: string
    progress: number // 0-100
    estimatedTimeRemaining?: number
    currentItem?: string
  }
  
  // Conflicts
  conflicts: SyncConflict[]
  unresolvedConflicts: number
  
  // Connection
  connectionStatus: 'online' | 'offline' | 'unstable'
  serverReachable: boolean
  lastServerContact?: string
  
  // Queue
  syncQueue: SyncChange[]
  queueSize: number
  oldestPendingChange?: string
  
  // Errors
  lastError?: string
  lastErrorAt?: string
  consecutiveFailures: number
  
  // Configuration
  autoSyncEnabled: boolean
  syncInterval: number // seconds
  conflictResolutionStrategy: ConflictResolution
  retryAttempts: number
  
  // Statistics
  statistics: SyncStatistics
  
  // Version control
  clientVersion: string
  serverVersion?: string
  protocolVersion: string
  
  // Metadata
  lastUpdated: string
  syncSessionId?: string
}

/**
 * Sync Status Factory Functions
 */
export class SyncStatusFactory {
  /**
   * Create initial sync status for new player
   */
  static createInitial(playerId: string): SyncStatus {
    const now = new Date().toISOString()
    
    return {
      playerId,
      status: 'synced',
      pendingChanges: 0,
      conflicts: [],
      unresolvedConflicts: 0,
      connectionStatus: 'online',
      serverReachable: true,
      syncQueue: [],
      queueSize: 0,
      consecutiveFailures: 0,
      autoSyncEnabled: true,
      syncInterval: 300, // 5 minutes
      conflictResolutionStrategy: 'latest_timestamp',
      retryAttempts: 3,
      statistics: this.createInitialStatistics(),
      clientVersion: '1.0.0',
      protocolVersion: '1.0',
      lastUpdated: now
    }
  }

  /**
   * Update status with new sync result
   */
  static updateWithSyncResult(
    status: SyncStatus,
    result: {
      success: boolean
      syncedItems: number
      conflicts: SyncConflict[]
      errors: string[]
      syncTime: number
      transferTime: number
    }
  ): SyncStatus {
    const now = new Date().toISOString()
    
    const newStatistics = this.updateStatistics(status.statistics, result)
    
    return {
      ...status,
      status: result.success ? 'synced' : (result.conflicts.length > 0 ? 'conflict' : 'error'),
      lastSync: now,
      pendingChanges: Math.max(0, status.pendingChanges - result.syncedItems),
      conflicts: [...status.conflicts, ...result.conflicts],
      unresolvedConflicts: status.unresolvedConflicts + result.conflicts.length,
      lastError: result.errors.length > 0 ? result.errors[0] : undefined,
      lastErrorAt: result.errors.length > 0 ? now : status.lastErrorAt,
      consecutiveFailures: result.success ? 0 : status.consecutiveFailures + 1,
      statistics: newStatistics,
      lastUpdated: now,
      currentOperation: undefined
    }
  }

  /**
   * Add change to sync queue
   */
  static addChange(status: SyncStatus, change: SyncChange): SyncStatus {
    const updatedQueue = [...status.syncQueue, change]
    
    return {
      ...status,
      status: status.status === 'synced' ? 'pending' : status.status,
      pendingChanges: status.pendingChanges + 1,
      syncQueue: updatedQueue,
      queueSize: updatedQueue.length,
      oldestPendingChange: status.oldestPendingChange || change.timestamp,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Remove changes from sync queue
   */
  static removeChanges(status: SyncStatus, changeIds: string[]): SyncStatus {
    const updatedQueue = status.syncQueue.filter(change => !changeIds.includes(change.id))
    
    return {
      ...status,
      syncQueue: updatedQueue,
      queueSize: updatedQueue.length,
      pendingChanges: Math.max(0, status.pendingChanges - changeIds.length),
      oldestPendingChange: updatedQueue.length > 0 ? updatedQueue[0].timestamp : undefined,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Update connection status
   */
  static updateConnectionStatus(
    status: SyncStatus,
    connectionStatus: SyncStatus['connectionStatus'],
    serverReachable: boolean
  ): SyncStatus {
    return {
      ...status,
      connectionStatus,
      serverReachable,
      lastServerContact: serverReachable ? new Date().toISOString() : status.lastServerContact,
      status: connectionStatus === 'offline' ? 'offline' : status.status,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Resolve conflict
   */
  static resolveConflict(
    status: SyncStatus,
    conflictId: string,
    resolution: ConflictResolution,
    resolvedBy: string
  ): SyncStatus {
    const updatedConflicts = status.conflicts.map(conflict => 
      conflict.itemId === conflictId
        ? {
            ...conflict,
            resolved: true,
            resolution,
            resolvedAt: new Date().toISOString(),
            resolvedBy
          }
        : conflict
    )
    
    const unresolvedCount = updatedConflicts.filter(c => !c.resolved).length
    
    return {
      ...status,
      conflicts: updatedConflicts,
      unresolvedConflicts: unresolvedCount,
      status: unresolvedCount === 0 && status.status === 'conflict' ? 'pending' : status.status,
      statistics: {
        ...status.statistics,
        conflictsResolved: status.statistics.conflictsResolved + 1
      },
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Create initial statistics
   */
  private static createInitialStatistics(): SyncStatistics {
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      averageSyncTime: 0,
      totalDataSynced: 0,
      totalItemsSynced: 0,
      itemTypeStats: {
        card: { synced: 0, failed: 0, conflicts: 0 },
        filter: { synced: 0, failed: 0, conflicts: 0 },
        collection: { synced: 0, failed: 0, conflicts: 0 },
        image: { synced: 0, failed: 0, conflicts: 0 },
        settings: { synced: 0, failed: 0, conflicts: 0 }
      },
      averageTransferSpeed: 0,
      peakTransferSpeed: 0,
      averageBatchSize: 0
    }
  }

  /**
   * Update statistics with new sync result
   */
  private static updateStatistics(
    stats: SyncStatistics,
    result: {
      success: boolean
      syncedItems: number
      syncTime: number
      transferTime: number
    }
  ): SyncStatistics {
    const totalSyncs = stats.totalSyncs + 1
    const successfulSyncs = stats.successfulSyncs + (result.success ? 1 : 0)
    const failedSyncs = stats.failedSyncs + (result.success ? 0 : 1)
    
    const averageSyncTime = (stats.averageSyncTime * stats.totalSyncs + result.syncTime) / totalSyncs
    const totalItemsSynced = stats.totalItemsSynced + result.syncedItems
    
    const transferSpeed = result.transferTime > 0 ? (result.syncedItems * 1000) / result.transferTime : 0
    const peakTransferSpeed = Math.max(stats.peakTransferSpeed, transferSpeed)
    
    return {
      ...stats,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      averageSyncTime,
      lastSuccessfulSync: result.success ? new Date().toISOString() : stats.lastSuccessfulSync,
      lastFailedSync: !result.success ? new Date().toISOString() : stats.lastFailedSync,
      totalItemsSynced,
      peakTransferSpeed,
      averageTransferSpeed: (stats.averageTransferSpeed * stats.totalSyncs + transferSpeed) / totalSyncs,
      averageBatchSize: (stats.averageBatchSize * stats.totalSyncs + result.syncedItems) / totalSyncs
    }
  }
}

/**
 * Conflict Resolution Functions
 */
export class ConflictResolver {
  /**
   * Automatically resolve conflict based on strategy
   */
  static resolve(conflict: SyncConflict, strategy: ConflictResolution): {
    resolution: ConflictResolution
    resolvedData: any
    reason: string
  } {
    switch (strategy) {
      case 'client_wins':
        return {
          resolution: 'client_wins',
          resolvedData: conflict.clientData,
          reason: 'Client data preferred by strategy'
        }
        
      case 'server_wins':
        return {
          resolution: 'server_wins',
          resolvedData: conflict.serverData,
          reason: 'Server data preferred by strategy'
        }
        
      case 'latest_timestamp':
        const clientTime = new Date(conflict.clientTimestamp)
        const serverTime = new Date(conflict.serverTimestamp)
        
        if (clientTime > serverTime) {
          return {
            resolution: 'client_wins',
            resolvedData: conflict.clientData,
            reason: 'Client data is newer'
          }
        } else {
          return {
            resolution: 'server_wins',
            resolvedData: conflict.serverData,
            reason: 'Server data is newer'
          }
        }
        
      case 'merge':
        return {
          resolution: 'merge',
          resolvedData: this.mergeData(conflict.clientData, conflict.serverData),
          reason: 'Data merged automatically'
        }
        
      default:
        return {
          resolution: 'manual',
          resolvedData: null,
          reason: 'Manual resolution required'
        }
    }
  }

  /**
   * Merge conflicting data (basic implementation)
   */
  private static mergeData(clientData: any, serverData: any): any {
    if (typeof clientData !== 'object' || typeof serverData !== 'object') {
      return clientData // Can't merge non-objects
    }
    
    const merged = { ...serverData }
    
    // Merge object properties
    Object.keys(clientData).forEach(key => {
      if (clientData[key] !== undefined && clientData[key] !== null) {
        if (typeof clientData[key] === 'object' && typeof serverData[key] === 'object') {
          merged[key] = this.mergeData(clientData[key], serverData[key])
        } else {
          // For arrays, prefer client data for user preferences
          if (Array.isArray(clientData[key])) {
            merged[key] = clientData[key]
          } else {
            // For primitives, take the most recent non-null value
            merged[key] = clientData[key]
          }
        }
      }
    })
    
    return merged
  }

  /**
   * Detect potential conflicts before they occur
   */
  static detectPotentialConflicts(
    changes: SyncChange[],
    serverData: Record<string, any>
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = []
    
    changes.forEach(change => {
      const serverItem = serverData[change.itemId]
      
      if (serverItem && change.type === 'update') {
        // Check if server version is newer
        if (serverItem.version > (change.previousData?.version || 0)) {
          conflicts.push({
            itemId: change.itemId,
            itemType: change.itemType,
            conflictType: 'version',
            clientVersion: change.previousData?.version || 0,
            serverVersion: serverItem.version,
            clientData: change.data,
            serverData: serverItem,
            clientTimestamp: change.timestamp,
            serverTimestamp: serverItem.updatedAt || serverItem.createdAt,
            resolutionOptions: ['client_wins', 'server_wins', 'merge', 'latest_timestamp'],
            recommendedResolution: 'latest_timestamp',
            resolved: false,
            detectedAt: new Date().toISOString(),
            severity: 'medium',
            description: `Version conflict: client v${change.previousData?.version || 0} vs server v${serverItem.version}`
          })
        }
      }
      
      if (!serverItem && change.type === 'update') {
        conflicts.push({
          itemId: change.itemId,
          itemType: change.itemType,
          conflictType: 'deletion',
          clientVersion: 0,
          serverVersion: 0,
          clientData: change.data,
          serverData: null,
          clientTimestamp: change.timestamp,
          serverTimestamp: new Date().toISOString(),
          resolutionOptions: ['client_wins'],
          recommendedResolution: 'client_wins',
          resolved: false,
          detectedAt: new Date().toISOString(),
          severity: 'low',
          description: 'Item was deleted on server but updated on client'
        })
      }
    })
    
    return conflicts
  }
}

/**
 * Sync Utility Functions
 */
export class SyncUtils {
  /**
   * Check if sync is needed
   */
  static needsSync(status: SyncStatus): boolean {
    return status.pendingChanges > 0 || status.unresolvedConflicts > 0
  }

  /**
   * Check if full sync is needed
   */
  static needsFullSync(status: SyncStatus, fullSyncInterval: number = 24 * 60 * 60 * 1000): boolean {
    if (!status.lastFullSync) return true
    
    const timeSinceLastFullSync = Date.now() - new Date(status.lastFullSync).getTime()
    return timeSinceLastFullSync > fullSyncInterval
  }

  /**
   * Calculate next sync time
   */
  static calculateNextSyncTime(status: SyncStatus): Date {
    const now = new Date()
    const intervalMs = status.syncInterval * 1000
    
    // If there are pending changes, sync sooner
    if (status.pendingChanges > 0) {
      const urgentInterval = Math.min(status.syncInterval, 60) * 1000 // Max 1 minute
      return new Date(now.getTime() + urgentInterval)
    }
    
    // If there were recent failures, use exponential backoff
    if (status.consecutiveFailures > 0) {
      const backoffMs = Math.min(intervalMs * Math.pow(2, status.consecutiveFailures), 30 * 60 * 1000)
      return new Date(now.getTime() + backoffMs)
    }
    
    return new Date(now.getTime() + intervalMs)
  }

  /**
   * Get human-readable status description
   */
  static getStatusDescription(status: SyncStatus): string {
    switch (status.status) {
      case 'synced':
        return status.pendingChanges > 0 ? 'Changes pending sync' : 'All changes synced'
      case 'pending':
        return `${status.pendingChanges} changes waiting to sync`
      case 'syncing':
        const progress = status.currentOperation?.progress || 0
        return `Syncing... ${progress}% complete`
      case 'error':
        return `Sync failed: ${status.lastError || 'Unknown error'}`
      case 'offline':
        return 'Offline - changes will sync when connected'
      case 'conflict':
        return `${status.unresolvedConflicts} conflicts need resolution`
      default:
        return 'Unknown status'
    }
  }

  /**
   * Get sync health score (0-100)
   */
  static getSyncHealthScore(status: SyncStatus): number {
    let score = 100
    
    // Deduct for pending changes
    score -= Math.min(status.pendingChanges * 2, 30)
    
    // Deduct for unresolved conflicts
    score -= Math.min(status.unresolvedConflicts * 10, 40)
    
    // Deduct for consecutive failures
    score -= Math.min(status.consecutiveFailures * 5, 25)
    
    // Deduct for offline status
    if (status.connectionStatus === 'offline') {
      score -= 20
    } else if (status.connectionStatus === 'unstable') {
      score -= 10
    }
    
    // Deduct for old pending changes
    if (status.oldestPendingChange) {
      const ageMs = Date.now() - new Date(status.oldestPendingChange).getTime()
      const ageHours = ageMs / (1000 * 60 * 60)
      if (ageHours > 24) {
        score -= 15
      } else if (ageHours > 1) {
        score -= 5
      }
    }
    
    return Math.max(0, score)
  }

  /**
   * Format sync statistics for display
   */
  static formatStatistics(stats: SyncStatistics): Record<string, string> {
    const successRate = stats.totalSyncs > 0 
      ? ((stats.successfulSyncs / stats.totalSyncs) * 100).toFixed(1)
      : '0'
    
    return {
      'Success Rate': `${successRate}%`,
      'Total Syncs': stats.totalSyncs.toLocaleString(),
      'Items Synced': stats.totalItemsSynced.toLocaleString(),
      'Conflicts Resolved': stats.conflictsResolved.toLocaleString(),
      'Average Sync Time': `${stats.averageSyncTime.toFixed(0)}ms`,
      'Data Transferred': this.formatBytes(stats.totalDataSynced),
      'Average Speed': `${this.formatBytes(stats.averageTransferSpeed)}/s`
    }
  }

  /**
   * Format bytes for display
   */
  private static formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
}