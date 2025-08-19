// Game Logic Hooks - Custom React hooks for game logic

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameStateService } from '../services/GameState';
import { DeckService } from '../services/DeckService';
import { Deck as GameStoreDeck } from '../stores/gameStore';
import { UnifiedCard } from '../models/unified/Card';

// Game State Hook
export function useGame() {
  const gameStateService = useRef<GameStateService | null>(null);
  const deckService = useRef<DeckService | null>(null);

  // Initialize services
  useEffect(() => {
    if (!gameStateService.current) {
      gameStateService.current = new GameStateService();
      deckService.current = new DeckService();
    }

    return () => {
      gameStateService.current?.destroy();
    };
  }, []);

  // Game store selectors
  const {
    currentMatch,
    isInGame,
    isConnected,
    decks,
    activeDeck,
    settings
  } = useGameStore();

  // Game actions
  const {
    startMatch,
    endMatch,
    createDeck,
    setActiveDeck,
    updateSettings
  } = useGameStore();

  // Deck management functions
  const createNewDeck = useCallback(async (name: string, cards: UnifiedCard[] = []) => {
    if (!deckService.current) return null;

    try {
      const deck = deckService.current.createDeck(name, cards);
      deckService.current.saveDeck(deck);
      
      const gameDeck = createDeck(name, cards);
      return gameDeck;
    } catch (error) {
      console.error('Failed to create deck:', error);
      return null;
    }
  }, [createDeck]);

  const validateDeck = useCallback((deck: GameStoreDeck): boolean => {
    if (!deckService.current) return false;
    return deckService.current.validateDeck(deck.cards);
  }, []);

  const loadDeck = useCallback(async (deckId: string): Promise<GameStoreDeck | null> => {
    if (!deckService.current) return null;

    try {
      return deckService.current.loadDeck(deckId);
    } catch (error) {
      console.error('Failed to load deck:', error);
      return null;
    }
  }, []);

  const saveDeck = useCallback(async (deck: GameStoreDeck): Promise<boolean> => {
    if (!deckService.current) return false;

    try {
      deckService.current.saveDeck(deck as any);
      return true;
    } catch (error) {
      console.error('Failed to save deck:', error);
      return false;
    }
  }, []);

  // Game state transitions
  const startPracticeMatch = useCallback(async (playerDeck: GameStoreDeck, opponentDeck?: GameStoreDeck) => {
    if (!gameStateService.current || !validateDeck(playerDeck)) return false;

    // Use a default opponent deck if none provided
    const opponent = opponentDeck || await createDefaultOpponentDeck();
    if (!opponent) return false;

    const matchData = {
      type: 'practice' as const,
      players: [
        {
          id: 'player',
          username: 'You',
          deck: playerDeck,
          health: deckService.current?.calculateTotalHP(playerDeck) || 100,
          maxHealth: deckService.current?.calculateTotalHP(playerDeck) || 100
        },
        {
          id: 'opponent',
          username: 'Opponent',
          deck: opponent,
          health: deckService.current?.calculateTotalHP(opponent) || 100,
          maxHealth: deckService.current?.calculateTotalHP(opponent) || 100
        }
      ]
    };

    startMatch(matchData);
    gameStateService.current.transitionToPhase('combat');
    return true;
  }, [startMatch, validateDeck]);

  const endCurrentMatch = useCallback((result: { winner?: string; reason?: string }) => {
    endMatch(result);
    gameStateService.current?.transitionToPhase('results');
  }, [endMatch]);

  // Helper function to create default opponent deck
  const createDefaultOpponentDeck = useCallback(async (): Promise<GameStoreDeck | null> => {
    if (!deckService.current) return null;

    // This would typically fetch from a pool of AI decks
    // For now, create a simple default deck
    const defaultCards: UnifiedCard[] = []; // Would be populated with actual cards

    return deckService.current.createDeck('AI Opponent', defaultCards);
  }, []);

  // Game settings management
  const updateGameSettings = useCallback((newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
    gameStateService.current?.updateSettings(newSettings as any);
  }, [updateSettings]);

  // Connection status
  const checkConnection = useCallback((): boolean => {
    return isConnected;
  }, [isConnected]);

  return {
    // State
    currentMatch,
    isInGame,
    isConnected,
    decks,
    activeDeck,
    settings,

    // Deck Management
    createNewDeck,
    validateDeck,
    loadDeck,
    saveDeck,
    setActiveDeck,

    // Game Actions
    startPracticeMatch,
    endCurrentMatch,
    updateGameSettings,

    // Utilities
    checkConnection,
    gameStateService: gameStateService.current,
    deckService: deckService.current
  };
}

// Hook for managing game performance
export function useGamePerformance() {
  const performanceMetrics = useRef({
    fps: 0,
    frameTime: 0,
    lastUpdate: 0,
    frameCount: 0
  });

  const updateFPS = useCallback((deltaTime: number) => {
    performanceMetrics.current.frameCount++;
    performanceMetrics.current.frameTime = deltaTime;
    
    const now = performance.now();
    if (now - performanceMetrics.current.lastUpdate >= 1000) {
      performanceMetrics.current.fps = performanceMetrics.current.frameCount;
      performanceMetrics.current.frameCount = 0;
      performanceMetrics.current.lastUpdate = now;
    }
  }, []);

  const getCurrentFPS = useCallback(() => {
    return performanceMetrics.current.fps;
  }, []);

  const getFrameTime = useCallback(() => {
    return performanceMetrics.current.frameTime;
  }, []);

  return {
    updateFPS,
    getCurrentFPS,
    getFrameTime,
    metrics: performanceMetrics.current
  };
}

// Hook for game input handling
export function useGameInput() {
  const keysPressed = useRef<Set<string>>(new Set());
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouseButtons = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.code);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = event.clientX;
      mousePosition.current.y = event.clientY;
    };

    const handleMouseDown = (event: MouseEvent) => {
      mouseButtons.current.add(event.button);
    };

    const handleMouseUp = (event: MouseEvent) => {
      mouseButtons.current.delete(event.button);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const isKeyPressed = useCallback((key: string) => {
    return keysPressed.current.has(key);
  }, []);

  const isMouseButtonPressed = useCallback((button: number) => {
    return mouseButtons.current.has(button);
  }, []);

  const getMousePosition = useCallback(() => {
    return { ...mousePosition.current };
  }, []);

  const clearInput = useCallback(() => {
    keysPressed.current.clear();
    mouseButtons.current.clear();
  }, []);

  return {
    isKeyPressed,
    isMouseButtonPressed,
    getMousePosition,
    clearInput
  };
}

// Hook for game audio management
export function useGameAudio() {
  const audioContext = useRef<AudioContext | null>(null);
  const soundCache = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSounds = useRef<Map<string, AudioBufferSourceNode>>(new Map());

  const { settings } = useGameStore();

  useEffect(() => {
    // Initialize audio context
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      // Stop all active sounds
      activeSounds.current.forEach(sound => {
        sound.stop();
      });
      activeSounds.current.clear();
      
      // Close audio context
      if (audioContext.current?.state !== 'closed') {
        audioContext.current?.close();
      }
    };
  }, []);

  const loadSound = useCallback(async (name: string, url: string): Promise<boolean> => {
    if (!audioContext.current || soundCache.current.has(name)) return true;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      soundCache.current.set(name, audioBuffer);
      return true;
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
      return false;
    }
  }, []);

  const playSound = useCallback((name: string, volume: number = 1, loop: boolean = false) => {
    if (!audioContext.current || !settings.soundEnabled) return null;

    const audioBuffer = soundCache.current.get(name);
    if (!audioBuffer) return null;

    const source = audioContext.current.createBufferSource();
    const gainNode = audioContext.current.createGain();

    source.buffer = audioBuffer;
    source.loop = loop;
    gainNode.gain.value = volume * (settings.soundEnabled ? 0.8 : 0);

    source.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    source.start();
    
    const soundId = `${name}_${Date.now()}`;
    activeSounds.current.set(soundId, source);

    // Clean up when sound ends
    source.onended = () => {
      activeSounds.current.delete(soundId);
    };

    return soundId;
  }, [settings.soundEnabled]);

  const stopSound = useCallback((soundId: string) => {
    const sound = activeSounds.current.get(soundId);
    if (sound) {
      sound.stop();
      activeSounds.current.delete(soundId);
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    activeSounds.current.forEach(sound => {
      sound.stop();
    });
    activeSounds.current.clear();
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    if (audioContext.current) {
      // This would typically be handled by a master gain node
      // For now, we'll update the settings
      useGameStore.getState().updateSettings({ soundEnabled: volume > 0 });
    }
  }, []);

  return {
    loadSound,
    playSound,
    stopSound,
    stopAllSounds,
    setMasterVolume,
    isAudioEnabled: settings.soundEnabled,
    volume: settings.soundEnabled ? 0.8 : 0
  };
}

// Hook for local storage management
export function useGameStorage() {
  const saveToStorage = useCallback(<T>(key: string, data: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }, []);

  const loadFromStorage = useCallback(<T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return defaultValue;
    }
  }, []);

  const removeFromStorage = useCallback((key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from storage:', error);
      return false;
    }
  }, []);

  const clearStorage = useCallback((): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }, []);

  return {
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    clearStorage
  };
}

// Hook for managing game tutorials and tips
export function useGameTutorial() {
  const tutorialState = useRef({
    currentStep: 0,
    isActive: false,
    completedTutorials: new Set<string>()
  });

  const startTutorial = useCallback((_tutorialId: string) => {
    tutorialState.current = {
      currentStep: 0,
      isActive: true,
      completedTutorials: tutorialState.current.completedTutorials
    };
  }, []);

  const nextStep = useCallback(() => {
    tutorialState.current.currentStep++;
  }, []);

  const completeTutorial = useCallback(() => {
    tutorialState.current.isActive = false;
  }, []);

  const skipTutorial = useCallback(() => {
    tutorialState.current.isActive = false;
  }, []);

  const isTutorialCompleted = useCallback(() => {
    return tutorialState.current.completedTutorials.size > 0;
  }, []);

  return {
    tutorialState: tutorialState.current,
    startTutorial,
    nextStep,
    completeTutorial,
    skipTutorial,
    isTutorialCompleted
  };
}