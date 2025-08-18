// Cards Store - Manages card collections, rolling, and card-related state
// Consolidates rollStore and collectionStore with proper UnifiedCard support

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UnifiedCard, CardRarity } from '../models/unified/Card';
import { RollService, RollResult, MultiRollResult } from '../services/RollService';
import { createStoreMiddleware } from './middleware';

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
  rarity: CardRarity | 'all';
  sortBy: 'name' | 'rarity' | 'power' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
}

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  cardsByRarity: Record<CardRarity, number>;
  completionPercentage: number;
  mostRecentCard?: UnifiedCard;
  totalValue: number;
}

export interface CardsStore {
  // Collection State
  collection: UnifiedCard[];
  selectedCard: UnifiedCard | null;
  filters: CollectionFilters;
  viewMode: 'grid' | 'list';
  
  // Roll State
  isRolling: boolean;
  lastRollResult: RollResult | MultiRollResult | null;
  rollHistory: RollHistory[];
  maxHistorySize: number;
  
  // Collection Actions
  addCard: (card: UnifiedCard) => void;
  addMultipleCards: (cards: UnifiedCard[]) => void;
  removeCard: (cardId: string) => void;
  setSelectedCard: (card: UnifiedCard | null) => void;
  setFilters: (filters: Partial<CollectionFilters>) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  clearCollection: () => void;
  
  // Roll Actions
  performSingleRoll: () => Promise<RollResult>;
  performTenRoll: () => Promise<MultiRollResult>;
  performHundredRoll: () => Promise<MultiRollResult>;
  addToHistory: (history: RollHistory) => void;
  clearHistory: () => void;
  
  // Computed Getters
  getFilteredCards: () => UnifiedCard[];
  getCollectionStats: () => CollectionStats;
  getCardsByRarity: (rarity: CardRarity) => UnifiedCard[];
  hasCard: (cardId: string) => boolean;
  getCardCount: (cardId: string) => number;
  getDuplicateCards: () => UnifiedCard[];
  getUniqueCardCount: () => number;
  getRollCost: (type: 'single' | 'ten' | 'hundred') => number;
  
  // Utilities
  reset: () => void;
}

const rollService = RollService.getInstance();
const middleware = createStoreMiddleware('cards', {
  enableLogger: true,
  enableDebugger: true,
  enablePersistence: true
});

export const useCardsStore = create<CardsStore>()(
  persist(
    middleware.debugger ? middleware.debugger(
      middleware.logger ? middleware.logger(
        (set, get) => ({
          // Initial state
          collection: [],
          selectedCard: null,
          filters: {
            search: '',
            rarity: 'all',
            sortBy: 'dateAdded',
            sortOrder: 'desc'
          },
          viewMode: 'grid',
          isRolling: false,
          lastRollResult: null,
          rollHistory: [],
          maxHistorySize: 50,
          
          // Collection Actions
          addCard: (card: UnifiedCard) => {
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
          
          addMultipleCards: (cards: UnifiedCard[]) => {
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
          
          setSelectedCard: (card: UnifiedCard | null) => {
            set({ selectedCard: card });
          },
          
          setFilters: (newFilters: Partial<CollectionFilters>) => {
            const state = get();
            set({
              filters: { ...state.filters, ...newFilters }
            });
          },
          
          setViewMode: (mode: 'grid' | 'list') => {
            set({ viewMode: mode });
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
          
          getCardsByRarity: (rarity: CardRarity) => {
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
              isRolling: false,
              lastRollResult: null,
              rollHistory: []
            });
          }
        })
      ) : (set, get) => ({}) // Fallback if logger is disabled
    ) : (set, get) => ({}), // Fallback if debugger is disabled
    middleware.persistence || {}
  )
);