// Master card collection index - exports all cards by rarity
import { commonCards } from './common';
import { uncommonCards } from './uncommon';
import { rareCards } from './rare';
import { epicCards } from './epic';
import { legendaryCards } from './legendary';
import { mythicCards } from './mythic';
import { cosmicCards } from './cosmic';
import { Card } from '../../models/Card';

// Export all card arrays
export {
  commonCards,
  uncommonCards,
  rareCards,
  epicCards,
  legendaryCards,
  mythicCards,
  cosmicCards,
};

// Combine all cards into a single array
export const allCards: Card[] = [
  ...commonCards,
  ...uncommonCards,
  ...rareCards,
  ...epicCards,
  ...legendaryCards,
  ...mythicCards,
  ...cosmicCards,
];

// Card count by rarity (for verification)
export const cardCounts = {
  common: commonCards.length,
  uncommon: uncommonCards.length,
  rare: rareCards.length,
  epic: epicCards.length,
  legendary: legendaryCards.length,
  mythic: mythicCards.length,
  cosmic: cosmicCards.length,
  total: allCards.length
};

// Helper functions for card retrieval
export class CardCollection {
  // Get cards by rarity
  static getByRarity(rarityProbability: number): Card[] {
    return allCards.filter(card => card.rarity === rarityProbability);
  }

  // Get random card by rarity probabilities
  static getRandomCard(): Card {
    const totalWeight = allCards.reduce((sum, card) => sum + (1 / card.rarity), 0);
    let random = Math.random() * totalWeight;
    
    for (const card of allCards) {
      random -= (1 / card.rarity);
      if (random <= 0) return card;
    }
    
    return commonCards[0]; // Fallback
  }

  // Get card by ID
  static getById(id: string): Card | undefined {
    return allCards.find(card => card.id === id);
  }

  // Get cards by family
  static getByFamily(family: string): Card[] {
    return allCards.filter(card => card.family === family);
  }

  // Search cards by name
  static search(query: string): Card[] {
    const lowerQuery = query.toLowerCase();
    return allCards.filter(card => 
      card.name.toLowerCase().includes(lowerQuery) ||
      card.description?.toLowerCase().includes(lowerQuery)
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
    2: 10,      // Common
    4: 10,      // Uncommon
    10: 10,     // Rare
    50: 8,      // Epic
    200: 6,     // Legendary
    1000: 4,    // Mythic
    10000: 1,   // Cosmic
  };

  // Check card counts
  Object.entries(expectedCounts).forEach(([rarity, expected]) => {
    const actualCount = cardCounts[rarity as keyof typeof cardCounts];
    if (actualCount !== expected) {
      errors.push(`${rarity}: expected ${expected}, got ${actualCount}`);
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