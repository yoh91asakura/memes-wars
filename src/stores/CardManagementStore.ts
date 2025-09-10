/**
 * CardManagementStore - Zustand store for card collection management
 * 
 * This store manages card collections, search/filter state, pagination,
 * and interaction with the CardManagementService.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Card } from '../models/Card';
import { CardCollection, CollectionMetadata } from '../models/CardCollection';
import { CardManagementService, LoadCollectionOptions, SearchOptions, SearchResult, CollectionStatistics } from '../services/CardManagementService';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface LoadingState {
  isLoading: boolean;
  isSearching: boolean;
  isLoadingMore: boolean;
  isSyncing: boolean;
  error: string | null;
  lastError: string | null;
}

interface SelectionState {
  selectedCardIds: Set<string>;
  selectedCards: Card[];
  selectionMode: 'none' | 'single' | 'multiple';
  lastSelectedId: string | null;
}

interface ViewState {
  viewMode: 'grid' | 'list' | 'gallery';
  sortBy: 'name' | 'rarity' | 'luck' | 'cost' | 'recent';
  sortOrder: 'asc' | 'desc';
  cardSize: 'small' | 'medium' | 'large';
  enableVirtualization: boolean;
  showMetadata: boolean;
}

interface CacheState {
  cachedCollections: Map<string, { collection: CardCollection; timestamp: number; ttl: number }>;
  cachedSearches: Map<string, { result: SearchResult; timestamp: number; ttl: number }>;
  cachedStats: Map<string, { stats: CollectionStatistics; timestamp: number; ttl: number }>;
  cacheHits: number;
  cacheMisses: number;
}

interface CardManagementState {
  // Data State
  currentCollection: CardCollection | null;
  allCards: Card[];
  filteredCards: Card[];
  searchResult: SearchResult | null;
  statistics: CollectionStatistics | null;
  
  // UI State
  pagination: PaginationState;
  loading: LoadingState;
  selection: SelectionState;
  view: ViewState;
  
  // Cache State
  cache: CacheState;
  
  // Current Context
  currentPlayerId: string | null;
  currentCollectionId: string | null;
  lastUpdated: string | null;
  
  // Actions
  setPlayerId: (playerId: string) => void;
  loadCollection: (playerId: string, options?: LoadCollectionOptions) => Promise<void>;
  reloadCollection: () => Promise<void>;
  searchCards: (searchTerm: string, options?: SearchOptions) => Promise<void>;
  clearSearch: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  loadMore: () => Promise<void>;
  
  // Selection
  selectCard: (cardId: string) => void;
  selectMultipleCards: (cardIds: string[]) => void;
  deselectCard: (cardId: string) => void;
  clearSelection: () => void;
  setSelectionMode: (mode: 'none' | 'single' | 'multiple') => void;
  
  // View Settings
  setViewMode: (mode: 'grid' | 'list' | 'gallery') => void;
  setSortBy: (sortBy: 'name' | 'rarity' | 'luck' | 'cost' | 'recent') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setCardSize: (size: 'small' | 'medium' | 'large') => void;
  setVirtualization: (enabled: boolean) => void;
  
  // Card Operations
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  updateCardMetadata: (cardId: string, metadata: Record<string, any>) => Promise<void>;
  batchUpdateCards: (updates: Array<{ cardId: string; metadata: Record<string, any> }>) => Promise<void>;
  refreshCard: (cardId: string) => Promise<void>;
  
  // Statistics
  loadStatistics: (playerId: string) => Promise<void>;
  refreshStatistics: () => Promise<void>;
  
  // Cache Management
  clearCache: (pattern?: string) => void;
  getCacheStats: () => { hits: number; misses: number; size: number };
  
  // Error Handling
  clearError: () => void;
  setError: (error: string) => void;
  
  // Utility
  reset: () => void;
  getCardById: (cardId: string) => Card | null;
  getSelectedCards: () => Card[];
}

const cardManagementService = new CardManagementService();

const initialPagination: PaginationState = {
  currentPage: 1,
  itemsPerPage: 50,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
};

const initialLoading: LoadingState = {
  isLoading: false,
  isSearching: false,
  isLoadingMore: false,
  isSyncing: false,
  error: null,
  lastError: null
};

const initialSelection: SelectionState = {
  selectedCardIds: new Set(),
  selectedCards: [],
  selectionMode: 'single',
  lastSelectedId: null
};

const initialView: ViewState = {
  viewMode: 'grid',
  sortBy: 'recent',
  sortOrder: 'desc',
  cardSize: 'medium',
  enableVirtualization: false,
  showMetadata: true
};

const initialCache: CacheState = {
  cachedCollections: new Map(),
  cachedSearches: new Map(),
  cachedStats: new Map(),
  cacheHits: 0,
  cacheMisses: 0
};

export const useCardManagementStore = create<CardManagementState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial State
        currentCollection: null,
        allCards: [],
        filteredCards: [],
        searchResult: null,
        statistics: null,
        pagination: initialPagination,
        loading: initialLoading,
        selection: initialSelection,
        view: initialView,
        cache: initialCache,
        currentPlayerId: null,
        currentCollectionId: null,
        lastUpdated: null,

        // Actions
        setPlayerId: (playerId: string) => {
          set((state) => {
            state.currentPlayerId = playerId;
            // Clear data when switching players
            state.currentCollection = null;
            state.allCards = [];
            state.filteredCards = [];
            state.searchResult = null;
            state.statistics = null;
            state.selection.selectedCardIds.clear();
            state.selection.selectedCards = [];
            state.pagination = { ...initialPagination };
          });
        },

        loadCollection: async (playerId: string, options?: LoadCollectionOptions) => {
          const cacheKey = `${playerId}-${JSON.stringify(options)}`;
          const cached = get().cache.cachedCollections.get(cacheKey);
          
          // Check cache first
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            set((state) => {
              state.currentCollection = cached.collection;
              state.allCards = cached.collection.cards;
              state.filteredCards = cached.collection.cards;
              state.currentPlayerId = playerId;
              state.currentCollectionId = cached.collection.collectionId;
              state.lastUpdated = new Date().toISOString();
              state.cache.cacheHits++;
              
              // Update pagination
              state.pagination.totalItems = cached.collection.cards.length;
              state.pagination.totalPages = Math.ceil(cached.collection.cards.length / state.pagination.itemsPerPage);
              state.pagination.hasNextPage = cached.collection.hasNextPage || false;
              state.pagination.hasPreviousPage = cached.collection.hasPreviousPage || false;
            });
            return;
          }

          set((state) => {
            state.loading.isLoading = true;
            state.loading.error = null;
            state.cache.cacheMisses++;
          });

          try {
            const collection = await cardManagementService.loadCollection(playerId, options);
            
            // Cache the result
            get().cache.cachedCollections.set(cacheKey, {
              collection,
              timestamp: Date.now(),
              ttl: options?.cacheTtl || 5 * 60 * 1000 // 5 minutes default
            });

            set((state) => {
              state.currentCollection = collection;
              state.allCards = collection.cards;
              state.filteredCards = collection.cards;
              state.currentPlayerId = playerId;
              state.currentCollectionId = collection.collectionId;
              state.lastUpdated = new Date().toISOString();
              state.loading.isLoading = false;
              
              // Update pagination
              state.pagination.totalItems = collection.cards.length;
              state.pagination.totalPages = Math.ceil(collection.cards.length / state.pagination.itemsPerPage);
              state.pagination.hasNextPage = collection.hasNextPage || false;
              state.pagination.hasPreviousPage = collection.hasPreviousPage || false;
              
              // Auto-enable virtualization for large collections
              if (collection.cards.length > 100) {
                state.view.enableVirtualization = true;
              }
            });
          } catch (error) {
            set((state) => {
              state.loading.isLoading = false;
              state.loading.error = error instanceof Error ? error.message : 'Failed to load collection';
              state.loading.lastError = state.loading.error;
            });
            throw error;
          }
        },

        reloadCollection: async () => {
          const { currentPlayerId } = get();
          if (!currentPlayerId) return;
          
          // Clear cache for this player
          const keysToDelete = Array.from(get().cache.cachedCollections.keys())
            .filter(key => key.startsWith(currentPlayerId));
          
          set((state) => {
            keysToDelete.forEach(key => state.cache.cachedCollections.delete(key));
          });
          
          await get().loadCollection(currentPlayerId);
        },

        searchCards: async (searchTerm: string, options?: SearchOptions) => {
          const { currentPlayerId } = get();
          if (!currentPlayerId) return;

          const cacheKey = `search-${currentPlayerId}-${searchTerm}-${JSON.stringify(options)}`;
          const cached = get().cache.cachedSearches.get(cacheKey);
          
          // Check cache first
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            set((state) => {
              state.searchResult = cached.result;
              state.filteredCards = cached.result.cards.map(c => c.item);
              state.cache.cacheHits++;
            });
            return;
          }

          set((state) => {
            state.loading.isSearching = true;
            state.loading.error = null;
            state.cache.cacheMisses++;
          });

          try {
            const result = await cardManagementService.searchCards(currentPlayerId, searchTerm, options);
            
            // Cache the result
            get().cache.cachedSearches.set(cacheKey, {
              result,
              timestamp: Date.now(),
              ttl: 2 * 60 * 1000 // 2 minutes for search results
            });

            set((state) => {
              state.searchResult = result;
              state.filteredCards = result.cards.map(c => c.item);
              state.loading.isSearching = false;
            });
          } catch (error) {
            set((state) => {
              state.loading.isSearching = false;
              state.loading.error = error instanceof Error ? error.message : 'Search failed';
            });
            throw error;
          }
        },

        clearSearch: () => {
          set((state) => {
            state.searchResult = null;
            state.filteredCards = state.allCards;
          });
        },

        // Pagination Actions
        setPage: (page: number) => {
          set((state) => {
            state.pagination.currentPage = Math.max(1, Math.min(page, state.pagination.totalPages));
            state.pagination.hasPreviousPage = state.pagination.currentPage > 1;
            state.pagination.hasNextPage = state.pagination.currentPage < state.pagination.totalPages;
          });
        },

        setItemsPerPage: (itemsPerPage: number) => {
          set((state) => {
            state.pagination.itemsPerPage = Math.max(1, itemsPerPage);
            state.pagination.totalPages = Math.ceil(state.pagination.totalItems / itemsPerPage);
            state.pagination.currentPage = Math.min(state.pagination.currentPage, state.pagination.totalPages);
            state.pagination.hasNextPage = state.pagination.currentPage < state.pagination.totalPages;
            state.pagination.hasPreviousPage = state.pagination.currentPage > 1;
          });
        },

        loadMore: async () => {
          const { currentPlayerId, pagination } = get();
          if (!currentPlayerId || !pagination.hasNextPage) return;

          set((state) => {
            state.loading.isLoadingMore = true;
          });

          try {
            const options: LoadCollectionOptions = {
              page: pagination.currentPage + 1,
              limit: pagination.itemsPerPage
            };

            const collection = await cardManagementService.loadCollection(currentPlayerId, options);

            set((state) => {
              state.allCards.push(...collection.cards);
              state.filteredCards = state.searchResult 
                ? state.filteredCards // Keep search results unchanged
                : state.allCards;
              state.pagination.currentPage++;
              state.pagination.hasNextPage = collection.hasNextPage || false;
              state.pagination.hasPreviousPage = true;
              state.loading.isLoadingMore = false;
            });
          } catch (error) {
            set((state) => {
              state.loading.isLoadingMore = false;
              state.loading.error = error instanceof Error ? error.message : 'Failed to load more cards';
            });
            throw error;
          }
        },

        // Selection Actions
        selectCard: (cardId: string) => {
          set((state) => {
            const { selectionMode } = state.selection;
            
            if (selectionMode === 'none') return;
            
            if (selectionMode === 'single') {
              state.selection.selectedCardIds.clear();
            }
            
            state.selection.selectedCardIds.add(cardId);
            state.selection.lastSelectedId = cardId;
            state.selection.selectedCards = Array.from(state.selection.selectedCardIds)
              .map(id => state.allCards.find(card => card.id === id))
              .filter(Boolean) as Card[];
          });
        },

        selectMultipleCards: (cardIds: string[]) => {
          set((state) => {
            if (state.selection.selectionMode === 'none') return;
            
            cardIds.forEach(id => state.selection.selectedCardIds.add(id));
            state.selection.selectedCards = Array.from(state.selection.selectedCardIds)
              .map(id => state.allCards.find(card => card.id === id))
              .filter(Boolean) as Card[];
          });
        },

        deselectCard: (cardId: string) => {
          set((state) => {
            state.selection.selectedCardIds.delete(cardId);
            state.selection.selectedCards = Array.from(state.selection.selectedCardIds)
              .map(id => state.allCards.find(card => card.id === id))
              .filter(Boolean) as Card[];
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selection.selectedCardIds.clear();
            state.selection.selectedCards = [];
            state.selection.lastSelectedId = null;
          });
        },

        setSelectionMode: (mode: 'none' | 'single' | 'multiple') => {
          set((state) => {
            state.selection.selectionMode = mode;
            if (mode === 'none') {
              state.selection.selectedCardIds.clear();
              state.selection.selectedCards = [];
            } else if (mode === 'single' && state.selection.selectedCardIds.size > 1) {
              const lastSelected = state.selection.lastSelectedId;
              state.selection.selectedCardIds.clear();
              if (lastSelected) {
                state.selection.selectedCardIds.add(lastSelected);
              }
              state.selection.selectedCards = Array.from(state.selection.selectedCardIds)
                .map(id => state.allCards.find(card => card.id === id))
                .filter(Boolean) as Card[];
            }
          });
        },

        // View Actions
        setViewMode: (mode: 'grid' | 'list' | 'gallery') => {
          set((state) => {
            state.view.viewMode = mode;
          });
        },

        setSortBy: (sortBy: 'name' | 'rarity' | 'luck' | 'cost' | 'recent') => {
          set((state) => {
            state.view.sortBy = sortBy;
            // Auto-sort the filtered cards
            state.filteredCards = cardManagementService.sortCards(
              state.filteredCards,
              sortBy,
              state.view.sortOrder
            );
          });
        },

        setSortOrder: (order: 'asc' | 'desc') => {
          set((state) => {
            state.view.sortOrder = order;
            // Auto-sort the filtered cards
            state.filteredCards = cardManagementService.sortCards(
              state.filteredCards,
              state.view.sortBy,
              order
            );
          });
        },

        setCardSize: (size: 'small' | 'medium' | 'large') => {
          set((state) => {
            state.view.cardSize = size;
          });
        },

        setVirtualization: (enabled: boolean) => {
          set((state) => {
            state.view.enableVirtualization = enabled;
          });
        },

        // Card Operations
        updateCard: async (cardId: string, updates: Partial<Card>) => {
          set((state) => {
            const cardIndex = state.allCards.findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
              state.allCards[cardIndex] = { ...state.allCards[cardIndex], ...updates };
            }
            
            const filteredIndex = state.filteredCards.findIndex(card => card.id === cardId);
            if (filteredIndex !== -1) {
              state.filteredCards[filteredIndex] = { ...state.filteredCards[filteredIndex], ...updates };
            }
          });
          
          // Clear relevant caches
          get().clearCache();
        },

        updateCardMetadata: async (cardId: string, metadata: Record<string, any>) => {
          try {
            const updatedCard = await cardManagementService.updateCardMetadata(cardId, metadata);
            get().updateCard(cardId, updatedCard);
          } catch (error) {
            set((state) => {
              state.loading.error = error instanceof Error ? error.message : 'Failed to update card metadata';
            });
            throw error;
          }
        },

        batchUpdateCards: async (updates: Array<{ cardId: string; metadata: Record<string, any> }>) => {
          try {
            const updatedCards = await cardManagementService.batchUpdateCards(updates);
            
            set((state) => {
              updatedCards.forEach(card => {
                const allIndex = state.allCards.findIndex(c => c.id === card.id);
                if (allIndex !== -1) {
                  state.allCards[allIndex] = card;
                }
                
                const filteredIndex = state.filteredCards.findIndex(c => c.id === card.id);
                if (filteredIndex !== -1) {
                  state.filteredCards[filteredIndex] = card;
                }
              });
            });
            
            // Clear caches
            get().clearCache();
          } catch (error) {
            set((state) => {
              state.loading.error = error instanceof Error ? error.message : 'Failed to batch update cards';
            });
            throw error;
          }
        },

        refreshCard: async (cardId: string) => {
          // This would typically fetch the latest card data from the server
          // For now, we'll just clear caches and reload the collection
          get().clearCache();
          if (get().currentPlayerId) {
            await get().reloadCollection();
          }
        },

        // Statistics
        loadStatistics: async (playerId: string) => {
          const cached = get().cache.cachedStats.get(playerId);
          
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            set((state) => {
              state.statistics = cached.stats;
              state.cache.cacheHits++;
            });
            return;
          }

          try {
            const stats = await cardManagementService.getCollectionStatistics(playerId);
            
            // Cache the result
            get().cache.cachedStats.set(playerId, {
              stats,
              timestamp: Date.now(),
              ttl: 10 * 60 * 1000 // 10 minutes
            });

            set((state) => {
              state.statistics = stats;
              state.cache.cacheMisses++;
            });
          } catch (error) {
            set((state) => {
              state.loading.error = error instanceof Error ? error.message : 'Failed to load statistics';
            });
            throw error;
          }
        },

        refreshStatistics: async () => {
          const { currentPlayerId } = get();
          if (!currentPlayerId) return;
          
          // Clear cached stats
          get().cache.cachedStats.delete(currentPlayerId);
          await get().loadStatistics(currentPlayerId);
        },

        // Cache Management
        clearCache: (pattern?: string) => {
          set((state) => {
            if (pattern) {
              // Clear caches matching pattern
              const collectionsToDelete = Array.from(state.cache.cachedCollections.keys())
                .filter(key => key.includes(pattern));
              collectionsToDelete.forEach(key => state.cache.cachedCollections.delete(key));
              
              const searchesToDelete = Array.from(state.cache.cachedSearches.keys())
                .filter(key => key.includes(pattern));
              searchesToDelete.forEach(key => state.cache.cachedSearches.delete(key));
              
              const statsToDelete = Array.from(state.cache.cachedStats.keys())
                .filter(key => key.includes(pattern));
              statsToDelete.forEach(key => state.cache.cachedStats.delete(key));
            } else {
              // Clear all caches
              state.cache.cachedCollections.clear();
              state.cache.cachedSearches.clear();
              state.cache.cachedStats.clear();
            }
          });
          
          // Also clear service cache
          cardManagementService.clearCache(pattern);
        },

        getCacheStats: () => {
          const { cache } = get();
          return {
            hits: cache.cacheHits,
            misses: cache.cacheMisses,
            size: cache.cachedCollections.size + cache.cachedSearches.size + cache.cachedStats.size
          };
        },

        // Error Handling
        clearError: () => {
          set((state) => {
            state.loading.error = null;
          });
        },

        setError: (error: string) => {
          set((state) => {
            state.loading.error = error;
            state.loading.lastError = error;
          });
        },

        // Utility
        reset: () => {
          set((state) => {
            state.currentCollection = null;
            state.allCards = [];
            state.filteredCards = [];
            state.searchResult = null;
            state.statistics = null;
            state.pagination = { ...initialPagination };
            state.loading = { ...initialLoading };
            state.selection = { ...initialSelection, selectedCardIds: new Set() };
            state.view = { ...initialView };
            state.currentPlayerId = null;
            state.currentCollectionId = null;
            state.lastUpdated = null;
          });
          get().clearCache();
        },

        getCardById: (cardId: string) => {
          const { allCards } = get();
          return allCards.find(card => card.id === cardId) || null;
        },

        getSelectedCards: () => {
          const { selection } = get();
          return selection.selectedCards;
        }
      })),
      {
        name: 'card-management-store'
      }
    )
  )
);

// Selectors for common use cases
export const cardManagementSelectors = {
  // Basic data selectors
  getCurrentCollection: (state: CardManagementState) => state.currentCollection,
  getAllCards: (state: CardManagementState) => state.allCards,
  getFilteredCards: (state: CardManagementState) => state.filteredCards,
  getSearchResult: (state: CardManagementState) => state.searchResult,
  getStatistics: (state: CardManagementState) => state.statistics,
  
  // UI state selectors
  getLoadingState: (state: CardManagementState) => state.loading,
  getPaginationState: (state: CardManagementState) => state.pagination,
  getSelectionState: (state: CardManagementState) => state.selection,
  getViewState: (state: CardManagementState) => state.view,
  
  // Computed selectors
  getSelectedCards: (state: CardManagementState) => state.selection.selectedCards,
  getIsLoading: (state: CardManagementState) => state.loading.isLoading || state.loading.isSearching,
  getHasError: (state: CardManagementState) => Boolean(state.loading.error),
  getHasSelection: (state: CardManagementState) => state.selection.selectedCardIds.size > 0,
  
  // Cache selectors
  getCacheStats: (state: CardManagementState) => ({
    hits: state.cache.cacheHits,
    misses: state.cache.cacheMisses,
    size: state.cache.cachedCollections.size + state.cache.cachedSearches.size + state.cache.cachedStats.size
  })
};

// Hooks for specific use cases
export const useCardCollection = (playerId?: string) => {
  const store = useCardManagementStore();
  
  React.useEffect(() => {
    if (playerId && playerId !== store.currentPlayerId) {
      store.setPlayerId(playerId);
      store.loadCollection(playerId);
    }
  }, [playerId, store]);
  
  return {
    collection: store.currentCollection,
    cards: store.filteredCards,
    loading: store.loading.isLoading,
    error: store.loading.error,
    reload: store.reloadCollection
  };
};

export const useCardSearch = () => {
  const store = useCardManagementStore();
  
  return {
    searchResult: store.searchResult,
    isSearching: store.loading.isSearching,
    searchCards: store.searchCards,
    clearSearch: store.clearSearch
  };
};

export const useCardSelection = () => {
  const store = useCardManagementStore();
  
  return {
    selectedCards: store.selection.selectedCards,
    selectedCardIds: Array.from(store.selection.selectedCardIds),
    selectionMode: store.selection.selectionMode,
    selectCard: store.selectCard,
    deselectCard: store.deselectCard,
    clearSelection: store.clearSelection,
    setSelectionMode: store.setSelectionMode
  };
};