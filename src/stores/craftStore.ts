// Craft Store - Zustand store for crafting system state management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CraftService, 
  craftService, 
  CraftRecipe, 
  CraftResult, 
  CraftedItem 
} from '../services/CraftService';
import { Card } from '../models/Card';

export interface CraftStore {
  // State
  availableRecipes: CraftRecipe[];
  activeItems: CraftedItem[];
  selectedRecipe: CraftRecipe | null;
  isCrafting: boolean;
  lastCraftResult: CraftResult | null;
  
  // Craft History
  totalCrafts: number;
  recipesCrafted: Record<string, number>;
  
  // Actions
  initializeCrafting: () => void;
  selectRecipe: (recipeId: string | null) => void;
  checkCanCraft: (recipeId: string, playerCards: Card[], playerGold: number, playerGems: number, playerLevel?: number) => { canCraft: boolean; reason?: string };
  performCraft: (recipeId: string, playerCards: Card[], onResourcesSpent?: (gold: number, gems: number, cardsUsed: Card[]) => void) => Promise<{ success: boolean; result?: CraftResult; error?: string }>;
  useActiveItem: (itemId: string) => boolean;
  refreshActiveItems: () => void;
  
  // Utilities
  getRecipesByCategory: (category: string) => CraftRecipe[];
  getCraftableRecipes: (playerCards: Card[], playerGold: number, playerGems: number, playerLevel?: number) => CraftRecipe[];
  getActiveBoosts: () => { type: string; value: number; remaining?: number }[];
  reset: () => void;
}

export const useCraftStore = create<CraftStore>()(
  persist(
    (set, get) => ({
      // Initial state
      availableRecipes: [],
      activeItems: [],
      selectedRecipe: null,
      isCrafting: false,
      lastCraftResult: null,
      totalCrafts: 0,
      recipesCrafted: {},
      
      // Initialize crafting system
      initializeCrafting: () => {
        const recipes = craftService.getAvailableRecipes();
        const activeItems = craftService.getActiveItems();
        const stats = craftService.getStats();
        
        set({
          availableRecipes: recipes,
          activeItems,
          totalCrafts: stats.totalCrafts,
          recipesCrafted: stats.recipesCrafted
        });
      },
      
      // Select recipe for crafting
      selectRecipe: (recipeId: string | null) => {
        if (!recipeId) {
          set({ selectedRecipe: null });
          return;
        }
        
        const recipe = craftService.getRecipe(recipeId);
        set({ selectedRecipe: recipe || null });
      },
      
      // Check if crafting is possible
      checkCanCraft: (recipeId: string, playerCards: Card[], playerGold: number, playerGems: number, playerLevel = 1) => {
        return craftService.canCraft(recipeId, playerCards, playerGold, playerGems, playerLevel);
      },
      
      // Perform crafting operation
      performCraft: async (recipeId: string, playerCards: Card[], onResourcesSpent?) => {
        set({ isCrafting: true });
        
        try {
          const result = await craftService.craft(
            recipeId,
            playerCards,
            onResourcesSpent,
            (craftResult) => {
              set({ lastCraftResult: craftResult });
            }
          );
          
          if (result.success) {
            // Update store state
            const stats = craftService.getStats();
            const activeItems = craftService.getActiveItems();
            
            set({
              totalCrafts: stats.totalCrafts,
              recipesCrafted: stats.recipesCrafted,
              activeItems,
              selectedRecipe: null // Clear selection after successful craft
            });
          }
          
          return result;
          
        } catch (error) {
          return {
            success: false,
            error: `Crafting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        } finally {
          set({ isCrafting: false });
        }
      },
      
      // Use an active item
      useActiveItem: (itemId: string) => {
        const success = craftService.useItem(itemId);
        
        if (success) {
          // Refresh active items
          const activeItems = craftService.getActiveItems();
          set({ activeItems });
        }
        
        return success;
      },
      
      // Refresh active items (cleanup expired ones)
      refreshActiveItems: () => {
        const activeItems = craftService.getActiveItems();
        set({ activeItems });
      },
      
      // Get recipes by category
      getRecipesByCategory: (category: string) => {
        const { availableRecipes } = get();
        return availableRecipes.filter(recipe => recipe.category === category);
      },
      
      // Get craftable recipes based on player resources
      getCraftableRecipes: (playerCards: Card[], playerGold: number, playerGems: number, playerLevel = 1) => {
        const { availableRecipes } = get();
        
        return availableRecipes.filter(recipe => {
          const check = craftService.canCraft(recipe.id, playerCards, playerGold, playerGems, playerLevel);
          return check.canCraft;
        });
      },
      
      // Get active boost effects
      getActiveBoosts: () => {
        const { activeItems, availableRecipes } = get();
        
        return activeItems
          .filter(item => item.active)
          .map(item => {
            const recipe = availableRecipes.find(r => r.id === item.recipeId);
            if (!recipe || !recipe.result.effect) return null;
            
            return {
              type: recipe.result.effect.type,
              value: recipe.result.effect.value,
              remaining: item.usesRemaining,
              itemId: item.id,
              name: recipe.name,
              icon: recipe.icon
            };
          })
          .filter(Boolean) as any[];
      },
      
      // Reset crafting state
      reset: () => {
        craftService.reset();
        set({
          activeItems: [],
          selectedRecipe: null,
          isCrafting: false,
          lastCraftResult: null,
          totalCrafts: 0,
          recipesCrafted: {}
        });
      }
    }),
    {
      name: 'craft-store',
      partialize: (state) => ({
        // Only persist essential data
        totalCrafts: state.totalCrafts,
        recipesCrafted: state.recipesCrafted,
        activeItems: state.activeItems
      })
    }
  )
);