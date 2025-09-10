/**
 * CardCollection Model with Search Index
 * 
 * This model represents a player's card collection with enhanced
 * functionality for search, filtering, and metadata management.
 */

import type { Card } from './Card'

export interface CollectionMetadata {
  totalCards: number
  totalByRarity: Record<string, number>
  totalByType: Record<string, number>
  totalByFamily: Record<string, number>
  averageLuck: number
  averageStackLevel: number
  customImageCount: number
  favoriteCount: number
  lastActivity: string
  completionPercentage: number
  collectionValue: number // Total gold value
}

export interface SearchIndex {
  cardId: string
  searchText: string
  keywords: string[]
  rarityWeight: number
  familyBonus: number
  lastIndexed: string
}

export interface CollectionStats {
  // Rarity distribution
  rarityDistribution: {
    rarity: string
    count: number
    percentage: number
  }[]
  
  // Family distribution
  familyDistribution: {
    family: string
    count: number
    synergies: string[]
  }[]
  
  // Power analysis
  powerAnalysis: {
    averageLuck: number
    totalDeckHP: number
    strongestCard: string
    mostUsedCard: string
    newestCard: string
  }
  
  // Collection health
  collectionHealth: {
    duplicateCount: number
    unstackedCount: number
    underusedCount: number
    recommendations: string[]
  }
}

export interface CardCollection {
  // Collection identity
  playerId: string
  collectionId: string
  
  // Card data
  cards: Card[]
  totalCount: number
  
  // Metadata
  metadata: CollectionMetadata
  
  // Search and indexing
  searchIndex: SearchIndex[]
  
  // Statistics
  stats?: CollectionStats
  
  // Sync information
  lastSync: string
  syncVersion: number
  
  // Pagination info
  page?: number
  limit?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

/**
 * Collection Factory Functions
 */
export class CollectionFactory {
  /**
   * Create empty collection for new player
   */
  static createEmpty(playerId: string): CardCollection {
    const now = new Date().toISOString()
    
    return {
      playerId,
      collectionId: `collection-${playerId}-${Date.now()}`,
      cards: [],
      totalCount: 0,
      metadata: {
        totalCards: 0,
        totalByRarity: {},
        totalByType: {},
        totalByFamily: {},
        averageLuck: 0,
        averageStackLevel: 0,
        customImageCount: 0,
        favoriteCount: 0,
        lastActivity: now,
        completionPercentage: 0,
        collectionValue: 0
      },
      searchIndex: [],
      lastSync: now,
      syncVersion: 1
    }
  }

  /**
   * Create collection from card array
   */
  static fromCards(playerId: string, cards: Card[]): CardCollection {
    const collection = this.createEmpty(playerId)
    
    collection.cards = cards
    collection.totalCount = cards.length
    collection.metadata = this.calculateMetadata(cards)
    collection.searchIndex = this.buildSearchIndex(cards)
    collection.stats = this.calculateStats(cards)
    
    return collection
  }

  /**
   * Add card to collection
   */
  static addCard(collection: CardCollection, card: Card): CardCollection {
    const updatedCards = [...collection.cards, card]
    
    return {
      ...collection,
      cards: updatedCards,
      totalCount: updatedCards.length,
      metadata: this.calculateMetadata(updatedCards),
      searchIndex: this.buildSearchIndex(updatedCards),
      stats: this.calculateStats(updatedCards),
      lastSync: new Date().toISOString(),
      syncVersion: collection.syncVersion + 1
    }
  }

  /**
   * Remove card from collection
   */
  static removeCard(collection: CardCollection, cardId: string): CardCollection {
    const updatedCards = collection.cards.filter(c => c.id !== cardId)
    
    return {
      ...collection,
      cards: updatedCards,
      totalCount: updatedCards.length,
      metadata: this.calculateMetadata(updatedCards),
      searchIndex: this.buildSearchIndex(updatedCards),
      stats: this.calculateStats(updatedCards),
      lastSync: new Date().toISOString(),
      syncVersion: collection.syncVersion + 1
    }
  }

  /**
   * Update card in collection
   */
  static updateCard(collection: CardCollection, updatedCard: Card): CardCollection {
    const updatedCards = collection.cards.map(c => 
      c.id === updatedCard.id ? updatedCard : c
    )
    
    return {
      ...collection,
      cards: updatedCards,
      metadata: this.calculateMetadata(updatedCards),
      searchIndex: this.buildSearchIndex(updatedCards),
      stats: this.calculateStats(updatedCards),
      lastSync: new Date().toISOString(),
      syncVersion: collection.syncVersion + 1
    }
  }

  /**
   * Calculate collection metadata
   */
  private static calculateMetadata(cards: Card[]): CollectionMetadata {
    const totalCards = cards.length
    
    if (totalCards === 0) {
      return {
        totalCards: 0,
        totalByRarity: {},
        totalByType: {},
        totalByFamily: {},
        averageLuck: 0,
        averageStackLevel: 0,
        customImageCount: 0,
        favoriteCount: 0,
        lastActivity: new Date().toISOString(),
        completionPercentage: 0,
        collectionValue: 0
      }
    }

    // Calculate rarity distribution
    const totalByRarity: Record<string, number> = {}
    cards.forEach(card => {
      const rarityName = this.getRarityName(card.rarity)
      totalByRarity[rarityName] = (totalByRarity[rarityName] || 0) + 1
    })

    // Calculate type distribution (if cards have type property)
    const totalByType: Record<string, number> = {}
    cards.forEach(card => {
      if (card.type) {
        totalByType[card.type] = (totalByType[card.type] || 0) + 1
      }
    })

    // Calculate family distribution
    const totalByFamily: Record<string, number> = {}
    cards.forEach(card => {
      const family = card.family || 'Unknown'
      totalByFamily[family] = (totalByFamily[family] || 0) + 1
    })

    // Calculate averages
    const averageLuck = cards.reduce((sum, card) => sum + card.luck, 0) / totalCards
    const averageStackLevel = cards.reduce((sum, card) => sum + card.stackLevel, 0) / totalCards

    // Count special properties
    const customImageCount = 0 // Cards don't have customImage in current model
    const favoriteCount = 0 // Cards don't have favorite in current model

    // Calculate collection value
    const collectionValue = cards.reduce((sum, card) => sum + card.goldReward, 0)

    // Find last activity
    const lastActivity = cards.reduce((latest, card) => {
      const cardTime = card.updatedAt || card.createdAt
      return cardTime > latest ? cardTime : latest
    }, cards[0]?.createdAt || new Date().toISOString())

    return {
      totalCards,
      totalByRarity,
      totalByType,
      totalByFamily,
      averageLuck,
      averageStackLevel,
      customImageCount,
      favoriteCount,
      lastActivity,
      completionPercentage: this.calculateCompletionPercentage(cards),
      collectionValue
    }
  }

  /**
   * Build search index for cards
   */
  private static buildSearchIndex(cards: Card[]): SearchIndex[] {
    return cards.map(card => ({
      cardId: card.id,
      searchText: this.generateSearchText(card),
      keywords: this.extractKeywords(card),
      rarityWeight: this.getRarityWeight(card.rarity),
      familyBonus: card.family ? 1 : 0,
      lastIndexed: new Date().toISOString()
    }))
  }

  /**
   * Calculate comprehensive stats
   */
  private static calculateStats(cards: Card[]): CollectionStats {
    if (cards.length === 0) {
      return {
        rarityDistribution: [],
        familyDistribution: [],
        powerAnalysis: {
          averageLuck: 0,
          totalDeckHP: 0,
          strongestCard: '',
          mostUsedCard: '',
          newestCard: ''
        },
        collectionHealth: {
          duplicateCount: 0,
          unstackedCount: 0,
          underusedCount: 0,
          recommendations: []
        }
      }
    }

    // Rarity distribution
    const rarityDistribution = this.calculateRarityDistribution(cards)
    
    // Family distribution
    const familyDistribution = this.calculateFamilyDistribution(cards)
    
    // Power analysis
    const powerAnalysis = this.calculatePowerAnalysis(cards)
    
    // Collection health
    const collectionHealth = this.calculateCollectionHealth(cards)

    return {
      rarityDistribution,
      familyDistribution,
      powerAnalysis,
      collectionHealth
    }
  }

  private static calculateRarityDistribution(cards: Card[]) {
    const distribution: Record<string, number> = {}
    
    cards.forEach(card => {
      const rarity = this.getRarityName(card.rarity)
      distribution[rarity] = (distribution[rarity] || 0) + 1
    })

    return Object.entries(distribution).map(([rarity, count]) => ({
      rarity,
      count,
      percentage: (count / cards.length) * 100
    }))
  }

  private static calculateFamilyDistribution(cards: Card[]) {
    const distribution: Record<string, { count: number; synergies: string[] }> = {}
    
    cards.forEach(card => {
      const family = card.family || 'Unknown'
      if (!distribution[family]) {
        distribution[family] = { count: 0, synergies: [] }
      }
      distribution[family].count += 1
      
      // Add synergies if available
      if (card.synergies) {
        card.synergies.forEach(synergy => {
          if (!distribution[family].synergies.includes(synergy)) {
            distribution[family].synergies.push(synergy)
          }
        })
      }
    })

    return Object.entries(distribution).map(([family, data]) => ({
      family,
      count: data.count,
      synergies: data.synergies
    }))
  }

  private static calculatePowerAnalysis(cards: Card[]) {
    const averageLuck = cards.reduce((sum, card) => sum + card.luck, 0) / cards.length
    const totalDeckHP = cards.reduce((sum, card) => sum + (card.hp || 0), 0)
    
    // Find strongest card (by luck)
    const strongestCard = cards.reduce((strongest, card) => 
      card.luck > strongest.luck ? card : strongest
    )

    // Most recent card
    const newestCard = cards.reduce((newest, card) => 
      (card.createdAt || '') > (newest.createdAt || '') ? card : newest
    )

    return {
      averageLuck,
      totalDeckHP,
      strongestCard: strongestCard.name,
      mostUsedCard: strongestCard.name, // Placeholder - would need usage tracking
      newestCard: newestCard.name
    }
  }

  private static calculateCollectionHealth(cards: Card[]) {
    const duplicateNames = new Set<string>()
    const seenNames = new Set<string>()
    
    cards.forEach(card => {
      if (seenNames.has(card.name)) {
        duplicateNames.add(card.name)
      }
      seenNames.add(card.name)
    })

    const unstackedCount = cards.filter(card => card.stackLevel === 1).length
    const underusedCount = cards.filter(card => (card.hp || 0) < 150).length

    const recommendations: string[] = []
    if (duplicateNames.size > 0) {
      recommendations.push(`Consider stacking ${duplicateNames.size} duplicate cards`)
    }
    if (unstackedCount > cards.length * 0.5) {
      recommendations.push('Many cards could benefit from stacking')
    }
    if (underusedCount > 0) {
      recommendations.push(`${underusedCount} cards might need upgrading`)
    }

    return {
      duplicateCount: duplicateNames.size,
      unstackedCount,
      underusedCount,
      recommendations
    }
  }

  private static generateSearchText(card: Card): string {
    const parts = [
      card.name,
      card.description || '',
      card.reference || '',
      this.getRarityName(card.rarity),
      card.family || '',
      card.type || ''
    ]
    
    return parts.join(' ').toLowerCase()
  }

  private static extractKeywords(card: Card): string[] {
    const keywords: string[] = []
    
    // Add name words
    keywords.push(...card.name.toLowerCase().split(/\s+/))
    
    // Add rarity
    keywords.push(this.getRarityName(card.rarity).toLowerCase())
    
    // Add family
    if (card.family) {
      keywords.push(card.family.toLowerCase())
    }
    
    // Add type
    if (card.type) {
      keywords.push(card.type.toLowerCase())
    }
    
    // Add emoji characters
    if (card.emojis) {
      card.emojis.forEach(emoji => {
        if (typeof emoji === 'string') {
          keywords.push(emoji)
        } else {
          keywords.push(emoji.character)
        }
      })
    }
    
    return [...new Set(keywords)].filter(k => k.length > 0)
  }

  private static calculateCompletionPercentage(cards: Card[]): number {
    // This would need to know about all possible cards in the game
    // For now, return a placeholder calculation
    return Math.min(100, (cards.length / 100) * 100)
  }

  private static getRarityName(probability: number): string {
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

  private static getRarityWeight(probability: number): number {
    if (probability <= 2) return 1
    if (probability <= 4) return 2
    if (probability <= 10) return 3
    if (probability <= 50) return 4
    if (probability <= 200) return 5
    if (probability <= 1000) return 6
    if (probability <= 10000) return 7
    if (probability <= 100000) return 8
    if (probability <= 1000000) return 9
    return 10
  }
}

/**
 * Collection Utility Functions
 */
export class CollectionUtils {
  /**
   * Filter collection by criteria
   */
  static filter(collection: CardCollection, criteria: {
    rarity?: string[]
    family?: string[]
    type?: string[]
    minLuck?: number
    maxLuck?: number
    hasCustomImage?: boolean
    isFavorite?: boolean
    searchText?: string
  }): Card[] {
    return collection.cards.filter(card => {
      // Rarity filter
      if (criteria.rarity && criteria.rarity.length > 0) {
        const cardRarity = CollectionFactory['getRarityName'](card.rarity)
        if (!criteria.rarity.includes(cardRarity)) return false
      }

      // Family filter
      if (criteria.family && criteria.family.length > 0) {
        if (!criteria.family.includes(card.family || '')) return false
      }

      // Type filter
      if (criteria.type && criteria.type.length > 0) {
        if (!criteria.type.includes(card.type || '')) return false
      }

      // Luck range filter
      if (criteria.minLuck !== undefined && card.luck < criteria.minLuck) return false
      if (criteria.maxLuck !== undefined && card.luck > criteria.maxLuck) return false

      // Search text filter
      if (criteria.searchText) {
        const searchIndex = collection.searchIndex.find(idx => idx.cardId === card.id)
        if (!searchIndex?.searchText.includes(criteria.searchText.toLowerCase())) return false
      }

      return true
    })
  }

  /**
   * Sort collection by criteria
   */
  static sort(cards: Card[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Card[] {
    const sortedCards = [...cards]
    
    sortedCards.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rarity':
          comparison = a.rarity - b.rarity
          break
        case 'luck':
          comparison = a.luck - b.luck
          break
        case 'stackLevel':
          comparison = a.stackLevel - b.stackLevel
          break
        case 'createdAt':
          comparison = (a.createdAt || '').localeCompare(b.createdAt || '')
          break
        case 'goldReward':
          comparison = a.goldReward - b.goldReward
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
    
    return sortedCards
  }

  /**
   * Get collection summary
   */
  static getSummary(collection: CardCollection): string {
    const { metadata } = collection
    return `Collection: ${metadata.totalCards} cards, ${Object.keys(metadata.totalByRarity).length} rarities, ${metadata.collectionValue} total value`
  }

  /**
   * Check if collection needs sync
   */
  static needsSync(collection: CardCollection, serverSyncVersion: number): boolean {
    return collection.syncVersion !== serverSyncVersion
  }

  /**
   * Paginate collection
   */
  static paginate(collection: CardCollection, page: number, limit: number): CardCollection {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedCards = collection.cards.slice(startIndex, endIndex)
    const totalPages = Math.ceil(collection.totalCount / limit)
    
    return {
      ...collection,
      cards: paginatedCards,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }
}