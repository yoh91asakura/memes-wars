import { 
  EmojiCategory, 
  EmojiAssignmentRules, 
  EmojiPower,
  CardEmojiData 
} from '../types/emoji';
import { 
  getEmojisByCategory, 
  getEmojiPower,
  calculateTotalBaseDamage 
} from '../systems/emoji-database';
import { Card } from '../types/card';

/**
 * Assignment rules for each card rarity
 * Based on specifications in docs/specifications/emoji-powers.md
 */
const RARITY_ASSIGNMENT_RULES: Record<string, EmojiAssignmentRules> = {
  common: {
    rarity: 'common',
    minEmojis: 1,
    maxEmojis: 2,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.SUPPORT],
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 2,
      [EmojiCategory.SUPPORT]: 1,
      [EmojiCategory.CONTROL]: 0,
      [EmojiCategory.DEBUFF]: 0,
      [EmojiCategory.ENERGY]: 0
    }
  },
  uncommon: {
    rarity: 'uncommon',
    minEmojis: 2,
    maxEmojis: 3,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.CONTROL, EmojiCategory.SUPPORT],
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 2,
      [EmojiCategory.CONTROL]: 1,
      [EmojiCategory.SUPPORT]: 1,
      [EmojiCategory.DEBUFF]: 0,
      [EmojiCategory.ENERGY]: 0
    }
  },
  rare: {
    rarity: 'rare',
    minEmojis: 3,
    maxEmojis: 4,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.CONTROL, EmojiCategory.SUPPORT, EmojiCategory.DEBUFF],
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 2,
      [EmojiCategory.CONTROL]: 2,
      [EmojiCategory.SUPPORT]: 2,
      [EmojiCategory.DEBUFF]: 1,
      [EmojiCategory.ENERGY]: 0
    }
  },
  epic: {
    rarity: 'epic',
    minEmojis: 4,
    maxEmojis: 5,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.CONTROL, EmojiCategory.SUPPORT, EmojiCategory.DEBUFF, EmojiCategory.ENERGY],
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 3,
      [EmojiCategory.CONTROL]: 2,
      [EmojiCategory.SUPPORT]: 2,
      [EmojiCategory.DEBUFF]: 2,
      [EmojiCategory.ENERGY]: 1
    }
  },
  legendary: {
    rarity: 'legendary',
    minEmojis: 5,
    maxEmojis: 6,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.CONTROL, EmojiCategory.SUPPORT, EmojiCategory.DEBUFF, EmojiCategory.ENERGY],
    energyRequirement: 2,
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 3,
      [EmojiCategory.CONTROL]: 3,
      [EmojiCategory.SUPPORT]: 3,
      [EmojiCategory.DEBUFF]: 2,
      [EmojiCategory.ENERGY]: 3
    }
  },
  mythic: {
    rarity: 'mythic',
    minEmojis: 6,
    maxEmojis: 8,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.CONTROL, EmojiCategory.SUPPORT, EmojiCategory.DEBUFF, EmojiCategory.ENERGY],
    energyRequirement: 2,
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 4,
      [EmojiCategory.CONTROL]: 3,
      [EmojiCategory.SUPPORT]: 3,
      [EmojiCategory.DEBUFF]: 3,
      [EmojiCategory.ENERGY]: 3
    }
  },
  cosmic: {
    rarity: 'cosmic',
    minEmojis: 8,
    maxEmojis: 10,
    allowedCategories: [EmojiCategory.DAMAGE, EmojiCategory.CONTROL, EmojiCategory.SUPPORT, EmojiCategory.DEBUFF, EmojiCategory.ENERGY],
    energyRequirement: 3,
    maxPerCategory: {
      [EmojiCategory.DAMAGE]: 5,
      [EmojiCategory.CONTROL]: 4,
      [EmojiCategory.SUPPORT]: 4,
      [EmojiCategory.DEBUFF]: 4,
      [EmojiCategory.ENERGY]: 4
    }
  }
};

/**
 * Predefined emoji combinations for thematic consistency
 */
const THEMATIC_COMBINATIONS = {
  burn_build: ['🔥', '💣', '☄️'],
  freeze_lock: ['❄️', '🌊', '🕸️'],
  poison_master: ['🧪', '🦠', '🐍'],
  lucky_gambler: ['🍀', '🎲', '🎰'],
  speed_demon: ['🏃', '⚡', '🎯'],
  tank_build: ['🛡️', '❤️', '🌱'],
  energy_loop: ['🔋', '⚡', '💎'],
  death_dealer: ['💀', '👻', '🗿']
};

export class EmojiAssignmentService {
  /**
   * Assign emojis to a card based on its rarity and type
   */
  static assignEmojisToCard(card: Card, seed?: number): CardEmojiData {
    const rules = RARITY_ASSIGNMENT_RULES[card.rarity];
    if (!rules) {
      throw new Error(`No assignment rules found for rarity: ${card.rarity}`);
    }

    // Use card ID as seed for deterministic results
    const random = this.createSeededRandom(seed || this.hashString(card.id));
    
    // Determine number of emojis
    const numEmojis = this.randomInt(random, rules.minEmojis, rules.maxEmojis);
    
    // Select emojis based on card type and rarity rules
    const selectedEmojis = this.selectEmojisForCard(card, numEmojis, rules, random);
    
    // Build emoji powers array
    const emojiPowers = selectedEmojis.map(char => getEmojiPower(char)!);
    
    // Calculate synergies (to be implemented by EmojiSynergyCalculator)
    const activeSynergies: any[] = []; // TODO: Implement synergy calculation
    
    return {
      emojis: selectedEmojis,
      emojiPowers,
      activeSynergies,
      totalBaseDamage: calculateTotalBaseDamage(selectedEmojis),
      synergyBonus: 0 // TODO: Calculate from synergies
    };
  }

  /**
   * Select appropriate emojis for a card
   */
  private static selectEmojisForCard(
    card: Card, 
    numEmojis: number, 
    rules: EmojiAssignmentRules, 
    random: () => number
  ): string[] {
    const selectedEmojis: string[] = [];
    const categoryCount: Record<EmojiCategory, number> = {
      [EmojiCategory.DAMAGE]: 0,
      [EmojiCategory.CONTROL]: 0,
      [EmojiCategory.SUPPORT]: 0,
      [EmojiCategory.DEBUFF]: 0,
      [EmojiCategory.ENERGY]: 0
    };

    // Try thematic combination first for higher rarities
    if (['epic', 'legendary', 'mythic', 'cosmic'].includes(card.rarity)) {
      const thematicEmojis = this.tryThematicCombination(card, random);
      if (thematicEmojis.length > 0) {
        const useCount = Math.min(thematicEmojis.length, numEmojis);
        selectedEmojis.push(...thematicEmojis.slice(0, useCount));
        
        // Update category counts
        selectedEmojis.forEach(emoji => {
          const power = getEmojiPower(emoji);
          if (power) categoryCount[power.category]++;
        });
      }
    }

    // Fill remaining slots
    while (selectedEmojis.length < numEmojis) {
      const category = this.selectRandomCategory(rules, categoryCount, random);
      const availableEmojis = this.getAvailableEmojisForCategory(
        category, 
        selectedEmojis, 
        rules
      );
      
      if (availableEmojis.length === 0) break;
      
      const selectedEmoji = availableEmojis[Math.floor(random() * availableEmojis.length)];
      selectedEmojis.push(selectedEmoji.character);
      categoryCount[category]++;
    }

    // Ensure energy requirement is met
    if (rules.energyRequirement) {
      this.ensureEnergyRequirement(selectedEmojis, categoryCount, rules, random);
    }

    return selectedEmojis;
  }

  /**
   * Try to use a thematic combination
   */
  private static tryThematicCombination(card: Card, random: () => number): string[] {
    const combinations = Object.values(THEMATIC_COMBINATIONS);
    
    // Select based on card type
    if (card.type === 'spell' && random() < 0.3) {
      return THEMATIC_COMBINATIONS.burn_build;
    } else if (card.type === 'defense' && random() < 0.4) {
      return THEMATIC_COMBINATIONS.tank_build;
    } else if (card.type === 'support' && random() < 0.3) {
      return THEMATIC_COMBINATIONS.energy_loop;
    }
    
    // Random selection
    if (random() < 0.2) {
      return combinations[Math.floor(random() * combinations.length)];
    }
    
    return [];
  }

  /**
   * Select random category respecting rules
   */
  private static selectRandomCategory(
    rules: EmojiAssignmentRules,
    categoryCount: Record<EmojiCategory, number>,
    random: () => number
  ): EmojiCategory {
    const availableCategories = rules.allowedCategories.filter(category => {
      const maxForCategory = rules.maxPerCategory?.[category] || Infinity;
      return categoryCount[category] < maxForCategory;
    });

    if (availableCategories.length === 0) {
      return EmojiCategory.DAMAGE; // Fallback
    }

    return availableCategories[Math.floor(random() * availableCategories.length)];
  }

  /**
   * Get available emojis for category
   */
  private static getAvailableEmojisForCategory(
    category: EmojiCategory,
    alreadySelected: string[],
    rules: EmojiAssignmentRules
  ): EmojiPower[] {
    const categoryEmojis = getEmojisByCategory(category);
    return categoryEmojis.filter(emoji => 
      !alreadySelected.includes(emoji.character) &&
      rules.allowedCategories.includes(category)
    );
  }

  /**
   * Ensure energy requirement is met
   */
  private static ensureEnergyRequirement(
    selectedEmojis: string[],
    categoryCount: Record<EmojiCategory, number>,
    rules: EmojiAssignmentRules,
    random: () => number
  ): void {
    if (!rules.energyRequirement) return;

    const currentEnergyCount = categoryCount[EmojiCategory.ENERGY];
    const needed = rules.energyRequirement - currentEnergyCount;

    if (needed > 0) {
      const energyEmojis = getEmojisByCategory(EmojiCategory.ENERGY);
      const available = energyEmojis.filter(e => !selectedEmojis.includes(e.character));

      // Replace some emojis with energy ones or add if space allows
      let replaced = 0;
      for (let i = 0; i < needed && available.length > 0; i++) {
        const energyEmoji = available[Math.floor(random() * available.length)];
        
        if (selectedEmojis.length < rules.maxEmojis) {
          // Add if we have space
          selectedEmojis.push(energyEmoji.character);
        } else if (replaced < selectedEmojis.length) {
          // Replace existing non-energy emoji
          const replaceIndex = Math.floor(random() * selectedEmojis.length);
          const oldEmoji = getEmojiPower(selectedEmojis[replaceIndex]);
          if (oldEmoji && oldEmoji.category !== EmojiCategory.ENERGY) {
            selectedEmojis[replaceIndex] = energyEmoji.character;
            replaced++;
          }
        }
        
        available.splice(available.indexOf(energyEmoji), 1);
        categoryCount[EmojiCategory.ENERGY]++;
      }
    }
  }

  /**
   * Validate emoji assignment against rules
   */
  static validateEmojiAssignment(emojis: string[], rarity: string): boolean {
    const rules = RARITY_ASSIGNMENT_RULES[rarity];
    if (!rules) return false;

    // Check count
    if (emojis.length < rules.minEmojis || emojis.length > rules.maxEmojis) {
      return false;
    }

    // Check category limits
    const categoryCount: Record<EmojiCategory, number> = {
      [EmojiCategory.DAMAGE]: 0,
      [EmojiCategory.CONTROL]: 0,
      [EmojiCategory.SUPPORT]: 0,
      [EmojiCategory.DEBUFF]: 0,
      [EmojiCategory.ENERGY]: 0
    };

    for (const emojiChar of emojis) {
      const emoji = getEmojiPower(emojiChar);
      if (!emoji) return false;
      
      if (!rules.allowedCategories.includes(emoji.category)) {
        return false;
      }
      
      categoryCount[emoji.category]++;
      
      const maxForCategory = rules.maxPerCategory?.[emoji.category] || Infinity;
      if (categoryCount[emoji.category] > maxForCategory) {
        return false;
      }
    }

    // Check energy requirement
    if (rules.energyRequirement && categoryCount[EmojiCategory.ENERGY] < rules.energyRequirement) {
      return false;
    }

    return true;
  }

  /**
   * Get assignment rules for rarity
   */
  static getRulesForRarity(rarity: string): EmojiAssignmentRules | undefined {
    return RARITY_ASSIGNMENT_RULES[rarity];
  }

  /**
   * Create seeded random number generator
   */
  private static createSeededRandom(seed: number): () => number {
    let m = seed;
    return () => {
      m = (m * 16807) % 2147483647;
      return (m - 1) / 2147483646;
    };
  }

  /**
   * Hash string to number for seed
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Random integer between min and max (inclusive)
   */
  private static randomInt(random: () => number, min: number, max: number): number {
    return Math.floor(random() * (max - min + 1)) + min;
  }
}