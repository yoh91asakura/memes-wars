/**
 * CardFiltersStore - Zustand store for card filter and preset management
 * 
 * This store manages filter criteria, presets, search history,
 * and filter persistence across sessions.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { CardFilterCriteria, FilterPreset, CostRange } from '../models/CardFilter';
import { FilterPresetFactory, FilterPresetManager } from '../models/CardFilter';

interface FilterHistory {
  id: string;
  criteria: CardFilterCriteria;
  timestamp: string;
  resultCount: number;
  executionTime: number;
}

interface FilterStats {
  totalSearches: number;
  averageExecutionTime: number;
  mostUsedFilters: Record<string, number>;
  popularPresets: Record<string, number>;
  searchHistory: FilterHistory[];
}

interface FilterValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface CardFiltersState {
  // Current Filter State
  currentFilters: CardFilterCriteria;
  activePresetId: string | null;
  lastAppliedFilters: CardFilterCriteria | null;
  
  // Presets Management
  presets: FilterPreset[];
  defaultPresets: FilterPreset[];
  customPresets: FilterPreset[];
  recentPresets: string[]; // IDs of recently used presets
  
  // Filter Options
  availableRarities: string[];
  availableTypes: string[];
  availableFamilies: string[];
  costRange: { min: number; max: number };
  
  // Search & History
  searchHistory: FilterHistory[];
  maxHistorySize: number;
  savedSearches: FilterPreset[];
  
  // Statistics
  stats: FilterStats;
  
  // UI State
  isExpanded: boolean;
  showAdvanced: boolean;
  showPresets: boolean;
  compactMode: boolean;
  
  // Validation
  validation: FilterValidation;
  
  // Actions - Basic Filter Operations
  setFilters: (filters: CardFilterCriteria) => void;
  updateFilters: (updates: Partial<CardFilterCriteria>) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
  
  // Actions - Individual Filter Updates
  setSearchText: (text: string) => void;
  setRarityFilters: (rarities: string[]) => void;
  setTypeFilters: (types: string[]) => void;
  setFamilyFilters: (families: string[]) => void;
  setCostRange: (range: CostRange) => void;
  setSortBy: (sortBy: CardFilterCriteria['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFavoriteFilter: (onlyFavorites: boolean) => void;
  setLockedFilter: (excludeLocked: boolean) => void;
  
  // Actions - Preset Management
  loadPresets: () => Promise<void>;
  applyPreset: (presetId: string) => void;
  savePreset: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'lastUsed'>) => void;
  updatePreset: (presetId: string, updates: Partial<FilterPreset>) => void;
  deletePreset: (presetId: string) => void;
  duplicatePreset: (presetId: string) => void;
  createPresetFromCurrent: (name: string, description?: string) => void;
  
  // Actions - History Management
  addToHistory: (criteria: CardFilterCriteria, resultCount: number, executionTime: number) => void;
  clearHistory: () => void;
  removeFromHistory: (historyId: string) => void;
  applyFromHistory: (historyId: string) => void;
  
  // Actions - Validation
  validateFilters: (filters: CardFilterCriteria) => FilterValidation;
  
  // Actions - Statistics
  updateStats: (criteria: CardFilterCriteria, executionTime: number) => void;
  resetStats: () => void;
  getPopularPresets: (limit?: number) => FilterPreset[];
  getMostUsedFilters: (limit?: number) => Array<{ filter: string; count: number }>;
  
  // Actions - UI State
  setExpanded: (expanded: boolean) => void;
  setShowAdvanced: (show: boolean) => void;
  setShowPresets: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  toggleExpanded: () => void;
  toggleAdvanced: () => void;
  
  // Actions - Configuration
  setAvailableOptions: (options: {
    rarities?: string[];
    types?: string[];
    families?: string[];
    costRange?: { min: number; max: number };
  }) => void;
  
  // Utility Actions
  hasActiveFilters: () => boolean;
  getFilterCount: () => number;
  exportFilters: () => string;
  importFilters: (filtersJson: string) => boolean;
  reset: () => void;
}

const defaultAvailableRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic', 'Divine', 'Infinity', 'Beyond'];
const defaultAvailableTypes = ['Meme', 'Reaction', 'Template', 'Format', 'Meta'];
const defaultAvailableFamilies = ['Animal', 'People', 'Cartoon', 'Gaming', 'Tech', 'Sports', 'Food', 'Music'];

const defaultCostRange = { min: 0, max: 10 };

const initialStats: FilterStats = {
  totalSearches: 0,
  averageExecutionTime: 0,
  mostUsedFilters: {},
  popularPresets: {},
  searchHistory: []
};

const initialValidation: FilterValidation = {
  isValid: true,
  errors: [],
  warnings: []
};

// Create default presets
const createDefaultPresets = (): FilterPreset[] => [
  FilterPresetFactory.createDefault('all', 'All Cards', 'Show all cards without any filters'),
  FilterPresetFactory.createDefault('favorites', 'Favorites', 'Show only favorited cards', { favorite: true }),
  FilterPresetFactory.createDefault('rare-plus', 'Rare & Above', 'Show Rare, Epic, Legendary, and higher rarity cards', { 
    rarity: ['Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic', 'Divine', 'Infinity', 'Beyond'] 
  }),
  FilterPresetFactory.createDefault('recent', 'Recently Added', 'Show cards added recently', { 
    sortBy: 'recent', 
    sortOrder: 'desc' 
  }),
  FilterPresetFactory.createDefault('high-luck', 'High Luck', 'Show cards with luck > 7', { 
    sortBy: 'luck', 
    sortOrder: 'desc' 
  })
];

export const useCardFiltersStore = create<CardFiltersState>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // Initial State
          currentFilters: {},
          activePresetId: null,
          lastAppliedFilters: null,
          presets: [],
          defaultPresets: createDefaultPresets(),
          customPresets: [],
          recentPresets: [],
          availableRarities: defaultAvailableRarities,
          availableTypes: defaultAvailableTypes,
          availableFamilies: defaultAvailableFamilies,
          costRange: defaultCostRange,
          searchHistory: [],
          maxHistorySize: 50,
          savedSearches: [],
          stats: initialStats,
          isExpanded: true,
          showAdvanced: false,
          showPresets: true,
          compactMode: false,
          validation: initialValidation,

          // Basic Filter Operations
          setFilters: (filters: CardFilterCriteria) => {
            set((state) => {
              state.currentFilters = { ...filters };
              state.activePresetId = null;
              state.validation = get().validateFilters(filters);
            });
          },

          updateFilters: (updates: Partial<CardFilterCriteria>) => {
            set((state) => {
              state.currentFilters = { ...state.currentFilters, ...updates };
              state.activePresetId = null;
              state.validation = get().validateFilters(state.currentFilters);
            });
          },

          clearFilters: () => {
            set((state) => {
              state.currentFilters = {};
              state.activePresetId = null;
              state.validation = initialValidation;
            });
          },

          resetToDefaults: () => {
            set((state) => {
              state.currentFilters = {};
              state.activePresetId = null;
              state.isExpanded = true;
              state.showAdvanced = false;
              state.showPresets = true;
              state.compactMode = false;
              state.validation = initialValidation;
            });
          },

          // Individual Filter Updates
          setSearchText: (text: string) => {
            get().updateFilters({ searchText: text || undefined });
          },

          setRarityFilters: (rarities: string[]) => {
            get().updateFilters({ rarity: rarities.length > 0 ? rarities : undefined });
          },

          setTypeFilters: (types: string[]) => {
            get().updateFilters({ type: types.length > 0 ? types : undefined });
          },

          setFamilyFilters: (families: string[]) => {
            get().updateFilters({ family: families.length > 0 ? families : undefined });
          },

          setCostRange: (range: CostRange) => {
            const { costRange } = get();
            if (range.min !== costRange.min || range.max !== costRange.max) {
              get().updateFilters({ costRange: range });
            }
          },

          setSortBy: (sortBy: CardFilterCriteria['sortBy']) => {
            get().updateFilters({ sortBy });
          },

          setSortOrder: (order: 'asc' | 'desc') => {
            get().updateFilters({ sortOrder: order });
          },

          setFavoriteFilter: (onlyFavorites: boolean) => {
            get().updateFilters({ favorite: onlyFavorites ? true : undefined });
          },

          setLockedFilter: (excludeLocked: boolean) => {
            get().updateFilters({ locked: excludeLocked ? false : undefined });
          },

          // Preset Management
          loadPresets: async () => {
            // In a real app, this would load from an API
            // For now, we'll just ensure default presets are available
            set((state) => {
              if (state.presets.length === 0) {
                state.presets = [...state.defaultPresets];
              }
            });
          },

          applyPreset: (presetId: string) => {
            const preset = get().presets.find(p => p.id === presetId);
            if (!preset) return;

            set((state) => {
              state.currentFilters = { ...preset.criteria };
              state.activePresetId = presetId;
              state.lastAppliedFilters = { ...preset.criteria };
              
              // Update recent presets
              const recentIndex = state.recentPresets.indexOf(presetId);
              if (recentIndex > -1) {
                state.recentPresets.splice(recentIndex, 1);
              }
              state.recentPresets.unshift(presetId);
              state.recentPresets = state.recentPresets.slice(0, 10); // Keep only 10 recent
              
              // Update stats
              state.stats.popularPresets[presetId] = (state.stats.popularPresets[presetId] || 0) + 1;
              
              state.validation = get().validateFilters(state.currentFilters);
            });

            // Update preset last used timestamp
            get().updatePreset(presetId, { lastUsed: new Date().toISOString() });
          },

          savePreset: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'lastUsed'>) => {
            const newPreset = FilterPresetFactory.create(
              preset.name,
              preset.description || '',
              preset.criteria,
              preset.icon,
              preset.isPublic
            );

            set((state) => {
              state.presets.push(newPreset);
              state.customPresets.push(newPreset);
            });
          },

          updatePreset: (presetId: string, updates: Partial<FilterPreset>) => {
            set((state) => {
              const presetIndex = state.presets.findIndex(p => p.id === presetId);
              if (presetIndex > -1) {
                state.presets[presetIndex] = { ...state.presets[presetIndex], ...updates };
                
                // Update custom presets too
                const customIndex = state.customPresets.findIndex(p => p.id === presetId);
                if (customIndex > -1) {
                  state.customPresets[customIndex] = { ...state.customPresets[customIndex], ...updates };
                }
              }
            });
          },

          deletePreset: (presetId: string) => {
            set((state) => {
              state.presets = state.presets.filter(p => p.id !== presetId);
              state.customPresets = state.customPresets.filter(p => p.id !== presetId);
              state.recentPresets = state.recentPresets.filter(id => id !== presetId);
              
              if (state.activePresetId === presetId) {
                state.activePresetId = null;
              }
              
              // Clean up stats
              delete state.stats.popularPresets[presetId];
            });
          },

          duplicatePreset: (presetId: string) => {
            const preset = get().presets.find(p => p.id === presetId);
            if (!preset) return;

            const duplicate = FilterPresetFactory.duplicate(preset);
            get().savePreset(duplicate);
          },

          createPresetFromCurrent: (name: string, description?: string) => {
            const { currentFilters } = get();
            if (Object.keys(currentFilters).length === 0) return;

            const preset = {
              name,
              description: description || '',
              criteria: currentFilters,
              icon: 'filter' as const,
              isPublic: false
            };

            get().savePreset(preset);
          },

          // History Management
          addToHistory: (criteria: CardFilterCriteria, resultCount: number, executionTime: number) => {
            const historyEntry: FilterHistory = {
              id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              criteria: { ...criteria },
              timestamp: new Date().toISOString(),
              resultCount,
              executionTime
            };

            set((state) => {
              state.searchHistory.unshift(historyEntry);
              if (state.searchHistory.length > state.maxHistorySize) {
                state.searchHistory = state.searchHistory.slice(0, state.maxHistorySize);
              }
              
              state.stats.searchHistory.unshift(historyEntry);
              if (state.stats.searchHistory.length > 100) { // Keep more detailed stats
                state.stats.searchHistory = state.stats.searchHistory.slice(0, 100);
              }
            });

            // Update statistics
            get().updateStats(criteria, executionTime);
          },

          clearHistory: () => {
            set((state) => {
              state.searchHistory = [];
            });
          },

          removeFromHistory: (historyId: string) => {
            set((state) => {
              state.searchHistory = state.searchHistory.filter(h => h.id !== historyId);
            });
          },

          applyFromHistory: (historyId: string) => {
            const historyEntry = get().searchHistory.find(h => h.id === historyId);
            if (!historyEntry) return;

            get().setFilters(historyEntry.criteria);
          },

          // Validation
          validateFilters: (filters: CardFilterCriteria): FilterValidation => {
            const errors: string[] = [];
            const warnings: string[] = [];

            // Validate cost range
            if (filters.costRange) {
              if (filters.costRange.min < 0 || filters.costRange.max < 0) {
                errors.push('Cost values cannot be negative');
              }
              if (filters.costRange.min > filters.costRange.max) {
                errors.push('Minimum cost cannot be greater than maximum cost');
              }
            }

            // Validate arrays are not empty
            if (filters.rarity && filters.rarity.length === 0) {
              warnings.push('Rarity filter is empty');
            }
            if (filters.type && filters.type.length === 0) {
              warnings.push('Type filter is empty');
            }
            if (filters.family && filters.family.length === 0) {
              warnings.push('Family filter is empty');
            }

            // Validate search text
            if (filters.searchText && filters.searchText.trim().length < 2) {
              warnings.push('Search text should be at least 2 characters long');
            }

            // Check for potentially conflicting filters
            if (filters.favorite === true && filters.locked === false) {
              warnings.push('Showing only favorites while excluding locked cards might return fewer results');
            }

            return {
              isValid: errors.length === 0,
              errors,
              warnings
            };
          },

          // Statistics
          updateStats: (criteria: CardFilterCriteria, executionTime: number) => {
            set((state) => {
              state.stats.totalSearches++;
              
              // Update average execution time
              const total = state.stats.averageExecutionTime * (state.stats.totalSearches - 1);
              state.stats.averageExecutionTime = (total + executionTime) / state.stats.totalSearches;
              
              // Track most used filters
              Object.keys(criteria).forEach(filterKey => {
                const value = criteria[filterKey as keyof CardFilterCriteria];
                if (value !== undefined && value !== null) {
                  if (Array.isArray(value) && value.length > 0) {
                    state.stats.mostUsedFilters[filterKey] = (state.stats.mostUsedFilters[filterKey] || 0) + 1;
                  } else if (!Array.isArray(value)) {
                    state.stats.mostUsedFilters[filterKey] = (state.stats.mostUsedFilters[filterKey] || 0) + 1;
                  }
                }
              });
            });
          },

          resetStats: () => {
            set((state) => {
              state.stats = { ...initialStats };
            });
          },

          getPopularPresets: (limit = 5) => {
            const { presets, stats } = get();
            return presets
              .filter(preset => stats.popularPresets[preset.id])
              .sort((a, b) => (stats.popularPresets[b.id] || 0) - (stats.popularPresets[a.id] || 0))
              .slice(0, limit);
          },

          getMostUsedFilters: (limit = 5) => {
            const { stats } = get();
            return Object.entries(stats.mostUsedFilters)
              .map(([filter, count]) => ({ filter, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, limit);
          },

          // UI State
          setExpanded: (expanded: boolean) => {
            set((state) => {
              state.isExpanded = expanded;
            });
          },

          setShowAdvanced: (show: boolean) => {
            set((state) => {
              state.showAdvanced = show;
            });
          },

          setShowPresets: (show: boolean) => {
            set((state) => {
              state.showPresets = show;
            });
          },

          setCompactMode: (compact: boolean) => {
            set((state) => {
              state.compactMode = compact;
            });
          },

          toggleExpanded: () => {
            set((state) => {
              state.isExpanded = !state.isExpanded;
            });
          },

          toggleAdvanced: () => {
            set((state) => {
              state.showAdvanced = !state.showAdvanced;
            });
          },

          // Configuration
          setAvailableOptions: (options: {
            rarities?: string[];
            types?: string[];
            families?: string[];
            costRange?: { min: number; max: number };
          }) => {
            set((state) => {
              if (options.rarities) state.availableRarities = options.rarities;
              if (options.types) state.availableTypes = options.types;
              if (options.families) state.availableFamilies = options.families;
              if (options.costRange) state.costRange = options.costRange;
            });
          },

          // Utility
          hasActiveFilters: () => {
            const filters = get().currentFilters;
            return Object.values(filters).some(value => {
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === 'string') return value.trim().length > 0;
              return value !== undefined && value !== null;
            });
          },

          getFilterCount: () => {
            const filters = get().currentFilters;
            let count = 0;
            
            Object.values(filters).forEach(value => {
              if (Array.isArray(value) && value.length > 0) count++;
              else if (typeof value === 'string' && value.trim().length > 0) count++;
              else if (typeof value === 'object' && value !== null) count++;
              else if (typeof value === 'boolean') count++;
            });
            
            return count;
          },

          exportFilters: () => {
            const { currentFilters, presets, searchHistory } = get();
            const exportData = {
              currentFilters,
              customPresets: presets.filter(p => !p.isDefault),
              recentHistory: searchHistory.slice(0, 10),
              exportedAt: new Date().toISOString()
            };
            return JSON.stringify(exportData, null, 2);
          },

          importFilters: (filtersJson: string) => {
            try {
              const importData = JSON.parse(filtersJson);
              
              set((state) => {
                if (importData.currentFilters) {
                  state.currentFilters = importData.currentFilters;
                  state.validation = get().validateFilters(state.currentFilters);
                }
                
                if (importData.customPresets && Array.isArray(importData.customPresets)) {
                  // Merge custom presets, avoiding duplicates by name
                  importData.customPresets.forEach((preset: FilterPreset) => {
                    const exists = state.presets.some(p => p.name === preset.name);
                    if (!exists) {
                      const newPreset = { ...preset, id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
                      state.presets.push(newPreset);
                      state.customPresets.push(newPreset);
                    }
                  });
                }
                
                if (importData.recentHistory && Array.isArray(importData.recentHistory)) {
                  // Merge history items
                  importData.recentHistory.forEach((historyItem: FilterHistory) => {
                    const newItem = { ...historyItem, id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
                    state.searchHistory.unshift(newItem);
                  });
                  
                  // Maintain max history size
                  if (state.searchHistory.length > state.maxHistorySize) {
                    state.searchHistory = state.searchHistory.slice(0, state.maxHistorySize);
                  }
                }
              });
              
              return true;
            } catch (error) {
              console.error('Failed to import filters:', error);
              return false;
            }
          },

          reset: () => {
            set((state) => {
              state.currentFilters = {};
              state.activePresetId = null;
              state.lastAppliedFilters = null;
              state.customPresets = [];
              state.recentPresets = [];
              state.searchHistory = [];
              state.savedSearches = [];
              state.stats = { ...initialStats };
              state.isExpanded = true;
              state.showAdvanced = false;
              state.showPresets = true;
              state.compactMode = false;
              state.validation = initialValidation;
              
              // Reset presets to defaults only
              state.presets = [...state.defaultPresets];
            });
          }
        })),
        {
          name: 'card-filters-store',
          partialize: (state) => ({
            // Persist only user preferences and data
            customPresets: state.customPresets,
            recentPresets: state.recentPresets,
            savedSearches: state.savedSearches,
            stats: state.stats,
            isExpanded: state.isExpanded,
            showAdvanced: state.showAdvanced,
            showPresets: state.showPresets,
            compactMode: state.compactMode,
            maxHistorySize: state.maxHistorySize,
            searchHistory: state.searchHistory.slice(0, 20) // Persist limited history
          })
        }
      )
    ),
    {
      name: 'card-filters-store'
    }
  )
);

// Selectors for common use cases
export const cardFiltersSelectors = {
  // Basic filter selectors
  getCurrentFilters: (state: CardFiltersState) => state.currentFilters,
  getActivePresetId: (state: CardFiltersState) => state.activePresetId,
  getActivePreset: (state: CardFiltersState) => 
    state.activePresetId ? state.presets.find(p => p.id === state.activePresetId) : null,
  
  // Preset selectors
  getAllPresets: (state: CardFiltersState) => state.presets,
  getCustomPresets: (state: CardFiltersState) => state.customPresets,
  getDefaultPresets: (state: CardFiltersState) => state.defaultPresets,
  getRecentPresets: (state: CardFiltersState) => 
    state.recentPresets.map(id => state.presets.find(p => p.id === id)).filter(Boolean) as FilterPreset[],
  
  // UI state selectors
  getUIState: (state: CardFiltersState) => ({
    isExpanded: state.isExpanded,
    showAdvanced: state.showAdvanced,
    showPresets: state.showPresets,
    compactMode: state.compactMode
  }),
  
  // Validation selectors
  getValidation: (state: CardFiltersState) => state.validation,
  getIsValid: (state: CardFiltersState) => state.validation.isValid,
  getValidationErrors: (state: CardFiltersState) => state.validation.errors,
  getValidationWarnings: (state: CardFiltersState) => state.validation.warnings,
  
  // Statistics selectors
  getStats: (state: CardFiltersState) => state.stats,
  getSearchHistory: (state: CardFiltersState) => state.searchHistory,
  getPopularPresets: (state: CardFiltersState) => state.getPopularPresets(),
  getMostUsedFilters: (state: CardFiltersState) => state.getMostUsedFilters(),
  
  // Computed selectors
  getHasActiveFilters: (state: CardFiltersState) => state.hasActiveFilters(),
  getFilterCount: (state: CardFiltersState) => state.getFilterCount(),
  getAvailableOptions: (state: CardFiltersState) => ({
    rarities: state.availableRarities,
    types: state.availableTypes,
    families: state.availableFamilies,
    costRange: state.costRange
  })
};

// Custom hooks for specific use cases
export const useCardFilters = () => {
  const store = useCardFiltersStore();
  
  return {
    filters: store.currentFilters,
    hasActiveFilters: store.hasActiveFilters(),
    filterCount: store.getFilterCount(),
    validation: store.validation,
    setFilters: store.setFilters,
    updateFilters: store.updateFilters,
    clearFilters: store.clearFilters
  };
};

export const useFilterPresets = () => {
  const store = useCardFiltersStore();
  
  return {
    presets: store.presets,
    activePresetId: store.activePresetId,
    recentPresets: store.recentPresets.map(id => store.presets.find(p => p.id === id)).filter(Boolean) as FilterPreset[],
    applyPreset: store.applyPreset,
    savePreset: store.savePreset,
    updatePreset: store.updatePreset,
    deletePreset: store.deletePreset,
    createPresetFromCurrent: store.createPresetFromCurrent
  };
};

export const useFilterHistory = () => {
  const store = useCardFiltersStore();
  
  return {
    history: store.searchHistory,
    addToHistory: store.addToHistory,
    clearHistory: store.clearHistory,
    applyFromHistory: store.applyFromHistory,
    removeFromHistory: store.removeFromHistory
  };
};

export const useFilterStats = () => {
  const store = useCardFiltersStore();
  
  return {
    stats: store.stats,
    popularPresets: store.getPopularPresets(),
    mostUsedFilters: store.getMostUsedFilters(),
    updateStats: store.updateStats,
    resetStats: store.resetStats
  };
};