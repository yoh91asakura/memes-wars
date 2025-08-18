import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UnifiedCard, CardRarity } from '../models/unified/Card';
import { CardService } from '../services/CardService';

interface CollectionFilters {
  search: string;
  rarity: CardRarity | 'all';
  sortBy: 'name' | 'rarity' | 'power' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
}

interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  cardsByRarity: Record<CardRarity, number>;
  completionPercentage: number;
  mostRecentCard?: UnifiedCard;
  totalValue: number;
}

interface CollectionStore {
  // State
  collection: UnifiedCard[];
  filters: CollectionFilters;
  viewMode: 'grid' | 'list';
  selectedCard: UnifiedCard | null;
  
  // Actions
  addCard: (card: UnifiedCard) => void;
  removeCard: (cardId: string) => void;
  setFilters: (filters: Partial<CollectionFilters>) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedCard: (card: UnifiedCard | null) => void;
  clearCollection: () => void;
  
  // Computed values
  getFilteredCards: () => UnifiedCard[];
  getCollectionStats: () => CollectionStats;
  getCardsByRarity: (rarity: CardRarity) => UnifiedCard[];
  hasCard: (cardId: string) => boolean;
  getCardCount: (cardId: string) => number;
}

const cardService = new CardService();

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      collection: [],
      filters: {
        search: '',
        rarity: 'all',
        sortBy: 'dateAdded',
        sortOrder: 'desc'
      },
      viewMode: 'grid',
      selectedCard: null,
      
      // Add card to collection
      addCard: (card: UnifiedCard) => {
        set((state) => ({
          collection: [...state.collection, {
            ...card,
            id: card.id + '_' + Date.now(), // Ensure unique IDs for duplicates
            addedAt: new Date().toISOString()
          }]
        }));
      },
      
      // Remove card from collection
      removeCard: (cardId: string) => {
        set((state) => ({
          collection: state.collection.filter(card => card.id !== cardId)
        }));
      },
      
      // Update filters
      setFilters: (newFilters: Partial<CollectionFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },
      
      // Set view mode
      setViewMode: (mode: 'grid' | 'list') => {
        set({ viewMode: mode });
      },
      
      // Set selected card
      setSelectedCard: (card: UnifiedCard | null) => {
        set({ selectedCard: card });
      },
      
      // Clear entire collection
      clearCollection: () => {
        set({ collection: [], selectedCard: null });
      },
      
      // Get filtered and sorted cards
      getFilteredCards: () => {
        const { collection, filters } = get();
        let filtered = [...collection];
        
        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(card =>
            card.name.toLowerCase().includes(searchLower) ||
            card.description.toLowerCase().includes(searchLower) ||
            card.emoji.includes(filters.search) ||
            card.tags?.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }
        
        // Apply rarity filter
        if (filters.rarity !== 'all') {
          filtered = filtered.filter(card => card.rarity === filters.rarity);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
          let comparison = 0;
          
          switch (filters.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'rarity': {
              const rarityOrder = {
                'COMMON': 1,
                'UNCOMMON': 2, 
                'RARE': 3,
                'EPIC': 4,
                'LEGENDARY': 5,
                'MYTHIC': 6,
                'COSMIC': 7
              };
              comparison = (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) - 
                          (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0);
              break;
            }
            case 'power':
              comparison = (a.attack + a.defense + a.health) - (b.attack + b.defense + b.health);
              break;
            case 'dateAdded':
              comparison = new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
              break;
          }
          
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return filtered;
      },
      
      // Get collection statistics
      getCollectionStats: () => {
        const { collection } = get();
        const allCards = cardService.getAllCards();
        
        const cardsByRarity: Record<CardRarity, number> = {
          COMMON: 0,
          UNCOMMON: 0,
          RARE: 0,
          EPIC: 0,
          LEGENDARY: 0,
          MYTHIC: 0,
          COSMIC: 0
        };
        
        // Count cards by rarity
        collection.forEach(card => {
          if (card.rarity in cardsByRarity) {
            cardsByRarity[card.rarity as CardRarity]++;
          }
        });
        
        const uniqueCards = new Set(collection.map(card => card.name)).size;
        const totalValue = collection.reduce((sum, card) => sum + (card.goldReward || 10), 0);
        
        return {
          totalCards: collection.length,
          uniqueCards,
          cardsByRarity,
          completionPercentage: Math.round((uniqueCards / allCards.length) * 100),
          mostRecentCard: collection.length > 0 ? 
            collection.sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime())[0] :
            undefined,
          totalValue
        };
      },
      
      // Get cards by rarity
      getCardsByRarity: (rarity: CardRarity) => {
        return get().collection.filter(card => card.rarity === rarity);
      },
      
      // Check if collection has a specific card
      hasCard: (cardId: string) => {
        return get().collection.some(card => card.id === cardId);
      },
      
      // Get count of specific card
      getCardCount: (cardId: string) => {
        return get().collection.filter(card => card.name === cardId).length;
      }
    }),
    {
      name: 'memes-wars-collection',
      partialize: (state) => ({
        collection: state.collection,
        filters: state.filters,
        viewMode: state.viewMode
      })
    }
  )
);
