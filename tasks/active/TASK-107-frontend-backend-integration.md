# Task: [INTEGRATION] - Connect Frontend to Backend API

## 📋 Metadata
- **ID**: TASK-107
- **Created**: 2025-08-18
- **Status**: DONE
- **Priority**: CRITICAL
- **Size**: L
- **Assignee**: Claude
- **Completed**: 2025-08-18
- **Epic**: Integration
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** developer  
**I want** seamless frontend-backend communication  
**So that** data flows efficiently between client and server with proper state management

## 📝 Description
Create a robust API client layer with Axios/Fetch, implement proper error handling, retry logic, optimistic updates, and real-time synchronization. Integrate with Zustand stores for state management and ensure offline capability with sync when online.

## ✅ Acceptance Criteria
- [ ] API client with interceptors configured
- [ ] Authentication flow integrated
- [ ] Optimistic updates for better UX
- [ ] Offline queue for failed requests
- [ ] WebSocket integration for real-time
- [ ] Error boundaries and fallbacks
- [ ] Loading states properly managed
- [ ] Cache invalidation strategy
- [ ] Request deduplication
- [ ] Automatic retry with exponential backoff

## 🔧 Technical Details

### API Client Architecture
```typescript
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().refreshToken();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  }
);

// API Hooks
export const useCards = () => {
  return useQuery({
    queryKey: ['cards'],
    queryFn: () => apiClient.get('/cards'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimistic Updates
export const useRollCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.post('/cards/roll'),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['cards']);
      
      // Snapshot previous value
      const previousCards = queryClient.getQueryData(['cards']);
      
      // Optimistically update
      queryClient.setQueryData(['cards'], (old) => {
        return [...old, { id: 'temp', status: 'rolling' }];
      });
      
      return { previousCards };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['cards'], context.previousCards);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries(['cards']);
    },
  });
};
```

### WebSocket Integration
```typescript
// src/api/websocket.ts
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/gameStore';

class GameSocket {
  private socket: Socket;
  
  connect() {
    this.socket = io(process.env.VITE_WS_URL, {
      auth: { token: getAuthToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.setupListeners();
  }
  
  private setupListeners() {
    this.socket.on('game:update', (data) => {
      useGameStore.getState().updateGame(data);
    });
    
    this.socket.on('match:found', (data) => {
      useGameStore.getState().startMatch(data);
    });
    
    this.socket.on('card:played', (data) => {
      useGameStore.getState().handleCardPlayed(data);
    });
  }
  
  emitAction(action: string, payload: any) {
    this.socket.emit(action, payload);
  }
}

export const gameSocket = new GameSocket();
```

### Offline Queue
```typescript
// src/api/offlineQueue.ts
class OfflineQueue {
  private queue: Request[] = [];
  
  add(request: Request) {
    this.queue.push(request);
    this.saveToLocalStorage();
  }
  
  async flush() {
    if (!navigator.onLine) return;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      try {
        await this.executeRequest(request);
      } catch (error) {
        this.queue.unshift(request);
        break;
      }
    }
    
    this.saveToLocalStorage();
  }
  
  private saveToLocalStorage() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }
}

// Listen for online event
window.addEventListener('online', () => {
  offlineQueue.flush();
});
```

### Store Integration
```typescript
// src/stores/syncStore.ts
export const useSyncStore = create((set, get) => ({
  syncStatus: 'idle',
  lastSync: null,
  pendingChanges: [],
  
  sync: async () => {
    set({ syncStatus: 'syncing' });
    
    try {
      const changes = get().pendingChanges;
      await apiClient.post('/sync', { changes });
      
      set({
        syncStatus: 'synced',
        lastSync: new Date(),
        pendingChanges: [],
      });
    } catch (error) {
      set({ syncStatus: 'error' });
    }
  },
  
  addPendingChange: (change) => {
    set((state) => ({
      pendingChanges: [...state.pendingChanges, change],
    }));
  },
}));
```

## ⚠️ Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API version mismatch | HIGH | MEDIUM | Version headers, graceful degradation |
| Network failures | HIGH | HIGH | Retry logic, offline mode |
| State desync | HIGH | MEDIUM | Conflict resolution, server as truth |

## 🧪 Test Scenarios
1. **Offline Mode**: App works without connection
2. **Token Refresh**: Seamless auth renewal
3. **Optimistic Updates**: Instant UI feedback
4. **WebSocket Reconnection**: Auto-reconnect on disconnect
5. **Error Handling**: Graceful failure messages

## 📊 Definition of Done
- [ ] All API endpoints integrated
- [ ] Authentication flow working
- [ ] Real-time updates via WebSocket
- [ ] Offline capability implemented
- [ ] Error handling comprehensive
- [ ] Performance metrics met
- [ ] Integration tests passing

---
*This task is part of The Meme Wars TCG project*
