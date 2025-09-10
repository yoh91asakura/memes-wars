/**
 * ImageCacheService - Advanced image caching with automatic cleanup
 * 
 * This service provides intelligent caching for card images with LRU eviction,
 * automatic cleanup, memory management, and performance optimization.
 */

import { cardLogger } from './CardLogger'

export interface CachedImage {
  key: string
  url: string
  blob: Blob
  metadata: {
    cardId: string
    playerId: string
    uploadDate: Date
    fileSize: number
    dimensions: { width: number; height: number }
    contentType: string
    variant?: string
    lastAccessed: Date
    accessCount: number
    source: 'upload' | 'original' | 'generated'
  }
  cacheDate: Date
  expiresAt?: Date
  priority: 'low' | 'medium' | 'high'
}

export interface CacheConfig {
  maxSize: number // bytes
  maxItems: number
  defaultTTL: number // milliseconds
  cleanupInterval: number // milliseconds
  compressionEnabled: boolean
  compressionQuality: number
  preloadStrategy: 'none' | 'visible' | 'adjacent' | 'all'
  enablePersistence: boolean
}

export interface CacheStats {
  totalSize: number
  totalItems: number
  hitRate: number
  missRate: number
  evictions: number
  cleanupRuns: number
  averageAccessTime: number
  memoryPressure: number
  oldestItem?: Date
  newestItem?: Date
  topAccessedItems: Array<{ key: string; accessCount: number }>
}

class ImageCacheService {
  private cache = new Map<string, CachedImage>()
  private accessOrder = new Set<string>() // LRU tracking
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    cleanupRuns: 0,
    totalAccessTime: 0,
    accessCount: 0
  }
  
  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxItems: 200,
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
    compressionEnabled: true,
    compressionQuality: 0.8,
    preloadStrategy: 'visible',
    enablePersistence: true
  }
  
  private cleanupTimer?: number
  private persistenceDB?: IDBDatabase
  private memoryObserver?: any
  private isCleaningUp = false

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    this.initializeCache()
    this.startCleanupTimer()
    this.initializePersistence()
    this.setupMemoryPressureHandling()
  }

  /**
   * Initialize cache system
   */
  private initializeCache(): void {
    cardLogger.info('cache', 'initialize', 'Initializing image cache', {
      maxSize: this.config.maxSize,
      maxItems: this.config.maxItems,
      compressionEnabled: this.config.compressionEnabled
    })

    // Load persisted cache if enabled
    if (this.config.enablePersistence) {
      this.loadPersistedCache()
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.runCleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Setup IndexedDB for persistence
   */
  private async initializePersistence(): Promise<void> {
    if (!this.config.enablePersistence || !('indexedDB' in window)) {
      return
    }

    try {
      const request = indexedDB.open('ImageCache', 1)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'key' })
          store.createIndex('cardId', 'metadata.cardId', { unique: false })
          store.createIndex('playerId', 'metadata.playerId', { unique: false })
          store.createIndex('lastAccessed', 'metadata.lastAccessed', { unique: false })
        }
      }
      
      request.onsuccess = (event) => {
        this.persistenceDB = (event.target as IDBOpenDBRequest).result
        cardLogger.info('cache', 'persistence_init', 'Persistence layer initialized')
      }
      
      request.onerror = (event) => {
        cardLogger.warn('cache', 'persistence_error', 'Failed to initialize persistence', {
          error: (event.target as IDBOpenDBRequest).error
        })
      }
    } catch (error) {
      cardLogger.error('cache', 'persistence_init_error', 'Persistence initialization failed', { error })
    }
  }

  /**
   * Setup memory pressure handling
   */
  private setupMemoryPressureHandling(): void {
    // Modern browsers: memory pressure API
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        const memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        
        if (memoryPressure > 0.8) {
          cardLogger.warn('cache', 'memory_pressure', 'High memory pressure detected', {
            memoryPressure,
            usedHeap: memory.usedJSHeapSize,
            totalHeap: memory.totalJSHeapSize
          })
          
          this.runEmergencyCleanup()
        }
      }, 5000)
    }
    
    // Visibility change cleanup
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.runMemoryOptimization()
      }
    })
  }

  /**
   * Cache an image
   */
  async cacheImage(
    key: string,
    url: string,
    metadata: CachedImage['metadata'],
    priority: CachedImage['priority'] = 'medium',
    expiresAt?: Date
  ): Promise<void> {
    const startTime = performance.now()

    try {
      // Check if already cached
      if (this.cache.has(key)) {
        this.updateAccessInfo(key)
        return
      }

      // Fetch image
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }

      let blob = await response.blob()

      // Apply compression if enabled
      if (this.config.compressionEnabled && blob.type.startsWith('image/')) {
        blob = await this.compressImage(blob)
      }

      // Check size constraints
      const totalSize = this.getTotalCacheSize() + blob.size
      if (totalSize > this.config.maxSize || this.cache.size >= this.config.maxItems) {
        await this.makeSpace(blob.size)
      }

      // Create cache entry
      const cachedImage: CachedImage = {
        key,
        url,
        blob,
        metadata: {
          ...metadata,
          lastAccessed: new Date(),
          accessCount: 1
        },
        cacheDate: new Date(),
        expiresAt: expiresAt || new Date(Date.now() + this.config.defaultTTL),
        priority
      }

      // Store in cache
      this.cache.set(key, cachedImage)
      this.updateAccessOrder(key)

      // Persist if enabled
      if (this.config.enablePersistence) {
        this.persistImage(cachedImage)
      }

      const duration = performance.now() - startTime
      
      cardLogger.logCacheOperation('set', key, {
        fileSize: blob.size,
        compressionApplied: this.config.compressionEnabled,
        duration,
        priority
      })

    } catch (error) {
      cardLogger.error('cache', 'cache_image_error', `Failed to cache image: ${key}`, {
        error: error instanceof Error ? error.message : error,
        url,
        metadata
      })
      throw error
    }
  }

  /**
   * Get cached image
   */
  async getImage(key: string): Promise<CachedImage | null> {
    const startTime = performance.now()

    // Check memory cache first
    if (this.cache.has(key)) {
      const image = this.cache.get(key)!
      
      // Check if expired
      if (image.expiresAt && image.expiresAt < new Date()) {
        this.cache.delete(key)
        this.accessOrder.delete(key)
        cardLogger.logCacheOperation('evict', key, { reason: 'expired' })
        this.stats.misses++
        return null
      }

      this.updateAccessInfo(key)
      this.stats.hits++
      
      const duration = performance.now() - startTime
      this.stats.totalAccessTime += duration
      this.stats.accessCount++
      
      cardLogger.logCacheOperation('hit', key, { duration })
      return image
    }

    // Try persistence layer
    if (this.config.enablePersistence && this.persistenceDB) {
      try {
        const persistedImage = await this.getPersistedImage(key)
        if (persistedImage) {
          // Restore to memory cache
          this.cache.set(key, persistedImage)
          this.updateAccessOrder(key)
          
          cardLogger.logCacheOperation('hit', key, { source: 'persistence' })
          this.stats.hits++
          return persistedImage
        }
      } catch (error) {
        cardLogger.warn('cache', 'persistence_read_error', 'Failed to read from persistence', { error })
      }
    }

    this.stats.misses++
    cardLogger.logCacheOperation('miss', key)
    return null
  }

  /**
   * Preload images based on strategy
   */
  async preloadImages(
    cardIds: string[], 
    playerId: string, 
    strategy?: CacheConfig['preloadStrategy']
  ): Promise<void> {
    const preloadStrategy = strategy || this.config.preloadStrategy
    
    if (preloadStrategy === 'none') return

    cardLogger.info('cache', 'preload_start', `Preloading ${cardIds.length} images`, {
      strategy: preloadStrategy,
      playerId
    })

    const preloadPromises = cardIds.map(async (cardId) => {
      const key = `card-${cardId}-${playerId}`
      
      if (this.cache.has(key)) return // Already cached

      try {
        const imageUrl = await this.getCardImageUrl(cardId, playerId)
        if (imageUrl) {
          await this.cacheImage(key, imageUrl, {
            cardId,
            playerId,
            uploadDate: new Date(),
            fileSize: 0, // Will be updated when cached
            dimensions: { width: 0, height: 0 },
            contentType: 'image/png',
            lastAccessed: new Date(),
            accessCount: 0,
            source: 'original'
          }, 'low')
        }
      } catch (error) {
        cardLogger.warn('cache', 'preload_failed', `Failed to preload image for card ${cardId}`, { error })
      }
    })

    await Promise.allSettled(preloadPromises)
    
    cardLogger.info('cache', 'preload_complete', 'Image preloading completed', {
      requestedCount: cardIds.length,
      cachedCount: cardIds.filter(id => this.cache.has(`card-${id}-${playerId}`)).length
    })
  }

  /**
   * Compress image blob
   */
  private async compressImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate compressed dimensions
        const maxDimension = 512
        let { width, height } = img
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (compressedBlob) => resolve(compressedBlob || blob),
          'image/jpeg',
          this.config.compressionQuality
        )
      }

      img.onerror = () => resolve(blob)
      img.src = URL.createObjectURL(blob)
    })
  }

  /**
   * Make space in cache by evicting items
   */
  private async makeSpace(requiredSize: number): Promise<void> {
    cardLogger.info('cache', 'make_space', `Making space for ${requiredSize} bytes`)

    const itemsToEvict: string[] = []
    let freedSize = 0

    // First, remove expired items
    for (const [key, image] of this.cache.entries()) {
      if (image.expiresAt && image.expiresAt < new Date()) {
        itemsToEvict.push(key)
        freedSize += image.blob.size
      }
    }

    // If not enough space, use LRU eviction
    if (freedSize < requiredSize || this.cache.size >= this.config.maxItems) {
      const sortedByAccess = Array.from(this.cache.entries())
        .sort((a, b) => {
          // Sort by priority first, then by access time
          if (a[1].priority !== b[1].priority) {
            const priorityOrder = { low: 1, medium: 2, high: 3 }
            return priorityOrder[a[1].priority] - priorityOrder[b[1].priority]
          }
          return a[1].metadata.lastAccessed.getTime() - b[1].metadata.lastAccessed.getTime()
        })

      for (const [key, image] of sortedByAccess) {
        if (!itemsToEvict.includes(key) && 
            (freedSize < requiredSize || this.cache.size >= this.config.maxItems)) {
          itemsToEvict.push(key)
          freedSize += image.blob.size
        }
      }
    }

    // Evict selected items
    for (const key of itemsToEvict) {
      this.cache.delete(key)
      this.accessOrder.delete(key)
      this.stats.evictions++
    }

    cardLogger.info('cache', 'space_made', `Evicted ${itemsToEvict.length} items, freed ${freedSize} bytes`)
  }

  /**
   * Run periodic cleanup
   */
  private async runCleanup(): Promise<void> {
    if (this.isCleaningUp) return

    this.isCleaningUp = true
    this.stats.cleanupRuns++

    try {
      cardLogger.debug('cache', 'cleanup_start', 'Starting periodic cache cleanup')

      const now = new Date()
      const expiredKeys: string[] = []
      
      // Find expired items
      for (const [key, image] of this.cache.entries()) {
        if (image.expiresAt && image.expiresAt < now) {
          expiredKeys.push(key)
        }
      }

      // Remove expired items
      for (const key of expiredKeys) {
        this.cache.delete(key)
        this.accessOrder.delete(key)
      }

      // Check cache size limits
      const currentSize = this.getTotalCacheSize()
      if (currentSize > this.config.maxSize * 0.9) { // 90% threshold
        await this.makeSpace(currentSize - this.config.maxSize * 0.8) // Target 80%
      }

      cardLogger.debug('cache', 'cleanup_complete', 'Cache cleanup completed', {
        expiredItems: expiredKeys.length,
        currentSize,
        currentItems: this.cache.size
      })

    } finally {
      this.isCleaningUp = false
    }
  }

  /**
   * Emergency cleanup for memory pressure
   */
  private async runEmergencyCleanup(): Promise<void> {
    cardLogger.warn('cache', 'emergency_cleanup', 'Running emergency cache cleanup')

    // Aggressive cleanup: remove 50% of items, starting with lowest priority
    const targetSize = Math.floor(this.cache.size * 0.5)
    const sortedItems = Array.from(this.cache.entries())
      .sort((a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3 }
        return priorityOrder[a[1].priority] - priorityOrder[b[1].priority]
      })

    for (let i = 0; i < targetSize && sortedItems.length > 0; i++) {
      const [key] = sortedItems[i]
      this.cache.delete(key)
      this.accessOrder.delete(key)
      this.stats.evictions++
    }
  }

  /**
   * Memory optimization when page is hidden
   */
  private runMemoryOptimization(): void {
    cardLogger.info('cache', 'memory_optimization', 'Running memory optimization')

    // Convert blobs to compressed format or release object URLs
    for (const [key, image] of this.cache.entries()) {
      if (image.priority === 'low' && image.metadata.accessCount < 3) {
        // Could convert to a lighter representation or remove entirely
        this.cache.delete(key)
        this.accessOrder.delete(key)
      }
    }
  }

  /**
   * Helper methods
   */
  private updateAccessInfo(key: string): void {
    const image = this.cache.get(key)
    if (image) {
      image.metadata.lastAccessed = new Date()
      image.metadata.accessCount++
      this.updateAccessOrder(key)
    }
  }

  private updateAccessOrder(key: string): void {
    if (this.accessOrder.has(key)) {
      this.accessOrder.delete(key)
    }
    this.accessOrder.add(key)
  }

  private getTotalCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, image) => total + image.blob.size, 0)
  }

  private async getCardImageUrl(cardId: string, playerId: string): Promise<string | null> {
    // This would typically call an API to get the image URL
    return `/api/cards/${cardId}/image?playerId=${playerId}`
  }

  /**
   * Persistence methods
   */
  private async persistImage(image: CachedImage): Promise<void> {
    if (!this.persistenceDB) return

    try {
      const tx = this.persistenceDB.transaction(['images'], 'readwrite')
      const store = tx.objectStore('images')
      
      // Store with ArrayBuffer for better performance
      const imageData = {
        ...image,
        blob: await image.blob.arrayBuffer(),
        blobType: image.blob.type
      }
      
      await store.put(imageData)
    } catch (error) {
      cardLogger.warn('cache', 'persist_error', 'Failed to persist image', { error, key: image.key })
    }
  }

  private async getPersistedImage(key: string): Promise<CachedImage | null> {
    if (!this.persistenceDB) return null

    return new Promise((resolve, reject) => {
      const tx = this.persistenceDB!.transaction(['images'], 'readonly')
      const store = tx.objectStore('images')
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.blob) {
          // Reconstruct blob from ArrayBuffer
          const blob = new Blob([result.blob], { type: result.blobType })
          resolve({
            ...result,
            blob,
            cacheDate: new Date(result.cacheDate),
            expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
            metadata: {
              ...result.metadata,
              uploadDate: new Date(result.metadata.uploadDate),
              lastAccessed: new Date(result.metadata.lastAccessed)
            }
          })
        } else {
          resolve(null)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  private async loadPersistedCache(): Promise<void> {
    // Load frequently accessed images from persistence
    // Implementation would depend on specific requirements
  }

  /**
   * Public API
   */
  public async clear(): Promise<void> {
    this.cache.clear()
    this.accessOrder.clear()
    
    if (this.persistenceDB) {
      const tx = this.persistenceDB.transaction(['images'], 'readwrite')
      await tx.objectStore('images').clear()
    }
    
    cardLogger.info('cache', 'clear', 'Cache cleared')
  }

  public getStats(): CacheStats {
    const totalSize = this.getTotalCacheSize()
    const totalRequests = this.stats.hits + this.stats.misses
    const images = Array.from(this.cache.values())
    
    return {
      totalSize,
      totalItems: this.cache.size,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
      evictions: this.stats.evictions,
      cleanupRuns: this.stats.cleanupRuns,
      averageAccessTime: this.stats.accessCount > 0 ? this.stats.totalAccessTime / this.stats.accessCount : 0,
      memoryPressure: this.config.maxSize > 0 ? (totalSize / this.config.maxSize) * 100 : 0,
      oldestItem: images.length > 0 ? new Date(Math.min(...images.map(img => img.cacheDate.getTime()))) : undefined,
      newestItem: images.length > 0 ? new Date(Math.max(...images.map(img => img.cacheDate.getTime()))) : undefined,
      topAccessedItems: images
        .sort((a, b) => b.metadata.accessCount - a.metadata.accessCount)
        .slice(0, 10)
        .map(img => ({ key: img.key, accessCount: img.metadata.accessCount }))
    }
  }

  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval && this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.startCleanupTimer()
    }
  }

  public async dispose(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    this.cache.clear()
    this.accessOrder.clear()
    
    if (this.persistenceDB) {
      this.persistenceDB.close()
    }
  }
}

export const imageCacheService = new ImageCacheService()
export default ImageCacheService