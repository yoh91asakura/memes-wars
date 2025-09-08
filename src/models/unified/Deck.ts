// Unified Deck Model - Aligned with Data Model Specification
// Follows specs/001-extract-current-project/data-model.md

import { Card, CardRarity } from './Card';

export enum SynergyType {
  FORCE_BUILD = 'force_build',        // 💪 + weapons
  LUCK_BUILD = 'luck_build',          // 🍀 cards together
  ANIMAL_PACK = 'animal_pack',        // 3+ animal cards
  MEME_COMBO = 'meme_combo',          // Same meme format cards
  ELEMENTAL = 'elemental',            // Fire/ice/lightning synergy
  CLASSIC_COMBO = 'classic_combo'     // Old school meme synergy
}

// Effect modifier for synergy bonuses
export interface EffectModifier {
  type: 'damage' | 'health' | 'speed' | 'mana_cost' | 'special';
  value: number;      // Multiplier or flat bonus
  description: string;
}

export interface SynergyBonus {
  type: SynergyType;
  cards: Card[];              // Cards contributing to synergy
  bonus: EffectModifier;      // Applied bonus
  active: boolean;            // Whether conditions are met
}

// Deck interface aligned with data-model.md specification
export interface Deck {
  id: string;
  name: string;
  cards: Card[];               // Active cards (size limited by stage)
  maxSize: number;            // Current deck size limit
  synergyBonuses: SynergyBonus[]; // Active bonuses from card combinations
  totalManaCost: number;      // Sum of all card costs
  createdAt: Date;
  lastUsed: Date;
}

// Deck validation utilities - implements constraints from data-model.md
export class DeckValidator {
  static isValid(deck: Deck): boolean {
    // Card count cannot exceed deck size limit (3-8 based on stage)
    if (deck.cards.length > deck.maxSize || deck.maxSize < 3 || deck.maxSize > 8) return false;
    
    // No duplicate cards allowed in same deck
    const cardIds = deck.cards.map(card => card.id);
    const uniqueIds = new Set(cardIds);
    if (cardIds.length !== uniqueIds.size) return false;
    
    // At least 1 card required for combat
    if (deck.cards.length < 1) return false;
    
    // Total mana cost validation (if applicable)
    const calculatedManaCost = deck.cards.reduce((sum, card) => sum + (card.manaCost || 0), 0);
    if (Math.abs(deck.totalManaCost - calculatedManaCost) > 0.01) return false;
    
    return true;
  }
  
  static validateDeckSizeLimit(currentStage: number): number {
    // Deck size limits based on stage progression
    if (currentStage <= 10) return 3;
    if (currentStage <= 25) return 4;
    if (currentStage <= 50) return 5;
    if (currentStage <= 75) return 6;
    if (currentStage <= 100) return 7;
    return 8; // Maximum deck size
  }
}

// Utility functions for working with Decks
export const DeckUtils = {
  // Create a new deck with validation
  createDeck(name: string, maxSize: number): Deck {
    const now = new Date();
    const deck: Deck = {
      id: crypto.randomUUID(),
      name,
      cards: [],
      maxSize,
      synergyBonuses: [],
      totalManaCost: 0,
      createdAt: now,
      lastUsed: now,
    };
    
    if (!DeckValidator.isValid(deck)) {
      throw new Error('Invalid deck configuration');
    }
    
    return deck;
  },
  
  // Add card to deck with validation
  addCard(deck: Deck, card: Card): Deck {
    // Check size limit
    if (deck.cards.length >= deck.maxSize) {
      throw new Error(`Deck is full (max size: ${deck.maxSize})`);
    }
    
    // Check for duplicates
    if (deck.cards.some(existingCard => existingCard.id === card.id)) {
      throw new Error('Card already exists in deck');
    }
    
    const updatedDeck: Deck = {
      ...deck,
      cards: [...deck.cards, card],
      totalManaCost: deck.totalManaCost + (card.manaCost || 0),
      lastUsed: new Date(),
    };
    
    // Recalculate synergies
    updatedDeck.synergyBonuses = this.calculateSynergies(updatedDeck.cards);
    
    return updatedDeck;
  },
  
  // Remove card from deck
  removeCard(deck: Deck, cardId: string): Deck {
    const cardIndex = deck.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in deck');
    }
    
    const removedCard = deck.cards[cardIndex];
    const updatedDeck: Deck = {
      ...deck,
      cards: deck.cards.filter((_, index) => index !== cardIndex),
      totalManaCost: deck.totalManaCost - (removedCard.manaCost || 0),
      lastUsed: new Date(),
    };
    
    // Recalculate synergies
    updatedDeck.synergyBonuses = this.calculateSynergies(updatedDeck.cards);
    
    return updatedDeck;
  },
  
  // Calculate synergies for a deck
  calculateSynergies(cards: Card[]): SynergyBonus[] {
    const bonuses: SynergyBonus[] = [];
    
    // Animal Pack synergy (3+ animal cards)
    const animalCards = cards.filter(card => card.memeFamily === 'animals');
    if (animalCards.length >= 3) {
      bonuses.push({
        type: SynergyType.ANIMAL_PACK,
        cards: animalCards,
        bonus: {
          type: 'health',
          value: 1.2, // +20% health
          description: 'Animal Pack: +20% health for all animal cards'
        },
        active: true
      });
    }
    
    // Classic Combo synergy (old school memes)
    const classicCards = cards.filter(card => card.memeFamily === 'classic_internet');
    if (classicCards.length >= 2) {
      bonuses.push({
        type: SynergyType.CLASSIC_COMBO,
        cards: classicCards,
        bonus: {
          type: 'damage',
          value: 1.15, // +15% damage
          description: 'Classic Combo: +15% damage for classic internet memes'
        },
        active: true
      });
    }
    
    // Force Build synergy (💪 emojis + weapon-like emojis)
    const forceCards = cards.filter(card => 
      card.emojis.some(emoji => ['💪', '👊', '🥊'].includes(emoji))
    );
    const weaponCards = cards.filter(card => 
      card.emojis.some(emoji => ['⚔️', '🗡️', '🔨', '⚡'].includes(emoji))
    );
    
    if (forceCards.length >= 2 && weaponCards.length >= 1) {
      bonuses.push({
        type: SynergyType.FORCE_BUILD,
        cards: [...forceCards, ...weaponCards.slice(0, 1)],
        bonus: {
          type: 'damage',
          value: 2.0, // Double damage
          description: 'Force Build: Double damage when combining strength and weapons'
        },
        active: true
      });
    }
    
    // Luck Build synergy (🍀 cards together)
    const luckCards = cards.filter(card => 
      card.emojis.some(emoji => ['🍀', '🎰', '🎲'].includes(emoji))
    );
    if (luckCards.length >= 2) {
      bonuses.push({
        type: SynergyType.LUCK_BUILD,
        cards: luckCards,
        bonus: {
          type: 'special',
          value: 0.2, // +20% luck proc chance
          description: 'Luck Build: +20% chance for special effects'
        },
        active: true
      });
    }
    
    return bonuses;
  },
  
  // Get deck statistics
  getDeckStats(deck: Deck) {
    const totalCards = deck.cards.length;
    const totalHealth = deck.cards.reduce((sum, card) => sum + card.health, 0);
    const totalDamage = deck.cards.reduce((sum, card) => sum + card.attackDamage, 0);
    const averageAttackSpeed = deck.cards.reduce((sum, card) => sum + card.attackSpeed, 0) / totalCards;
    
    // Rarity distribution
    const rarityCount: Record<CardRarity, number> = {
      [CardRarity.COMMON]: 0,
      [CardRarity.UNCOMMON]: 0,
      [CardRarity.RARE]: 0,
      [CardRarity.EPIC]: 0,
      [CardRarity.LEGENDARY]: 0,
      [CardRarity.MYTHIC]: 0,
      [CardRarity.COSMIC]: 0,
    };
    
    deck.cards.forEach(card => {
      rarityCount[card.rarity]++;
    });
    
    return {
      totalCards,
      totalHealth,
      totalDamage,
      averageHealth: totalHealth / totalCards,
      averageDamage: totalDamage / totalCards,
      averageAttackSpeed,
      rarityDistribution: rarityCount,
      activeSynergies: deck.synergyBonuses.length,
      deckUtilization: (totalCards / deck.maxSize) * 100, // Percentage full
    };
  },
};