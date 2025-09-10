/**
 * Performance utilities for card management with large collections
 * 
 * This module provides optimization utilities, memoization, debouncing,
 * worker support, and performance monitoring for collections over 500 cards.
 */

import { cardLogger } from '../services/CardLogger'
import type { Card } from '../models/Card'
import type { CardFilter } from '../models/CardFilter'

export interface PerformanceConfig {
  chunkSize: number
  debounceMs: number
  enableWebWorkers: boolean
  enableIndexedSearch: boolean
  enableMemoization: boolean
  cacheSize: number
  measurePerformance: boolean
}

export interface PerformanceMetrics {
  operation: string
  duration: number
  itemCount: number
  memoryUsage: number
  renderTime?: number
  workerTime?: number
  cacheHits: number
  cacheMisses: number
}

export interface SearchIndex {
  cardId: string
  searchableText: string
  keywords: string[]
  rarity: number
  type: string
  family: string
  abilities: string[]
}

// Default performance configuration
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  chunkSize: 100,
  debounceMs: 300,
  enableWebWorkers: true,
  enableIndexedSearch: true,
  enableMemoization: true,
  cacheSize: 1000,
  measurePerformance: true
}

/**
 * Performance measurement decorator
 */
export function measurePerformance(operationName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      const memoryBefore = getMemoryUsage()

      try {
        const result = await originalMethod.apply(this, args)
        const duration = performance.now() - startTime
        const memoryAfter = getMemoryUsage()

        const metrics: PerformanceMetrics = {
          operation: operationName,
          duration,
          itemCount: Array.isArray(result) ? result.length : 1,
          memoryUsage: memoryAfter - memoryBefore,
          cacheHits: 0,
          cacheMisses: 0
        }

        cardLogger.logPerformanceMetrics(operationName, duration, metrics.itemCount, {
          memoryBefore,
          memoryAfter,
          operationType: 'decorated_method'
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime
        cardLogger.error('performance', operationName, `Performance measurement failed: ${error}`, {
          duration,
          error: error instanceof Error ? error.message : error
        })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Advanced memoization with LRU cache
 */
export class LRUMemoization<T> {
  private cache = new Map<string, { value: T; timestamp: number; hits: number }>()
  private maxSize: number
  private ttl: number

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hit count and move to end (most recently used)
    entry.hits++
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    })
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; hitRates: Array<{ key: string; hits: number }> } {
    return {
      size: this.cache.size,
      hitRates: Array.from(this.cache.entries())
        .sort(([, a], [, b]) => b.hits - a.hits)
        .slice(0, 10)
        .map(([key, entry]) => ({ key, hits: entry.hits }))
    }
  }
}

/**
 * Debounced function creator with cancellation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate = false
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: number | undefined
  let lastArgs: Parameters<T>
  let lastThis: any
  let result: ReturnType<T>

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args
    lastThis = this

    const callNow = immediate && !timeoutId

    clearTimeout(timeoutId)

    timeoutId = window.setTimeout(() => {
      timeoutId = undefined
      if (!immediate) {
        result = func.apply(lastThis, lastArgs)
      }
    }, delay)

    if (callNow) {
      result = func.apply(lastThis, lastArgs)
    }

    return result
  } as T & { cancel: () => void; flush: () => void }

  debounced.cancel = () => {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      result = func.apply(lastThis, lastArgs)
      timeoutId = undefined
    }
    return result
  }

  return debounced
}

/**
 * Chunked processing for large arrays
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[], chunkIndex: number) => Promise<R[]>,
  chunkSize = DEFAULT_PERFORMANCE_CONFIG.chunkSize,
  onProgress?: (progress: { completed: number; total: number; percentage: number }) => void
): Promise<R[]> {
  const results: R[] = []
  const chunks: T[][] = []

  // Create chunks
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }

  // Process chunks with progress reporting
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkResults = await processor(chunk, i)
    results.push(...chunkResults)

    if (onProgress) {
      onProgress({
        completed: (i + 1) * chunkSize,
        total: items.length,
        percentage: ((i + 1) / chunks.length) * 100
      })
    }

    // Yield to event loop to prevent blocking
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return results
}

/**
 * Web Worker support for heavy computations
 */
export class CardWorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private workQueue: Array<{
    data: any
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []

  constructor(size = navigator.hardwareConcurrency || 4) {
    this.initializeWorkers(size)
  }

  private initializeWorkers(size: number): void {
    for (let i = 0; i < size; i++) {
      try {
        // Create worker with inline code for card processing
        const workerCode = `
          self.onmessage = function(e) {
            const { type, data, id } = e.data;
            
            try {
              let result;
              
              switch (type) {
                case 'filterCards':
                  result = filterCards(data.cards, data.filters);
                  break;
                case 'searchCards':
                  result = searchCards(data.cards, data.searchTerm);
                  break;
                case 'sortCards':
                  result = sortCards(data.cards, data.sortBy, data.sortOrder);
                  break;
                case 'buildSearchIndex':
                  result = buildSearchIndex(data.cards);
                  break;
                default:
                  throw new Error('Unknown worker task type: ' + type);
              }
              
              self.postMessage({ id, result, success: true });
            } catch (error) {
              self.postMessage({ id, error: error.message, success: false });
            }
          };
          
          function filterCards(cards, filters) {
            return cards.filter(card => {
              return filters.every(filter => {
                if (filter.rarities && filter.rarities.length > 0) {
                  if (!filter.rarities.includes(getRarityName(card.rarity))) return false;
                }
                
                if (filter.costRange) {
                  if (card.cost < filter.costRange.min || card.cost > filter.costRange.max) return false;
                }
                
                if (filter.types && filter.types.length > 0) {
                  if (!filter.types.includes(card.type)) return false;
                }
                
                if (filter.textSearch) {
                  const searchTerm = filter.textSearch.toLowerCase();
                  const searchable = (card.name + ' ' + card.description + ' ' + card.abilities.join(' ')).toLowerCase();
                  if (!searchable.includes(searchTerm)) return false;
                }
                
                return true;
              });
            });
          }
          
          function searchCards(cards, searchTerm) {
            const term = searchTerm.toLowerCase();
            return cards.filter(card => {
              const searchable = (card.name + ' ' + card.description + ' ' + card.abilities.join(' ')).toLowerCase();
              return searchable.includes(term);
            }).map(card => ({
              card,
              score: calculateSearchScore(card, searchTerm)
            })).sort((a, b) => b.score - a.score);
          }
          
          function sortCards(cards, sortBy, sortOrder) {
            return cards.slice().sort((a, b) => {
              let comparison = 0;
              
              switch (sortBy) {
                case 'name':
                  comparison = a.name.localeCompare(b.name);
                  break;
                case 'rarity':
                  comparison = b.rarity - a.rarity;
                  break;
                case 'cost':
                  comparison = a.cost - b.cost;
                  break;
                case 'luck':
                  comparison = b.luck - a.luck;
                  break;
                default:
                  comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
              }
              
              return sortOrder === 'desc' ? -comparison : comparison;
            });
          }
          
          function buildSearchIndex(cards) {
            return cards.map(card => ({
              cardId: card.id,
              searchableText: (card.name + ' ' + card.description + ' ' + card.abilities.join(' ')).toLowerCase(),
              keywords: extractKeywords(card),
              rarity: card.rarity,
              type: card.type,
              family: card.family,
              abilities: card.abilities
            }));
          }
          
          function getRarityName(probability) {
            if (probability <= 2) return 'Common';
            if (probability <= 4) return 'Uncommon';
            if (probability <= 10) return 'Rare';
            if (probability <= 50) return 'Epic';
            if (probability <= 200) return 'Legendary';
            return 'Mythic';
          }
          
          function calculateSearchScore(card, searchTerm) {
            const term = searchTerm.toLowerCase();
            let score = 0;
            
            if (card.name.toLowerCase().includes(term)) score += 10;
            if (card.description.toLowerCase().includes(term)) score += 5;
            if (card.abilities.some(ability => ability.toLowerCase().includes(term))) score += 7;
            
            return score;
          }
          
          function extractKeywords(card) {
            const text = (card.name + ' ' + card.description + ' ' + card.abilities.join(' ')).toLowerCase();
            return text.split(/\\W+/).filter(word => word.length > 2);
          }
        `

        const blob = new Blob([workerCode], { type: 'application/javascript' })
        const worker = new Worker(URL.createObjectURL(blob))

        worker.onmessage = (e) => {
          this.handleWorkerMessage(worker, e)
        }

        worker.onerror = (error) => {
          cardLogger.error('performance', 'worker_error', 'Worker error occurred', { error: error.message })
        }

        this.workers.push(worker)
        this.availableWorkers.push(worker)
      } catch (error) {
        cardLogger.warn('performance', 'worker_init', 'Failed to create worker', { error })
      }
    }
  }

  private handleWorkerMessage(worker: Worker, event: MessageEvent): void {
    const { id, result, error, success } = event.data
    
    // Find and resolve the corresponding promise
    const workItem = this.workQueue.find(item => item.data.id === id)
    if (workItem) {
      this.workQueue = this.workQueue.filter(item => item.data.id !== id)
      
      if (success) {
        workItem.resolve(result)
      } else {
        workItem.reject(new Error(error))
      }
    }

    // Return worker to available pool
    this.availableWorkers.push(worker)
    this.processQueue()
  }

  private processQueue(): void {
    while (this.workQueue.length > 0 && this.availableWorkers.length > 0) {
      const workItem = this.workQueue.shift()!
      const worker = this.availableWorkers.shift()!
      
      worker.postMessage(workItem.data)
    }
  }

  public execute<T>(type: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const workItem = {
        data: { type, data: { ...data, id: Date.now() + Math.random() } },
        resolve,
        reject
      }

      this.workQueue.push(workItem)
      this.processQueue()
    })
  }

  public dispose(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.availableWorkers = []
    this.workQueue = []
  }
}

/**
 * Search index for fast card filtering
 */
export class CardSearchIndex {
  private index = new Map<string, SearchIndex>()
  private keywordMap = new Map<string, Set<string>>()
  private memoization = new LRUMemoization<Card[]>(100)

  buildIndex(cards: Card[]): void {
    const startTime = performance.now()
    
    this.index.clear()
    this.keywordMap.clear()

    for (const card of cards) {
      const searchIndex: SearchIndex = {
        cardId: card.id,
        searchableText: this.buildSearchableText(card),
        keywords: this.extractKeywords(card),
        rarity: card.rarity,
        type: card.type || '',
        family: card.family || '',
        abilities: card.abilities || []
      }

      this.index.set(card.id, searchIndex)

      // Build keyword mapping
      for (const keyword of searchIndex.keywords) {
        if (!this.keywordMap.has(keyword)) {
          this.keywordMap.set(keyword, new Set())
        }
        this.keywordMap.get(keyword)!.add(card.id)
      }
    }

    const duration = performance.now() - startTime
    cardLogger.logPerformanceMetrics('build_search_index', duration, cards.length, {
      operationType: 'index_build',
      indexSize: this.index.size,
      keywordCount: this.keywordMap.size
    })
  }

  search(cards: Card[], searchTerm: string): Card[] {
    const cacheKey = `search_${searchTerm}`
    const cached = this.memoization.get(cacheKey)
    if (cached) {
      cardLogger.logCacheOperation('hit', cacheKey)
      return cached
    }

    const startTime = performance.now()
    const term = searchTerm.toLowerCase().trim()

    if (!term) {
      return cards
    }

    // Fast keyword-based search
    const matchingCardIds = new Set<string>()
    const keywords = term.split(/\s+/)

    for (const keyword of keywords) {
      const cardIds = this.keywordMap.get(keyword)
      if (cardIds) {
        if (matchingCardIds.size === 0) {
          cardIds.forEach(id => matchingCardIds.add(id))
        } else {
          // Intersection for AND behavior
          const intersection = new Set<string>()
          for (const id of matchingCardIds) {
            if (cardIds.has(id)) {
              intersection.add(id)
            }
          }
          matchingCardIds.clear()
          intersection.forEach(id => matchingCardIds.add(id))
        }
      }
    }

    // Convert to cards and score
    const results = cards
      .filter(card => matchingCardIds.has(card.id) || this.fallbackTextSearch(card, term))
      .map(card => ({ card, score: this.calculateSearchScore(card, term) }))
      .sort((a, b) => b.score - a.score)
      .map(result => result.card)

    const duration = performance.now() - startTime
    cardLogger.logPerformanceMetrics('search_cards', duration, results.length, {
      operationType: 'indexed_search',
      searchTerm: term,
      totalCards: cards.length
    })

    this.memoization.set(cacheKey, results)
    return results
  }

  filter(cards: Card[], filters: CardFilter[]): Card[] {
    const cacheKey = `filter_${JSON.stringify(filters)}`
    const cached = this.memoization.get(cacheKey)
    if (cached) {
      return cached
    }

    const startTime = performance.now()
    
    const results = cards.filter(card => {
      const searchIndex = this.index.get(card.id)
      if (!searchIndex) return true // Include if no index entry

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
          if (!criteria.types.includes(searchIndex.type)) return false
        }

        // Text search filter
        if (criteria.textSearch) {
          if (!searchIndex.searchableText.includes(criteria.textSearch.toLowerCase())) {
            return false
          }
        }

        return true
      })
    })

    const duration = performance.now() - startTime
    cardLogger.logPerformanceMetrics('filter_cards', duration, results.length, {
      operationType: 'indexed_filter',
      filterCount: filters.length,
      totalCards: cards.length
    })

    this.memoization.set(cacheKey, results)
    return results
  }

  private buildSearchableText(card: Card): string {
    return [
      card.name,
      card.description || '',
      ...(card.abilities || []),
      card.family || '',
      card.type || ''
    ].join(' ').toLowerCase()
  }

  private extractKeywords(card: Card): string[] {
    const text = this.buildSearchableText(card)
    return text
      .split(/\W+/)
      .filter(word => word.length > 2)
      .slice(0, 20) // Limit keywords per card
  }

  private fallbackTextSearch(card: Card, term: string): boolean {
    const searchableText = this.buildSearchableText(card)
    return searchableText.includes(term)
  }

  private calculateSearchScore(card: Card, term: string): number {
    let score = 0
    const name = card.name.toLowerCase()
    const description = (card.description || '').toLowerCase()

    // Name matches score higher
    if (name.includes(term)) score += 10
    if (name.startsWith(term)) score += 5

    // Description matches
    if (description.includes(term)) score += 3

    // Ability matches
    if (card.abilities?.some(ability => ability.toLowerCase().includes(term))) {
      score += 7
    }

    // Boost score for rarer cards
    score += Math.min(card.rarity / 100, 2)

    return score
  }

  private getRarityName(probability: number): string {
    if (probability <= 2) return 'Common'
    if (probability <= 4) return 'Uncommon'
    if (probability <= 10) return 'Rare'
    if (probability <= 50) return 'Epic'
    if (probability <= 200) return 'Legendary'
    if (probability <= 1000) return 'Mythic'
    return 'Divine'
  }

  getStats(): {
    indexSize: number
    keywordCount: number
    memoizationStats: ReturnType<LRUMemoization<Card[]>['getStats']>
  } {
    return {
      indexSize: this.index.size,
      keywordCount: this.keywordMap.size,
      memoizationStats: this.memoization.getStats()
    }
  }

  clear(): void {
    this.index.clear()
    this.keywordMap.clear()
    this.memoization.clear()
  }
}

/**
 * Utility functions
 */
export function getMemoryUsage(): number {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize
  }
  return 0
}

export function createPerformanceMarker(name: string): () => number {
  const startTime = performance.now()
  
  return () => {
    const duration = performance.now() - startTime
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    return duration
  }
}

export function batchRequestAnimationFrame<T>(
  callback: (items: T[]) => void,
  items: T[],
  batchSize = 10
): Promise<void> {
  return new Promise(resolve => {
    let index = 0

    function processBatch() {
      const batch = items.slice(index, index + batchSize)
      if (batch.length > 0) {
        callback(batch)
        index += batchSize
        
        if (index < items.length) {
          requestAnimationFrame(processBatch)
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    }

    requestAnimationFrame(processBatch)
  })
}

// Global instances
export const cardSearchIndex = new CardSearchIndex()
export const cardWorkerPool = new CardWorkerPool()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  cardWorkerPool.dispose()
})

export default {
  measurePerformance,
  LRUMemoization,
  debounce,
  processInChunks,
  CardWorkerPool,
  CardSearchIndex,
  getMemoryUsage,
  createPerformanceMarker,
  batchRequestAnimationFrame,
  cardSearchIndex,
  cardWorkerPool
}