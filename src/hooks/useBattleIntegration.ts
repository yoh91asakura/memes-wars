// Battle Integration Hook - Connects combat system with unified card system

import { useCallback, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { BattleService } from '../services/BattleService';
import { CombatArena } from '../models/Combat';
import { Deck } from '../stores/gameStore';

export interface BattleIntegrationConfig {
  playerDeckId?: string;
  opponentDeckId?: string;
  battleType: 'pvp' | 'pve' | 'training';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface BattleResults {
  winner: any;
  duration: number;
  playerStats: any;
  rewards: {
    xp: number;
    coins: number;
    cards?: string[];
  };
}

export const useBattleIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResults, setLastResults] = useState<BattleResults | null>(null);
  
  const battleService = new BattleService();

  // Initialize combat with unified decks
  const initializeBattle = useCallback(async (config: BattleIntegrationConfig) => {
    setIsLoading(true);
    
    try {
      const { playerDeckId, opponentDeckId, battleType, difficulty = 'medium' } = config;

      // Get player deck
      let playerDeck: Deck | null = null;
      if (playerDeckId) {
        const gameStore = useGameStore.getState();
        playerDeck = gameStore.decks.find(d => d.id === playerDeckId) || null;
      }

      if (!playerDeck) {
        const gameStore = useGameStore.getState();
        playerDeck = gameStore.activeDeck || gameStore.decks[0] || null;
      }

      // Get or create opponent deck
      let opponentDeck: Deck | null = null;
      if (opponentDeckId) {
        const gameStore = useGameStore.getState();
        opponentDeck = gameStore.decks.find(d => d.id === opponentDeckId) || null;
      }

      if (!opponentDeck) {
        opponentDeck = await createAIDeck(difficulty);
      }

      if (!playerDeck || !opponentDeck) {
        throw new Error('Failed to load decks for battle');
      }

      // Create appropriate arena based on battle type
      const arena = createArenaForBattleType(battleType);

      return { playerDeck, opponentDeck, arena, battleType };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start battle with integration
  const startBattle = useCallback(async (config: BattleIntegrationConfig) => {
    const battleSetup = await initializeBattle(config);
    if (!battleSetup) return null;

    const { playerDeck, opponentDeck, arena, battleType } = battleSetup;

    try {
      const results = await battleService.startBattle({
        playerDeck,
        opponentDeck,
        arena,
        battleType
      });

      // Process results and rewards
      const processedResults = processBattleResults(results, battleType);
      setLastResults(processedResults);

      // Apply rewards
      await applyRewards(processedResults.rewards);

      return processedResults;
    } catch (error) {
      console.error('Battle failed:', error);
      return null;
    }
  }, [initializeBattle, battleService]);

  // Get battle state
  const getBattleState = useCallback(() => {
    return battleService.getBattleState();
  }, [battleService]);

  // Control battle
  const controlBattle = useCallback((action: 'pause' | 'resume' | 'end') => {
    switch (action) {
      case 'pause':
        battleService.pauseBattle();
        break;
      case 'resume':
        battleService.resumeBattle();
        break;
      case 'end':
        battleService.endBattle();
        break;
    }
  }, [battleService]);

  // Create AI deck based on difficulty
  const createAIDeck = async (difficulty: string): Promise<Deck> => {

    const aiDeck: Deck = {
      id: `ai_${difficulty}_${Date.now()}`,
      name: `AI ${difficulty}`,
      cards: [],
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return aiDeck;
  };

  // Create arena for battle type
  const createArenaForBattleType = (battleType: string): CombatArena => {
    const baseArena = {
      id: `${battleType}_arena_${Date.now()}`,
      width: 1200,
      height: 800,
      boundaries: [
        { x: 0, y: 0, width: 1200, height: 20 },
        { x: 0, y: 780, width: 1200, height: 20 },
        { x: 0, y: 0, width: 20, height: 800 },
        { x: 1180, y: 0, width: 20, height: 800 }
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
        roundDuration: 120000,
        suddenDeathTime: 90000
      }
    };

    switch (battleType) {
      case 'pvp':
        return {
          ...baseArena,
          width: 1400,
          height: 900,
          settings: { ...baseArena.settings, roundDuration: 180000 }
        };
      case 'training':
        return {
          ...baseArena,
          settings: { ...baseArena.settings, roundDuration: 60000 }
        };
      default:
        return baseArena;
    }
  };

  // Process battle results
  const processBattleResults = (results: any, battleType: string): BattleResults => {
    const baseRewards = {
      pvp: { xp: 100, coins: 50 },
      pve: { xp: 75, coins: 30 },
      training: { xp: 25, coins: 10 }
    };

    const rewards = baseRewards[battleType as keyof typeof baseRewards] || baseRewards.pve;

    return {
      winner: results.winner,
      duration: results.duration || 0,
      playerStats: results.playerStats || {},
      rewards: {
        ...rewards,
        cards: []
      }
    };
  };

  // Apply rewards to user
  const applyRewards = async (rewards: { xp: number; coins: number; cards?: string[] }) => {
    // TODO: Implement XP and coins storage
    console.log(`Adding ${rewards.xp} XP and ${rewards.coins} coins`);
    
    if (rewards.cards) {
      for (const _cardId of rewards.cards) {
        // Unlock card logic would go here
      }
    }
  };

  // Cleanup
  const cleanup = useCallback(() => {
    battleService.endBattle();
    setLastResults(null);
  }, [battleService]);

  return {
    battleService,
    isLoading,
    lastResults,
    startBattle,
    getBattleState,
    controlBattle,
    cleanup
  };
};