// CraftService Tests - Testing the crafting system functionality
import { describe, it, expect, beforeEach } from 'vitest';
import { CraftService } from '../../../src/services/CraftService';
import { Card } from '../../../src/models/Card';

describe('CraftService', () => {
  let craftService: CraftService;
  
  beforeEach(() => {
    craftService = new CraftService();
    craftService.reset(); // Clean state for each test
  });

  describe('Recipe Management', () => {
    it('should load all recipes on initialization', () => {
      const recipes = craftService.getAvailableRecipes();
      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes.some(r => r.id === 'lucky_charm')).toBe(true);
      expect(recipes.some(r => r.id === 'deck_expansion')).toBe(true);
    });

    it('should get recipe by ID', () => {
      const recipe = craftService.getRecipe('lucky_charm');
      expect(recipe).toBeDefined();
      expect(recipe?.name).toBe('Lucky Charm 🍀');
      expect(recipe?.category).toBe('consumable');
    });

    it('should return undefined for non-existent recipe', () => {
      const recipe = craftService.getRecipe('non_existent');
      expect(recipe).toBeUndefined();
    });
  });

  describe('Craft Validation', () => {
    const mockCards: Card[] = [
      { id: '1', name: 'Test Common 1', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '2', name: 'Test Common 2', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '3', name: 'Test Common 3', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '4', name: 'Test Common 4', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '5', name: 'Test Common 5', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
    ];

    it('should validate crafting requirements - success case', () => {
      const result = craftService.canCraft('lucky_charm', mockCards, 1000, 50, 1);
      expect(result.canCraft).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should fail validation when not enough cards', () => {
      const fewCards = mockCards.slice(0, 2); // Only 2 cards, need 5
      const result = craftService.canCraft('lucky_charm', fewCards, 1000, 50, 1);
      expect(result.canCraft).toBe(false);
      expect(result.reason).toContain('Need 5 common cards');
    });

    it('should fail validation when not enough gold', () => {
      const result = craftService.canCraft('deck_expansion', [], 100, 50, 1); // Needs 5000 gold
      expect(result.canCraft).toBe(false);
      expect(result.reason).toBe('Insufficient gold');
    });

    it('should fail validation when not enough gems', () => {
      const result = craftService.canCraft('master_collector', [], 10000, 5, 1); // Needs 100 gems
      expect(result.canCraft).toBe(false);
      expect(result.reason).toBe('Insufficient gems');
    });

    it('should fail validation for level requirements', () => {
      const result = craftService.canCraft('cosmic_fusion', [], 10000, 1000, 10); // Needs level 50
      expect(result.canCraft).toBe(false);
      expect(result.reason).toBe('Requires level 50');
    });
  });

  describe('Crafting Process', () => {
    const mockCards: Card[] = [
      { id: '1', name: 'Test Common 1', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '2', name: 'Test Common 2', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '3', name: 'Test Common 3', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '4', name: 'Test Common 4', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '5', name: 'Test Common 5', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
    ];

    it('should successfully craft a lucky charm', async () => {
      let resourcesSpent = { gold: 0, gems: 0, cardsUsed: [] as Card[] };
      let itemReceived: any = null;

      const result = await craftService.craft(
        'lucky_charm',
        mockCards,
        (gold, gems, cards) => {
          resourcesSpent = { gold, gems, cardsUsed: cards };
        },
        (item) => {
          itemReceived = item;
        }
      );

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.item).toBeDefined();
      expect(resourcesSpent.cardsUsed.length).toBe(5);
      expect(itemReceived.type).toBe('item');
    });

    it('should fail crafting for non-existent recipe', async () => {
      const result = await craftService.craft('non_existent', mockCards);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Recipe not found');
    });
  });

  describe('Active Items Management', () => {
    it('should start with no active items', () => {
      const activeItems = craftService.getActiveItems();
      expect(activeItems).toHaveLength(0);
    });

    it('should track active items after crafting consumables', async () => {
      const mockCards: Card[] = [
        { id: '1', name: 'Test Common 1', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '2', name: 'Test Common 2', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '3', name: 'Test Common 3', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '4', name: 'Test Common 4', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '5', name: 'Test Common 5', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      ];

      const result = await craftService.craft('lucky_charm', mockCards);
      expect(result.success).toBe(true);

      const activeItems = craftService.getActiveItems();
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].recipeId).toBe('lucky_charm');
      expect(activeItems[0].active).toBe(true);
      expect(activeItems[0].usesRemaining).toBe(5);
    });

    it('should use active items correctly', async () => {
      const mockCards: Card[] = [
        { id: '1', name: 'Test Common 1', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '2', name: 'Test Common 2', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '3', name: 'Test Common 3', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '4', name: 'Test Common 4', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: '5', name: 'Test Common 5', rarity: 2, luck: 5, emojis: [], family: 'CLASSIC_INTERNET' as any, reference: 'test', stackLevel: 1, goldReward: 10, emoji: '🐵', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      ];

      const craftResult = await craftService.craft('lucky_charm', mockCards);
      const itemId = craftResult.item!.id;

      // Use the item
      const useResult = craftService.useItem(itemId);
      expect(useResult).toBe(true);

      // Check remaining uses
      const activeItems = craftService.getActiveItems();
      expect(activeItems[0].usesRemaining).toBe(4);
    });
  });

  describe('Statistics', () => {
    it('should track craft statistics', () => {
      const initialStats = craftService.getStats();
      expect(initialStats.totalCrafts).toBe(0);
      expect(Object.keys(initialStats.recipesCrafted)).toHaveLength(0);
    });
  });

  describe('Recipe Categories', () => {
    it('should have consumable recipes', () => {
      const recipes = craftService.getAvailableRecipes();
      const consumables = recipes.filter(r => r.category === 'consumable');
      expect(consumables.length).toBeGreaterThan(0);
      expect(consumables.some(r => r.id === 'lucky_charm')).toBe(true);
    });

    it('should have permanent upgrade recipes', () => {
      const recipes = craftService.getAvailableRecipes();
      const permanents = recipes.filter(r => r.category === 'permanent');
      expect(permanents.length).toBeGreaterThan(0);
      expect(permanents.some(r => r.id === 'deck_expansion')).toBe(true);
    });

    it('should have special card recipes', () => {
      const recipes = craftService.getAvailableRecipes();
      const cardRecipes = recipes.filter(r => r.category === 'card');
      expect(cardRecipes.length).toBeGreaterThan(0);
      expect(cardRecipes.some(r => r.id === 'forge_legendary')).toBe(true);
    });
  });
});