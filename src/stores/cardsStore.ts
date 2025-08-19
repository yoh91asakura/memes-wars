// Cards Store - Manages card collections, rolling, and card-related state
// Consolidates rollStore and collectionStore with proper Card support

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../models/Card';
import { StackedCard, StackedCardUtils } from '../types/StackedCard';
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

export interface CardsStore {
  // Collection State
  collection: Card[];
  selectedCard: Card | null;
  filters: CollectionFilters;
  viewMode: 'grid' | 'list';
  
  // Roll State
  isRolling: boolean;
  lastRollResult: RollResult | MultiRollResult | null;
  rollHistory: RollHistory[];
  maxHistorySize: number;
  
  // Collection Actions
  addCard: (card: Card) => void;
  addMultipleCards: (cards: Card[]) => void;
  removeCard: (cardId: string) => void;
  setSelectedCard: (card: Card | null) => void;
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
  getFilteredCards: () => StackedCard[];
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

const rollService = RollService.getInstance();

export const useCardsStore = create<CardsStore>()(
  persist(
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
          
          setSelectedCard: (card: Card | null) => {
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
            
            // Create stacked cards from collection
            let stackedCards = StackedCardUtils.createCardStacks(state.collection);
            
            // Apply search filter
            if (state.filters.search) {
              const searchLower = state.filters.search.toLowerCase();
              stackedCards = stackedCards.filter(card =>
                card.name.toLowerCase().includes(searchLower) ||
                (card.description && card.description.toLowerCase().includes(searchLower))
              );
            }
            
            // Apply rarity filter
            if (state.filters.rarity !== 'all') {
              stackedCards = stackedCards.filter(card => {
                // Convert numeric rarity to string for filtering
                const rarityString = card.rarity <= 2 ? 'common' :
                  card.rarity <= 4 ? 'uncommon' :
                  card.rarity <= 10 ? 'rare' :
                  card.rarity <= 50 ? 'epic' :
                  card.rarity <= 200 ? 'legendary' :
                  card.rarity <= 1000 ? 'mythic' :
                  card.rarity <= 10000 ? 'cosmic' :
                  card.rarity <= 100000 ? 'divine' : 'infinity';
                return rarityString === state.filters.rarity;
              });
            }
            
            // Apply sorting - default to rarity descending for best cards first
            stackedCards.sort((a, b) => {
              let comparison = 0;
              
              switch (state.filters.sortBy) {
                case 'name':
                  comparison = a.name.localeCompare(b.name);
                  break;
                case 'rarity':
                default:
                  // Sort by rarity descending (higher rarity number = rarer = first)
                  comparison = b.rarity - a.rarity;
                  break;
                case 'power':
                  comparison = (a.luck + (a.hp || 100)) - (b.luck + (b.hp || 100));
                  break;
                case 'dateAdded':
                  comparison = new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
                  break;
              }
              
              return state.filters.sortOrder === 'asc' ? comparison : -comparison;
            });
            
            return stackedCards;
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
        }),
    {
      name: 'cards-store'
    }
  )
);