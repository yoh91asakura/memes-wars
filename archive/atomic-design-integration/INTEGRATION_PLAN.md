# 🔌 Plan d'Intégration Frontend-Backend - The Meme Wars

## 📊 État Actuel
- ✅ Backend API fonctionnel (Node.js/Express/PostgreSQL/Redis)
- ✅ 14 cartes meme dans la base de données
- ✅ Endpoints REST disponibles
- ⚠️ ApiService.ts partiellement implémenté
- ❌ Stores Zustand non connectés au backend
- ❌ Authentification non implémentée
- ❌ WebSocket non configuré

## 🎯 Objectif
Connecter complètement le frontend React au backend Express pour avoir une application fonctionnelle end-to-end.

## 📋 Plan d'Implémentation Détaillé

### Phase 1: Configuration de Base (2h)

#### 1.1 Configuration Environnement
```typescript
// .env.local
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_ENV=development
```

#### 1.2 Client API avec Axios
```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour tokens JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gestion d'erreurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré - refresh ou logout
      await refreshToken();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Phase 2: Services API (3h)

#### 2.1 Card Service
```typescript
// src/services/api/CardApiService.ts
import apiClient from '@/api/client';
import { Card, CardRarity } from '@/types/Card';

export class CardApiService {
  // Récupérer toutes les cartes
  async getCards(filters?: {
    page?: number;
    limit?: number;
    rarity?: CardRarity;
    search?: string;
  }) {
    const response = await apiClient.get('/api/cards', { params: filters });
    return response.data;
  }

  // Roll de cartes
  async rollCards(packType: string, count: number) {
    const response = await apiClient.post('/api/cards/roll', {
      packType,
      count
    });
    return response.data;
  }

  // Détail d'une carte
  async getCard(cardId: string) {
    const response = await apiClient.get(`/api/cards/${cardId}`);
    return response.data;
  }

  // Statistiques
  async getStats() {
    const response = await apiClient.get('/api/cards/stats');
    return response.data;
  }
}

export const cardApiService = new CardApiService();
```

#### 2.2 Auth Service
```typescript
// src/services/api/AuthApiService.ts
export class AuthApiService {
  async login(email: string, password: string) {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });
    const { token, refreshToken, user } = response.data;
    
    // Stocker les tokens
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { user, token };
  }

  async register(userData: RegisterData) {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    await apiClient.post('/api/auth/logout');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/api/auth/refresh', {
      refreshToken
    });
    localStorage.setItem('authToken', response.data.token);
    return response.data.token;
  }
}
```

### Phase 3: React Query Integration (2h)

#### 3.1 Configuration React Query
```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 3.2 Custom Hooks
```typescript
// src/hooks/api/useCards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardApiService } from '@/services/api/CardApiService';

export function useCards(filters?: CardFilters) {
  return useQuery({
    queryKey: ['cards', filters],
    queryFn: () => cardApiService.getCards(filters),
    keepPreviousData: true, // Pour pagination
  });
}

export function useRollCards() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ packType, count }: RollParams) => 
      cardApiService.rollCards(packType, count),
    onSuccess: (data) => {
      // Invalider le cache des cartes
      queryClient.invalidateQueries(['cards']);
      // Invalider les stats
      queryClient.invalidateQueries(['cardStats']);
    },
  });
}

export function useCardStats() {
  return useQuery({
    queryKey: ['cardStats'],
    queryFn: () => cardApiService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Phase 4: Connexion des Stores Zustand (3h)

#### 4.1 Refactor CardStore
```typescript
// src/stores/cardStore.ts
import { create } from 'zustand';
import { cardApiService } from '@/services/api/CardApiService';

interface CardStore {
  // État
  cards: Card[];
  selectedCard: Card | null;
  isLoading: boolean;
  error: string | null;
  filters: CardFilters;
  
  // Actions
  fetchCards: () => Promise<void>;
  rollCards: (packType: string, count: number) => Promise<Card[]>;
  selectCard: (card: Card | null) => void;
  setFilters: (filters: Partial<CardFilters>) => void;
  clearError: () => void;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  selectedCard: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    rarity: undefined,
    search: '',
  },

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cardApiService.getCards(get().filters);
      set({ 
        cards: response.cards,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  rollCards: async (packType: string, count: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cardApiService.rollCards(packType, count);
      const newCards = response.cards;
      
      // Ajouter les nouvelles cartes à la collection
      set(state => ({
        cards: [...state.cards, ...newCards],
        isLoading: false
      }));
      
      return newCards;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  selectCard: (card) => set({ selectedCard: card }),
  
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    // Auto-fetch avec les nouveaux filtres
    get().fetchCards();
  },

  clearError: () => set({ error: null }),
}));
```

#### 4.2 AuthStore
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApiService } from '@/services/api/AuthApiService';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authApiService.login(email, password);
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await authApiService.logout();
        set({ 
          user: null,
          isAuthenticated: false 
        });
      },

      // ... autres méthodes
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
```

### Phase 5: WebSocket Integration (2h)

#### 5.1 Socket Manager
```typescript
// src/services/socket/SocketManager.ts
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/gameStore';

class SocketManager {
  private socket: Socket | null = null;
  
  connect(token: string) {
    if (this.socket?.connected) return;
    
    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.setupListeners();
  }
  
  private setupListeners() {
    if (!this.socket) return;
    
    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    // Updates de jeu
    this.socket.on('game:update', (data) => {
      useGameStore.getState().updateGameState(data);
    });
    
    // Matchmaking
    this.socket.on('match:found', (matchData) => {
      useGameStore.getState().startMatch(matchData);
    });
    
    // Chat/Messages
    this.socket.on('message:new', (message) => {
      useChatStore.getState().addMessage(message);
    });
  }
  
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
  
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketManager = new SocketManager();
```

### Phase 6: Composants UI (3h)

#### 6.1 Loading States
```typescript
// src/components/ui/LoadingStates.tsx
export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

#### 6.2 Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Envoyer à un service de monitoring (Sentry, etc.)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback p-8 text-center">
          <h2>Oops! Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Phase 7: Mode Offline (2h)

#### 7.1 Service Worker
```typescript
// src/serviceWorker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Precache des assets statiques
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/cards'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Network first pour auth
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth'),
  new NetworkFirst({
    cacheName: 'auth-cache',
  })
);
```

#### 7.2 Offline Queue
```typescript
// src/services/OfflineQueue.ts
class OfflineQueue {
  private queue: QueuedRequest[] = [];
  
  constructor() {
    this.loadFromStorage();
    window.addEventListener('online', () => this.flush());
  }
  
  add(request: QueuedRequest) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    });
    this.saveToStorage();
  }
  
  async flush() {
    if (!navigator.onLine || this.queue.length === 0) return;
    
    const requests = [...this.queue];
    this.queue = [];
    
    for (const request of requests) {
      try {
        await this.executeRequest(request);
      } catch (error) {
        console.error('Failed to sync request:', error);
        this.queue.push(request);
      }
    }
    
    this.saveToStorage();
  }
  
  private saveToStorage() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }
  
  private loadFromStorage() {
    const stored = localStorage.getItem('offlineQueue');
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }
}

export const offlineQueue = new OfflineQueue();
```

## 📊 Ordre d'Implémentation

1. **Jour 1 (4h)**
   - [ ] Configuration environnement (.env)
   - [ ] Setup Axios client avec intercepteurs
   - [ ] Créer CardApiService
   - [ ] Tester connexion avec backend

2. **Jour 2 (4h)**
   - [ ] Intégrer React Query
   - [ ] Créer hooks personnalisés (useCards, useRollCards)
   - [ ] Refactorer CardStore pour utiliser l'API
   - [ ] Mettre à jour les composants Card

3. **Jour 3 (4h)**
   - [ ] Implémenter AuthService et AuthStore
   - [ ] Créer pages Login/Register
   - [ ] Protected routes
   - [ ] Token refresh logic

4. **Jour 4 (3h)**
   - [ ] WebSocket setup
   - [ ] Real-time updates
   - [ ] Loading states et error handling
   - [ ] Tests d'intégration

## 🧪 Tests à Effectuer

### Tests Unitaires
- [ ] Services API
- [ ] Stores Zustand
- [ ] Custom hooks

### Tests d'Intégration
- [ ] Login flow complet
- [ ] Roll de cartes
- [ ] Pagination
- [ ] Filtrage
- [ ] WebSocket connexion/reconnexion

### Tests E2E
- [ ] Parcours utilisateur complet
- [ ] Mode offline
- [ ] Performance

## ⚠️ Points d'Attention

1. **CORS**: S'assurer que le backend autorise les requêtes du frontend
2. **Tokens JWT**: Gérer expiration et refresh automatique
3. **Types TypeScript**: Maintenir la synchronisation frontend/backend
4. **Cache**: Stratégie d'invalidation cohérente
5. **Optimistic Updates**: Pour une meilleure UX
6. **Error Recovery**: Retry logic et fallbacks

## 📈 Métriques de Succès

- ✅ Toutes les fonctionnalités connectées au backend
- ✅ Temps de réponse < 200ms pour les requêtes cachées
- ✅ Temps de réponse < 500ms pour les requêtes réseau
- ✅ 0 erreurs non gérées
- ✅ Mode offline fonctionnel
- ✅ WebSocket stable sur 1h+ de session

## 🚀 Prochaines Étapes

Après l'intégration complète:
1. Optimisation des performances
2. Tests de charge
3. Monitoring et analytics
4. Déploiement production
