// Crafting System - Create new items and upgrade cards
// Implementation based on CLAUDE.md Phase 2 specifications

import { Card, MemeFamily, EffectType } from '../models/Card';

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: 'upgrade' | 'consumable' | 'enhancement' | 'special';
  
  // Requirements
  requirements: CraftingRequirement[];
  
  // Output
  output: CraftingOutput;
  
  // Constraints
  maxCrafts?: number; // Max times this can be crafted (-1 for unlimited)
  unlockCondition?: UnlockCondition;
  
  // Metadata
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  craftTime?: number; // Time in seconds (0 for instant)
}

export interface CraftingRequirement {
  type: 'cards' | 'gold' | 'dust' | 'tickets' | 'achievements' | 'stage_completion';
  condition: string; // Card rarity, specific amount, etc.
  amount: number;
  description: string;
}

export interface CraftingOutput {
  type: 'card' | 'consumable' | 'enhancement' | 'currency';
  item: string | Card; // Item ID or card object
  amount: number;
  description: string;
}

export interface UnlockCondition {
  type: 'level' | 'stage' | 'achievement' | 'cards_collected';
  value: number | string;
  description: string;
}

export interface CraftingMaterial {
  id: string;
  name: string;
  description: string;
  type: 'dust' | 'essence' | 'crystal' | 'fragment';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  value: number; // Base value for trading
}

export interface CraftingAttempt {
  recipeId: string;
  playerId: string;
  timestamp: number;
  result: CraftingResult;
  materialsCost: Record<string, number>;
}

export interface CraftingResult {
  success: boolean;
  output?: CraftingOutput[];
  bonusOutput?: CraftingOutput[];
  message: string;
  experience: number;
}

// Define all crafting recipes as specified in CLAUDE.md
export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  LUCKY_CHARM: {
    id: 'LUCKY_CHARM',
    name: 'Lucky Charm 🍀',
    description: 'Permanently increases luck for better roll outcomes',
    category: 'enhancement',
    requirements: [
      {
        type: 'cards',
        condition: 'common',
        amount: 5,
        description: 'Sacrifice 5 common cards'
      }
    ],
    output: {
      type: 'consumable',
      item: 'lucky_charm',
      amount: 1,
      description: '+10% luck bonus (permanent)'
    },
    maxCrafts: -1,
    rarity: 'common',
    icon: '🍀'
  },

  POWER_CRYSTAL: {
    id: 'POWER_CRYSTAL',
    name: 'Power Crystal 💎',
    description: 'Enhances deck with permanent damage boost',
    category: 'enhancement',
    requirements: [
      {
        type: 'cards',
        condition: 'rare',
        amount: 3,
        description: 'Sacrifice 3 rare cards'
      },
      {
        type: 'gold',
        condition: 'currency',
        amount: 500,
        description: 'Pay 500 gold'
      }
    ],
    output: {
      type: 'consumable',
      item: 'power_crystal',
      amount: 1,
      description: '+15% damage to all attacks (permanent)'
    },
    maxCrafts: 5,
    rarity: 'rare',
    icon: '💎'
  },

  CARD_FORGE: {
    id: 'CARD_FORGE',
    name: 'Card Forge ⚒️',
    description: 'Combine duplicate cards to upgrade rarity',
    category: 'upgrade',
    requirements: [
      {
        type: 'cards',
        condition: 'same_id',
        amount: 3,
        description: '3 copies of the same card'
      },
      {
        type: 'dust',
        condition: 'crafting_dust',
        amount: 100,
        description: 'Crafting dust from recycled cards'
      }
    ],
    output: {
      type: 'card',
      item: 'upgraded_card',
      amount: 1,
      description: 'Next rarity tier of the input card'
    },
    maxCrafts: -1,
    rarity: 'common',
    icon: '⚒️'
  },

  RAINBOW_ESSENCE: {
    id: 'RAINBOW_ESSENCE',
    name: 'Rainbow Essence 🌈',
    description: 'Magical essence that can become any rare material',
    category: 'consumable',
    requirements: [
      {
        type: 'cards',
        condition: 'different_families',
        amount: 7,
        description: 'Cards from 7 different meme families'
      },
      {
        type: 'tickets',
        condition: 'roll_tickets',
        amount: 10,
        description: 'Spend 10 roll tickets'
      }
    ],
    output: {
      type: 'consumable',
      item: 'rainbow_essence',
      amount: 1,
      description: 'Can be converted to any crafting material'
    },
    maxCrafts: 3,
    unlockCondition: {
      type: 'stage',
      value: 25,
      description: 'Complete stage 25 (Chaos Dragon boss)'
    },
    rarity: 'epic',
    icon: '🌈'
  },

  MEME_FUSION: {
    id: 'MEME_FUSION',
    name: 'Meme Fusion 🔀',
    description: 'Combine two different cards to create a hybrid',
    category: 'special',
    requirements: [
      {
        type: 'cards',
        condition: 'different_families',
        amount: 2,
        description: '2 cards from different meme families'
      },
      {
        type: 'gold',
        condition: 'currency',
        amount: 1000,
        description: 'High cost for experimental fusion'
      }
    ],
    output: {
      type: 'card',
      item: 'fusion_card',
      amount: 1,
      description: 'Unique hybrid card with combined properties'
    },
    maxCrafts: -1,
    unlockCondition: {
      type: 'achievement',
      value: 'synergy_master',
      description: 'Unlock 5 different synergies'
    },
    rarity: 'legendary',
    icon: '🔀'
  },

  DECK_EXPANDER: {
    id: 'DECK_EXPANDER',
    name: 'Deck Expander 📈',
    description: 'Permanently increases deck size limit by 1',
    category: 'enhancement',
    requirements: [
      {
        type: 'cards',
        condition: 'epic',
        amount: 2,
        description: 'Sacrifice 2 epic cards'
      },
      {
        type: 'achievements',
        condition: 'boss_slayer',
        amount: 1,
        description: 'Defeat at least 3 boss enemies'
      }
    ],
    output: {
      type: 'enhancement',
      item: 'deck_expansion',
      amount: 1,
      description: '+1 deck size limit (permanent)'
    },
    maxCrafts: 3,
    unlockCondition: {
      type: 'stage',
      value: 50,
      description: 'Complete stage 50 (Infinity Beast)'
    },
    rarity: 'legendary',
    icon: '📈'
  },

  STABILITY_POTION: {
    id: 'STABILITY_POTION',
    name: 'Stability Potion 🧪',
    description: 'Reduces RNG variance for more consistent rolls',
    category: 'consumable',
    requirements: [
      {
        type: 'dust',
        condition: 'crafting_dust',
        amount: 50,
        description: 'Crafting dust'
      },
      {
        type: 'gold',
        condition: 'currency',
        amount: 200,
        description: 'Gold for ingredients'
      }
    ],
    output: {
      type: 'consumable',
      item: 'stability_potion',
      amount: 3,
      description: 'Use before rolling for better odds (3 uses)'
    },
    maxCrafts: -1,
    rarity: 'common',
    icon: '🧪'
  },

  CHAOS_ORBS: {
    id: 'CHAOS_ORBS',
    name: 'Chaos Orbs 🔮',
    description: 'Embrace randomness for potentially huge rewards',
    category: 'consumable',
    requirements: [
      {
        type: 'cards',
        condition: 'mythic',
        amount: 1,
        description: 'Sacrifice 1 mythic card for pure chaos'
      }
    ],
    output: {
      type: 'consumable',
      item: 'chaos_orb',
      amount: 1,
      description: 'Random outcome: disaster or incredible reward'
    },
    maxCrafts: -1,
    unlockCondition: {
      type: 'cards_collected',
      value: 100,
      description: 'Collect at least 100 unique cards'
    },
    rarity: 'legendary',
    icon: '🔮'
  }
};

// Define crafting materials
export const CRAFTING_MATERIALS: Record<string, CraftingMaterial> = {
  CRAFTING_DUST: {
    id: 'CRAFTING_DUST',
    name: 'Crafting Dust',
    description: 'Fine particles left from recycled cards',
    type: 'dust',
    rarity: 'common',
    icon: '💨',
    value: 1
  },
  
  MEME_ESSENCE: {
    id: 'MEME_ESSENCE',
    name: 'Meme Essence',
    description: 'Concentrated meme energy from rare cards',
    type: 'essence',
    rarity: 'rare',
    icon: '✨',
    value: 10
  },
  
  CHAOS_CRYSTAL: {
    id: 'CHAOS_CRYSTAL',
    name: 'Chaos Crystal',
    description: 'Crystallized chaos from epic encounters',
    type: 'crystal',
    rarity: 'epic',
    icon: '💎',
    value: 50
  },
  
  LEGEND_FRAGMENT: {
    id: 'LEGEND_FRAGMENT',
    name: 'Legend Fragment',
    description: 'Fragment of legendary power',
    type: 'fragment',
    rarity: 'legendary',
    icon: '🌟',
    value: 200
  }
};

export class CraftingSystem {
  private static playerInventories: Map<string, CraftingInventory> = new Map();
  private static craftingHistory: CraftingAttempt[] = [];

  // Get or create player inventory
  static getPlayerInventory(playerId: string): CraftingInventory {
    if (!this.playerInventories.has(playerId)) {
      this.playerInventories.set(playerId, {
        materials: {},
        enhancements: {},
        consumables: {},
        craftingLevel: 1,
        totalCrafts: 0
      });
    }
    return this.playerInventories.get(playerId)!;
  }

  // Check if player can craft recipe
  static canCraft(playerId: string, recipeId: string, playerCards: Card[], playerGold: number, playerTickets: number): CraftingValidation {
    const recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) {
      return { canCraft: false, missingRequirements: [], errors: ['Recipe not found'] };
    }

    const inventory = this.getPlayerInventory(playerId);
    const missingRequirements: string[] = [];
    const errors: string[] = [];

    // Check unlock conditions
    if (recipe.unlockCondition) {
      // This would need to be integrated with player progress system
      // For now, assume all recipes are unlocked
    }

    // Check max crafts
    if (recipe.maxCrafts && recipe.maxCrafts > 0) {
      const timesCrafted = this.craftingHistory.filter(
        attempt => attempt.playerId === playerId && attempt.recipeId === recipeId
      ).length;
      
      if (timesCrafted >= recipe.maxCrafts) {
        errors.push(`Maximum crafts reached (${recipe.maxCrafts})`);
      }
    }

    // Check requirements
    for (const requirement of recipe.requirements) {
      const validation = this.validateRequirement(requirement, playerCards, playerGold, playerTickets, inventory);
      if (!validation.satisfied) {
        missingRequirements.push(validation.missing);
      }
    }

    return {
      canCraft: missingRequirements.length === 0 && errors.length === 0,
      missingRequirements,
      errors
    };
  }

  // Attempt to craft an item
  static craftItem(playerId: string, recipeId: string, playerCards: Card[], playerGold: number, playerTickets: number): CraftingResult {
    const recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) {
      return {
        success: false,
        message: 'Recipe not found',
        experience: 0
      };
    }

    const validation = this.canCraft(playerId, recipeId, playerCards, playerGold, playerTickets);
    if (!validation.canCraft) {
      return {
        success: false,
        message: `Cannot craft: ${validation.missingRequirements.join(', ')}`,
        experience: 0
      };
    }

    // Consume materials
    const consumedMaterials = this.consumeMaterials(playerId, recipe, playerCards, playerGold, playerTickets);
    
    // Calculate success rate and bonuses
    const craftingResult = this.executeRecipe(recipe, playerId);
    
    // Record crafting attempt
    const attempt: CraftingAttempt = {
      recipeId,
      playerId,
      timestamp: Date.now(),
      result: craftingResult,
      materialsCost: consumedMaterials
    };
    this.craftingHistory.push(attempt);

    // Update player inventory
    this.updatePlayerInventory(playerId, craftingResult);

    return craftingResult;
  }

  // Get available recipes for player
  static getAvailableRecipes(playerId: string, playerLevel: number, completedStages: number[], achievements: string[]): CraftingRecipe[] {
    return Object.values(CRAFTING_RECIPES).filter(recipe => {
      if (!recipe.unlockCondition) return true;

      switch (recipe.unlockCondition.type) {
        case 'level':
          return playerLevel >= recipe.unlockCondition.value;
        case 'stage':
          return completedStages.includes(recipe.unlockCondition.value as number);
        case 'achievement':
          return achievements.includes(recipe.unlockCondition.value as string);
        case 'cards_collected':
          // This would need to be integrated with card collection system
          return true;
        default:
          return true;
      }
    });
  }

  // Recycle cards into materials
  static recycleCards(playerId: string, cards: Card[]): CraftingMaterial[] {
    const materials: CraftingMaterial[] = [];
    const inventory = this.getPlayerInventory(playerId);

    for (const card of cards) {
      const materialType = this.getRecycleMaterial(card.rarity);
      const amount = this.getRecycleAmount(card.rarity);
      
      materials.push({
        ...CRAFTING_MATERIALS[materialType],
        value: amount
      });

      // Add to inventory
      inventory.materials[materialType] = (inventory.materials[materialType] || 0) + amount;
    }

    return materials;
  }

  // Get crafting statistics
  static getCraftingStats(playerId: string): CraftingStats {
    const inventory = this.getPlayerInventory(playerId);
    const attempts = this.craftingHistory.filter(a => a.playerId === playerId);
    const successful = attempts.filter(a => a.result.success);

    return {
      craftingLevel: inventory.craftingLevel,
      totalCrafts: inventory.totalCrafts,
      successRate: attempts.length > 0 ? successful.length / attempts.length : 0,
      totalExperience: attempts.reduce((sum, a) => sum + a.result.experience, 0),
      favoriteRecipe: this.getMostCraftedRecipe(playerId),
      materialsOwned: Object.keys(inventory.materials).length,
      enhancementsActive: Object.keys(inventory.enhancements).length
    };
  }

  // Private helper methods
  private static validateRequirement(
    requirement: CraftingRequirement, 
    cards: Card[], 
    gold: number, 
    tickets: number, 
    inventory: CraftingInventory
  ): { satisfied: boolean; missing: string } {
    switch (requirement.type) {
      case 'cards':
        const cardCount = this.countMatchingCards(cards, requirement.condition);
        if (cardCount < requirement.amount) {
          return {
            satisfied: false,
            missing: `Need ${requirement.amount - cardCount} more ${requirement.condition} cards`
          };
        }
        break;

      case 'gold':
        if (gold < requirement.amount) {
          return {
            satisfied: false,
            missing: `Need ${requirement.amount - gold} more gold`
          };
        }
        break;

      case 'tickets':
        if (tickets < requirement.amount) {
          return {
            satisfied: false,
            missing: `Need ${requirement.amount - tickets} more tickets`
          };
        }
        break;

      case 'dust':
        const dustCount = inventory.materials['CRAFTING_DUST'] || 0;
        if (dustCount < requirement.amount) {
          return {
            satisfied: false,
            missing: `Need ${requirement.amount - dustCount} more crafting dust`
          };
        }
        break;
    }

    return { satisfied: true, missing: '' };
  }

  private static countMatchingCards(cards: Card[], condition: string): number {
    switch (condition) {
      case 'common': return cards.filter(c => c.rarity === 2).length;
      case 'uncommon': return cards.filter(c => c.rarity === 4).length;
      case 'rare': return cards.filter(c => c.rarity === 10).length;
      case 'epic': return cards.filter(c => c.rarity === 50).length;
      case 'legendary': return cards.filter(c => c.rarity === 200).length;
      case 'mythic': return cards.filter(c => c.rarity === 1000).length;
      case 'different_families':
        const families = new Set(cards.map(c => c.family));
        return families.size;
      case 'same_id':
        const cardGroups = cards.reduce((acc, card) => {
          acc[card.id] = (acc[card.id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return Math.max(...Object.values(cardGroups));
      default:
        return 0;
    }
  }

  private static consumeMaterials(
    playerId: string, 
    recipe: CraftingRecipe, 
    cards: Card[], 
    gold: number, 
    tickets: number
  ): Record<string, number> {
    const consumed: Record<string, number> = {};
    
    // This would integrate with the actual game systems to consume resources
    // For now, just track what would be consumed
    
    for (const requirement of recipe.requirements) {
      consumed[requirement.type] = requirement.amount;
    }

    return consumed;
  }

  private static executeRecipe(recipe: CraftingRecipe, playerId: string): CraftingResult {
    const inventory = this.getPlayerInventory(playerId);
    
    // Base success rate based on crafting level
    let successRate = 0.8 + (inventory.craftingLevel * 0.02);
    
    // Rarity affects difficulty
    switch (recipe.rarity) {
      case 'legendary': successRate *= 0.6; break;
      case 'epic': successRate *= 0.7; break;
      case 'rare': successRate *= 0.85; break;
    }

    const success = Math.random() < successRate;
    const baseExperience = this.getExperienceReward(recipe.rarity);
    
    if (success) {
      return {
        success: true,
        output: [recipe.output],
        message: `Successfully crafted ${recipe.name}!`,
        experience: baseExperience
      };
    } else {
      return {
        success: false,
        message: 'Crafting failed! Materials lost.',
        experience: Math.floor(baseExperience * 0.25)
      };
    }
  }

  private static updatePlayerInventory(playerId: string, result: CraftingResult): void {
    const inventory = this.getPlayerInventory(playerId);
    
    inventory.totalCrafts++;
    
    if (result.success && result.output) {
      for (const output of result.output) {
        switch (output.type) {
          case 'consumable':
            inventory.consumables[output.item as string] = 
              (inventory.consumables[output.item as string] || 0) + output.amount;
            break;
          case 'enhancement':
            inventory.enhancements[output.item as string] = 
              (inventory.enhancements[output.item as string] || 0) + output.amount;
            break;
        }
      }
    }

    // Level up crafting
    const newLevel = Math.floor(inventory.totalCrafts / 10) + 1;
    if (newLevel > inventory.craftingLevel) {
      inventory.craftingLevel = newLevel;
    }
  }

  private static getRecycleMaterial(rarity: number): string {
    if (rarity <= 4) return 'CRAFTING_DUST';
    if (rarity <= 50) return 'MEME_ESSENCE';
    if (rarity <= 1000) return 'CHAOS_CRYSTAL';
    return 'LEGEND_FRAGMENT';
  }

  private static getRecycleAmount(rarity: number): number {
    if (rarity <= 2) return 1;
    if (rarity <= 4) return 2;
    if (rarity <= 10) return 5;
    if (rarity <= 50) return 15;
    if (rarity <= 200) return 50;
    if (rarity <= 1000) return 150;
    return 500;
  }

  private static getExperienceReward(rarity: string): number {
    switch (rarity) {
      case 'common': return 10;
      case 'rare': return 25;
      case 'epic': return 50;
      case 'legendary': return 100;
      default: return 10;
    }
  }

  private static getMostCraftedRecipe(playerId: string): string {
    const attempts = this.craftingHistory.filter(a => a.playerId === playerId);
    const recipeCounts = attempts.reduce((acc, attempt) => {
      acc[attempt.recipeId] = (acc[attempt.recipeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(recipeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
  }
}

// Supporting interfaces
export interface CraftingInventory {
  materials: Record<string, number>;
  enhancements: Record<string, number>;
  consumables: Record<string, number>;
  craftingLevel: number;
  totalCrafts: number;
}

export interface CraftingValidation {
  canCraft: boolean;
  missingRequirements: string[];
  errors: string[];
}

export interface CraftingStats {
  craftingLevel: number;
  totalCrafts: number;
  successRate: number;
  totalExperience: number;
  favoriteRecipe: string;
  materialsOwned: number;
  enhancementsActive: number;
}

export default CraftingSystem;