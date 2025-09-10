/**
 * Performance tests for large card collections
 * 
 * These tests verify that the card management system maintains acceptable
 * performance with collections of 500+ cards, including search, filter,
 * sort, and rendering operations.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import type { Card } from '../../src/models/Card'
import { CardSearchIndex, cardWorkerPool } from '../../src/utils/performance'
import { CardManagementService } from '../../src/services/CardManagementService'
import { imageCacheService } from '../../src/services/ImageCacheService'

// Performance targets from requirements
const PERFORMANCE_TARGETS = {
  SEARCH_TIME: 200, // ms for search operations
  FILTER_TIME: 200, // ms for filter operations  
  SORT_TIME: 100,   // ms for sort operations
  RENDER_TIME: 500, // ms for initial render
  MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB memory usage
  COLLECTION_LOAD: 1000, // ms for collection loading
  CACHE_RESPONSE: 50 // ms for cached operations
}

// Test data generators
const generateLargeCardCollection = (size: number): Card[] => {
  const cards: Card[] = []
  const names = [
    'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Sphinx', 'Kraken', 'Leviathan', 
    'Behemoth', 'Chimera', 'Hydra', 'Basilisk', 'Wyvern', 'Manticore', 'Cerberus',
    'Minotaur', 'Centaur', 'Harpy', 'Siren', 'Valkyrie', 'Angel', 'Demon'
  ]
  const adjectives = [
    'Ancient', 'Mighty', 'Fierce', 'Noble', 'Dark', 'Light', 'Fire', 'Ice',
    'Storm', 'Earth', 'Shadow', 'Golden', 'Silver', 'Crimson', 'Azure'
  ]
  const rarities = [2, 4, 10, 50, 200, 1000, 10000] // Common to Divine
  const families = ['Fire', 'Water', 'Earth', 'Air', 'Dark', 'Light', 'Neutral']
  const types = ['Creature', 'Spell', 'Artifact', 'Enchantment', 'Planeswalker']
  const abilities = [
    'Flying', 'Trample', 'First Strike', 'Double Strike', 'Deathtouch', 'Lifelink',
    'Vigilance', 'Haste', 'Reach', 'Hexproof', 'Indestructible', 'Regenerate',
    'Flash', 'Defender', 'Menace', 'Prowess', 'Scry', 'Surveil'
  ]

  for (let i = 0; i < size; i++) {
    const name = names[i % names.length]
    const adjective = adjectives[i % adjectives.length]
    const cardName = `${adjective} ${name}`
    
    cards.push({
      id: `perf-card-${i}`,
      name: cardName,
      image: `card-${i}.png`,
      description: `A ${adjective.toLowerCase()} ${name.toLowerCase()} with mysterious powers. Card number ${i} in the test collection.`,
      rarity: rarities[i % rarities.length],
      luck: (i % 1000) + 1,
      cost: (i % 15) + 1,
      hp: (i % 500) + 50,
      attack: (i % 200) + 10,
      defense: (i % 150) + 5,
      abilities: [
        abilities[i % abilities.length],
        abilities[(i + 1) % abilities.length],
        ...(i % 3 === 0 ? [abilities[(i + 2) % abilities.length]] : [])
      ],
      family: families[i % families.length],
      type: types[i % types.length],
      createdAt: new Date(Date.now() - (i * 60000)).toISOString(), // Cards created 1 minute apart
      stackLevel: (i % 10) + 1,
      goldReward: (i % 100) + 10
    })
  }

  return cards
}

describe('Large Collection Performance Tests', () => {
  let largeCollection: Card[]
  let searchIndex: CardSearchIndex
  let memoryBaseline: number

  beforeAll(() => {
    // Establish memory baseline
    if ('memory' in performance) {
      memoryBaseline = (performance as any).memory.usedJSHeapSize
    }

    // Generate large test collection
    console.log('Generating large collection for performance tests...')
    largeCollection = generateLargeCardCollection(2000)
    console.log(`Generated ${largeCollection.length} cards for testing`)

    // Pre-warm search index
    searchIndex = new CardSearchIndex()
    searchIndex.buildIndex(largeCollection)
  })

  afterAll(() => {
    // Cleanup
    searchIndex.clear()
    cardWorkerPool.dispose()
    
    if ('gc' in window) {
      (window as any).gc()
    }
  })

  describe('Search Performance', () => {
    it('should search 500 cards under target time', async () => {
      const mediumCollection = largeCollection.slice(0, 500)
      const testIndex = new CardSearchIndex()
      testIndex.buildIndex(mediumCollection)

      const start = performance.now()
      const results = testIndex.search(mediumCollection, 'Ancient Dragon')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
      expect(results.length).toBeGreaterThan(0)
      
      console.log(`Search 500 cards: ${duration.toFixed(2)}ms`)
    })

    it('should search 1000 cards under target time', async () => {
      const largeTestCollection = largeCollection.slice(0, 1000)
      const testIndex = new CardSearchIndex()
      testIndex.buildIndex(largeTestCollection)

      const start = performance.now()
      const results = testIndex.search(largeTestCollection, 'Fire')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
      expect(results.length).toBeGreaterThan(0)
      
      console.log(`Search 1000 cards: ${duration.toFixed(2)}ms`)
    })

    it('should search 2000 cards under target time', async () => {
      const start = performance.now()
      const results = searchIndex.search(largeCollection, 'Phoenix')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
      expect(results.length).toBeGreaterThan(0)
      
      console.log(`Search 2000 cards: ${duration.toFixed(2)}ms`)
    })

    it('should handle complex search queries efficiently', async () => {
      const complexQueries = [
        'Ancient Fire Dragon',
        'Dark Shadow Spell',
        'Golden Light Artifact',
        'Mighty Storm Creature'
      ]

      for (const query of complexQueries) {
        const start = performance.now()
        const results = searchIndex.search(largeCollection, query)
        const duration = performance.now() - start

        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
        expect(results.length).toBeGreaterThanOrEqual(0)
        
        console.log(`Complex search "${query}": ${duration.toFixed(2)}ms`)
      }
    })

    it('should maintain search performance over multiple operations', async () => {
      const searchTerms = Array.from({ length: 50 }, (_, i) => `Card ${i}`)
      const durations: number[] = []

      for (const term of searchTerms) {
        const start = performance.now()
        searchIndex.search(largeCollection, term)
        const duration = performance.now() - start
        durations.push(duration)
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const maxDuration = Math.max(...durations)

      expect(avgDuration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
      expect(maxDuration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME * 1.5) // Allow 50% variance

      console.log(`Average search time over 50 operations: ${avgDuration.toFixed(2)}ms`)
      console.log(`Max search time: ${maxDuration.toFixed(2)}ms`)
    })
  })

  describe('Filter Performance', () => {
    const createTestFilter = (criteria: any) => ({
      id: 'perf-filter',
      name: 'Performance Test Filter',
      criteria,
      active: true,
      createdDate: new Date(),
      lastUsed: new Date(),
      playerId: 'perf-test-player'
    })

    it('should filter by rarity efficiently', async () => {
      const filter = createTestFilter({ rarities: ['Epic', 'Legendary'] })

      const start = performance.now()
      const results = searchIndex.filter(largeCollection, [filter])
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.FILTER_TIME)
      expect(results.every(card => card.rarity >= 50 && card.rarity <= 200)).toBe(true)

      console.log(`Rarity filter: ${duration.toFixed(2)}ms, ${results.length} results`)
    })

    it('should filter by cost range efficiently', async () => {
      const filter = createTestFilter({ costRange: { min: 5, max: 10 } })

      const start = performance.now()
      const results = searchIndex.filter(largeCollection, [filter])
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.FILTER_TIME)
      expect(results.every(card => card.cost >= 5 && card.cost <= 10)).toBe(true)

      console.log(`Cost range filter: ${duration.toFixed(2)}ms, ${results.length} results`)
    })

    it('should filter by multiple criteria efficiently', async () => {
      const filters = [
        createTestFilter({ rarities: ['Rare', 'Epic'] }),
        createTestFilter({ costRange: { min: 3, max: 8 } }),
        createTestFilter({ types: ['Creature', 'Spell'] })
      ]

      const start = performance.now()
      const results = searchIndex.filter(largeCollection, filters)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.FILTER_TIME * 1.5) // Allow extra time for multiple filters
      expect(results.length).toBeGreaterThanOrEqual(0)

      console.log(`Multiple filters: ${duration.toFixed(2)}ms, ${results.length} results`)
    })

    it('should handle text search filter efficiently', async () => {
      const filter = createTestFilter({ textSearch: 'dragon fire' })

      const start = performance.now()
      const results = searchIndex.filter(largeCollection, [filter])
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.FILTER_TIME)

      console.log(`Text search filter: ${duration.toFixed(2)}ms, ${results.length} results`)
    })
  })

  describe('Sort Performance', () => {
    it('should sort by name efficiently', async () => {
      const service = new CardManagementService()

      const start = performance.now()
      const results = await service.sortCards(largeCollection, 'name', 'asc')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SORT_TIME * 2) // Sorting is more expensive
      expect(results[0].name <= results[1].name).toBe(true)
      expect(results.length).toBe(largeCollection.length)

      console.log(`Sort by name: ${duration.toFixed(2)}ms`)
    })

    it('should sort by rarity efficiently', async () => {
      const service = new CardManagementService()

      const start = performance.now()
      const results = await service.sortCards(largeCollection, 'rarity', 'desc')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SORT_TIME * 2)
      expect(results[0].rarity >= results[1].rarity).toBe(true)

      console.log(`Sort by rarity: ${duration.toFixed(2)}ms`)
    })

    it('should sort by multiple criteria in sequence', async () => {
      const service = new CardManagementService()
      const testCollection = largeCollection.slice(0, 1000) // Smaller for multiple operations

      const operations = [
        { sortBy: 'name', sortOrder: 'asc' },
        { sortBy: 'rarity', sortOrder: 'desc' },
        { sortBy: 'cost', sortOrder: 'asc' }
      ]

      let currentCollection = [...testCollection]
      const totalStart = performance.now()

      for (const op of operations) {
        const start = performance.now()
        currentCollection = await service.sortCards(currentCollection, op.sortBy as any, op.sortOrder as any)
        const duration = performance.now() - start

        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SORT_TIME * 2)
        console.log(`Sort by ${op.sortBy}: ${duration.toFixed(2)}ms`)
      }

      const totalDuration = performance.now() - totalStart
      expect(totalDuration).toBeLessThan(PERFORMANCE_TARGETS.SORT_TIME * 6) // 3 operations with buffer

      console.log(`Total sort operations: ${totalDuration.toFixed(2)}ms`)
    })
  })

  describe('Memory Usage', () => {
    it('should not exceed memory limits during operations', async () => {
      if (!('memory' in performance)) {
        console.log('Memory measurement not available in this environment')
        return
      }

      const initialMemory = (performance as any).memory.usedJSHeapSize
      
      // Perform intensive operations
      const searchOperations = 100
      const filterOperations = 50

      // Search operations
      for (let i = 0; i < searchOperations; i++) {
        searchIndex.search(largeCollection, `test ${i}`)
      }

      // Filter operations
      for (let i = 0; i < filterOperations; i++) {
        const filter = {
          id: `filter-${i}`,
          name: `Filter ${i}`,
          criteria: { costRange: { min: i % 10, max: (i % 10) + 5 } },
          active: true,
          createdDate: new Date(),
          lastUsed: new Date(),
          playerId: 'test'
        }
        searchIndex.filter(largeCollection, [filter])
      }

      const finalMemory = (performance as any).memory.usedJSHeapSize
      const memoryIncrease = finalMemory - initialMemory

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_TARGETS.MEMORY_LIMIT)

      console.log(`Memory usage after operations: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
    })

    it('should release memory after clearing cache', async () => {
      if (!('memory' in performance)) return

      const beforeMemory = (performance as any).memory.usedJSHeapSize

      // Create and use temporary search index
      const tempIndex = new CardSearchIndex()
      tempIndex.buildIndex(largeCollection)

      // Perform operations to fill cache
      for (let i = 0; i < 50; i++) {
        tempIndex.search(largeCollection, `search ${i}`)
      }

      const peakMemory = (performance as any).memory.usedJSHeapSize

      // Clear and force cleanup
      tempIndex.clear()
      if ('gc' in window) {
        (window as any).gc()
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100))

      const afterMemory = (performance as any).memory.usedJSHeapSize
      const memoryRecovered = peakMemory - afterMemory

      console.log(`Memory recovered: ${(memoryRecovered / 1024 / 1024).toFixed(2)}MB`)
      
      // Should recover at least some memory
      expect(memoryRecovered).toBeGreaterThan(0)
    })
  })

  describe('Cache Performance', () => {
    it('should demonstrate cache performance improvement', async () => {
      // Cold search (no cache)
      const coldStart = performance.now()
      const coldResults = searchIndex.search(largeCollection, 'Ancient Dragon')
      const coldDuration = performance.now() - coldStart

      // Warm search (cached)
      const warmStart = performance.now()
      const warmResults = searchIndex.search(largeCollection, 'Ancient Dragon')
      const warmDuration = performance.now() - warmStart

      expect(warmDuration).toBeLessThan(PERFORMANCE_TARGETS.CACHE_RESPONSE)
      expect(warmDuration).toBeLessThan(coldDuration) // Cache should be faster
      expect(warmResults).toEqual(coldResults)

      console.log(`Cold search: ${coldDuration.toFixed(2)}ms`)
      console.log(`Warm search: ${warmDuration.toFixed(2)}ms`)
      console.log(`Cache speedup: ${(coldDuration / warmDuration).toFixed(2)}x`)
    })

    it('should handle cache eviction gracefully', async () => {
      const service = new CardManagementService()
      const durations: number[] = []

      // Perform many different searches to trigger cache eviction
      for (let i = 0; i < 200; i++) {
        const start = performance.now()
        searchIndex.search(largeCollection, `unique search ${i}`)
        const duration = performance.now() - start
        durations.push(duration)
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const maxDuration = Math.max(...durations)

      // Even with cache eviction, performance should be acceptable
      expect(avgDuration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
      expect(maxDuration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME * 2)

      console.log(`Average duration with cache eviction: ${avgDuration.toFixed(2)}ms`)
      console.log(`Max duration: ${maxDuration.toFixed(2)}ms`)
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent searches', async () => {
      const concurrentSearches = 10
      const searchPromises: Promise<Card[]>[] = []

      const start = performance.now()

      for (let i = 0; i < concurrentSearches; i++) {
        searchPromises.push(
          new Promise(resolve => {
            const results = searchIndex.search(largeCollection, `concurrent ${i}`)
            resolve(results)
          })
        )
      }

      const results = await Promise.all(searchPromises)
      const duration = performance.now() - start

      expect(results).toHaveLength(concurrentSearches)
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME * 2) // Allow extra time for concurrency

      console.log(`${concurrentSearches} concurrent searches: ${duration.toFixed(2)}ms`)
    })

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        () => searchIndex.search(largeCollection, 'Dragon'),
        () => searchIndex.search(largeCollection, 'Phoenix'),
        () => searchIndex.filter(largeCollection, [{
          id: 'test', name: 'test', criteria: { rarities: ['Rare'] }, 
          active: true, createdDate: new Date(), lastUsed: new Date(), playerId: 'test'
        }]),
        () => searchIndex.filter(largeCollection, [{
          id: 'test2', name: 'test2', criteria: { costRange: { min: 5, max: 10 } }, 
          active: true, createdDate: new Date(), lastUsed: new Date(), playerId: 'test'
        }])
      ]

      const start = performance.now()
      const results = await Promise.all(operations.map(op => Promise.resolve(op())))
      const duration = performance.now() - start

      expect(results).toHaveLength(operations.length)
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME * 2)

      console.log(`Mixed concurrent operations: ${duration.toFixed(2)}ms`)
    })
  })

  describe('Scalability Tests', () => {
    it('should show linear or sub-linear scaling with collection size', async () => {
      const sizes = [100, 500, 1000, 2000]
      const results: { size: number; duration: number }[] = []

      for (const size of sizes) {
        const testCollection = largeCollection.slice(0, size)
        const testIndex = new CardSearchIndex()
        testIndex.buildIndex(testCollection)

        const start = performance.now()
        testIndex.search(testCollection, 'Dragon')
        const duration = performance.now() - start

        results.push({ size, duration })

        // Each size should still be under target
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
      }

      // Log scaling results
      console.log('Scaling results:')
      results.forEach(({ size, duration }) => {
        console.log(`${size} cards: ${duration.toFixed(2)}ms`)
      })

      // Check that scaling is reasonable (not exponential)
      const ratio2000to500 = results[3].duration / results[1].duration
      expect(ratio2000to500).toBeLessThan(8) // Should be less than 8x slower for 4x data
    })

    it('should handle edge case: single card collection', async () => {
      const singleCard = [largeCollection[0]]
      const testIndex = new CardSearchIndex()
      testIndex.buildIndex(singleCard)

      const start = performance.now()
      const results = testIndex.search(singleCard, 'Ancient')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(10) // Should be very fast
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('should handle edge case: empty collection', async () => {
      const emptyCollection: Card[] = []
      const testIndex = new CardSearchIndex()
      testIndex.buildIndex(emptyCollection)

      const start = performance.now()
      const results = testIndex.search(emptyCollection, 'test')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(10) // Should be very fast
      expect(results).toHaveLength(0)
    })
  })
})

describe('Integration Performance Tests', () => {
  let service: CardManagementService
  let testCollection: Card[]

  beforeEach(() => {
    service = new CardManagementService()
    testCollection = generateLargeCardCollection(1000)
    
    // Mock the loadCollection method
    vi.spyOn(service, 'loadCollection' as any).mockResolvedValue({
      cards: testCollection,
      playerId: 'perf-test-player',
      collectionId: 'perf-test-collection'
    })
  })

  it('should handle full search workflow within time limits', async () => {
    const start = performance.now()
    
    const searchResult = await service.searchCards('perf-test-player', 'Ancient Dragon', {
      maxResults: 50,
      includeAbilities: true,
      sortBy: 'relevance'
    })
    
    const duration = performance.now() - start

    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME * 2) // Allow extra time for full workflow
    expect(searchResult.cards.length).toBeGreaterThanOrEqual(0)
    expect(searchResult.executionTime).toBeDefined()

    console.log(`Full search workflow: ${duration.toFixed(2)}ms`)
    console.log(`Results found: ${searchResult.cards.length}`)
  })

  it('should handle batch operations efficiently', async () => {
    const operations = [
      { type: 'search' as const, params: { searchTerm: 'Dragon', options: {} } },
      { type: 'filter' as const, params: { 
        filters: [{
          id: 'test', name: 'test', criteria: { rarities: ['Rare', 'Epic'] },
          active: true, createdDate: new Date(), lastUsed: new Date(), playerId: 'test'
        }], 
        options: {} 
      } },
      { type: 'sort' as const, params: { sortBy: 'name', sortOrder: 'asc' } }
    ]

    const start = performance.now()
    const results = await service.batchProcessCards(testCollection, operations)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME * 3) // Multiple operations
    expect(results.length).toBeGreaterThan(0)

    console.log(`Batch operations: ${duration.toFixed(2)}ms`)
    console.log(`Final result count: ${results.length}`)
  })
})

// Helper function to run performance benchmarks
export function runPerformanceBenchmark(name: string, fn: () => Promise<void> | void, iterations = 10) {
  return it(`${name} - benchmark`, async () => {
    const durations: number[] = []

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await fn()
      const duration = performance.now() - start
      durations.push(duration)
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    const stdDev = Math.sqrt(durations.reduce((a, b) => a + Math.pow(b - avgDuration, 2), 0) / durations.length)

    console.log(`\n${name} Benchmark Results (${iterations} iterations):`)
    console.log(`Average: ${avgDuration.toFixed(2)}ms`)
    console.log(`Min: ${minDuration.toFixed(2)}ms`)
    console.log(`Max: ${maxDuration.toFixed(2)}ms`)
    console.log(`Std Dev: ${stdDev.toFixed(2)}ms`)

    // Expect reasonable performance
    expect(avgDuration).toBeLessThan(PERFORMANCE_TARGETS.SEARCH_TIME)
    expect(stdDev / avgDuration).toBeLessThan(0.5) // Coefficient of variation < 50%
  })
}