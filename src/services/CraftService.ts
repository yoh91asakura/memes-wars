// Craft Service - Implementation based on CLAUDE.md Phase 2 specifications
// Allows players to craft special items and upgrades using cards and resources

import { Card, CardUtils } from '../models/Card';
import { v4 as uuidv4 } from 'uuid';

// Craft Recipe Types
export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'permanent' | 'upgrade' | 'card';
  
  // Requirements
  cost: {
    common?: number;
    uncommon?: number;
    rare?: number;
    epic?: number;
    legendary?: number;
    mythic?: number;
    cosmic?: number;
    gold?: number;
    gems?: number;
  };
  
  // Optional specific card requirements
  requiredCards?: string[]; // Card IDs
  playerLevelRequired?: number;
  
  // Result
  result: CraftResult;
  
  // Constraints
  unique?: boolean; // Can only be crafted once
  maxCrafts?: number; // Max times this can be crafted
  cooldown?: number; // Cooldown between crafts (ms)
  
  // UI
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CraftResult {
  type: 'item' | 'card' | 'currency' | 'permanent_upgrade';
  id: string;
  quantity?: number;
  
  // For items
  effect?: {
    type: 'luck_boost' | 'xp_boost' | 'gold_boost' | 'pity_reduction' | 'guaranteed_rarity';
    value: number;
    duration?: number; // For temporary effects
  };
  
  // For cards
  cardData?: Card;
}

export interface CraftedItem {
  id: string;
  recipeId: string;
  craftedAt: number;
  expiresAt?: number; // For temporary items
  active: boolean;
  usesRemaining?: number;
}

export interface CraftStats {
  totalCrafts: number;
  recipesCrafted: Record<string, number>;
  lastCraftTime: number;
  activeItems: CraftedItem[];
}

// Craft Service Implementation
export class CraftService {
  private recipes: Map<string, CraftRecipe> = new Map();
  private craftStats: CraftStats;
  
  constructor() {
    this.initializeRecipes();
    this.craftStats = {
      totalCrafts: 0,
      recipesCrafted: {},
      lastCraftTime: 0,
      activeItems: []
    };
  }
  
  // Initialize all craft recipes from CLAUDE.md specifications
  private initializeRecipes(): void {
    const recipes: CraftRecipe[] = [
      // === Consumables (Temporary Boosts) ===
      {
        id: 'lucky_charm',
        name: 'Lucky Charm 🍀',
        description: 'Increases luck by 10% for next 5 rolls',
        category: 'consumable',
        cost: { common: 5 },
        result: {
          type: 'item',
          id: 'luck_boost_small',
          effect: {
            type: 'luck_boost',
            value: 0.1,
            duration: 5 // 5 rolls
          }
        },
        icon: '🍀',
        rarity: 'common'
      },
      
      {
        id: 'golden_horseshoe',
        name: 'Golden Horseshoe 🐎',
        description: 'Guarantees rare or better for next roll',
        category: 'consumable',
        cost: { uncommon: 3, rare: 1 },
        result: {
          type: 'item',
          id: 'guaranteed_rare',
          effect: {
            type: 'guaranteed_rarity',
            value: 0, // 0 = rare, 1 = epic, etc.
            duration: 1 // 1 roll
          }
        },
        icon: '🐎',
        rarity: 'rare'
      },
      
      {
        id: 'rainbow_crystal',
        name: 'Rainbow Crystal 🌈',
        description: 'Reduces all pity counters by 5',
        category: 'consumable',
        cost: { rare: 2, epic: 1 },
        result: {
          type: 'item',
          id: 'pity_reducer',
          effect: {
            type: 'pity_reduction',
            value: 5
          }
        },
        icon: '🌈',
        rarity: 'epic'
      },
      
      {
        id: 'midas_touch',
        name: 'Midas Touch ✨',
        description: 'Doubles gold rewards for next 10 battles',
        category: 'consumable',
        cost: { epic: 1, gold: 1000 },
        result: {
          type: 'item',
          id: 'gold_boost_major',
          effect: {
            type: 'gold_boost',
            value: 2.0,
            duration: 10 // 10 battles
          }
        },
        icon: '✨',
        rarity: 'epic'
      },
      
      // === Permanent Upgrades ===
      {
        id: 'deck_expansion',
        name: 'Deck Expansion 📦',
        description: 'Permanently increases deck size limit by 1',
        category: 'permanent',
        cost: { legendary: 1, gold: 5000 },
        result: {
          type: 'permanent_upgrade',
          id: 'deck_size_increase',
          quantity: 1
        },
        unique: true,
        maxCrafts: 3, // Can craft max 3 times
        icon: '📦',
        rarity: 'legendary'
      },
      
      {
        id: 'master_collector',
        name: 'Master Collector 🏆',
        description: 'Permanently increases luck by 5%',
        category: 'permanent',
        cost: { mythic: 1, gems: 100 },
        result: {
          type: 'permanent_upgrade',
          id: 'permanent_luck_boost',
          quantity: 5 // +5% luck
        },
        unique: true,
        icon: '🏆',
        rarity: 'legendary'
      },
      
      // === Special Cards ===
      {
        id: 'forge_legendary',
        name: 'Legendary Forge ⚒️',
        description: 'Combine 5 epic cards into 1 legendary card',
        category: 'card',
        cost: { epic: 5, gold: 2500 },
        result: {
          type: 'card',
          id: 'random_legendary'
        },
        cooldown: 24 * 60 * 60 * 1000, // 24 hour cooldown
        icon: '⚒️',
        rarity: 'legendary'
      },
      
      {
        id: 'cosmic_fusion',
        name: 'Cosmic Fusion 🌌',
        description: 'Ultimate craft: Create a cosmic card from multiple mythics',
        category: 'card',
        cost: { mythic: 3, cosmic: 1, gems: 500 },
        playerLevelRequired: 50,
        result: {
          type: 'card',
          id: 'guaranteed_cosmic'
        },
        unique: true,
        icon: '🌌',
        rarity: 'legendary'
      },
      
      // === Resource Conversion ===
      {
        id: 'dust_to_gold',
        name: 'Alchemist\'s Dream 🧪',
        description: 'Convert excess cards to gold',
        category: 'consumable',
        cost: { common: 10 },
        result: {
          type: 'currency',
          id: 'gold',
          quantity: 500
        },
        icon: '🧪',
        rarity: 'common'
      },
      
      {
        id: 'gem_synthesis',
        name: 'Gem Synthesis 💎',
        description: 'Convert rare cards to gems',
        category: 'consumable',
        cost: { rare: 3 },
        result: {
          type: 'currency',
          id: 'gems',
          quantity: 10
        },
        icon: '💎',
        rarity: 'rare'
      }
    ];
    
    // Store recipes in map
    recipes.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }
  
  // === PUBLIC METHODS ===
  
  /**
   * Get all available recipes
   */
  getAvailableRecipes(): CraftRecipe[] {
    return Array.from(this.recipes.values());
  }
  
  /**
   * Get recipe by ID
   */
  getRecipe(id: string): CraftRecipe | undefined {
    return this.recipes.get(id);
  }
  
  /**
   * Check if player can craft a recipe
   */
  canCraft(
    recipeId: string, 
    playerCards: Card[],
    playerGold: number,
    playerGems: number,
    playerLevel: number = 1
  ): { canCraft: boolean; reason?: string } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return { canCraft: false, reason: 'Recipe not found' };
    }
    
    // Check level requirement
    if (recipe.playerLevelRequired && playerLevel < recipe.playerLevelRequired) {
      return { 
        canCraft: false, 
        reason: `Requires level ${recipe.playerLevelRequired}` 
      };
    }
    
    // Check unique constraint
    if (recipe.unique && this.craftStats.recipesCrafted[recipeId] >= 1) {
      return { canCraft: false, reason: 'Can only be crafted once' };
    }
    
    // Check max crafts
    if (recipe.maxCrafts && this.craftStats.recipesCrafted[recipeId] >= recipe.maxCrafts) {
      return { 
        canCraft: false, 
        reason: `Maximum crafts reached (${recipe.maxCrafts})` 
      };
    }
    
    // Check cooldown
    if (recipe.cooldown) {
      const lastCraft = this.craftStats.recipesCrafted[recipeId];
      const timeSinceLastCraft = Date.now() - this.craftStats.lastCraftTime;
      if (lastCraft > 0 && timeSinceLastCraft < recipe.cooldown) {
        const remainingTime = Math.ceil((recipe.cooldown - timeSinceLastCraft) / 1000 / 60);
        return { 
          canCraft: false, 
          reason: `Cooldown: ${remainingTime} minutes remaining` 
        };
      }
    }
    
    // Check currency requirements
    if (recipe.cost.gold && playerGold < recipe.cost.gold) {
      return { canCraft: false, reason: 'Insufficient gold' };
    }
    
    if (recipe.cost.gems && playerGems < recipe.cost.gems) {
      return { canCraft: false, reason: 'Insufficient gems' };
    }
    
    // Check card requirements
    const cardsByRarity = this.countCardsByRarity(playerCards);
    
    for (const [rarity, required] of Object.entries(recipe.cost)) {
      if (rarity === 'gold' || rarity === 'gems') continue;
      
      const available = cardsByRarity[rarity] || 0;
      if (available < (required || 0)) {
        return { 
          canCraft: false, 
          reason: `Need ${required} ${rarity} cards (have ${available})` 
        };
      }
    }
    
    // Check specific card requirements
    if (recipe.requiredCards) {
      const playerCardIds = new Set(playerCards.map(c => c.id));
      const missingCards = recipe.requiredCards.filter(id => !playerCardIds.has(id));
      if (missingCards.length > 0) {
        return { 
          canCraft: false, 
          reason: `Missing required cards: ${missingCards.length}` 
        };
      }
    }
    
    return { canCraft: true };
  }
  
  /**
   * Perform crafting
   */
  async craft(
    recipeId: string,
    playerCards: Card[],
    onResourcesSpent?: (gold: number, gems: number, cardsUsed: Card[]) => void,
    onItemReceived?: (result: CraftResult) => void
  ): Promise<{ success: boolean; result?: CraftResult; item?: CraftedItem; error?: string }> {
    
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return { success: false, error: 'Recipe not found' };
    }
    
    // Final validation (should be done by caller, but safety check)
    const validation = this.canCraft(recipeId, playerCards, 0, 0); // Simplified for this demo
    if (!validation.canCraft) {
      return { success: false, error: validation.reason };
    }
    
    try {
      // Calculate resources to spend
      const cardsToConsume = this.selectCardsForCrafting(playerCards, recipe.cost);
      const goldCost = recipe.cost.gold || 0;
      const gemsCost = recipe.cost.gems || 0;
      
      // Notify resources being spent
      if (onResourcesSpent) {
        onResourcesSpent(goldCost, gemsCost, cardsToConsume);
      }
      
      // Create the result
      const result = await this.createCraftResult(recipe.result);
      
      // Create crafted item if it's a consumable/temporary item
      let craftedItem: CraftedItem | undefined;
      if (recipe.category === 'consumable' && result.type === 'item') {
        craftedItem = {
          id: uuidv4(),
          recipeId: recipe.id,
          craftedAt: Date.now(),
          active: true,
          usesRemaining: result.effect?.duration
        };
        
        // Add to active items
        this.craftStats.activeItems.push(craftedItem);
      }
      
      // Update craft statistics
      this.updateCraftStats(recipeId);
      
      // Notify item received
      if (onItemReceived) {
        onItemReceived(result);
      }
      
      return { 
        success: true, 
        result,
        item: craftedItem
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: `Crafting failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  /**
   * Get active crafted items
   */
  getActiveItems(): CraftedItem[] {
    // Clean up expired items
    const now = Date.now();
    this.craftStats.activeItems = this.craftStats.activeItems.filter(item => 
      item.active && (!item.expiresAt || item.expiresAt > now)
    );
    
    return this.craftStats.activeItems.filter(item => item.active);
  }
  
  /**
   * Use/consume an active item
   */
  useItem(itemId: string): boolean {
    const item = this.craftStats.activeItems.find(i => i.id === itemId && i.active);
    if (!item) return false;
    
    if (item.usesRemaining) {
      item.usesRemaining--;
      if (item.usesRemaining <= 0) {
        item.active = false;
      }
    }
    
    return true;
  }
  
  /**
   * Get crafting statistics
   */
  getStats(): CraftStats {
    return { ...this.craftStats };
  }
  
  /**
   * Reset crafting data (for testing)
   */
  reset(): void {
    this.craftStats = {
      totalCrafts: 0,
      recipesCrafted: {},
      lastCraftTime: 0,
      activeItems: []
    };
  }
  
  // === PRIVATE HELPER METHODS ===
  
  private countCardsByRarity(cards: Card[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    cards.forEach(card => {
      const rarity = typeof card.rarity === 'string' 
        ? card.rarity.toLowerCase() 
        : CardUtils.getRarityName(card.rarity).toLowerCase();
      counts[rarity] = (counts[rarity] || 0) + 1;
    });
    
    return counts;
  }
  
  private selectCardsForCrafting(cards: Card[], cost: CraftRecipe['cost']): Card[] {
    const selected: Card[] = [];
    const available = [...cards]; // Copy to avoid mutation
    
    // Select cards by rarity
    for (const [rarity, needed] of Object.entries(cost)) {
      if (rarity === 'gold' || rarity === 'gems' || !needed) continue;
      
      let found = 0;
      for (let i = available.length - 1; i >= 0 && found < needed; i--) {
        const card = available[i];
        const cardRarity = typeof card.rarity === 'string'
          ? card.rarity.toLowerCase()
          : CardUtils.getRarityName(card.rarity).toLowerCase();
          
        if (cardRarity === rarity) {
          selected.push(card);
          available.splice(i, 1);
          found++;
        }
      }
    }
    
    return selected;
  }
  
  private async createCraftResult(resultSpec: CraftResult): Promise<CraftResult> {
    // For random card results, generate the actual card
    if (resultSpec.type === 'card') {
      if (resultSpec.id === 'random_legendary') {
        // Generate a random legendary card
        // In real implementation, this would use CardService to get a random legendary
        return {
          ...resultSpec,
          cardData: {
            id: `crafted_legendary_${uuidv4()}`,
            name: 'Crafted Legendary',
            rarity: 200, // Legendary in the card system
            luck: 100,
            emojis: []
          } as Card
        };
      }
    }
    
    return resultSpec;
  }
  
  private updateCraftStats(recipeId: string): void {
    this.craftStats.totalCrafts++;
    this.craftStats.recipesCrafted[recipeId] = (this.craftStats.recipesCrafted[recipeId] || 0) + 1;
    this.craftStats.lastCraftTime = Date.now();
  }
}

// Export singleton instance
export const craftService = new CraftService();