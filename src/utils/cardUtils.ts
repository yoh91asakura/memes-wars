/**
 * Common card utilities to reduce duplication across services
 * 
 * This module provides shared validation, formatting, and transformation
 * functions used across card management services.
 */

import type { Card } from '../models/Card'

/**
 * Validation utilities
 */
export class CardValidation {
  static validatePlayerId(playerId: string): void {
    if (!playerId?.trim()) {
      throw new Error('Invalid player ID: Player ID is required')
    }
    if (playerId.length < 3 || playerId.length > 50) {
      throw new Error('Invalid player ID: Must be between 3 and 50 characters')
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(playerId)) {
      throw new Error('Invalid player ID: Must contain only letters, numbers, hyphens, and underscores')
    }
  }

  static validateCardId(cardId: string): void {
    if (!cardId?.trim()) {
      throw new Error('Invalid card ID: Card ID is required')
    }
    if (cardId.length < 3 || cardId.length > 50) {
      throw new Error('Invalid card ID: Must be between 3 and 50 characters')
    }
  }

  static validateSearchTerm(searchTerm: string, required = false): void {
    if (required && !searchTerm?.trim()) {
      throw new Error('Search term is required')
    }
    if (searchTerm && searchTerm.length > 200) {
      throw new Error('Search term too long: Maximum 200 characters')
    }
  }

  static validatePaginationParams(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = Math.max(1, page || 1)
    const validatedLimit = Math.min(Math.max(1, limit || 50), 200)
    return { page: validatedPage, limit: validatedLimit }
  }

  static validateSortField(sortBy: string, validFields: string[]): void {
    if (!validFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}. Valid fields are: ${validFields.join(', ')}`)
    }
  }

  static validateSortOrder(sortOrder: string): 'asc' | 'desc' {
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      throw new Error('Invalid sort order: Must be "asc" or "desc"')
    }
    return sortOrder
  }

  static validateImageFile(file: File): void {
    if (!file) {
      throw new Error('Image file is required')
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type: Must be an image')
    }
    
    if (!file.type.includes('png') && !file.type.includes('jpg') && !file.type.includes('jpeg')) {
      throw new Error('Invalid image format: Only PNG and JPEG are supported')
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('File too large: Maximum size is 10MB')
    }
    
    if (file.size < 1000) { // 1KB
      throw new Error('File too small: Minimum size is 1KB')
    }
  }

  static validateMetadata(metadata: Record<string, any>): void {
    if (metadata.usageCount !== undefined) {
      if (typeof metadata.usageCount !== 'number' || metadata.usageCount < 0) {
        throw new Error('Invalid usage count: Must be a non-negative number')
      }
    }
    
    if (metadata.userRating !== undefined) {
      if (typeof metadata.userRating !== 'number' || metadata.userRating < 1 || metadata.userRating > 5) {
        throw new Error('Invalid user rating: Must be between 1 and 5')
      }
    }
    
    if (metadata.tags !== undefined) {
      if (!Array.isArray(metadata.tags)) {
        throw new Error('Invalid tags: Must be an array')
      }
      if (metadata.tags.length > 20) {
        throw new Error('Too many tags: Maximum 20 tags allowed')
      }
      if (metadata.tags.some((tag: any) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Invalid tag: Tags must be strings with maximum 50 characters')
      }
    }
    
    if (metadata.notes !== undefined) {
      if (typeof metadata.notes !== 'string' || metadata.notes.length > 500) {
        throw new Error('Invalid notes: Must be string with maximum 500 characters')
      }
    }
  }
}

/**
 * Formatting utilities
 */
export class CardFormatting {
  static getRarityName(probability: number): string {
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

  static getRarityColor(probability: number): string {
    if (probability <= 2) return '#9E9E9E' // Gray
    if (probability <= 4) return '#4CAF50' // Green
    if (probability <= 10) return '#2196F3' // Blue
    if (probability <= 50) return '#9C27B0' // Purple
    if (probability <= 200) return '#FF9800' // Orange
    if (probability <= 1000) return '#F44336' // Red
    if (probability <= 10000) return '#E91E63' // Pink
    if (probability <= 100000) return '#3F51B5' // Indigo
    if (probability <= 1000000) return '#FF5722' // Deep Orange
    return '#795548' // Brown
  }

  static formatCardName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }

  static formatDescription(description: string): string {
    return description.trim().replace(/\s+/g, ' ').slice(0, 500)
  }

  static formatAbilities(abilities: string[]): string[] {
    return abilities
      .map(ability => ability.trim())
      .filter(ability => ability.length > 0)
      .slice(0, 10) // Limit to 10 abilities
  }

  static formatTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 20) // Limit to 20 tags
  }

  static formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
  }

  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  static formatPercentage(value: number, precision = 1): string {
    return `${value.toFixed(precision)}%`
  }
}

/**
 * Card transformation utilities
 */
export class CardTransform {
  static toSearchableText(card: Card): string {
    return [
      card.name,
      card.description || '',
      ...(card.abilities || []),
      card.family || '',
      card.type || '',
      CardFormatting.getRarityName(card.rarity)
    ].join(' ').toLowerCase()
  }

  static extractKeywords(card: Card): string[] {
    const text = this.toSearchableText(card)
    return text
      .split(/\W+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word))
      .slice(0, 20) // Limit keywords per card
  }

  static sanitizeCardData(card: Partial<Card>): Partial<Card> {
    const sanitized: Partial<Card> = {}

    if (card.id) sanitized.id = String(card.id).trim()
    if (card.name) sanitized.name = CardFormatting.formatCardName(card.name)
    if (card.description) sanitized.description = CardFormatting.formatDescription(card.description)
    if (card.abilities) sanitized.abilities = CardFormatting.formatAbilities(card.abilities)
    if (card.family) sanitized.family = String(card.family).trim()
    if (card.type) sanitized.type = String(card.type).trim()
    if (typeof card.rarity === 'number') sanitized.rarity = Math.max(0, card.rarity)
    if (typeof card.luck === 'number') sanitized.luck = Math.max(0, card.luck)
    if (typeof card.cost === 'number') sanitized.cost = Math.max(0, card.cost)
    if (typeof card.hp === 'number') sanitized.hp = Math.max(0, card.hp)
    if (typeof card.attack === 'number') sanitized.attack = Math.max(0, card.attack)
    if (typeof card.defense === 'number') sanitized.defense = Math.max(0, card.defense)

    return sanitized
  }

  static buildSearchIndex(cards: Card[]): Array<{
    cardId: string
    searchableText: string
    keywords: string[]
    rarity: number
    type: string
    family: string
    abilities: string[]
  }> {
    return cards.map(card => ({
      cardId: card.id,
      searchableText: this.toSearchableText(card),
      keywords: this.extractKeywords(card),
      rarity: card.rarity,
      type: card.type || '',
      family: card.family || '',
      abilities: card.abilities || []
    }))
  }

  private static isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ])
    return stopWords.has(word.toLowerCase())
  }
}

/**
 * Error handling utilities
 */
export class CardErrorUtils {
  static createValidationError(field: string, message: string): Error {
    const error = new Error(`Validation Error: ${message}`)
    error.name = 'ValidationError'
    ;(error as any).field = field
    return error
  }

  static createNotFoundError(entity: string, id: string): Error {
    const error = new Error(`${entity} not found: ${id}`)
    error.name = 'NotFoundError'
    ;(error as any).entityType = entity
    ;(error as any).entityId = id
    return error
  }

  static createPermissionError(operation: string): Error {
    const error = new Error(`Permission denied: ${operation}`)
    error.name = 'PermissionError'
    ;(error as any).operation = operation
    return error
  }

  static createRateLimitError(limit: number, window: number): Error {
    const error = new Error(`Rate limit exceeded: ${limit} requests per ${window}ms`)
    error.name = 'RateLimitError'
    ;(error as any).limit = limit
    ;(error as any).window = window
    return error
  }

  static isRetryableError(error: Error): boolean {
    const retryableTypes = ['NetworkError', 'TimeoutError', 'ServiceUnavailable']
    const retryableMessages = ['network error', 'timeout', 'service unavailable', 'connection']
    
    return retryableTypes.includes(error.name) ||
           retryableMessages.some(msg => error.message.toLowerCase().includes(msg))
  }
}

/**
 * Performance utilities
 */
export class CardPerfUtils {
  static measureOperation<T>(
    operationName: string,
    operation: () => T | Promise<T>
  ): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve) => {
      const start = performance.now()
      
      try {
        const result = await operation()
        const duration = performance.now() - start
        
        resolve({ result, duration })
      } catch (error) {
        const duration = performance.now() - start
        console.error(`Operation ${operationName} failed after ${duration}ms:`, error)
        throw error
      }
    })
  }

  static createCacheKey(...parts: (string | number | boolean | null | undefined)[]): string {
    return parts
      .filter(part => part !== null && part !== undefined)
      .map(part => String(part))
      .join(':')
  }

  static shouldUseWorker(itemCount: number, threshold = 1000): boolean {
    return itemCount > threshold && typeof Worker !== 'undefined'
  }

  static shouldUseChunking(itemCount: number, threshold = 500): boolean {
    return itemCount > threshold
  }

  static calculateOptimalChunkSize(itemCount: number, maxChunkSize = 100): number {
    if (itemCount <= maxChunkSize) return itemCount
    
    // Aim for 10-20 chunks
    const targetChunks = Math.max(10, Math.min(20, Math.sqrt(itemCount)))
    return Math.ceil(itemCount / targetChunks)
  }
}

// Export all utilities as a combined object
export const CardUtils = {
  Validation: CardValidation,
  Formatting: CardFormatting,
  Transform: CardTransform,
  Error: CardErrorUtils,
  Perf: CardPerfUtils
}

export default CardUtils