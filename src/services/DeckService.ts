// Deck Service - Deck validation and management operations

import { Deck, DeckStats, DeckValidation, DeckValidationError, DeckValidationWarning } from '../models/Deck';
import { Card } from '../models/Card';
import { EmojiProjectile } from '../models/Combat';
import { StageManager } from '../data/stages';

export interface IDeckService {
  validateDeck(cards: Card[], stageNumber?: number): boolean;
  validateDeckForStage(cards: Card[], stageNumber: number): DeckValidation;
  calculateTotalHP(deck: Deck): number;
  getActiveEmojis(deck: Deck): EmojiProjectile[];
  getDeckSizeLimit(stageNumber: number): number;
  saveDeck(deck: Deck): void;
  loadDeck(id: string): Deck;
}

export class DeckService implements IDeckService {
  private readonly MIN_DECK_SIZE = 15;
  private readonly MAX_DECK_SIZE = 30;
  private readonly MAX_COPIES_PER_CARD = 3;

  public validateDeck(cards: Card[], stageNumber?: number): boolean {
    if (stageNumber) {
      const validation = this.validateDeckForStage(cards, stageNumber);
      return validation.isValid;
    }
    const validation = this.getDetailedValidation(cards);
    return validation.isValid;
  }

  public validateDeckForStage(cards: Card[], stageNumber: number): DeckValidation {
    const errors: DeckValidationError[] = [];
    const warnings: DeckValidationWarning[] = [];
    
    // Get stage-specific deck size limit
    const deckSizeLimit = this.getDeckSizeLimit(stageNumber);
    
    // Stage-specific size validation
    if (cards.length === 0) {
      errors.push({
        type: 'size',
        message: `Deck cannot be empty for stage ${stageNumber}.`,
        severity: 'error'
      });
    }
    
    if (cards.length > deckSizeLimit) {
      errors.push({
        type: 'size',
        message: `Deck size exceeds limit for stage ${stageNumber}. Maximum: ${deckSizeLimit}, current: ${cards.length}.`,
        severity: 'error'
      });
    }
    
    // Warning if deck is not at maximum size
    if (cards.length < deckSizeLimit && cards.length > 0) {
      warnings.push({
        type: 'optimization',
        message: `Deck could use ${deckSizeLimit - cards.length} more cards for stage ${stageNumber}.`,
        severity: 'warning'
      });
    }
    
    // Duplicate validation (same as original)
    const cardCounts = this.getCardCounts(cards);
    for (const [cardId, count] of cardCounts) {
      if (count > this.MAX_COPIES_PER_CARD) {
        errors.push({
          type: 'duplicates',
          message: `Too many copies of card ${cardId}. Maximum ${this.MAX_COPIES_PER_CARD}, found ${count}.`,
          severity: 'error'
        });
      }
    }
    
    // Stage difficulty suggestions
    const stage = StageManager.getStage(stageNumber);
    if (stage) {
      // Suggest strategy based on enemy emojis
      const enemyEmojis = stage.enemyEmojis;
      if (enemyEmojis.includes('🛡️') && !cards.some(card => card.emojis?.some(emoji => emoji.character === '💥'))) {
        warnings.push({
          type: 'strategy',
          message: `Enemy has shields (🛡️). Consider adding explosive emojis (💥) for better damage.`,
          severity: 'info'
        });
      }
      
      if (enemyEmojis.includes('🔥') && !cards.some(card => card.emojis?.some(emoji => emoji.character === '❄️'))) {
        warnings.push({
          type: 'strategy',
          message: `Enemy uses fire (🔥). Consider adding ice emojis (❄️) for counter-effect.`,
          severity: 'info'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      deckSize: cards.length,
      maxDeckSize: deckSizeLimit
    };
  }

  public getDeckSizeLimit(stageNumber: number): number {
    return StageManager.getDeckSizeLimit(stageNumber);
  }

  public getDetailedValidation(cards: Card[]): DeckValidation {
    const errors: DeckValidationError[] = [];
    const warnings: DeckValidationWarning[] = [];

    // Size validation
    if (cards.length < this.MIN_DECK_SIZE) {
      errors.push({
        type: 'size',
        message: `Deck must contain at least ${this.MIN_DECK_SIZE} cards. Currently has ${cards.length}.`,
        severity: 'error'
      });
    }

    if (cards.length > this.MAX_DECK_SIZE) {
      errors.push({
        type: 'size',
        message: `Deck cannot exceed ${this.MAX_DECK_SIZE} cards. Currently has ${cards.length}.`,
        severity: 'error'
      });
    }

    // Duplicate validation
    const cardCounts = this.getCardCounts(cards);
    for (const [cardId, count] of cardCounts) {
      if (count > this.MAX_COPIES_PER_CARD) {
        errors.push({
          type: 'duplicates',
          message: `Too many copies of "${cardId}". Maximum ${this.MAX_COPIES_PER_CARD} allowed, found ${count}.`,
          severity: 'error',
          affectedCards: [cardId]
        });
      }
    }

    // Balance warnings
    const stats = this.calculateDeckStats(cards);
    
    if (stats.offensiveRating < 3) {
      warnings.push({
        type: 'balance',
        message: 'Deck has low offensive power. Consider adding more damage-dealing cards.',
        severity: 'warning',
        suggestion: 'Add cards with higher damage values or better offensive abilities.'
      });
    }

    if (stats.defensiveRating < 3) {
      warnings.push({
        type: 'balance',
        message: 'Deck has low defensive capabilities. Consider adding more health or shield cards.',
        severity: 'warning',
        suggestion: 'Add cards with higher health values or defensive abilities.'
      });
    }

    // Synergy analysis
    const synergyScore = this.calculateSynergyScore(cards);
    if (synergyScore < 0.5) {
      warnings.push({
        type: 'synergy',
        message: 'Deck cards have limited synergy. Cards may work better together with similar types or abilities.',
        severity: 'info',
        suggestion: 'Consider focusing on a specific strategy or card types that complement each other.'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: []
    };
  }

  public calculateTotalHP(deck: Deck): number {
    return deck.cards.reduce((total, card) => {
      return total + (card.health || 0);
    }, 0);
  }

  public calculateTotalDamage(deck: Deck): number {
    return deck.cards.reduce((total, card) => {
      return total + (card.damage || 0);
    }, 0);
  }

  public calculateDeckStats(cards: Card[]): DeckStats {
    const totalCards = cards.length;
    const totalHealth = cards.reduce((sum, card) => sum + (card.health || 0), 0);
    const totalDamage = cards.reduce((sum, card) => sum + (card.damage || 0), 0);

    // Rarity distribution
    const rarityDistribution = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
      cosmic: 0,
      divine: 0,
      infinity: 0
    };

    cards.forEach(card => {
      if (card.rarity in rarityDistribution) {
        rarityDistribution[card.rarity as keyof typeof rarityDistribution]++;
      }
    });

    // Type distribution
    const typeDistribution: Record<string, number> = {};
    cards.forEach(card => {
      const type = card.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // Calculate ratings (1-10 scale)
    const averageDamage = totalCards > 0 ? totalDamage / totalCards : 0;
    const averageHealth = totalCards > 0 ? totalHealth / totalCards : 0;

    const offensiveRating = Math.min(10, Math.max(1, averageDamage / 10));
    const defensiveRating = Math.min(10, Math.max(1, averageHealth / 20));
    const utilityRating = this.calculateUtilityRating(cards);
    const synergyRating = this.calculateSynergyScore(cards) * 10;

    return {
      totalHealth,
      totalDamage,
      averageDamage,
      averageHealth,
      rarityDistribution,
      typeDistribution,
      projectedFireRate: this.calculateFireRate(cards),
      projectedDPS: averageDamage * this.calculateFireRate(cards),
      projectedSurvivability: averageHealth + this.calculateShieldValue(cards),
      offensiveRating,
      defensiveRating,
      utilityRating,
      synergyRating,
      overallRating: (offensiveRating + defensiveRating + utilityRating + synergyRating) / 4
    };
  }

  public getActiveEmojis(deck: Deck): EmojiProjectile[] {
    // Extract emoji projectiles from deck cards
    return deck.cards.map(card => ({
      id: `emoji_${card.id}`,
      emoji: card.emoji,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      damage: card.damage || 10,
      size: 32,
      rotation: 0,
      ownerId: 'player',
      bounces: 0,
      maxBounces: 2,
      lifespan: 0,
      maxLifespan: 5,
      effects: [],
      trail: [],
      isActive: false
    }));
  }

  public saveDeck(deck: Deck): void {
    try {
      const deckData = {
        ...deck,
        updatedAt: new Date().toISOString(),
        stats: this.calculateDeckStats(deck.cards)
      };

      // Save to localStorage as fallback
      const savedDecks = this.getSavedDecks();
      const existingIndex = savedDecks.findIndex(d => d.id === deck.id);
      
      if (existingIndex >= 0) {
        savedDecks[existingIndex] = deckData;
      } else {
        savedDecks.push(deckData);
      }

      localStorage.setItem('saved_decks', JSON.stringify(savedDecks));
    } catch (error) {
      console.error('Failed to save deck:', error);
      throw new Error('Unable to save deck. Please try again.');
    }
  }

  public loadDeck(id: string): Deck {
    try {
      const savedDecks = this.getSavedDecks();
      const deck = savedDecks.find(d => d.id === id);
      
      if (!deck) {
        throw new Error(`Deck with ID "${id}" not found.`);
      }

      return deck;
    } catch (error) {
      console.error('Failed to load deck:', error);
      throw new Error('Unable to load deck. It may have been deleted or corrupted.');
    }
  }

  public loadAllDecks(): Deck[] {
    return this.getSavedDecks();
  }

  public deleteDeck(id: string): void {
    try {
      const savedDecks = this.getSavedDecks();
      const filteredDecks = savedDecks.filter(d => d.id !== id);
      localStorage.setItem('saved_decks', JSON.stringify(filteredDecks));
    } catch (error) {
      console.error('Failed to delete deck:', error);
      throw new Error('Unable to delete deck. Please try again.');
    }
  }

  public createDeck(name: string, cards: Card[] = []): Deck {
    const now = new Date().toISOString();
    const deck: Deck = {
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: '',
      cards,
      isActive: false,
      isValid: this.validateDeck(cards),
      createdAt: now,
      updatedAt: now,
      createdBy: 'current_user', // This would come from auth context
      version: 1,
      maxSize: this.MAX_DECK_SIZE,
      minSize: this.MIN_DECK_SIZE,
      format: 'standard',
      stats: this.calculateDeckStats(cards),
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        backgroundColor: '#f8fafc',
        cardBackDesign: 'default',
        iconSet: 'default',
        name: 'Default'
      },
      isPublic: false,
      likes: 0,
      downloads: 0,
      tags: [],
      isTournamentLegal: true,
      bannedCards: [],
      restrictedCards: []
    };

    return deck;
  }

  public duplicateDeck(originalDeck: Deck, newName: string): Deck {
    const duplicatedDeck = {
      ...originalDeck,
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      cards: [...originalDeck.cards] // Deep copy the cards array
    };

    return duplicatedDeck;
  }

  public exportDeck(deck: Deck, format: 'json' | 'text' | 'url' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(deck, null, 2);
      case 'text':
        return this.deckToTextFormat(deck);
      case 'url':
        return this.deckToUrlFormat(deck);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  public importDeck(data: string, format: 'json' | 'text' | 'url' = 'json'): Deck {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(data);
        case 'text':
          return this.textFormatToDeck(data);
        case 'url':
          return this.urlFormatToDeck(data);
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Failed to import deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public optimizeDeck(deck: Deck, strategy: 'balance' | 'offense' | 'defense' | 'synergy' = 'balance'): Deck {
    const optimizedCards = [...deck.cards];
    
    switch (strategy) {
      case 'offense':
        // Sort by damage, keep highest damage cards
        optimizedCards.sort((a, b) => (b.damage || 0) - (a.damage || 0));
        break;
      case 'defense':
        // Sort by health, keep highest health cards
        optimizedCards.sort((a, b) => (b.health || 0) - (a.health || 0));
        break;
      case 'synergy':
        // Group by type and keep cards that work well together
        optimizedCards.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
        break;
      case 'balance':
      default:
        // Balance between offense and defense
        optimizedCards.sort((a, b) => {
          const scoreA = (a.damage || 0) + (a.health || 0);
          const scoreB = (b.damage || 0) + (b.health || 0);
          return scoreB - scoreA;
        });
        break;
    }

    return {
      ...deck,
      cards: optimizedCards.slice(0, this.MAX_DECK_SIZE),
      updatedAt: new Date().toISOString(),
      stats: this.calculateDeckStats(optimizedCards)
    };
  }

  // Private helper methods
  private getSavedDecks(): Deck[] {
    try {
      const saved = localStorage.getItem('saved_decks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private getCardCounts(cards: Card[]): Map<string, number> {
    const counts = new Map<string, number>();
    cards.forEach(card => {
      counts.set(card.id, (counts.get(card.id) || 0) + 1);
    });
    return counts;
  }

  private calculateFireRate(cards: Card[]): number {
    // Base fire rate calculation based on card properties
    const baseRate = 2.0; // projectiles per second
    const speedModifiers = cards.reduce((sum, card) => {
      // Cards with lower cost tend to fire faster
      const cost = card.cost || 1;
      return sum + (1 / cost);
    }, 0);
    
    return baseRate + (speedModifiers / cards.length);
  }

  private calculateShieldValue(cards: Card[]): number {
    return cards.reduce((sum, card) => {
      // Cards with defensive properties contribute to shield
      if (card.type === 'defense' || card.abilities?.some(a => a.includes('shield'))) {
        return sum + (card.health || 0) * 0.5;
      }
      return sum;
    }, 0);
  }

  private calculateUtilityRating(cards: Card[]): number {
    let utilityScore = 0;
    
    cards.forEach(card => {
      // Cards with special abilities get utility points
      if (card.abilities && card.abilities.length > 0) {
        utilityScore += card.abilities.length;
      }
      
      // Cards with effects get utility points
      if (card.effect) {
        utilityScore += 1;
      }
    });

    return Math.min(10, utilityScore / Math.max(1, cards.length) * 10);
  }

  private calculateSynergyScore(cards: Card[]): number {
    const typeGroups = new Map<string, number>();
    
    cards.forEach(card => {
      const type = card.type || 'unknown';
      typeGroups.set(type, (typeGroups.get(type) || 0) + 1);
    });

    // Higher score for having groups of similar types
    let synergyScore = 0;
    for (const [, count] of typeGroups) {
      if (count >= 3) {
        synergyScore += count * 0.2;
      }
    }

    return Math.min(1, synergyScore / cards.length);
  }

  private deckToTextFormat(deck: Deck): string {
    let text = `# ${deck.name}\n\n`;
    text += `## Cards (${deck.cards.length})\n`;
    
    const cardCounts = this.getCardCounts(deck.cards);
    const uniqueCards = Array.from(cardCounts.keys());
    
    uniqueCards.forEach(cardId => {
      const card = deck.cards.find(c => c.id === cardId)!;
      const count = cardCounts.get(cardId)!;
      text += `${count}x ${card.name} (${card.rarity})\n`;
    });

    return text;
  }

  private deckToUrlFormat(deck: Deck): string {
    const encoded = btoa(JSON.stringify({
      id: deck.id,
      name: deck.name,
      cards: deck.cards.map(c => ({ id: c.id, count: 1 }))
    }));
    
    return `${window.location.origin}/deck/import/${encoded}`;
  }

  private textFormatToDeck(text: string): Deck {
    // Parse text format back to deck
    const lines = text.split('\n').filter(line => line.trim());
    const name = lines[0].replace('# ', '').trim();
    
    // This would need more sophisticated parsing in a real implementation
    throw new Error('Text format import not fully implemented');
  }

  private urlFormatToDeck(url: string): Deck {
    try {
      const encoded = url.split('/').pop()!;
      const decoded = JSON.parse(atob(encoded));
      
      // This would need to reconstruct the full deck from the encoded data
      throw new Error('URL format import not fully implemented');
    } catch {
      throw new Error('Invalid deck URL format');
    }
  }
}