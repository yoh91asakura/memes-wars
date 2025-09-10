/**
 * CardManagementService - Core service for card collection management
 * 
 * This service handles card collection loading, searching, sorting,
 * and metadata management with caching and performance optimization.
 */

import type { Card } from '@/models/Card'
import type { CardCollection, CollectionMetadata } from '@/models/CardCollection'
import { CollectionFactory, CollectionUtils } from '@/models/CardCollection'
import { indexedDBService } from './IndexedDBService'
import { apiClient } from './BaseAPIClient'
import { CardUtils } from '../utils/cardUtils'
import { cardSearchIndex, cardWorkerPool, debounce, processInChunks, measurePerformance } from '../utils/performance'
import Fuse from 'fuse.js'

export interface LoadCollectionOptions {
  page?: number
  limit?: number
  includeMetadata?: boolean
  includeAll?: boolean
  cacheTtl?: number
  forceRefresh?: boolean
  offlineMode?: boolean
}

export interface SearchOptions {
  maxResults?: number
  includeAbilities?: boolean
  includeDescription?: boolean
  threshold?: number
  sortBy?: 'relevance' | 'name' | 'rarity' | 'luck'
}

export interface SearchResult {
  cards: Array<{
    item: Card
    score: number
    relevanceScore: number
    matches?: Array<{
      field: string
      value: string
      indices: number[][]
    }>
  }>
  totalMatches: number
  searchTerm: string
  executionTime: number
  options: SearchOptions
}

export interface CollectionStatistics {
  totalCards: number
  byRarity: Record<string, number>
  byType: Record<string, number>
  byFamily: Record<string, number>
  averageLuck: number
  totalDeckHP: number
  strongestCard: string
  mostUsedCard: string
  newestCard: string
  completionPercentage: number
}

// Cache implementation for performance
class CollectionCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 min default TTL
    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      timestamp: Date.now(),
      ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    )
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

export class CardManagementService {
  private cache = new CollectionCache()
  private isOnline = navigator.onLine
  private debouncedSearch = debounce(this.performSearch.bind(this), 300)
  private debouncedFilter = debounce(this.performFilter.bind(this), 150)
  private searchIndexBuilt = false

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineChanges()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }
  
  /**
   * Load player's card collection with optional pagination and offline support
   */
  async loadCollection(
    playerId: string,
    options: LoadCollectionOptions = {}
  ): Promise<CardCollection> {
    CardUtils.Validation.validatePlayerId(playerId)
    
    const cacheKey = `collection-${playerId}-${JSON.stringify(options)}`
    const cached = this.cache.get<CardCollection>(cacheKey)
    
    if (cached && !options.forceRefresh) {
      return cached
    }
    
    // Try IndexedDB first (offline or as fallback)
    if (options.offlineMode || !this.isOnline) {
      try {
        const offlineCollection = await indexedDBService.getCollection(playerId)
        if (offlineCollection) {
          this.cache.set(cacheKey, offlineCollection, options.cacheTtl || (5 * 60 * 1000))
          return offlineCollection
        }
      } catch (error) {
        console.warn('Failed to load from IndexedDB:', error)
      }
    }
    
    // If offline and no cached data, throw error
    if (!this.isOnline && !cached) {
      throw new Error('No internet connection and no offline data available')
    }
    
    try {
      const params = new URLSearchParams()
      
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.includeMetadata !== undefined) params.set('includeMetadata', options.includeMetadata.toString())
      if (options.includeAll) params.set('includeAll', 'true')
      
      const endpoint = `/cards/collection/${playerId}${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await apiClient.get(endpoint, {
        timeout: 30000 // 30 second timeout
      })
      
      if (!response.success) {
        if (response.error?.code === 'NOT_FOUND') {
          throw new Error('Player not found')
        }
        throw new Error(response.error?.message || 'Failed to load collection')
      }
      
      const data = response.data
      
      // Transform API response to CardCollection format
      const collection = this.transformApiResponse(playerId, data)
      
      // Save to IndexedDB for offline access
      if (this.isOnline) {
        try {
          await indexedDBService.saveCollection(collection)
        } catch (error) {
          console.warn('Failed to save to IndexedDB:', error)
        }
      }
      
      // Cache the result
      const ttl = options.cacheTtl || (5 * 60 * 1000) // 5 minutes default
      this.cache.set(cacheKey, collection, ttl)
      
      return collection
      
    } catch (error) {
      console.error('Failed to load collection from API:', error)
      
      // Fallback to IndexedDB if API fails
      try {
        const offlineCollection = await indexedDBService.getCollection(playerId)
        if (offlineCollection) {
          console.log('Falling back to offline data')
          return offlineCollection
        }
      } catch (offlineError) {
        console.warn('Offline fallback also failed:', offlineError)
      }
      
      throw error
    }
  }
  
  /**
   * Optimized search with debouncing and indexing for large collections
   */
  async searchCards(
    playerId: string,
    searchTerm: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    CardUtils.Validation.validatePlayerId(playerId)
    CardUtils.Validation.validateSearchTerm(searchTerm)
    
    if (!searchTerm?.trim()) {
      return {
        cards: [],
        totalMatches: 0,
        searchTerm: '',
        executionTime: 0,
        options
      }
    }

    // Load collection for search
    const collection = await this.loadCollection(playerId, { includeAll: true })
    
    // Use debounced search for performance
    return this.debouncedSearch(collection.cards, searchTerm, options)
  }

  /**
   * Perform the actual search operation (called by debounced version)
   */
  @measurePerformance('search_cards_performance')
  private async performSearch(
    cards: Card[],
    searchTerm: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const startTime = performance.now()
    
    try {
      // Build search index if not exists or collection is large
      if (!this.searchIndexBuilt || cards.length > 500) {
        await this.buildSearchIndex(cards)
      }

      // Use optimized indexed search for large collections
      if (cards.length > 100) {
        const results = await this.performIndexedSearch(cards, searchTerm, options)
        const executionTime = performance.now() - startTime
        
        return {
          cards: results.map(card => ({
            item: card,
            score: 0.5, // Indexed search doesn't provide detailed scores
            relevanceScore: 0.5,
            matches: []
          })),
          totalMatches: results.length,
          searchTerm: searchTerm.trim(),
          executionTime,
          options
        }
      }

      // Use Fuse.js for smaller collections (better accuracy)
      return this.performFuseSearch(cards, searchTerm, options)
      
    } catch (error) {
      console.error('Search failed:', error)
      throw error
    }
  }

  /**
   * Build search index for performance optimization
   */
  private async buildSearchIndex(cards: Card[]): Promise<void> {
    if (cards.length > 500) {
      // Use web worker for large collections
      try {
        await cardWorkerPool.execute('buildSearchIndex', { cards })
      } catch (error) {
        console.warn('Worker search index failed, falling back to main thread')
      }
    }
    
    cardSearchIndex.buildIndex(cards)
    this.searchIndexBuilt = true
  }

  /**
   * Perform indexed search for large collections
   */
  private async performIndexedSearch(
    cards: Card[],
    searchTerm: string,
    options: SearchOptions
  ): Promise<Card[]> {
    if (cards.length > 1000) {
      // Use web worker for very large collections
      try {
        const results = await cardWorkerPool.execute<Card[]>('searchCards', {
          cards,
          searchTerm
        })
        return results.slice(0, options.maxResults || 50)
      } catch (error) {
        console.warn('Worker search failed, falling back to indexed search')
      }
    }

    const results = cardSearchIndex.search(cards, searchTerm)
    return results.slice(0, options.maxResults || 50)
  }

  /**
   * Legacy Fuse.js search for smaller collections
   */
  private async performFuseSearch(
    cards: Card[],
    searchTerm: string,
    options: SearchOptions
  ): Promise<SearchResult> {
    const startTime = performance.now()
    
    // Configure Fuse.js for fuzzy search
    const fuseOptions = {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.2 },
        { name: 'reference', weight: 0.1 },
        ...(options.includeAbilities ? [{ name: 'abilities', weight: 0.3 }] : []),
        { name: 'family', weight: 0.1 }
      ],
      threshold: options.threshold || 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: true
    }
    
    const fuse = new Fuse(cards, fuseOptions)
    const fuseResults = fuse.search(searchTerm, {
      limit: options.maxResults || 50
    })
    
    // Transform results with relevance scoring
    const results = fuseResults.map(result => ({
      item: result.item,
      score: result.score || 1,
      relevanceScore: 1 - (result.score || 1), // Higher is better
      matches: result.matches?.map(match => ({
        field: match.key || '',
        value: match.value || '',
        indices: match.indices || []
      }))
    }))
    
    // Apply additional sorting if specified
    if (options.sortBy && options.sortBy !== 'relevance') {
      results.sort((a, b) => {
        switch (options.sortBy) {
          case 'name':
            return a.item.name.localeCompare(b.item.name)
          case 'rarity':
            return b.item.rarity - a.item.rarity // Higher rarity first
          case 'luck':
            return b.item.luck - a.item.luck // Higher luck first
          default:
            return 0
        }
      })
    }
    
    const executionTime = performance.now() - startTime
    
    return {
      cards: results,
      totalMatches: results.length,
      searchTerm: searchTerm.trim(),
      executionTime,
      options
    }
  }
  
  /**
   * Sort cards by specified criteria with performance optimization
   */
  @measurePerformance('sort_cards_performance')
  async sortCards(
    cards: Card[],
    sortBy: 'name' | 'rarity' | 'luck' | 'cost' | 'stackLevel' | 'createdAt' | 'goldReward' | 'family',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<Card[]> {
    const validSortFields = ['name', 'rarity', 'luck', 'cost', 'stackLevel', 'createdAt', 'goldReward', 'family']
    
    if (!validSortFields.includes(sortBy)) {
      throw new Error('Invalid sort field')
    }

    // Use worker for large collections
    if (cards.length > 1000) {
      try {
        return await cardWorkerPool.execute<Card[]>('sortCards', {
          cards,
          sortBy,
          sortOrder
        })
      } catch (error) {
        console.warn('Worker sort failed, falling back to main thread')
      }
    }
    
    return CollectionUtils.sort(cards, sortBy, sortOrder)
  }

  /**
   * Optimized filtering with debouncing for large collections
   */
  async filterCards(
    cards: Card[],
    filters: any[],
    options: { useWorkers?: boolean; chunkSize?: number } = {}
  ): Promise<Card[]> {
    return this.debouncedFilter(cards, filters, options)
  }

  /**
   * Perform the actual filter operation (called by debounced version)
   */
  @measurePerformance('filter_cards_performance')
  private async performFilter(
    cards: Card[],
    filters: any[],
    options: { useWorkers?: boolean; chunkSize?: number }
  ): Promise<Card[]> {
    if (!filters || filters.length === 0) {
      return cards
    }

    // Build search index if not exists for large collections
    if (!this.searchIndexBuilt && cards.length > 100) {
      await this.buildSearchIndex(cards)
    }

    // Use indexed filtering for large collections
    if (cards.length > 100) {
      return cardSearchIndex.filter(cards, filters)
    }

    // Use worker for very large collections
    if (options.useWorkers && cards.length > 1000) {
      try {
        return await cardWorkerPool.execute<Card[]>('filterCards', {
          cards,
          filters
        })
      } catch (error) {
        console.warn('Worker filter failed, falling back to main thread')
      }
    }

    // Process in chunks for large collections to prevent blocking
    if (cards.length > 500) {
      const chunkSize = options.chunkSize || 100
      return await processInChunks(
        cards,
        async (chunk) => this.filterChunk(chunk, filters),
        chunkSize
      )
    }

    // Simple filter for small collections
    return this.filterChunk(cards, filters)
  }

  /**
   * Filter a chunk of cards
   */
  private async filterChunk(cards: Card[], filters: any[]): Promise<Card[]> {
    return cards.filter(card => {
      return filters.every(filter => {
        if (!filter.active) return true

        const criteria = filter.criteria

        // Rarity filter
        if (criteria.rarities && criteria.rarities.length > 0) {
          const rarityName = this.getRarityName(card.rarity)
          if (!criteria.rarities.includes(rarityName)) return false
        }

        // Cost range filter
        if (criteria.costRange) {
          if (card.cost < (criteria.costRange.min || 0) || 
              card.cost > (criteria.costRange.max || Infinity)) {
            return false
          }
        }

        // Type filter
        if (criteria.types && criteria.types.length > 0) {
          if (!criteria.types.includes(card.type)) return false
        }

        // Text search filter
        if (criteria.textSearch) {
          const searchableText = (card.name + ' ' + card.description + ' ' + card.abilities.join(' ')).toLowerCase()
          if (!searchableText.includes(criteria.textSearch.toLowerCase())) {
            return false
          }
        }

        return true
      })
    })
  }

  /**
   * Batch process multiple operations for better performance
   */
  async batchProcessCards(
    cards: Card[],
    operations: Array<{
      type: 'filter' | 'search' | 'sort'
      params: any
    }>
  ): Promise<Card[]> {
    let processedCards = cards

    // Process operations in chunks to prevent blocking
    for (const operation of operations) {
      switch (operation.type) {
        case 'filter':
          processedCards = await this.filterCards(processedCards, operation.params.filters, operation.params.options)
          break
        case 'search':
          const searchResult = await this.performSearch(processedCards, operation.params.searchTerm, operation.params.options)
          processedCards = searchResult.cards.map(result => result.item)
          break
        case 'sort':
          processedCards = await this.sortCards(processedCards, operation.params.sortBy, operation.params.sortOrder)
          break
      }

      // Yield to event loop between operations
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    return processedCards
  }
  
  /**
   * Update card metadata
   */
  async updateCardMetadata(
    cardId: string,
    metadata: {
      customImageId?: string
      lastUsed?: string
      usageCount?: number
      userRating?: number
      tags?: string[]
      favorite?: boolean
      locked?: boolean
    }
  ): Promise<Card> {
    CardUtils.Validation.validateCardId(cardId)
    CardUtils.Validation.validateMetadata(metadata)
    
    try {
      const response = await apiClient.patch(`/cards/${cardId}/metadata`, metadata)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update card metadata')
      }
      
      const updatedCard = response.data
      
      // Invalidate related cache entries
      this.cache.invalidate(`collection`)
      this.cache.invalidate(`card-${cardId}`)
      
      return updatedCard
      
    } catch (error) {
      console.error('Failed to update card metadata:', error)
      throw error
    }
  }
  
  /**
   * Get comprehensive collection statistics
   */
  async getCollectionStatistics(playerId: string): Promise<CollectionStatistics> {
    if (!playerId?.trim()) {
      throw new Error('Invalid player ID')
    }
    
    const cacheKey = `stats-${playerId}`
    const cached = this.cache.get<CollectionStatistics>(cacheKey)
    
    if (cached) {
      return cached
    }
    
    try {
      const collection = await this.loadCollection(playerId, { includeAll: true })
      
      if (collection.cards.length === 0) {
        const emptyStats: CollectionStatistics = {
          totalCards: 0,
          byRarity: {},
          byType: {},
          byFamily: {},
          averageLuck: 0,
          totalDeckHP: 0,
          strongestCard: '',
          mostUsedCard: '',
          newestCard: '',
          completionPercentage: 0
        }
        
        this.cache.set(cacheKey, emptyStats, 2 * 60 * 1000) // 2 min cache for empty
        return emptyStats
      }
      
      const stats = this.calculateDetailedStatistics(collection.cards)
      
      // Cache for longer since stats are expensive to calculate
      this.cache.set(cacheKey, stats, 10 * 60 * 1000) // 10 minutes
      
      return stats
      
    } catch (error) {
      console.error('Failed to get collection statistics:', error)
      throw error
    }
  }
  
  /**
   * Batch update multiple cards
   */
  async batchUpdateCards(
    updates: Array<{
      cardId: string
      metadata: Record<string, any>
    }>
  ): Promise<Card[]> {
    if (!Array.isArray(updates) || updates.length === 0) {
      return []
    }
    
    // Validate all updates first
    updates.forEach(update => {
      CardUtils.Validation.validateCardId(update.cardId)
      CardUtils.Validation.validateMetadata(update.metadata)
    })
    
    try {
      const response = await apiClient.patch('/cards/batch-update', { updates })
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Batch update failed')
      }
      
      const updatedCards = response.data
      
      // Invalidate cache
      this.cache.invalidate('collection')
      updates.forEach(update => {
        this.cache.invalidate(`card-${update.cardId}`)
      })
      
      return updatedCards
      
    } catch (error) {
      console.error('Batch update failed:', error)
      throw error
    }
  }
  
  /**
   * Get card usage analytics
   */
  async getCardUsageAnalytics(playerId: string, cardId?: string): Promise<{
    totalUsage: number
    averageSessionTime: number
    lastUsed: string | null
    usageByDay: Array<{ date: string; count: number }>
    popularCombinations: Array<{ cards: string[]; frequency: number }>
  }> {
    CardUtils.Validation.validatePlayerId(playerId)
    if (cardId) CardUtils.Validation.validateCardId(cardId)
    
    const params = new URLSearchParams()
    if (cardId) params.set('cardId', cardId)
    
    const endpoint = `/analytics/cards/${playerId}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.get(endpoint)
    
    if (!response.ok) {
      throw new Error('Failed to load analytics')
    }
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get analytics')
    }
    
    return response.data
  }
  
  /**
   * Private helper methods
   */
  
  private transformApiResponse(playerId: string, apiData: any): CardCollection {
    // Transform API response to match our CardCollection interface
    const collection = CollectionFactory.fromCards(playerId, apiData.cards || [])
    
    // Apply API metadata if available
    if (apiData.page) collection.page = apiData.page
    if (apiData.limit) collection.limit = apiData.limit
    if (apiData.totalPages) collection.totalPages = apiData.totalPages
    if (apiData.hasNextPage !== undefined) collection.hasNextPage = apiData.hasNextPage
    if (apiData.hasPreviousPage !== undefined) collection.hasPreviousPage = apiData.hasPreviousPage
    if (apiData.lastSync) collection.lastSync = apiData.lastSync
    
    return collection
  }
  
  private calculateDetailedStatistics(cards: Card[]): CollectionStatistics {
    const totalCards = cards.length
    
    // Calculate rarity distribution
    const byRarity: Record<string, number> = {}
    cards.forEach(card => {
      const rarity = this.getRarityName(card.rarity)
      byRarity[rarity] = (byRarity[rarity] || 0) + 1
    })
    
    // Calculate type distribution (based on family for now)
    const byType: Record<string, number> = {}
    cards.forEach(card => {
      const type = card.type || 'Unknown'
      byType[type] = (byType[type] || 0) + 1
    })
    
    // Calculate family distribution
    const byFamily: Record<string, number> = {}
    cards.forEach(card => {
      const family = card.family || 'Unknown'
      byFamily[family] = (byFamily[family] || 0) + 1
    })
    
    // Calculate averages and totals
    const averageLuck = cards.reduce((sum, card) => sum + card.luck, 0) / totalCards
    const totalDeckHP = cards.reduce((sum, card) => sum + (card.hp || 0), 0)
    
    // Find notable cards
    const strongestCard = cards.reduce((strongest, card) => 
      card.luck > strongest.luck ? card : strongest
    )
    
    const newestCard = cards.reduce((newest, card) => 
      (card.createdAt || '') > (newest.createdAt || '') ? card : newest
    )
    
    // Calculate completion percentage (placeholder - would need total possible cards)
    const completionPercentage = Math.min(100, (totalCards / 500) * 100) // Assuming 500 total cards
    
    return {
      totalCards,
      byRarity,
      byType,
      byFamily,
      averageLuck,
      totalDeckHP,
      strongestCard: strongestCard.name,
      mostUsedCard: strongestCard.name, // Placeholder - would need usage data
      newestCard: newestCard.name,
      completionPercentage
    }
  }
  
  private getRarityName(probability: number): string {
    if (probability <= 2) return 'Common'
    if (probability <= 4) return 'Uncommon'
    if (probability <= 10) return 'Rare'
    if (probability <= 50) return 'Epic'
    if (probability <= 200) return 'Legendary'
    if (probability <= 1000) return 'Mythic'
    if (probability <= 10000) return 'Cosmic'
    if (probability <= 100000) return 'Divine'
    if (probability <= 1000000) return 'Infinity'
    return 'Beyond'
  }
  
  /**
   * Sync offline changes when coming back online
   */
  private async syncOfflineChanges(): Promise<void> {
    try {
      const pendingItems = await indexedDBService.getPendingSyncItems()
      
      for (const syncItem of pendingItems) {
        try {
          await this.syncSingleItem(syncItem)
        } catch (error) {
          console.error(`Failed to sync item ${syncItem.id}:`, error)
          // Mark as failed for retry later
          syncItem.status = 'failed'
          syncItem.lastAttempt = new Date()
          syncItem.retryCount = (syncItem.retryCount || 0) + 1
          await indexedDBService.saveSyncStatus(syncItem)
        }
      }
    } catch (error) {
      console.error('Failed to sync offline changes:', error)
    }
  }

  private async syncSingleItem(syncItem: any): Promise<void> {
    switch (syncItem.entityType) {
      case 'card':
        await this.syncCard(syncItem)
        break
      case 'collection':
        await this.syncCollection(syncItem)
        break
      case 'filter':
        await this.syncFilter(syncItem)
        break
      case 'image':
        await this.syncImage(syncItem)
        break
      default:
        console.warn(`Unknown sync entity type: ${syncItem.entityType}`)
    }
    
    // Mark as synced
    syncItem.status = 'synced'
    syncItem.lastSync = new Date()
    await indexedDBService.saveSyncStatus(syncItem)
  }

  private async syncCard(syncItem: any): Promise<void> {
    const response = await apiClient.put(`/cards/${syncItem.entityId}`, syncItem.data)
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to sync card')
    }
  }

  private async syncCollection(syncItem: any): Promise<void> {
    const response = await apiClient.post(`/cards/collection/${syncItem.playerId}/sync`, syncItem.data)
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to sync collection')
    }
  }

  private async syncFilter(syncItem: any): Promise<void> {
    const response = await apiClient.put(`/cards/filters/${syncItem.entityId}`, syncItem.data)
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to sync filter')
    }
  }

  private async syncImage(syncItem: any): Promise<void> {
    // Handle image sync differently since it involves file uploads
    const response = await apiClient.upload(`/cards/${syncItem.cardId}/image`, syncItem.formData)
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to sync image')
    }
  }

  // Auth header management is now handled by BaseAPIClient

  /**
   * Queue an item for offline sync
   */
  public async queueForSync(
    entityType: 'card' | 'collection' | 'filter' | 'image',
    entityId: string,
    data: any,
    playerId?: string,
    cardId?: string
  ): Promise<void> {
    const syncStatus = {
      id: `${entityType}-${entityId}-${Date.now()}`,
      entityId,
      entityType,
      playerId,
      cardId,
      status: 'pending' as const,
      data,
      createdAt: new Date(),
      lastAttempt: new Date(),
      retryCount: 0
    }
    
    await indexedDBService.saveSyncStatus(syncStatus)
  }

  /**
   * Get offline sync status
   */
  public async getSyncStatus(): Promise<{
    pending: number
    failed: number
    lastSync: Date | null
  }> {
    const pendingItems = await indexedDBService.getPendingSyncItems()
    const pending = pendingItems.filter(item => item.status === 'pending').length
    const failed = pendingItems.filter(item => item.status === 'failed').length
    
    const metadata = await indexedDBService.getMetadata()
    const lastSync = metadata?.lastSync || null
    
    return { pending, failed, lastSync }
  }

  /**
   * Check if service is online
   */
  public isServiceOnline(): boolean {
    return this.isOnline
  }

  /**
   * Public cache management methods
   */
  
  public clearCache(pattern?: string): void {
    this.cache.invalidate(pattern)
  }
  
  public getCacheStats(): {
    size: number
    keys: string[]
  } {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys())
    }
  }
}