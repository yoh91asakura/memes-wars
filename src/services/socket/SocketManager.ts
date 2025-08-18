/**
 * Manager WebSocket pour les communications temps réel
 * Gère la connexion, reconnexion, et événements Socket.IO
 */

import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/gameStore';

// Types pour les événements WebSocket
interface ServerToClientEvents {
  // Game events
  'game:update': (data: any) => void;
  'game:player_joined': (data: { playerId: string; username: string }) => void;
  'game:player_left': (data: { playerId: string }) => void;
  'game:ended': (data: { winner: string; stats: any }) => void;
  
  // Card events
  'card:rolled': (data: { playerId: string; cards: any[] }) => void;
  'card:traded': (data: { from: string; to: string; cards: any[] }) => void;
  
  // Match events
  'match:found': (data: any) => void;
  'match:cancelled': (data: { reason: string }) => void;
  'match:started': (data: any) => void;
  
  // Chat events
  'chat:message': (data: { 
    id: string; 
    userId: string; 
    username: string; 
    message: string; 
    timestamp: number 
  }) => void;
  
  // System events
  'notification': (data: { 
    type: 'info' | 'success' | 'warning' | 'error'; 
    title: string; 
    message: string 
  }) => void;
  'user:online': (data: { userId: string; status: 'online' | 'offline' }) => void;
  
  // Connection events
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_attempt': (attemptNumber: number) => void;
  'reconnect_error': (error: Error) => void;
  'reconnect_failed': () => void;
}

interface ClientToServerEvents {
  // Game actions
  'game:join': (data: { roomId: string }) => void;
  'game:leave': (data?: any) => void; // Make optional to fix type issues
  'game:action': (data: { action: string; payload: any }) => void;
  
  // Matchmaking
  'matchmaking:join_queue': (data: { gameMode: string }) => void;
  'matchmaking:leave_queue': (data?: any) => void; // Make optional to fix type issues
  
  // Chat
  'chat:send': (data: { message: string; roomId?: string }) => void;
  'chat:typing': (data: { isTyping: boolean }) => void;
  
  // User status
  'user:status': (data: { status: 'online' | 'away' | 'busy' }) => void;
  
  // Heartbeat
  'ping': (data: { timestamp: number }) => void;
}

class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  // Event listeners registry
  private eventListeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

  /**
   * Se connecter au serveur WebSocket
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket déjà connecté');
      return;
    }

    console.log('🔌 Connexion WebSocket...');

    try {
      this.socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3001', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000, // Max 10 seconds
        timeout: 10000,
        forceNew: true,
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      });

      this.setupEventListeners();
      this.startHeartbeat();
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion WebSocket:', error);
      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Se déconnecter du serveur
   */
  disconnect(): void {
    console.log('🔌 Déconnexion WebSocket...');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.eventListeners.clear();
  }

  /**
   * Émettre un événement vers le serveur
   */
  emit<K extends keyof ClientToServerEvents>(
    event: K, 
    data?: Parameters<ClientToServerEvents[K]>[0]
  ): void {
    if (!this.socket?.connected) {
      console.warn(`⚠️ Tentative d'envoi de ${event} sans connexion WebSocket`);
      return;
    }

    try {
      if (data !== undefined) {
        this.socket.emit(event as any, data);
      } else {
        this.socket.emit(event as any);
      }
      
      if (import.meta.env.VITE_DEBUG) {
        console.log(`📤 WebSocket emit: ${event}`, data);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de ${event}:`, error);
    }
  }

  /**
   * S'abonner à un événement
   */
  on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ): void {
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, []);
    }
    
    this.eventListeners.get(event as string)!.push(callback as (...args: unknown[]) => void);
    
    if (this.socket) {
      this.socket.on(event as any, callback as any);
    }
  }

  /**
   * Se désabonner d'un événement
   */
  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K]
  ): void {
    if (callback) {
      const listeners = this.eventListeners.get(event as string) || [];
      const index = listeners.indexOf(callback as (...args: unknown[]) => void);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event as string);
    }
    
    if (this.socket) {
      this.socket.off(event as any, callback as any);
    }
  }

  /**
   * Obtenir l'état de connexion
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnecting: boolean;
    attempts: number;
  } {
    return {
      connected: this.isConnected,
      connecting: this.socket?.disconnected === false && !this.socket?.connected || false,
      reconnecting: this.reconnectAttempts > 0,
      attempts: this.reconnectAttempts,
    };
  }

  /**
   * Rejoindre une room spécifique
   */
  joinRoom(roomId: string): void {
    this.emit('game:join', { roomId });
  }

  /**
   * Quitter la room actuelle
   */
  leaveRoom(): void {
    this.emit('game:leave');
  }

  /**
   * Envoyer un message de chat
   */
  sendChatMessage(message: string, roomId?: string): void {
    this.emit('chat:send', { message, roomId });
  }

  /**
   * Rejoindre la queue de matchmaking
   */
  joinMatchmakingQueue(gameMode: string): void {
    this.emit('matchmaking:join_queue', { gameMode });
  }

  /**
   * Quitter la queue de matchmaking
   */
  leaveMatchmakingQueue(): void {
    this.emit('matchmaking:leave_queue');
  }

  // === MÉTHODES PRIVÉES ===

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      
      // Ré-enregistrer tous les listeners
      this.reregisterEventListeners();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket déconnecté:', reason);
      this.isConnected = false;
      
      // Auto-reconnect sauf si c'est une déconnexion volontaire
      if (reason === 'io server disconnect') {
        console.log('🔄 Reconnexion manuelle nécessaire');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket reconnecté après ${attemptNumber} tentative(s)`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Tentative de reconnexion ${attemptNumber}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Erreur de reconnexion:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Échec de toutes les tentatives de reconnexion');
      this.handleReconnectFailed();
    });

    // Événements de jeu
    this.socket.on('game:update', (data) => {
      if (import.meta.env.VITE_DEBUG) {
        console.log('🎮 Game update:', data);
      }
      // Le store de jeu gérera cette donnée
      try {
        useGameStore.getState().updateGameState(data);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du game state:', error);
      }
    });

    this.socket.on('match:found', (data) => {
      console.log('🎯 Match trouvé:', data);
      try {
        useGameStore.getState().startMatch(data);
      } catch (error) {
        console.error('Erreur lors du démarrage du match:', error);
      }
    });

    // Notifications système
    this.socket.on('notification', (data) => {
      console.log(`📢 Notification [${data.type}]:`, data.title, '-', data.message);
      // TODO: Intégrer avec un système de notifications UI
    });

    // Événements de chat
    this.socket.on('chat:message', (data) => {
      if (import.meta.env.VITE_DEBUG) {
        console.log('💬 Message de chat:', data);
      }
      // TODO: Intégrer avec le store de chat
    });
  }

  private reregisterEventListeners(): void {
    // Ré-enregistrer tous les event listeners personnalisés
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(listener => {
        if (this.socket) {
          this.socket.on(event as any, listener as any);
        }
      });
    });
  }

  private handleConnectionError(error: Error): void {
    console.error('WebSocket connection error:', error);
    
    // Augmenter le délai de reconnexion avec backoff exponentiel
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  private handleReconnectFailed(): void {
    console.error('Impossible de se reconnecter au serveur WebSocket');
    
    // Notifier l'utilisateur que la connexion temps réel est perdue
    // TODO: Afficher une notification dans l'UI
    
    // Optionnel: Essayer de se reconnecter après un délai plus long
    setTimeout(() => {
      console.log('🔄 Nouvelle tentative de connexion WebSocket...');
      const token = localStorage.getItem('authToken');
      if (token) {
        this.connect(token);
      }
    }, 60000); // Retry après 1 minute
  }

  private startHeartbeat(): void {
    // Envoyer un ping périodique pour maintenir la connexion
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping' as any, { timestamp: Date.now() });
      }
    }, 30000); // Ping toutes les 30 secondes
  }
}

// Instance singleton
export const socketManager = new SocketManager();

// Hook React pour utiliser le WebSocket dans les composants
export function useSocket() {
  return {
    socket: socketManager,
    isConnected: socketManager.getConnectionStatus().connected,
    connect: socketManager.connect.bind(socketManager),
    disconnect: socketManager.disconnect.bind(socketManager),
    emit: socketManager.emit.bind(socketManager),
    on: socketManager.on.bind(socketManager),
    off: socketManager.off.bind(socketManager),
  };
}
