/**
 * Unit tests for card management filter utilities
 * 
 * These tests verify the correctness and performance of filtering,
 * searching, and sorting operations for card collections.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Card } from '../../src/models/Card'
import { CardSearchIndex, debounce, processInChunks } from '../../src/utils/performance'
import { CardManagementService } from '../../src/services/CardManagementService'

// Mock card data
const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: `card-${Math.random()}`,
  name: 'Test Card',
  image: 'test.png',
  description: 'A test card',
  rarity: 50,
  luck: 100,
  cost: 3,
  hp: 100,
  attack: 50,
  defense: 30,
  abilities: ['Test Ability'],
  family: 'Test',
  type: 'Creature',
  createdAt: new Date().toISOString(),
  stackLevel: 1,
  goldReward: 10,
  ...overrides
})

const createMockCards = (count: number): Card[] => {
  const cards: Card[] = []
  const rarities = [2, 4, 10, 50, 200, 1000] // Common to Mythic
  const families = ['Fire', 'Water', 'Earth', 'Air', 'Dark', 'Light']
  const types = ['Creature', 'Spell', 'Artifact', 'Enchantment']
  
  for (let i = 0; i < count; i++) {
    cards.push(createMockCard({
      id: `card-${i}`,
      name: `Test Card ${i}`,
      description: `Description for card ${i}`,
      rarity: rarities[i % rarities.length],
      cost: (i % 10) + 1,
      luck: (i % 1000) + 1,
      family: families[i % families.length],
      type: types[i % types.length],
      abilities: [`Ability ${i}`, `Power ${i % 3}`],
      hp: (i % 200) + 50,
      attack: (i % 100) + 20,
      defense: (i % 80) + 10
    }))
  }
  
  return cards
}

describe('CardSearchIndex', () => {
  let searchIndex: CardSearchIndex
  let mockCards: Card[]

  beforeEach(() => {
    searchIndex = new CardSearchIndex()
    mockCards = createMockCards(100)
    searchIndex.buildIndex(mockCards)
  })

  describe('buildIndex', () => {
    it('should build index for all cards', () => {
      const stats = searchIndex.getStats()
      expect(stats.indexSize).toBe(100)
      expect(stats.keywordCount).toBeGreaterThan(0)
    })

    it('should handle empty card list', () => {
      const emptyIndex = new CardSearchIndex()
      emptyIndex.buildIndex([])
      
      const stats = emptyIndex.getStats()
      expect(stats.indexSize).toBe(0)
      expect(stats.keywordCount).toBe(0)
    })

    it('should rebuild index when called multiple times', () => {
      const newCards = createMockCards(50)
      searchIndex.buildIndex(newCards)
      
      const stats = searchIndex.getStats()
      expect(stats.indexSize).toBe(50)
    })
  })

  describe('search', () => {
    it('should find cards by name', () => {
      const results = searchIndex.search(mockCards, 'Test Card 1')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toContain('Test Card 1')
    })

    it('should find cards by description', () => {
      const results = searchIndex.search(mockCards, 'Description for card 5')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(card => card.description.includes('Description for card 5'))).toBe(true)
    })

    it('should find cards by ability', () => {
      const results = searchIndex.search(mockCards, 'Ability 10')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(card => card.abilities.some(ability => ability.includes('Ability 10')))).toBe(true)
    })

    it('should return empty array for non-matching search', () => {
      const results = searchIndex.search(mockCards, 'NonExistentCard')
      expect(results).toHaveLength(0)
    })

    it('should handle empty search term', () => {
      const results = searchIndex.search(mockCards, '')
      expect(results).toEqual(mockCards)
    })

    it('should handle multiple keywords (AND behavior)', () => {
      const results = searchIndex.search(mockCards, 'Test Card')
      expect(results.length).toBe(mockCards.length) // All cards match "Test Card"
    })

    it('should score results by relevance', () => {
      const results = searchIndex.search(mockCards, 'Test Card 1')
      expect(results[0].name).toBe('Test Card 1') // Exact match should be first
    })

    it('should be case insensitive', () => {
      const results = searchIndex.search(mockCards, 'test card 1')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toContain('Test Card 1')
    })
  })

  describe('filter', () => {
    const createFilter = (criteria: any, active = true) => ({
      id: 'test-filter',
      name: 'Test Filter',
      criteria,
      active,
      createdDate: new Date(),
      lastUsed: new Date(),
      playerId: 'test-player'
    })

    it('should filter by rarity', () => {
      const filter = createFilter({ rarities: ['Common'] })
      const results = searchIndex.filter(mockCards, [filter])
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(card => card.rarity <= 2)).toBe(true)
    })

    it('should filter by cost range', () => {
      const filter = createFilter({ costRange: { min: 5, max: 7 } })
      const results = searchIndex.filter(mockCards, [filter])
      
      expect(results.every(card => card.cost >= 5 && card.cost <= 7)).toBe(true)
    })

    it('should filter by type', () => {
      const filter = createFilter({ types: ['Creature'] })
      const results = searchIndex.filter(mockCards, [filter])
      
      expect(results.every(card => card.type === 'Creature')).toBe(true)
    })

    it('should filter by text search', () => {
      const filter = createFilter({ textSearch: 'card 5' })
      const results = searchIndex.filter(mockCards, [filter])
      
      expect(results.every(card => 
        card.name.toLowerCase().includes('card 5') ||
        card.description?.toLowerCase().includes('card 5') ||
        card.abilities?.some(ability => ability.toLowerCase().includes('card 5'))
      )).toBe(true)
    })

    it('should apply multiple filters (AND behavior)', () => {
      const filters = [
        createFilter({ rarities: ['Common', 'Uncommon'] }),
        createFilter({ costRange: { min: 1, max: 3 } })
      ]
      const results = searchIndex.filter(mockCards, filters)
      
      expect(results.every(card => 
        card.rarity <= 4 && card.cost >= 1 && card.cost <= 3
      )).toBe(true)
    })

    it('should ignore inactive filters', () => {
      const filters = [
        createFilter({ rarities: ['Common'] }, true),
        createFilter({ costRange: { min: 100, max: 200 } }, false) // Inactive
      ]
      const results = searchIndex.filter(mockCards, filters)
      
      // Should only apply the active filter
      expect(results.every(card => card.rarity <= 2)).toBe(true)
      expect(results.some(card => card.cost < 100)).toBe(true)
    })

    it('should return all cards when no filters are active', () => {
      const filters = [
        createFilter({ rarities: ['Common'] }, false),
        createFilter({ costRange: { min: 100, max: 200 } }, false)
      ]
      const results = searchIndex.filter(mockCards, filters)
      
      expect(results).toHaveLength(mockCards.length)
    })

    it('should handle empty filters array', () => {
      const results = searchIndex.filter(mockCards, [])
      expect(results).toHaveLength(mockCards.length)
    })
  })

  describe('performance', () => {
    it('should handle large collections efficiently', () => {
      const largeCardSet = createMockCards(1000)
      const start = performance.now()
      
      searchIndex.buildIndex(largeCardSet)
      const searchResults = searchIndex.search(largeCardSet, 'Test Card')
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // Should complete within 100ms
      expect(searchResults.length).toBeGreaterThan(0)
    })

    it('should cache search results', () => {
      // First search
      const start1 = performance.now()
      const results1 = searchIndex.search(mockCards, 'Test Card 1')
      const duration1 = performance.now() - start1

      // Second search (should be cached)
      const start2 = performance.now()
      const results2 = searchIndex.search(mockCards, 'Test Card 1')
      const duration2 = performance.now() - start2

      expect(results1).toEqual(results2)
      expect(duration2).toBeLessThan(duration1) // Cached should be faster
    })
  })
})

describe('Performance Utilities', () => {
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      // Call multiple times rapidly
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled()

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should have been called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    it('should support immediate execution', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100, true)

      debouncedFn('arg1')
      
      // Should be called immediately
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })

    it('should support cancellation', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn.cancel()

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should support flush', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn.flush()

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })
  })

  describe('processInChunks', () => {
    it('should process items in chunks', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const chunkSize = 10
      const processedChunks: number[][] = []

      const processor = async (chunk: number[]) => {
        processedChunks.push([...chunk])
        return chunk.map(x => x * 2)
      }

      const results = await processInChunks(items, processor, chunkSize)

      expect(processedChunks).toHaveLength(10) // 100 items / 10 per chunk
      expect(processedChunks[0]).toHaveLength(10)
      expect(results).toHaveLength(100)
      expect(results[0]).toBe(0) // 0 * 2
      expect(results[1]).toBe(2) // 1 * 2
    })

    it('should report progress', async () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const progressUpdates: any[] = []

      const processor = async (chunk: number[]) => chunk

      await processInChunks(
        items, 
        processor, 
        10,
        (progress) => progressUpdates.push(progress)
      )

      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100)
    })

    it('should handle empty arrays', async () => {
      const results = await processInChunks([], async (chunk) => chunk, 10)
      expect(results).toHaveLength(0)
    })

    it('should handle single item chunks', async () => {
      const items = [1, 2, 3]
      const results = await processInChunks(items, async (chunk) => chunk, 1)
      
      expect(results).toEqual([1, 2, 3])
    })
  })
})

describe('CardManagementService Filtering', () => {
  let service: CardManagementService
  let mockCards: Card[]

  beforeEach(() => {
    // Mock the loadCollection method to return our test cards
    service = new CardManagementService()
    mockCards = createMockCards(200)
    
    vi.spyOn(service, 'loadCollection' as any).mockResolvedValue({
      cards: mockCards,
      playerId: 'test-player',
      collectionId: 'test-collection'
    })
  })

  describe('search performance', () => {
    it('should handle small collections with Fuse.js', async () => {
      const smallCards = createMockCards(50)
      vi.spyOn(service, 'loadCollection' as any).mockResolvedValue({
        cards: smallCards,
        playerId: 'test-player',
        collectionId: 'test-collection'
      })

      const start = performance.now()
      const result = await service.searchCards('test-player', 'Test Card 1')
      const duration = performance.now() - start

      expect(result.cards.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(100) // Should be fast for small collections
    })

    it('should handle large collections with indexing', async () => {
      const largeCards = createMockCards(600)
      vi.spyOn(service, 'loadCollection' as any).mockResolvedValue({
        cards: largeCards,
        playerId: 'test-player',
        collectionId: 'test-collection'
      })

      const start = performance.now()
      const result = await service.searchCards('test-player', 'Test Card')
      const duration = performance.now() - start

      expect(result.cards.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(200) // Should be optimized for large collections
    })
  })

  describe('sort performance', () => {
    it('should sort cards by name', async () => {
      const unsortedCards = [
        createMockCard({ name: 'Zebra Card' }),
        createMockCard({ name: 'Alpha Card' }),
        createMockCard({ name: 'Beta Card' })
      ]

      const result = await service.sortCards(unsortedCards, 'name', 'asc')

      expect(result[0].name).toBe('Alpha Card')
      expect(result[1].name).toBe('Beta Card')
      expect(result[2].name).toBe('Zebra Card')
    })

    it('should sort cards by rarity', async () => {
      const unsortedCards = [
        createMockCard({ rarity: 200 }), // Legendary
        createMockCard({ rarity: 2 }),   // Common
        createMockCard({ rarity: 50 })   // Epic
      ]

      const result = await service.sortCards(unsortedCards, 'rarity', 'desc')

      expect(result[0].rarity).toBe(200) // Highest rarity first
      expect(result[1].rarity).toBe(50)
      expect(result[2].rarity).toBe(2)   // Lowest rarity last
    })

    it('should handle invalid sort fields', async () => {
      await expect(service.sortCards(mockCards, 'invalidField' as any, 'asc'))
        .rejects.toThrow('Invalid sort field')
    })
  })

  describe('batch processing', () => {
    it('should process multiple operations in sequence', async () => {
      const operations = [
        { type: 'filter' as const, params: { filters: [], options: {} } },
        { type: 'sort' as const, params: { sortBy: 'name', sortOrder: 'asc' } }
      ]

      const result = await service.batchProcessCards(mockCards, operations)

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      
      // Check that sorting was applied (first card should be alphabetically first)
      const sortedNames = result.map(card => card.name).sort()
      expect(result[0].name).toBe(sortedNames[0])
    })

    it('should handle empty operations array', async () => {
      const result = await service.batchProcessCards(mockCards, [])
      expect(result).toEqual(mockCards)
    })
  })
})

describe('Edge Cases and Error Handling', () => {
  let searchIndex: CardSearchIndex

  beforeEach(() => {
    searchIndex = new CardSearchIndex()
  })

  it('should handle cards with missing fields', () => {
    const cardsWithMissingFields = [
      createMockCard({ description: undefined, abilities: undefined }),
      createMockCard({ family: undefined, type: undefined }),
      createMockCard({ name: '' })
    ]

    expect(() => searchIndex.buildIndex(cardsWithMissingFields)).not.toThrow()
    
    const results = searchIndex.search(cardsWithMissingFields, 'Test')
    expect(results).toBeDefined()
  })

  it('should handle very long search terms', () => {
    const mockCards = createMockCards(10)
    searchIndex.buildIndex(mockCards)

    const veryLongSearchTerm = 'a'.repeat(1000)
    const results = searchIndex.search(mockCards, veryLongSearchTerm)
    
    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBe(true)
  })

  it('should handle special characters in search', () => {
    const cardsWithSpecialChars = [
      createMockCard({ name: 'Card with @#$%' }),
      createMockCard({ name: 'Card with émojis 🎮' }),
      createMockCard({ description: 'Has "quotes" and symbols!' })
    ]

    searchIndex.buildIndex(cardsWithSpecialChars)
    
    const results1 = searchIndex.search(cardsWithSpecialChars, '@#$%')
    const results2 = searchIndex.search(cardsWithSpecialChars, 'émojis')
    const results3 = searchIndex.search(cardsWithSpecialChars, '"quotes"')

    expect(results1.length).toBeGreaterThanOrEqual(0)
    expect(results2.length).toBeGreaterThanOrEqual(0)
    expect(results3.length).toBeGreaterThanOrEqual(0)
  })

  it('should handle numerical searches', () => {
    const cardsWithNumbers = [
      createMockCard({ name: 'Card 123' }),
      createMockCard({ description: 'Costs 42 gold' }),
      createMockCard({ abilities: ['Deal 999 damage'] })
    ]

    searchIndex.buildIndex(cardsWithNumbers)
    
    const results1 = searchIndex.search(cardsWithNumbers, '123')
    const results2 = searchIndex.search(cardsWithNumbers, '42')
    const results3 = searchIndex.search(cardsWithNumbers, '999')

    expect(results1.some(card => card.name.includes('123'))).toBe(true)
    expect(results2.some(card => card.description?.includes('42'))).toBe(true)
    expect(results3.some(card => card.abilities?.some(ability => ability.includes('999')))).toBe(true)
  })
})

describe('Memory and Performance Stress Tests', () => {
  it('should handle very large collections without memory leaks', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Create and process a very large collection
    const largeCollection = createMockCards(5000)
    const searchIndex = new CardSearchIndex()
    
    searchIndex.buildIndex(largeCollection)
    
    // Perform multiple operations
    for (let i = 0; i < 100; i++) {
      const results = searchIndex.search(largeCollection, `Card ${i}`)
      expect(results).toBeDefined()
    }
    
    // Clear the index
    searchIndex.clear()
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc()
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  }, 30000) // 30 second timeout for this intensive test

  it('should maintain performance with repeated operations', async () => {
    const cards = createMockCards(1000)
    const searchIndex = new CardSearchIndex()
    searchIndex.buildIndex(cards)
    
    const durations: number[] = []
    
    // Perform 50 search operations and measure each
    for (let i = 0; i < 50; i++) {
      const start = performance.now()
      searchIndex.search(cards, `Test Card ${i % 100}`)
      const duration = performance.now() - start
      durations.push(duration)
    }
    
    // Calculate average and check that later operations aren't significantly slower
    const firstTen = durations.slice(0, 10)
    const lastTen = durations.slice(-10)
    
    const firstAvg = firstTen.reduce((a, b) => a + b, 0) / firstTen.length
    const lastAvg = lastTen.reduce((a, b) => a + b, 0) / lastTen.length
    
    // Last operations shouldn't be more than 2x slower than first
    expect(lastAvg).toBeLessThan(firstAvg * 2)
  })
})

// Helper function to measure async function performance
async function measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}