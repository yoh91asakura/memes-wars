// Game State Service - Centralized game state coordination

import { CombatArena, CombatPlayer } from '../models/Combat';
import { Player, PlayerSession } from '../models/Player';
import { Deck } from '../models/Deck';
import { CombatEngine } from './CombatEngine';
import { DeckService } from './DeckService';

export type GameMode = 'practice' | 'pvp' | 'tournament' | 'campaign';
export type GamePhase = 'menu' | 'deckbuilding' | 'matchmaking' | 'combat' | 'results' | 'paused';

export interface GameStateData {
  // Core State
  currentPhase: GamePhase;
  gameMode: GameMode;
  isOnline: boolean;
  isPaused: boolean;
  
  // Players
  currentPlayer: Player | null;
  sessionData: PlayerSession | null;
  
  // Game Objects
  activeDeck: Deck | null;
  arena: CombatArena | null;
  combatEngine: CombatEngine | null;
  
  // Match State
  currentMatch: {
    id: string;
    players: CombatPlayer[];
    startTime: number;
    duration: number;
    winner?: string;
  } | null;
  
  // UI State
  activeScreen: string;
  loadingStates: Map<string, boolean>;
  errors: GameError[];
  notifications: GameNotification[];
  
  // Settings
  gameSettings: GameSettings;
  
  // Performance
  performance: PerformanceMetrics;
}

export interface GameSettings {
  // Video
  resolution: { width: number; height: number; };
  fullscreen: boolean;
  vsync: boolean;
  frameRateLimit: number;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  
  // Audio
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  
  // Gameplay
  autoFire: boolean;
  showDamageNumbers: boolean;
  showHealthBars: boolean;
  mouseSensitivity: number;
  
  // UI
  showFPS: boolean;
  showPing: boolean;
  uiScale: number;
  colorTheme: 'light' | 'dark' | 'auto';
  
  // Accessibility
  colorBlindMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  projectileCount: number;
  effectCount: number;
  lastUpdate: number;
}

export interface GameError {
  id: string;
  type: 'network' | 'gameplay' | 'system' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  timestamp: number;
  resolved: boolean;
}

export interface GameNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  timestamp: number;
  dismissed: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

export class GameStateService {
  private state: GameStateData;
  private listeners: Map<string, ((state: GameStateData) => void)[]> = new Map();
  private deckService: DeckService;
  private performanceTimer: number | null = null;

  constructor() {
    this.deckService = new DeckService();
    this.state = this.createInitialState();
    this.startPerformanceMonitoring();
  }

  // State Management
  public getState(): GameStateData {
    return { ...this.state };
  }

  public setState(updates: Partial<GameStateData>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners('state_updated');
  }

  public subscribe(event: string, callback: (state: GameStateData) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Phase Management
  public transitionToPhase(newPhase: GamePhase): void {
    const oldPhase = this.state.currentPhase;
    
    // Validate transition
    if (!this.isValidPhaseTransition(oldPhase, newPhase)) {
      this.addError({
        type: 'system',
        severity: 'medium',
        message: `Invalid phase transition from ${oldPhase} to ${newPhase}`,
        details: 'Some game phases cannot transition directly to others.'
      });
      return;
    }

    // Execute pre-transition cleanup
    this.cleanupPhase(oldPhase);

    // Update state
    this.setState({ currentPhase: newPhase });

    // Execute post-transition setup
    this.setupPhase(newPhase);

    this.notifyListeners('phase_changed');
  }

  public getCurrentPhase(): GamePhase {
    return this.state.currentPhase;
  }

  // Combat Management
  public startCombat(playerDeck: Deck, opponentDeck: Deck, arena: CombatArena): void {
    if (this.state.combatEngine) {
      this.endCombat();
    }

    const combatEngine = new CombatEngine(arena);
    combatEngine.initialize(playerDeck, opponentDeck);

    // Subscribe to combat events
    combatEngine.addEventListener('match_started', (event) => {
      this.handleCombatEvent('match_started', event);
    });

    combatEngine.addEventListener('match_ended', (event) => {
      this.handleCombatEvent('match_ended', event);
    });

    combatEngine.addEventListener('player_killed', (event) => {
      this.handleCombatEvent('player_killed', event);
    });

    this.setState({
      combatEngine,
      arena,
      activeDeck: playerDeck,
      currentMatch: {
        id: `match_${Date.now()}`,
        players: [],
        startTime: Date.now(),
        duration: 0
      }
    });

    combatEngine.startBattle();
    this.transitionToPhase('combat');
  }

  public endCombat(): void {
    if (this.state.combatEngine) {
      this.state.combatEngine.pause();
    }

    this.setState({
      combatEngine: null,
      arena: null,
      currentMatch: null
    });

    this.transitionToPhase('results');
  }

  public pauseCombat(): void {
    if (this.state.combatEngine && this.state.currentPhase === 'combat') {
      this.state.combatEngine.pause();
      this.setState({ isPaused: true });
      this.transitionToPhase('paused');
    }
  }

  public resumeCombat(): void {
    if (this.state.combatEngine && this.state.isPaused) {
      this.state.combatEngine.resume();
      this.setState({ isPaused: false });
      this.transitionToPhase('combat');
    }
  }

  // Deck Management
  public setActiveDeck(deck: Deck): void {
    const validation = this.deckService.getDetailedValidation(deck.cards);
    
    if (!validation.isValid) {
      this.addError({
        type: 'validation',
        severity: 'high',
        message: 'Cannot set invalid deck as active',
        details: validation.errors.map(e => e.message).join('; ')
      });
      return;
    }

    this.setState({ activeDeck: deck });
    this.notifyListeners('deck_changed');
  }

  public getActiveDeck(): Deck | null {
    return this.state.activeDeck;
  }

  // Player Management
  public setCurrentPlayer(player: Player): void {
    this.setState({ currentPlayer: player });
    this.startPlayerSession(player);
    this.notifyListeners('player_changed');
  }

  public getCurrentPlayer(): Player | null {
    return this.state.currentPlayer;
  }

  // Settings Management
  public updateSettings(updates: Partial<GameSettings>): void {
    const newSettings = { ...this.state.gameSettings, ...updates };
    this.setState({ gameSettings: newSettings });
    this.applySettings(newSettings);
    this.saveSettings(newSettings);
    this.notifyListeners('settings_changed');
  }

  public getSettings(): GameSettings {
    return this.state.gameSettings;
  }

  // Error Management
  public addError(error: Omit<GameError, 'id' | 'timestamp' | 'resolved'>): void {
    const newError: GameError = {
      ...error,
      id: `error_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      resolved: false
    };

    this.setState({
      errors: [...this.state.errors, newError]
    });

    this.notifyListeners('error_occurred');

    // Auto-resolve low severity errors after 5 seconds
    if (error.severity === 'low') {
      setTimeout(() => this.resolveError(newError.id), 5000);
    }
  }

  public resolveError(errorId: string): void {
    this.setState({
      errors: this.state.errors.map(error =>
        error.id === errorId ? { ...error, resolved: true } : error
      )
    });
  }

  public clearErrors(): void {
    this.setState({ errors: [] });
  }

  // Notification Management
  public addNotification(notification: Omit<GameNotification, 'id' | 'timestamp' | 'dismissed'>): void {
    const newNotification: GameNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      dismissed: false
    };

    this.setState({
      notifications: [...this.state.notifications, newNotification]
    });

    // Auto-dismiss after duration
    if (notification.duration) {
      setTimeout(() => this.dismissNotification(newNotification.id), notification.duration);
    }

    this.notifyListeners('notification_added');
  }

  public dismissNotification(notificationId: string): void {
    this.setState({
      notifications: this.state.notifications.map(notification =>
        notification.id === notificationId 
          ? { ...notification, dismissed: true }
          : notification
      )
    });
  }

  public clearNotifications(): void {
    this.setState({ notifications: [] });
  }

  // Loading State Management
  public setLoading(key: string, isLoading: boolean): void {
    const loadingStates = new Map(this.state.loadingStates);
    loadingStates.set(key, isLoading);
    this.setState({ loadingStates });
  }

  public isLoading(key: string): boolean {
    return this.state.loadingStates.get(key) || false;
  }

  // Performance Monitoring
  public updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    const updatedMetrics = { ...this.state.performance, ...metrics, lastUpdate: Date.now() };
    this.setState({ performance: updatedMetrics });
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return this.state.performance;
  }

  // Private Methods
  private createInitialState(): GameStateData {
    return {
      currentPhase: 'menu',
      gameMode: 'practice',
      isOnline: false,
      isPaused: false,
      currentPlayer: null,
      sessionData: null,
      activeDeck: null,
      arena: null,
      combatEngine: null,
      currentMatch: null,
      activeScreen: 'main_menu',
      loadingStates: new Map(),
      errors: [],
      notifications: [],
      gameSettings: this.loadSettings(),
      performance: {
        fps: 60,
        averageFPS: 60,
        minFPS: 60,
        maxFPS: 60,
        frameTime: 16.67,
        memoryUsage: 0,
        drawCalls: 0,
        projectileCount: 0,
        effectCount: 0,
        lastUpdate: Date.now()
      }
    };
  }

  private isValidPhaseTransition(from: GamePhase, to: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      menu: ['deckbuilding', 'matchmaking', 'combat'],
      deckbuilding: ['menu', 'matchmaking'],
      matchmaking: ['menu', 'combat'],
      combat: ['paused', 'results', 'menu'],
      results: ['menu', 'deckbuilding'],
      paused: ['combat', 'menu']
    };

    return validTransitions[from].includes(to);
  }

  private cleanupPhase(phase: GamePhase): void {
    switch (phase) {
      case 'combat':
        if (this.state.combatEngine) {
          this.state.combatEngine.pause();
        }
        break;
      case 'paused':
        // Clear pause-specific UI state
        break;
      default:
        break;
    }
  }

  private setupPhase(phase: GamePhase): void {
    switch (phase) {
      case 'combat':
        this.setLoading('combat_initialization', false);
        break;
      case 'menu':
        this.clearErrors();
        break;
      case 'results':
        this.calculateMatchResults();
        break;
      default:
        break;
    }
  }

  private handleCombatEvent(eventType: string, event: any): void {
    switch (eventType) {
      case 'match_started':
        this.addNotification({
          type: 'info',
          title: 'Combat Started',
          message: 'The battle has begun!',
          duration: 3000
        });
        break;
      case 'match_ended':
        this.endCombat();
        break;
      case 'player_killed':
        this.addNotification({
          type: 'info',
          title: 'Player Eliminated',
          message: `${event.data.playerId} has been eliminated!`,
          duration: 2000
        });
        break;
    }
  }

  private startPlayerSession(player: Player): void {
    const session: PlayerSession = {
      sessionId: `session_${Date.now()}`,
      playerId: player.id,
      startTime: new Date().toISOString(),
      isActive: true,
      location: 'game',
      device: navigator.userAgent,
      activities: []
    };

    this.setState({ sessionData: session });
  }

  private calculateMatchResults(): void {
    if (this.state.currentMatch && this.state.combatEngine) {
      const combatState = this.state.combatEngine.getState();
      const winner = combatState.winner;
      
      if (winner) {
        this.addNotification({
          type: 'success',
          title: 'Victory!',
          message: `${winner} wins the battle!`,
          duration: 5000
        });
      }
    }
  }

  private loadSettings(): GameSettings {
    try {
      const saved = localStorage.getItem('game_settings');
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    return this.getDefaultSettings();
  }

  private saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem('game_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  private getDefaultSettings(): GameSettings {
    return {
      resolution: { width: 1920, height: 1080 },
      fullscreen: false,
      vsync: true,
      frameRateLimit: 60,
      graphicsQuality: 'high',
      masterVolume: 0.8,
      sfxVolume: 0.9,
      musicVolume: 0.7,
      autoFire: false,
      showDamageNumbers: true,
      showHealthBars: true,
      mouseSensitivity: 1.0,
      showFPS: false,
      showPing: false,
      uiScale: 1.0,
      colorTheme: 'auto',
      colorBlindMode: false,
      highContrast: false,
      reducedMotion: false,
      screenReaderMode: false
    };
  }

  private applySettings(settings: GameSettings): void {
    // Apply graphics settings
    document.documentElement.style.setProperty('--ui-scale', settings.uiScale.toString());
    
    // Apply theme
    if (settings.colorTheme !== 'auto') {
      document.documentElement.setAttribute('data-theme', settings.colorTheme);
    }

    // Apply accessibility settings
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
  }

  private startPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsValues: number[] = [];

    const monitor = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      frameCount++;

      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime);
        fpsValues.push(fps);
        
        // Keep only last 60 values (60 seconds of data)
        if (fpsValues.length > 60) {
          fpsValues.shift();
        }

        const averageFPS = fpsValues.reduce((sum, val) => sum + val, 0) / fpsValues.length;
        const minFPS = Math.min(...fpsValues);
        const maxFPS = Math.max(...fpsValues);

        this.updatePerformanceMetrics({
          fps,
          averageFPS: Math.round(averageFPS),
          minFPS,
          maxFPS,
          frameTime: deltaTime / frameCount,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      this.performanceTimer = requestAnimationFrame(monitor);
    };

    this.performanceTimer = requestAnimationFrame(monitor);
  }

  private notifyListeners(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(this.state));
    }
  }

  public destroy(): void {
    if (this.performanceTimer) {
      cancelAnimationFrame(this.performanceTimer);
    }
    
    if (this.state.combatEngine) {
      this.state.combatEngine.pause();
    }

    this.listeners.clear();
  }
}