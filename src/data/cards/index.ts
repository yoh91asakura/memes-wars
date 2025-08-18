// Master card collection index - exports all cards by rarity
import { commonCards } from './common';
import { uncommonCards } from './uncommon';
import { rareCards } from './rare';
import { epicCards } from './epic';
import { legendaryCards } from './legendary';
import { mythicCards } from './mythic';
import { cosmicCards } from './cosmic';
import { divineCards } from './divine';
import { infinityCards } from './infinity';
import { UnifiedCard, CardRarity } from '../../models/unified/Card';

// Export all card arrays
export {
  commonCards,
  uncommonCards,
  rareCards,
  epicCards,
  legendaryCards,
  mythicCards,
  cosmicCards,
  divineCards,
  infinityCards
};

// Combine all cards into a single array
export const allCards: UnifiedCard[] = [
  ...commonCards,
  ...uncommonCards,
  ...rareCards,
  ...epicCards,
  ...legendaryCards,
  ...mythicCards,
  ...cosmicCards,
  ...divineCards,
  ...infinityCards
];

// Card count by rarity (for verification)
export const cardCounts = {
  [CardRarity.COMMON]: commonCards.length,
  [CardRarity.UNCOMMON]: uncommonCards.length,
  [CardRarity.RARE]: rareCards.length,
  [CardRarity.EPIC]: epicCards.length,
  [CardRarity.LEGENDARY]: legendaryCards.length,
  [CardRarity.MYTHIC]: mythicCards.length,
  [CardRarity.COSMIC]: cosmicCards.length,
  [CardRarity.DIVINE]: divineCards.length,
  [CardRarity.INFINITY]: infinityCards.length,
  total: allCards.length
};

// Helper functions for card retrieval
export class CardCollection {
  // Get cards by rarity
  static getByRarity(rarity: CardRarity): UnifiedCard[] {
    return allCards.filter(card => card.rarity === rarity);
  }

  // Get random card by rarity probabilities
  static getRandomCard(): UnifiedCard {
    const totalWeight = allCards.reduce((sum, card) => sum + (1 / card.rarityProbability), 0);
    let random = Math.random() * totalWeight;
    
    for (const card of allCards) {
      random -= (1 / card.rarityProbability);
      if (random <= 0) return card;
    }
    
    return commonCards[0]; // Fallback
  }

  // Get card by ID
  static getById(id: string): UnifiedCard | undefined {
    return allCards.find(card => card.id === id);
  }

  // Get cards by family
  static getByFamily(family: string): UnifiedCard[] {
    return allCards.filter(card => card.family === family);
  }

  // Search cards by name or tags
  static search(query: string): UnifiedCard[] {
    const lowerQuery = query.toLowerCase();
    return allCards.filter(card => 
      card.name.toLowerCase().includes(lowerQuery) ||
      card.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      card.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Get statistics
  static getStatistics() {
    return {
      cardCounts,
      totalCards: allCards.length,
      averageLuck: allCards.reduce((sum, card) => sum + card.luck, 0) / allCards.length,
      averageGoldReward: allCards.reduce((sum, card) => sum + card.goldReward, 0) / allCards.length,
      familyDistribution: Object.entries(
        allCards.reduce((acc, card) => {
          acc[card.family] = (acc[card.family] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([, a], [, b]) => b - a)
    };
  }
}

// Validation function
export function validateCardCollection(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const expectedCounts = {
    [CardRarity.COMMON]: 10,
    [CardRarity.UNCOMMON]: 10,
    [CardRarity.RARE]: 10,
    [CardRarity.EPIC]: 8,
    [CardRarity.LEGENDARY]: 6,
    [CardRarity.MYTHIC]: 4,
    [CardRarity.COSMIC]: 1,
    [CardRarity.DIVINE]: 2,
    [CardRarity.INFINITY]: 1
  };

  // Check card counts
  Object.entries(expectedCounts).forEach(([rarity, expected]) => {
    const actual = cardCounts[rarity as CardRarity];
    if (actual !== expected) {
      errors.push(`${rarity}: expected ${expected}, got ${actual}`);
    }
  });

  // Check for duplicate IDs
  const ids = allCards.map(card => card.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
  }

  // Check required fields
  allCards.forEach(card => {
    if (!card.id || !card.name || !card.emoji || !card.rarity) {
      errors.push(`Card ${card.id || 'unknown'} missing required fields`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default allCards;