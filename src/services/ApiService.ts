/**
 * Service API pour communiquer avec le backend Meme Wars
 * Gère toutes les requêtes HTTP vers l'API REST
 */

import { Card, CardRarity, CardType } from '../types/Card';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api';

// Types pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CardListResponse {
  cards: Card[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CardRollResult {
  cards: Card[];
  packType: string;
  totalValue: number;
  bonusMultiplier?: number;
}

interface CardStatsResponse {
  total: number;
  byRarity: Record<CardRarity, number>;
  byType: Record<CardType, number>;
}

interface PopularTag {
  tag: string;
  count: number;
}

interface SearchResult {
  cards: Card[];
  query: string;
  count: number;
}

// Service principal
class ApiService {
  private baseUrl = API_BASE_URL;

  /**
   * Helper pour faire des requêtes HTTP
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check du backend
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // === ENDPOINTS CARDS ===

  /**
   * Récupère la liste des cartes avec filtres et pagination
   */
  async getCards(params: {
    page?: number;
    limit?: number;
    rarity?: CardRarity;
    type?: CardType;
    search?: string;
  } = {}): Promise<CardListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.rarity) queryParams.set('rarity', params.rarity);
    if (params.type) queryParams.set('type', params.type);
    if (params.search) queryParams.set('search', params.search);

    const endpoint = `/cards?${queryParams.toString()}`;
    const response = await this.makeRequest<CardListResponse>(endpoint);
    return response.data;
  }

  /**
   * Récupère une carte par son ID
   */
  async getCardById(cardId: string): Promise<Card> {
    const response = await this.makeRequest<Card>(`/cards/${cardId}`);
    return response.data;
  }

  /**
   * Roll des cartes (pack opening)
   */
  async rollCards(packType: string = 'basic', count: number = 1): Promise<CardRollResult> {
    const response = await this.makeRequest<CardRollResult>('/cards/roll', {
      method: 'POST',
      body: JSON.stringify({ packType, count }),
    });
    return response.data;
  }

  /**
   * Recherche de cartes par texte
   */
  async searchCards(query: string, limit: number = 20): Promise<SearchResult> {
    const response = await this.makeRequest<SearchResult>(`/cards/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  /**
   * Statistiques des cartes
   */
  async getCardStats(): Promise<CardStatsResponse> {
    const response = await this.makeRequest<CardStatsResponse>('/cards/stats');
    return response.data;
  }

  /**
   * Tags populaires
   */
  async getPopularTags(limit: number = 20): Promise<PopularTag[]> {
    const response = await this.makeRequest<{ tags: PopularTag[]; count: number }>(`/cards/tags/popular?limit=${limit}`);
    return response.data.tags;
  }

  // === ENDPOINTS AUTH (pour plus tard) ===

  /**
   * Inscription utilisateur
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<any> {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  /**
   * Connexion utilisateur
   */
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<any> {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  }

  // === ENDPOINTS GAME (pour plus tard) ===

  /**
   * Créer une partie
   */
  async createMatch(matchData: {
    deckId: string;
    matchType?: string;
    opponentId?: string;
  }): Promise<any> {
    const response = await this.makeRequest('/game/match/create', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
    return response.data;
  }

  /**
   * Récupérer une partie
   */
  async getMatch(matchId: string): Promise<any> {
    const response = await this.makeRequest(`/game/match/${matchId}`);
    return response.data;
  }

  // === ENDPOINTS MATCHMAKING (pour plus tard) ===

  /**
   * Rejoindre la queue de matchmaking
   */
  async joinQueue(queueData: {
    deckId: string;
    matchType?: string;
    preferredRegion?: string;
  }): Promise<any> {
    const response = await this.makeRequest('/matchmaking/queue', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });
    return response.data;
  }

  /**
   * Quitter la queue de matchmaking
   */
  async leaveQueue(): Promise<any> {
    const response = await this.makeRequest('/matchmaking/queue', {
      method: 'DELETE',
    });
    return response.data;
  }

  /**
   * Statut du matchmaking
   */
  async getMatchmakingStatus(): Promise<any> {
    const response = await this.makeRequest('/matchmaking/status');
    return response.data;
  }
}

// Instance singleton
export const apiService = new ApiService();
export default apiService;

// Export des types pour utilisation dans les composants
export type {
  ApiResponse,
  CardListResponse,
  CardRollResult,
  CardStatsResponse,
  PopularTag,
  SearchResult,
  PaginationInfo,
};
