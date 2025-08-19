// Combat Store - Combat state management with Zustand

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CombatState, CombatPlayer, EmojiProjectile, ActiveEffect, CombatEvent, CombatArena } from '../models/Combat';
import { CombatEngine } from '../services/CombatEngine';
import { Deck } from '../models/Deck';

export interface CombatStore {
  // Combat State
  isActive: boolean;
  isPaused: boolean;
  phase: 'waiting' | 'countdown' | 'active' | 'paused' | 'ended';
  
  // Arena & Engine
  arena: CombatArena | null;
  combatEngine: CombatEngine | null;
  
  // Players
  players: CombatPlayer[];
  currentPlayerId: string | null;
  winner: CombatPlayer | null;
  
  // Combat Objects
  projectiles: EmojiProjectile[];
  activeEffects: ActiveEffect[];
  
  // Time Management
  timeRemaining: number;
  totalDuration: number;
  startTime: number;
  endTime?: number;
  
  // Events & Statistics
  events: CombatEvent[];
  statistics: {
    totalProjectilesFired: number;
    totalDamageDealt: number;
    totalCollisions: number;
    currentFPS: number;
    averageFPS: number;
    peakProjectileCount: number;
  };
  
  // UI State
  showDebugInfo: boolean;
  cameraPosition: { x: number; y: number; zoom: number };
  selectedProjectile: string | null;
  
  // Settings
  settings: {
    autoFire: boolean;
    showDamageNumbers: boolean;
    showHealthBars: boolean;
    showProjectileTrails: boolean;
    particleEffects: boolean;
    soundEffects: boolean;
  };
  
  // Actions
  initializeCombat: (arena: CombatArena, playerDeck: Deck, opponentDeck: Deck) => void;
  startCombat: () => void;
  pauseCombat: () => void;
  resumeCombat: () => void;
  endCombat: (winner?: CombatPlayer) => void;
  resetCombat: () => void;
  
  // Combat Updates
  updateFromEngine: (engineState: CombatState) => void;
  fireProjectile: (playerId: string, target: { x: number; y: number }) => void;
  applyDamage: (playerId: string, damage: number) => void;
  addEffect: (playerId: string, effect: ActiveEffect) => void;
  removeEffect: (effectId: string) => void;
  
  // Player Management
  updatePlayerHealth: (playerId: string, health: number) => void;
  updatePlayerPosition: (playerId: string, position: { x: number; y: number }) => void;
  eliminatePlayer: (playerId: string) => void;
  
  // UI Actions
  setSelectedProjectile: (projectileId: string | null) => void;
  updateCamera: (position: { x: number; y: number; zoom: number }) => void;
  toggleDebugInfo: () => void;
  updateSettings: (settings: Partial<CombatStore['settings']>) => void;
  
  // Event Handling
  addEvent: (event: CombatEvent) => void;
  clearEvents: () => void;
  getEventsByType: (type: string) => CombatEvent[];
  
  // Statistics
  updateStatistics: (stats: Partial<CombatStore['statistics']>) => void;
  resetStatistics: () => void;
  
  // Utilities
  getPlayer: (playerId: string) => CombatPlayer | null;
  getCurrentPlayer: () => CombatPlayer | null;
  getAlivePlayerCount: () => number;
  getProjectileCount: () => number;
  isPlayerAlive: (playerId: string) => boolean;
}

// Arena creation helper (used in initialization)
export const createInitialArena = (): CombatArena => ({
  id: 'default_arena',
  width: 1200,
  height: 800,
  boundaries: [
    { x: 0, y: 0, width: 1200, height: 20 }, // Top
    { x: 0, y: 780, width: 1200, height: 20 }, // Bottom
    { x: 0, y: 0, width: 20, height: 800 }, // Left
    { x: 1180, y: 0, width: 20, height: 800 } // Right
  ],
  obstacles: [],
  playerSpawns: [
    { x: 200, y: 400 },
    { x: 1000, y: 400 }
  ],
  powerupSpawns: [],
  settings: {
    gravity: 200,
    friction: 0.98,
    bounceMultiplier: 0.8,
    maxProjectiles: 100,
    tickRate: 60,
    roundDuration: 120000, // 2 minutes
    suddenDeathTime: 90000 // 1.5 minutes
  }
});

export const useCombatStore = create<CombatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    isActive: false,
    isPaused: false,
    phase: 'waiting',
    arena: null,
    combatEngine: null,
    players: [],
    currentPlayerId: null,
    winner: null,
    projectiles: [],
    activeEffects: [],
    timeRemaining: 0,
    totalDuration: 0,
    startTime: 0,
    events: [],
    statistics: {
      totalProjectilesFired: 0,
      totalDamageDealt: 0,
      totalCollisions: 0,
      currentFPS: 60,
      averageFPS: 60,
      peakProjectileCount: 0
    },
    showDebugInfo: false,
    cameraPosition: { x: 600, y: 400, zoom: 1.0 },
    selectedProjectile: null,
    settings: {
      autoFire: true,
      showDamageNumbers: true,
      showHealthBars: true,
      showProjectileTrails: true,
      particleEffects: true,
      soundEffects: true
    },

    // Combat Management Actions
    initializeCombat: (arena: CombatArena, playerDeck: Deck, opponentDeck: Deck) => {
      const combatEngine = new CombatEngine(arena);
      
      // Subscribe to combat engine events
      combatEngine.addEventListener('match_started', (event) => {
        get().addEvent(event);
      });

      combatEngine.addEventListener('match_ended', (event) => {
        const winner = get().players.find(p => p.id === event.data.winner);
        get().endCombat(winner);
      });

      combatEngine.addEventListener('projectile_fired', (event) => {
        get().updateStatistics({ 
          totalProjectilesFired: get().statistics.totalProjectilesFired + 1 
        });
        get().addEvent(event);
      });

      combatEngine.addEventListener('player_damaged', (event) => {
        get().updateStatistics({ 
          totalDamageDealt: get().statistics.totalDamageDealt + (event.data.damage as number || 0)
        });
        get().addEvent(event);
      });

      combatEngine.addEventListener('projectile_hit', (event) => {
        get().updateStatistics({ 
          totalCollisions: get().statistics.totalCollisions + 1 
        });
        get().addEvent(event);
      });

      combatEngine.initialize(playerDeck, opponentDeck);

      set({
        arena,
        combatEngine,
        timeRemaining: arena.settings.roundDuration,
        totalDuration: arena.settings.roundDuration,
        phase: 'waiting',
        startTime: Date.now()
      });
    },

    startCombat: () => {
      const { combatEngine } = get();
      if (combatEngine) {
        combatEngine.startBattle();
        set({
          isActive: true,
          isPaused: false,
          phase: 'active',
          startTime: Date.now()
        });
      }
    },

    pauseCombat: () => {
      const { combatEngine } = get();
      if (combatEngine) {
        combatEngine.pause();
        set({ isPaused: true, phase: 'paused' });
      }
    },

    resumeCombat: () => {
      const { combatEngine } = get();
      if (combatEngine) {
        combatEngine.resume();
        set({ isPaused: false, phase: 'active' });
      }
    },

    endCombat: (winner?: CombatPlayer) => {
      const { combatEngine } = get();
      if (combatEngine) {
        combatEngine.pause();
      }

      set({
        isActive: false,
        isPaused: false,
        phase: 'ended',
        winner: winner || null,
        endTime: Date.now()
      });
    },

    resetCombat: () => {
      const { combatEngine } = get();
      if (combatEngine) {
        combatEngine.pause();
      }

      set({
        isActive: false,
        isPaused: false,
        phase: 'waiting',
        combatEngine: null,
        arena: null,
        players: [],
        currentPlayerId: null,
        winner: null,
        projectiles: [],
        activeEffects: [],
        timeRemaining: 0,
        totalDuration: 0,
        startTime: 0,
        endTime: undefined,
        events: [],
        selectedProjectile: null,
        cameraPosition: { x: 600, y: 400, zoom: 1.0 }
      });

      get().resetStatistics();
    },

    // Engine Updates
    updateFromEngine: (engineState: CombatState) => {
      const state = get();
      
      set({
        phase: engineState.phase as any,
        players: engineState.players,
        projectiles: engineState.projectiles,
        activeEffects: engineState.effects,
        timeRemaining: engineState.timeRemaining,
        winner: engineState.winner ? engineState.players.find(p => p.id === engineState.winner) || null : null
      });

      // Update statistics
      get().updateStatistics({
        currentFPS: engineState.stats.averageFPS,
        averageFPS: engineState.stats.averageFPS,
        peakProjectileCount: Math.max(state.statistics.peakProjectileCount, engineState.projectiles.length)
      });
    },

    fireProjectile: (_playerId: string, target: { x: number; y: number }) => {
      // This would be handled by the combat engine
      // Just emit an event for UI feedback
      get().addEvent({
        id: `manual_fire_${Date.now()}`,
        type: 'projectile_fired',
        timestamp: Date.now(),
        data: { target, manual: true }
      });
    },

    applyDamage: (playerId: string, damage: number) => {
      const player = get().getPlayer(playerId);
      if (player) {
        const newHealth = Math.max(0, player.health - damage);
        get().updatePlayerHealth(playerId, newHealth);
        
        if (newHealth <= 0) {
          get().eliminatePlayer(playerId);
        }
      }
    },

    addEffect: (_playerId: string, effect: ActiveEffect) => {
      set(state => ({
        activeEffects: [...state.activeEffects, effect]
      }));
    },

    removeEffect: (effectId: string) => {
      set(state => ({
        activeEffects: state.activeEffects.filter(e => e.id !== effectId)
      }));
    },

    // Player Management
    updatePlayerHealth: (playerId: string, health: number) => {
      set(state => ({
        players: state.players.map(player =>
          player.id === playerId ? { ...player, health } : player
        )
      }));
    },

    updatePlayerPosition: (playerId: string, position: { x: number; y: number }) => {
      set(state => ({
        players: state.players.map(player =>
          player.id === playerId ? { ...player, position } : player
        )
      }));
    },

    eliminatePlayer: (playerId: string) => {
      set(state => ({
        players: state.players.map(player =>
          player.id === playerId ? { ...player, isAlive: false } : player
        )
      }));

      get().addEvent({
        id: `elimination_${Date.now()}`,
        type: 'player_killed',
        timestamp: Date.now(),
        playerId,
        data: { reason: 'eliminated' }
      });

      // Check for winner
      const alivePlayers = get().players.filter(p => p.isAlive);
      if (alivePlayers.length <= 1) {
        get().endCombat(alivePlayers[0]);
      }
    },

    // UI Actions
    setSelectedProjectile: (projectileId: string | null) => {
      set({ selectedProjectile: projectileId });
    },

    updateCamera: (position: { x: number; y: number; zoom: number }) => {
      set({ cameraPosition: position });
    },

    toggleDebugInfo: () => {
      set(state => ({ showDebugInfo: !state.showDebugInfo }));
    },

    updateSettings: (newSettings: Partial<CombatStore['settings']>) => {
      set(state => ({
        settings: { ...state.settings, ...newSettings }
      }));
    },

    // Event Management
    addEvent: (event: CombatEvent) => {
      set(state => ({
        events: [...state.events.slice(-99), event] // Keep last 100 events
      }));
    },

    clearEvents: () => {
      set({ events: [] });
    },

    getEventsByType: (type: string) => {
      return get().events.filter(event => event.type === type);
    },

    // Statistics
    updateStatistics: (stats: Partial<CombatStore['statistics']>) => {
      set(state => ({
        statistics: { ...state.statistics, ...stats }
      }));
    },

    resetStatistics: () => {
      set({
        statistics: {
          totalProjectilesFired: 0,
          totalDamageDealt: 0,
          totalCollisions: 0,
          currentFPS: 60,
          averageFPS: 60,
          peakProjectileCount: 0
        }
      });
    },

    saveMatchResults: (state: CombatState) => {
      // Save match results to unified storage
      const results = {
        players: state.players,
        duration: state.stats.duration,
        winner: state.winner,
        rewards: state.stats
      };
      
      // This would integrate with the unified game store
      console.log('Combat results saved:', results);
    },

    // Utilities
    getPlayer: (playerId: string) => {
      return get().players.find(p => p.id === playerId) || null;
    },

    getCurrentPlayer: () => {
      const { currentPlayerId } = get();
      return currentPlayerId ? get().getPlayer(currentPlayerId) : null;
    },

    getAlivePlayerCount: () => {
      return get().players.filter(p => p.isAlive).length;
    },

    getProjectileCount: () => {
      return get().projectiles.filter(p => p.isActive).length;
    },

    isPlayerAlive: (playerId: string) => {
      const player = get().getPlayer(playerId);
      return player ? player.isAlive : false;
    }
  }))
);

// Selectors for optimized component subscriptions
export const useCombatPlayers = () => useCombatStore(state => state.players);
export const useCombatProjectiles = () => useCombatStore(state => state.projectiles);
export const useCombatPhase = () => useCombatStore(state => state.phase);
export const useCombatTimeRemaining = () => useCombatStore(state => state.timeRemaining);
export const useCombatStatistics = () => useCombatStore(state => state.statistics);
export const useCombatSettings = () => useCombatStore(state => state.settings);
export const useCombatWinner = () => useCombatStore(state => state.winner);

// Action selectors
export const useCombatActions = () => useCombatStore(state => ({
  initializeCombat: state.initializeCombat,
  startCombat: state.startCombat,
  pauseCombat: state.pauseCombat,
  resumeCombat: state.resumeCombat,
  endCombat: state.endCombat,
  resetCombat: state.resetCombat
}));