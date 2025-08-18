/**
 * Hook personnalisé pour gérer les cartes avec le backend
 * Remplace progressivement les anciens services de cartes mockées
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardRarity, CardType } from '../types/Card';
import { apiService, type CardListResponse, type CardRollResult, type CardStatsResponse } from '../services/ApiService';

// Types pour le hook
interface UseCardsOptions {
  page?: number;
  limit?: number;
  rarity?: CardRarity;
  type?: CardType;
  search?: string;
  autoFetch?: boolean;
}

interface UseCardsReturn {
  // Données
  cards: Card[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  stats: CardStatsResponse | null;
  
  // États
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCards: () => Promise<void>;
  fetchStats: () => Promise<void>;
  rollCards: (packType: string, count: number) => Promise<CardRollResult>;
  searchCards: (query: string) => Promise<Card[]>;
  getCardById: (id: string) => Promise<Card>;
  
  // Helpers
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setFilters: (filters: { rarity?: CardRarity; type?: CardType; search?: string }) => void;
  clearFilters: () => void;
}

/**
 * Hook principal pour gérer les cartes
 */
export const useCards = (options: UseCardsOptions = {}): UseCardsReturn => {
  const {
    page = 1,
    limit = 20,
    rarity,
    type,
    search,
    autoFetch = true,
  } = options;

  // État local
  const [cards, setCards] = useState<Card[]>([]);
  const [pagination, setPagination] = useState<UseCardsReturn['pagination']>(null);
  const [stats, setStats] = useState<CardStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres locaux
  const [currentPage, setCurrentPage] = useState(page);
  const [currentRarity, setCurrentRarity] = useState<CardRarity | undefined>(rarity);
  const [currentType, setCurrentType] = useState<CardType | undefined>(type);
  const [currentSearch, setCurrentSearch] = useState<string | undefined>(search);

  /**
   * Récupère les cartes depuis l'API
   */
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: CardListResponse = await apiService.getCards({
        page: currentPage,
        limit,
        rarity: currentRarity,
        type: currentType,
        search: currentSearch,
      });

      setCards(response.cards);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev,
      });
      
      console.log(`✅ Cards loaded: ${response.cards.length}/${response.total}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cards';
      setError(errorMessage);
      console.error('❌ Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, currentRarity, currentType, currentSearch]);

  /**
   * Récupère les statistiques des cartes
   */
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiService.getCardStats();
      setStats(statsData);
      console.log('✅ Card stats loaded:', statsData);
    } catch (err) {
      console.error('❌ Error fetching card stats:', err);
    }
  }, []);

  /**
   * Roll des cartes (ouverture de packs)
   */
  const rollCards = useCallback(async (packType: string = 'basic', count: number = 1): Promise<CardRollResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.rollCards(packType, count);
      console.log(`🎲 Rolled ${result.cards.length} cards:`, result.cards.map(c => c.name));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to roll cards';
      setError(errorMessage);
      console.error('❌ Error rolling cards:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recherche de cartes
   */
  const searchCards = useCallback(async (query: string): Promise<Card[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.searchCards(query);
      console.log(`🔍 Search "${query}" found ${result.count} results`);
      return result.cards;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search cards';
      setError(errorMessage);
      console.error('❌ Error searching cards:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère une carte par ID
   */
  const getCardById = useCallback(async (id: string): Promise<Card> => {
    setLoading(true);
    setError(null);

    try {
      const card = await apiService.getCardById(id);
      console.log(`🎴 Card loaded: ${card.name}`);
      return card;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch card';
      setError(errorMessage);
      console.error('❌ Error fetching card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actions de pagination
  const nextPage = useCallback(() => {
    if (pagination?.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (pagination?.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [pagination]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Actions de filtrage
  const setFilters = useCallback((filters: { rarity?: CardRarity; type?: CardType; search?: string }) => {
    setCurrentRarity(filters.rarity);
    setCurrentType(filters.type);
    setCurrentSearch(filters.search);
    setCurrentPage(1); // Reset à la première page
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentRarity(undefined);
    setCurrentType(undefined);
    setCurrentSearch(undefined);
    setCurrentPage(1);
  }, []);

  // Effet pour charger automatiquement les cartes
  useEffect(() => {
    if (autoFetch) {
      fetchCards();
    }
  }, [fetchCards, autoFetch]);

  // Effet pour charger les stats au montage
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);

  return {
    // Données
    cards,
    pagination,
    stats,
    
    // États
    loading,
    error,
    
    // Actions
    fetchCards,
    fetchStats,
    rollCards,
    searchCards,
    getCardById,
    
    // Helpers
    nextPage,
    prevPage,
    setPage,
    setFilters,
    clearFilters,
  };
};

/**
 * Hook simplifié pour roller des cartes
 */
export const useCardRoll = () => {
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<CardRollResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roll = useCallback(async (packType: string = 'basic', count: number = 1) => {
    setRolling(true);
    setError(null);

    try {
      const result = await apiService.rollCards(packType, count);
      setLastRoll(result);
      console.log(`🎉 Pack opened! Got ${result.cards.length} cards worth ${result.totalValue} points`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to roll cards';
      setError(errorMessage);
      console.error('❌ Roll failed:', err);
      throw err;
    } finally {
      setRolling(false);
    }
  }, []);

  return {
    roll,
    rolling,
    lastRoll,
    error,
  };
};

/**
 * Hook pour les statistiques de cartes
 */
export const useCardStats = () => {
  const [stats, setStats] = useState<CardStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statsData = await apiService.getCardStats();
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('❌ Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useCards;
