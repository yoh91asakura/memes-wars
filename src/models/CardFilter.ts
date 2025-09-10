/**
 * CardFilter Model with Persistence
 * 
 * This model represents filter criteria and saved filter presets
 * for the card management system.
 */

export interface CostRange {
  min: number
  max: number
}

export interface LuckRange {
  min: number
  max: number
}

export interface CardFilterCriteria {
  // Basic filters
  rarity?: string[]
  type?: string[]
  family?: string[]
  
  // Range filters
  costRange?: CostRange
  luckRange?: LuckRange
  stackRange?: CostRange // min/max stack level
  
  // Boolean filters
  hasCustomImage?: boolean | null
  isFavorite?: boolean | null
  isLocked?: boolean | null
  hasAbilities?: boolean | null
  
  // Text search
  searchText?: string
  
  // Sorting
  sortBy?: 'name' | 'rarity' | 'luck' | 'cost' | 'stackLevel' | 'createdAt' | 'goldReward' | 'family'
  sortOrder?: 'asc' | 'desc'
  
  // Advanced filters
  abilityTypes?: string[]
  effectTypes?: string[]
  minGoldReward?: number
  maxGoldReward?: number
  
  // Date filters
  acquiredAfter?: string
  acquiredBefore?: string
  lastUsedAfter?: string
  lastUsedBefore?: string
}

export interface FilterPreset {
  id: string
  name: string
  description?: string
  criteria: CardFilterCriteria
  
  // Metadata
  playerId: string
  createdAt: string
  lastUsed?: string
  usageCount: number
  
  // Sharing
  isPublic: boolean
  createdBy: string
  tags: string[]
  
  // System presets
  isSystemPreset: boolean
  category?: 'collection' | 'deck-building' | 'analysis' | 'fun'
}

export interface QuickFilter {
  id: string
  label: string
  criteria: Partial<CardFilterCriteria>
  icon?: string
  color?: string
  description?: string
}

export interface FilterState {
  // Current active filter
  activeCriteria: CardFilterCriteria
  
  // Saved presets
  presets: FilterPreset[]
  
  // Quick access filters
  quickFilters: QuickFilter[]
  
  // Recently used
  recentPresets: string[] // Preset IDs
  
  // Search history
  searchHistory: string[]
  
  // Applied filters for undo/redo
  filterHistory: CardFilterCriteria[]
  currentHistoryIndex: number
  
  // Player settings
  playerId: string
  lastSync: string
  autoSaveEnabled: boolean
}

export interface FilterValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface FilterApplication {
  criteria: CardFilterCriteria
  appliedAt: string
  resultCount: number
  executionTime: number
  cacheHit: boolean
}

/**
 * Filter Factory Functions
 */
export class FilterFactory {
  /**
   * Create empty filter criteria
   */
  static createEmptyCriteria(): CardFilterCriteria {
    return {
      sortBy: 'name',
      sortOrder: 'asc'
    }
  }

  /**
   * Create default filter state for new player
   */
  static createDefaultState(playerId: string): FilterState {
    return {
      activeCriteria: this.createEmptyCriteria(),
      presets: this.createDefaultPresets(playerId),
      quickFilters: this.createDefaultQuickFilters(),
      recentPresets: [],
      searchHistory: [],
      filterHistory: [this.createEmptyCriteria()],
      currentHistoryIndex: 0,
      playerId,
      lastSync: new Date().toISOString(),
      autoSaveEnabled: true
    }
  }

  /**
   * Create a new filter preset
   */
  static createPreset(
    playerId: string,
    name: string,
    criteria: CardFilterCriteria,
    options: {
      description?: string
      isPublic?: boolean
      tags?: string[]
      category?: FilterPreset['category']
    } = {}
  ): FilterPreset {
    return {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options.description,
      criteria,
      playerId,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isPublic: options.isPublic ?? false,
      createdBy: playerId,
      tags: options.tags ?? [],
      isSystemPreset: false,
      category: options.category
    }
  }

  /**
   * Create default filter presets
   */
  private static createDefaultPresets(playerId: string): FilterPreset[] {
    return [
      this.createSystemPreset(playerId, 'all-cards', 'All Cards', {}, {
        description: 'Show all cards in collection',
        category: 'collection'
      }),
      this.createSystemPreset(playerId, 'favorites', 'Favorites', {
        isFavorite: true
      }, {
        description: 'Show only favorite cards',
        category: 'collection'
      }),
      this.createSystemPreset(playerId, 'custom-images', 'Custom Images', {
        hasCustomImage: true
      }, {
        description: 'Cards with custom artwork',
        category: 'collection'
      }),
      this.createSystemPreset(playerId, 'high-rarity', 'High Rarity', {
        rarity: ['Epic', 'Legendary', 'Mythic', 'Cosmic', 'Divine'],
        sortBy: 'rarity',
        sortOrder: 'desc'
      }, {
        description: 'Epic rarity and above',
        category: 'collection'
      }),
      this.createSystemPreset(playerId, 'deck-ready', 'Deck Ready', {
        luckRange: { min: 100, max: 10000 },
        stackRange: { min: 2, max: 10 },
        sortBy: 'luck',
        sortOrder: 'desc'
      }, {
        description: 'Cards ready for deck building',
        category: 'deck-building'
      }),
      this.createSystemPreset(playerId, 'recent', 'Recently Acquired', {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, {
        description: 'Most recently acquired cards',
        category: 'collection'
      })
    ]
  }

  /**
   * Create system preset (non-deletable)
   */
  private static createSystemPreset(
    playerId: string,
    id: string,
    name: string,
    criteria: CardFilterCriteria,
    options: {
      description?: string
      category?: FilterPreset['category']
    } = {}
  ): FilterPreset {
    return {
      id,
      name,
      description: options.description,
      criteria: {
        ...this.createEmptyCriteria(),
        ...criteria
      },
      playerId,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isPublic: false,
      createdBy: 'system',
      tags: ['system'],
      isSystemPreset: true,
      category: options.category
    }
  }

  /**
   * Create default quick filters
   */
  private static createDefaultQuickFilters(): QuickFilter[] {
    return [
      {
        id: 'common',
        label: 'Common',
        criteria: { rarity: ['Common'] },
        icon: '⚪',
        color: '#9CA3AF',
        description: 'Common rarity cards'
      },
      {
        id: 'uncommon',
        label: 'Uncommon',
        criteria: { rarity: ['Uncommon'] },
        icon: '🟢',
        color: '#10B981',
        description: 'Uncommon rarity cards'
      },
      {
        id: 'rare',
        label: 'Rare',
        criteria: { rarity: ['Rare'] },
        icon: '🔵',
        color: '#3B82F6',
        description: 'Rare rarity cards'
      },
      {
        id: 'epic',
        label: 'Epic',
        criteria: { rarity: ['Epic'] },
        icon: '🟣',
        color: '#8B5CF6',
        description: 'Epic rarity cards'
      },
      {
        id: 'legendary',
        label: 'Legendary',
        criteria: { rarity: ['Legendary'] },
        icon: '🟠',
        color: '#F59E0B',
        description: 'Legendary rarity cards'
      },
      {
        id: 'mythic-plus',
        label: 'Mythic+',
        criteria: { rarity: ['Mythic', 'Cosmic', 'Divine', 'Infinity', 'Beyond'] },
        icon: '🌟',
        color: '#EF4444',
        description: 'Mythic rarity and above'
      },
      {
        id: 'high-luck',
        label: 'High Luck',
        criteria: { luckRange: { min: 500, max: 10000 } },
        icon: '🍀',
        color: '#10B981',
        description: 'Cards with 500+ luck'
      },
      {
        id: 'stacked',
        label: 'Stacked',
        criteria: { stackRange: { min: 2, max: 10 } },
        icon: '📚',
        color: '#3B82F6',
        description: 'Stacked cards (level 2+)'
      },
      {
        id: 'custom-art',
        label: 'Custom Art',
        criteria: { hasCustomImage: true },
        icon: '🎨',
        color: '#8B5CF6',
        description: 'Cards with custom images'
      },
      {
        id: 'favorites',
        label: 'Favorites',
        criteria: { isFavorite: true },
        icon: '⭐',
        color: '#F59E0B',
        description: 'Favorite cards'
      }
    ]
  }
}

/**
 * Filter Validation Functions
 */
export class FilterValidator {
  /**
   * Validate filter criteria
   */
  static validate(criteria: CardFilterCriteria): FilterValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate rarity values
    if (criteria.rarity && criteria.rarity.length > 0) {
      const validRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic', 'Divine', 'Infinity', 'Beyond']
      const invalidRarities = criteria.rarity.filter(r => !validRarities.includes(r))
      if (invalidRarities.length > 0) {
        errors.push(`Invalid rarity values: ${invalidRarities.join(', ')}`)
      }
    }

    // Validate cost range
    if (criteria.costRange) {
      if (criteria.costRange.min < 0) {
        errors.push('Cost minimum cannot be negative')
      }
      if (criteria.costRange.max < criteria.costRange.min) {
        errors.push('Cost maximum must be greater than minimum')
      }
      if (criteria.costRange.max > 20) {
        warnings.push('Cost maximum is very high')
      }
    }

    // Validate luck range
    if (criteria.luckRange) {
      if (criteria.luckRange.min < 0) {
        errors.push('Luck minimum cannot be negative')
      }
      if (criteria.luckRange.max < criteria.luckRange.min) {
        errors.push('Luck maximum must be greater than minimum')
      }
      if (criteria.luckRange.max > 10000) {
        warnings.push('Luck maximum is very high')
      }
    }

    // Validate stack range
    if (criteria.stackRange) {
      if (criteria.stackRange.min < 1) {
        errors.push('Stack level minimum must be at least 1')
      }
      if (criteria.stackRange.max > 10) {
        errors.push('Stack level maximum cannot exceed 10')
      }
      if (criteria.stackRange.max < criteria.stackRange.min) {
        errors.push('Stack maximum must be greater than minimum')
      }
    }

    // Validate sort field
    if (criteria.sortBy) {
      const validSortFields = ['name', 'rarity', 'luck', 'cost', 'stackLevel', 'createdAt', 'goldReward', 'family']
      if (!validSortFields.includes(criteria.sortBy)) {
        errors.push(`Invalid sort field: ${criteria.sortBy}`)
      }
    }

    // Validate sort order
    if (criteria.sortOrder && !['asc', 'desc'].includes(criteria.sortOrder)) {
      errors.push(`Invalid sort order: ${criteria.sortOrder}`)
    }

    // Validate search text
    if (criteria.searchText && criteria.searchText.length > 100) {
      warnings.push('Search text is very long')
    }

    // Validate date formats
    if (criteria.acquiredAfter && isNaN(Date.parse(criteria.acquiredAfter))) {
      errors.push('Invalid acquiredAfter date format')
    }
    if (criteria.acquiredBefore && isNaN(Date.parse(criteria.acquiredBefore))) {
      errors.push('Invalid acquiredBefore date format')
    }
    if (criteria.lastUsedAfter && isNaN(Date.parse(criteria.lastUsedAfter))) {
      errors.push('Invalid lastUsedAfter date format')
    }
    if (criteria.lastUsedBefore && isNaN(Date.parse(criteria.lastUsedBefore))) {
      errors.push('Invalid lastUsedBefore date format')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate filter preset
   */
  static validatePreset(preset: FilterPreset): FilterValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate basic properties
    if (!preset.id?.trim()) {
      errors.push('Preset ID is required')
    }

    if (!preset.name?.trim()) {
      errors.push('Preset name is required')
    } else if (preset.name.length > 50) {
      warnings.push('Preset name is very long')
    }

    if (!preset.playerId?.trim()) {
      errors.push('Player ID is required')
    }

    if (!preset.createdAt || isNaN(Date.parse(preset.createdAt))) {
      errors.push('Valid creation date is required')
    }

    // Validate criteria
    const criteriaValidation = this.validate(preset.criteria)
    errors.push(...criteriaValidation.errors)
    warnings.push(...criteriaValidation.warnings)

    // Validate tags
    if (preset.tags && preset.tags.some(tag => tag.length > 20)) {
      warnings.push('Some tags are very long')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

/**
 * Filter Utility Functions
 */
export class FilterUtils {
  /**
   * Check if criteria is empty (no filters applied)
   */
  static isEmpty(criteria: CardFilterCriteria): boolean {
    const hasFilters = 
      (criteria.rarity && criteria.rarity.length > 0) ||
      (criteria.type && criteria.type.length > 0) ||
      (criteria.family && criteria.family.length > 0) ||
      criteria.costRange ||
      criteria.luckRange ||
      criteria.stackRange ||
      criteria.hasCustomImage !== undefined ||
      criteria.isFavorite !== undefined ||
      criteria.isLocked !== undefined ||
      (criteria.searchText && criteria.searchText.trim().length > 0) ||
      (criteria.abilityTypes && criteria.abilityTypes.length > 0) ||
      criteria.minGoldReward !== undefined ||
      criteria.maxGoldReward !== undefined

    return !hasFilters
  }

  /**
   * Merge multiple criteria (for combining filters)
   */
  static merge(base: CardFilterCriteria, overlay: CardFilterCriteria): CardFilterCriteria {
    return {
      ...base,
      ...overlay,
      rarity: overlay.rarity || base.rarity,
      type: overlay.type || base.type,
      family: overlay.family || base.family,
      abilityTypes: overlay.abilityTypes || base.abilityTypes
    }
  }

  /**
   * Get human-readable filter description
   */
  static describe(criteria: CardFilterCriteria): string {
    const parts: string[] = []

    if (criteria.rarity && criteria.rarity.length > 0) {
      parts.push(`Rarity: ${criteria.rarity.join(', ')}`)
    }

    if (criteria.type && criteria.type.length > 0) {
      parts.push(`Type: ${criteria.type.join(', ')}`)
    }

    if (criteria.family && criteria.family.length > 0) {
      parts.push(`Family: ${criteria.family.join(', ')}`)
    }

    if (criteria.costRange) {
      parts.push(`Cost: ${criteria.costRange.min}-${criteria.costRange.max}`)
    }

    if (criteria.luckRange) {
      parts.push(`Luck: ${criteria.luckRange.min}-${criteria.luckRange.max}`)
    }

    if (criteria.hasCustomImage === true) {
      parts.push('Has custom image')
    }

    if (criteria.isFavorite === true) {
      parts.push('Favorites only')
    }

    if (criteria.searchText) {
      parts.push(`Search: "${criteria.searchText}"`)
    }

    if (criteria.sortBy) {
      parts.push(`Sorted by ${criteria.sortBy} (${criteria.sortOrder || 'asc'})`)
    }

    return parts.length > 0 ? parts.join(', ') : 'No filters applied'
  }

  /**
   * Calculate estimated result count (for performance optimization)
   */
  static estimateResultCount(criteria: CardFilterCriteria, totalCards: number): number {
    let estimatedCount = totalCards

    // Apply rarity filter estimation
    if (criteria.rarity && criteria.rarity.length > 0) {
      const rarityPercentage = criteria.rarity.length / 10 // Assuming 10 rarities
      estimatedCount *= rarityPercentage
    }

    // Apply other filter estimations
    if (criteria.hasCustomImage === true) {
      estimatedCount *= 0.1 // Assume 10% have custom images
    }

    if (criteria.isFavorite === true) {
      estimatedCount *= 0.05 // Assume 5% are favorites
    }

    if (criteria.searchText && criteria.searchText.length > 0) {
      estimatedCount *= 0.3 // Text search typically reduces results significantly
    }

    return Math.ceil(estimatedCount)
  }

  /**
   * Check if two criteria are equivalent
   */
  static areEqual(a: CardFilterCriteria, b: CardFilterCriteria): boolean {
    return JSON.stringify(this.normalize(a)) === JSON.stringify(this.normalize(b))
  }

  /**
   * Normalize criteria for comparison
   */
  static normalize(criteria: CardFilterCriteria): CardFilterCriteria {
    const normalized = { ...criteria }
    
    // Sort arrays for consistent comparison
    if (normalized.rarity) {
      normalized.rarity = [...normalized.rarity].sort()
    }
    if (normalized.type) {
      normalized.type = [...normalized.type].sort()
    }
    if (normalized.family) {
      normalized.family = [...normalized.family].sort()
    }
    
    // Remove undefined values
    Object.keys(normalized).forEach(key => {
      if (normalized[key as keyof CardFilterCriteria] === undefined) {
        delete normalized[key as keyof CardFilterCriteria]
      }
    })
    
    return normalized
  }

  /**
   * Create filter for recent cards
   */
  static createRecentFilter(days: number = 7): CardFilterCriteria {
    const date = new Date()
    date.setDate(date.getDate() - days)
    
    return {
      acquiredAfter: date.toISOString(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }

  /**
   * Create filter for deck building
   */
  static createDeckBuildingFilter(): CardFilterCriteria {
    return {
      luckRange: { min: 50, max: 10000 },
      stackRange: { min: 1, max: 10 },
      sortBy: 'luck',
      sortOrder: 'desc'
    }
  }

  /**
   * Create filter for collection analysis
   */
  static createAnalysisFilter(analysisType: 'power' | 'rarity' | 'family'): CardFilterCriteria {
    switch (analysisType) {
      case 'power':
        return {
          luckRange: { min: 100, max: 10000 },
          sortBy: 'luck',
          sortOrder: 'desc'
        }
      case 'rarity':
        return {
          rarity: ['Epic', 'Legendary', 'Mythic', 'Cosmic', 'Divine', 'Infinity', 'Beyond'],
          sortBy: 'rarity',
          sortOrder: 'desc'
        }
      case 'family':
        return {
          sortBy: 'family',
          sortOrder: 'asc'
        }
      default:
        return this.createEmptyCriteria()
    }
  }

  private static createEmptyCriteria(): CardFilterCriteria {
    return FilterFactory.createEmptyCriteria()
  }
}