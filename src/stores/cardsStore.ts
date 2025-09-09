// Cards Store - Manages card collections, rolling, and card-related state
// Consolidates rollStore and collectionStore with proper Card support

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../models';
import { RollService, RollResult, MultiRollResult } from '../services/RollService';

// Roll configuration
const rollConfig = {
  rollCosts: {
    single: 100,
    ten: 900,
    hundred: 8000
  }
};

export interface RollHistory {
  id: string;
  timestamp: number;
  cards: RollResult[];
  type: 'single' | 'ten' | 'hundred';
  cost: number;
}

export interface CollectionFilters {
  search: string;
  rarity: string | 'all';
  sortBy: 'name' | 'rarity' | 'power' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
}

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  cardsByRarity: Record<string, number>;
  completionPercentage: number;
  mostRecentCard?: Card;
  totalValue: number;
}

export interface CardStack {
  cardData: Card;
  count: number;
  ids: string[];
  firstAddedAt: string;
  lastAddedAt: string;
}

export interface AutoRollSettings {
  enabled: boolean;
  maxRolls?: number;
  stopOnRarity?: string;
  animationSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  batchSize: number;
}

export interface AutoRollState {
  isActive: boolean;
  settings: AutoRollSettings;
  progress: {
    currentRoll: number;
    totalRolls: number;
    cardsObtained: Card[];
    startTime: number;
    lastBatchTime: number;
  };
}

export interface CardsStore {
  // Collection State
  collection: Card[];
  cards: Card[]; // Alias for collection for compatibility
  selectedCard: Card | null;
  filters: CollectionFilters;
  viewMode: 'grid' | 'list' | 'stack';
  showStacks: boolean;
  
  // Roll State
  isRolling: boolean;
  lastRollResult: RollResult | MultiRollResult | null;
  rollHistory: RollHistory[];
  maxHistorySize: number;
  
  // Auto Roll State
  autoRollState: AutoRollState;
  
  // Collection Actions
  addCard: (card: Card) => void;
  addMultipleCards: (cards: Card[]) => void;
  removeCard: (cardId: string) => void;
  removeCards: (cardIds: string[]) => void; // New method for multiple cards
  setSelectedCard: (card: Card | null) => void;
  setFilters: (filters: Partial<CollectionFilters>) => void;
  setViewMode: (mode: 'grid' | 'list' | 'stack') => void;
  toggleShowStacks: () => void;
  clearCollection: () => void;
  
  // Roll Actions
  performSingleRoll: () => Promise<RollResult>;
  performTenRoll: () => Promise<MultiRollResult>;
  performHundredRoll: () => Promise<MultiRollResult>;
  addToHistory: (history: RollHistory) => void;
  clearHistory: () => void;
  
  // Auto Roll Actions
  startAutoRoll: (settings: AutoRollSettings) => Promise<void>;
  stopAutoRoll: () => void;
  pauseAutoRoll: () => void;
  resumeAutoRoll: () => void;
  updateAutoRollSettings: (settings: Partial<AutoRollSettings>) => void;
  
  // Computed Getters
  getFilteredCards: () => Card[];
  getCollectionStats: () => CollectionStats;
  getCardsByRarity: (rarity: string) => Card[];
  hasCard: (cardId: string) => boolean;
  getCardCount: (cardId: string) => number;
  getDuplicateCards: () => Card[];
  getUniqueCardCount: () => number;
  getRollCost: (type: 'single' | 'ten' | 'hundred') => number;
  
  // Utilities
  reset: () => void;
}

const rollService = new RollService();

export const useCardsStore = create<CardsStore>()(
  persist(
    (set, get) => ({
          // Initial state
          collection: [],
          get cards() { return get().collection; }, // Alias getter for compatibility
          selectedCard: null,
          filters: {
            search: '',
            rarity: 'all',
            sortBy: 'dateAdded',
            sortOrder: 'desc'
          },
          viewMode: 'grid',
          showStacks: false,
          
          // Auto Roll State
          autoRollState: {
            isActive: false,
            settings: {
              enabled: false,
              animationSpeed: 'normal',
              batchSize: 1
            },
            progress: {
              currentRoll: 0,
              totalRolls: 0,
              cardsObtained: [],
              startTime: 0,
              lastBatchTime: 0
            }
          },
          
          isRolling: false,
          lastRollResult: null,
          rollHistory: [],
          maxHistorySize: 50,
          
          // Collection Actions
          addCard: (card: Card) => {
            const state = get();
            const newCard = {
              ...card,
              id: card.id || `${card.name}-${Date.now()}`,
              addedAt: new Date().toISOString()
            };
            
            set({
              collection: [...state.collection, newCard],
              selectedCard: newCard
            });
          },
          
          addMultipleCards: (cards: Card[]) => {
            const state = get();
            const newCards = cards.map(card => ({
              ...card,
              id: card.id || `${card.name}-${Date.now()}-${Math.random()}`,
              addedAt: new Date().toISOString()
            }));
            
            set({
              collection: [...state.collection, ...newCards]
            });
          },
          
          removeCard: (cardId: string) => {
            const state = get();
            set({
              collection: state.collection.filter(card => card.id !== cardId),
              selectedCard: state.selectedCard?.id === cardId ? null : state.selectedCard
            });
          },
          
          removeCards: (cardIds: string[]) => {
            const state = get();
            const idSet = new Set(cardIds);
            set({
              collection: state.collection.filter(card => !idSet.has(card.id)),
              selectedCard: state.selectedCard && idSet.has(state.selectedCard.id) ? null : state.selectedCard
            });
          },
          
          setSelectedCard: (card: Card | null) => {
            set({ selectedCard: card });
          },
          
          setFilters: (newFilters: Partial<CollectionFilters>) => {
            const state = get();
            set({
              filters: { ...state.filters, ...newFilters }
            });
          },
          
          setViewMode: (mode: 'grid' | 'list' | 'stack') => {
            set({ viewMode: mode });
          },
          
          toggleShowStacks: () => {
            const state = get();
            set({ showStacks: !state.showStacks });
          },
          
          clearCollection: () => {
            set({
              collection: [],
              selectedCard: null
            });
          },
          
          // Roll Actions
          performSingleRoll: async () => {
            set({ isRolling: true });
            
            try {
              // Get player stats from the player store (if available)
              const playerStats = {
                totalRolls: 0,
                rollsSinceRare: 0,
                rollsSinceEpic: 0,
                rollsSinceLegendary: 0,
                rollsSinceMythic: 0,
                rollsSinceCosmic: 0,
                collectedByRarity: {}
              };
              
              const result = rollService.rollSingle(playerStats);
              
              // Add to collection
              get().addCard(result.card);
              
              // Add to history
              get().addToHistory({
                id: `roll-${Date.now()}`,
                timestamp: Date.now(),
                cards: [result],
                type: 'single',
                cost: rollConfig.rollCosts.single
              });
              
              set({ 
                lastRollResult: result,
                isRolling: false 
              });
              
              return result;
            } catch (error) {
              set({ isRolling: false });
              throw error;
            }
          },
          
          performTenRoll: async () => {
            set({ isRolling: true });
            
            try {
              const playerStats = {
                totalRolls: 0,
                rollsSinceRare: 0,
                rollsSinceEpic: 0,
                rollsSinceLegendary: 0,
                rollsSinceMythic: 0,
                rollsSinceCosmic: 0,
                collectedByRarity: {}
              };
              
              const result = rollService.rollTen(playerStats);
              
              // Add all cards to collection
              get().addMultipleCards(result.cards.map(r => r.card));
              
              // Add to history
              get().addToHistory({
                id: `roll-${Date.now()}`,
                timestamp: Date.now(),
                cards: result.cards,
                type: 'ten',
                cost: rollConfig.rollCosts.ten
              });
              
              set({ 
                lastRollResult: result,
                isRolling: false 
              });
              
              return result;
            } catch (error) {
              set({ isRolling: false });
              throw error;
            }
          },
          
          performHundredRoll: async () => {
            set({ isRolling: true });
            
            try {
              const playerStats = {
                totalRolls: 0,
                rollsSinceRare: 0,
                rollsSinceEpic: 0,
                rollsSinceLegendary: 0,
                rollsSinceMythic: 0,
                rollsSinceCosmic: 0,
                collectedByRarity: {}
              };
              
              const result = rollService.rollHundred(playerStats);
              
              // Add all cards to collection
              get().addMultipleCards(result.cards.map(r => r.card));
              if (result.bonusCards) {
                get().addMultipleCards(result.bonusCards);
              }
              
              // Add to history
              get().addToHistory({
                id: `roll-${Date.now()}`,
                timestamp: Date.now(),
                cards: result.cards,
                type: 'hundred',
                cost: rollConfig.rollCosts.hundred
              });
              
              set({ 
                lastRollResult: result,
                isRolling: false 
              });
              
              return result;
            } catch (error) {
              set({ isRolling: false });
              throw error;
            }
          },
          
          addToHistory: (newHistory: RollHistory) => {
            const state = get();
            const updatedHistory = [newHistory, ...state.rollHistory].slice(0, state.maxHistorySize);
            set({ rollHistory: updatedHistory });
          },
          
          clearHistory: () => {
            set({ rollHistory: [] });
          },
          
          // Computed Getters
          getFilteredCards: () => {
            const state = get();
            let filtered = [...state.collection];
            
            // Apply search filter
            if (state.filters.search) {
              const searchLower = state.filters.search.toLowerCase();
              filtered = filtered.filter(card =>
                card.name.toLowerCase().includes(searchLower) ||
                card.description.toLowerCase().includes(searchLower)
              );
            }
            
            // Apply rarity filter
            if (state.filters.rarity !== 'all') {
              filtered = filtered.filter(card => card.rarity === state.filters.rarity);
            }
            
            // Apply sorting
            filtered.sort((a, b) => {
              let comparison = 0;
              
              switch (state.filters.sortBy) {
                case 'name':
                  comparison = a.name.localeCompare(b.name);
                  break;
                case 'rarity':
                  const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'COSMIC', 'DIVINE', 'INFINITY'];
                  comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                  break;
                case 'power':
                  comparison = (a.attack + a.defense + a.health) - (b.attack + b.defense + b.health);
                  break;
                case 'dateAdded':
                  comparison = new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
                  break;
              }
              
              return state.filters.sortOrder === 'asc' ? comparison : -comparison;
            });
            
            return filtered;
          },
          
          getCollectionStats: () => {
            const state = get();
            const collection = state.collection;
            
            const stats: CollectionStats = {
              totalCards: collection.length,
              uniqueCards: new Set(collection.map(card => card.name)).size,
              cardsByRarity: {
                COMMON: 0,
                UNCOMMON: 0,
                RARE: 0,
                EPIC: 0,
                LEGENDARY: 0,
                MYTHIC: 0,
                COSMIC: 0,
                DIVINE: 0,
                INFINITY: 0
              },
              completionPercentage: 0,
              totalValue: 0
            };
            
            collection.forEach(card => {
              stats.cardsByRarity[card.rarity]++;
              stats.totalValue += card.goldReward || 0;
            });
            
            if (collection.length > 0) {
              stats.mostRecentCard = collection
                .sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime())[0];
            }
            
            // Calculate completion percentage (would need total available cards)
            // For now, use a rough estimate
            stats.completionPercentage = Math.min((stats.uniqueCards / 500) * 100, 100);
            
            return stats;
          },
          
          getCardsByRarity: (rarity: string) => {
            const state = get();
            return state.collection.filter(card => card.rarity === rarity);
          },
          
          hasCard: (cardId: string) => {
            const state = get();
            return state.collection.some(card => card.id === cardId);
          },
          
          getCardCount: (cardId: string) => {
            const state = get();
            return state.collection.filter(card => card.id === cardId).length;
          },
          
          getDuplicateCards: () => {
            const state = get();
            const cardCounts = new Map<string, number>();
            
            state.collection.forEach(card => {
              cardCounts.set(card.name, (cardCounts.get(card.name) || 0) + 1);
            });
            
            return state.collection.filter(card => (cardCounts.get(card.name) || 0) > 1);
          },
          
          getUniqueCardCount: () => {
            const state = get();
            return new Set(state.collection.map(card => card.name)).size;
          },
          
          getRollCost: (type: 'single' | 'ten' | 'hundred') => {
            return rollConfig.rollCosts[type];
          },
          
          // Auto Roll Actions
          startAutoRoll: async (settings: AutoRollSettings) => {
            const state = get();
            if (state.autoRollState.isActive) return;
            
            const startTime = Date.now();
            set({
              autoRollState: {
                isActive: true,
                settings: { ...settings, enabled: true },
                progress: {
                  currentRoll: 0,
                  totalRolls: settings.maxRolls || 0,
                  cardsObtained: [],
                  startTime,
                  lastBatchTime: startTime
                }
              }
            });
            
            // Start the auto-roll process
            const performAutoRoll = async () => {
              const currentState = get();
              if (!currentState.autoRollState.isActive) return;
              
              const { settings: autoSettings, progress } = currentState.autoRollState;
              
              if (autoSettings.maxRolls && progress.currentRoll >= autoSettings.maxRolls) {
                get().stopAutoRoll();
                return;
              }
              
              try {
                // Perform batch rolls based on batchSize
                const rollPromises = [];
                for (let i = 0; i < autoSettings.batchSize && progress.currentRoll + i < (autoSettings.maxRolls || Infinity); i++) {
                  rollPromises.push(get().performSingleRoll());
                }
                
                const results = await Promise.all(rollPromises);
                const newCards = results.map(r => r.card);
                
                // Check stop conditions
                let shouldStop = false;
                if (autoSettings.stopOnRarity) {
                  shouldStop = newCards.some(card => card.rarity.toLowerCase() === autoSettings.stopOnRarity?.toLowerCase());
                }
                
                // Update progress
                const updatedState = get();
                set({
                  autoRollState: {
                    ...updatedState.autoRollState,
                    progress: {
                      ...updatedState.autoRollState.progress,
                      currentRoll: updatedState.autoRollState.progress.currentRoll + results.length,
                      cardsObtained: [...updatedState.autoRollState.progress.cardsObtained, ...newCards],
                      lastBatchTime: Date.now()
                    }
                  }
                });
                
                if (shouldStop) {
                  get().stopAutoRoll();
                  return;
                }
                
                // Schedule next batch
                const delay = autoSettings.animationSpeed === 'instant' ? 0 : 
                            autoSettings.animationSpeed === 'fast' ? 100 :
                            autoSettings.animationSpeed === 'normal' ? 500 : 1000;
                            
                setTimeout(performAutoRoll, delay);
                
              } catch (error) {
                console.error('Auto-roll failed:', error);
                get().stopAutoRoll();
              }
            };
            
            // Start the first batch
            setTimeout(performAutoRoll, 500);
          },
          
          stopAutoRoll: () => {
            const state = get();
            set({
              autoRollState: {
                ...state.autoRollState,
                isActive: false
              }
            });
          },
          
          pauseAutoRoll: () => {
            const state = get();
            set({
              autoRollState: {
                ...state.autoRollState,
                isActive: false // Simple pause by setting inactive
              }
            });
          },
          
          resumeAutoRoll: () => {
            const state = get();
            if (state.autoRollState.settings.enabled) {
              get().startAutoRoll(state.autoRollState.settings);
            }
          },
          
          updateAutoRollSettings: (newSettings: Partial<AutoRollSettings>) => {
            const state = get();
            set({
              autoRollState: {
                ...state.autoRollState,
                settings: {
                  ...state.autoRollState.settings,
                  ...newSettings
                }
              }
            });
          },
          
          // Stacking Methods
          getStackedCards: () => {
            const state = get();
            const stackMap = new Map<string, CardStack>();
            
            state.collection.forEach(card => {
              const key = `${card.name}-${card.rarity}`;
              if (stackMap.has(key)) {
                const stack = stackMap.get(key)!;
                stack.count += 1;
                stack.ids.push(card.id);
                stack.lastAddedAt = card.addedAt || stack.lastAddedAt;
              } else {
                stackMap.set(key, {
                  cardData: card,
                  count: 1,
                  ids: [card.id],
                  firstAddedAt: card.addedAt || new Date().toISOString(),
                  lastAddedAt: card.addedAt || new Date().toISOString()
                });
              }
            });
            
            return Array.from(stackMap.values());
          },
          
          // Utilities
          reset: () => {
            set({
              collection: [],
              selectedCard: null,
              filters: {
                search: '',
                rarity: 'all',
                sortBy: 'dateAdded',
                sortOrder: 'desc'
              },
              viewMode: 'grid',
              showStacks: false,
              isRolling: false,
              lastRollResult: null,
              rollHistory: [],
              autoRollState: {
                isActive: false,
                settings: {
                  enabled: false,
                  animationSpeed: 'normal',
                  batchSize: 1
                },
                progress: {
                  currentRoll: 0,
                  totalRolls: 0,
                  cardsObtained: [],
                  startTime: 0,
                  lastBatchTime: 0
                }
              }
            });
          }
        }),
    {
      name: 'cards-store'
    }
  )
);