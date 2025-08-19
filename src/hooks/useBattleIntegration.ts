// Battle Integration Hook - Connects combat system with unified card system

import { useCallback, useEffect, useState } from 'react';
import { useCombatStore } from '../stores/combatStore';
import { useDeckStore } from '../stores/deckStore';
import { useGameStore } from '../stores/gameStore';
import { BattleService } from '../services/BattleService';
import { CombatArena } from '../models/Combat';
import { Deck } from '../models/unified/Deck';

export interface BattleIntegrationConfig {
  playerDeckId?: string;
  opponentDeckId?: string;
  battleType: 'pvp' | 'pve' | 'training';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface BattleResults {
  winner: string;
  duration: number;
  playerStats: {
    damageDealt: number;
    damageReceived: number;
    projectilesFired: number;
    accuracy: number;
    kills: number;
    cards: any[];
  };
  rewards: {
    xp: number;
    coins: number;
    cards?: any[];
  };
}

export const useBattleIntegration = () => {
  const [battleService] = useState(() => new BattleService());
  const [isLoading, setIsLoading] = useState(false);
  const [lastResults, setLastResults] = useState<BattleResults | null>(null);

  // Store access
  const { getDeckById } = useDeckStore();
  const { addXP, addCoins, unlockCard } = useGameStore();

  // Initialize combat with unified decks
  const initializeBattle = useCallback(async (config: BattleIntegrationConfig) => {
    setIsLoading(true);
    
    try {
      const { playerDeckId, opponentDeckId, battleType, difficulty = 'medium' } = config;

      // Get player deck
      let playerDeck = playerDeckId ? getDeckById(playerDeckId) : null;
      if (!playerDeck) {
        const defaultDecks = getDeckById('default');
        playerDeck = defaultDecks || await createDefaultDeck();
      }

      // Get or create opponent deck
      let opponentDeck = opponentDeckId ? getDeckById(opponentDeckId) : null;
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
  }, [getDeckById]);

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
  }, [battleService, initializeBattle]);

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

  // Create default deck if none exists
  const createDefaultDeck = async (): Promise<Deck> => {
    // This would integrate with deck creation system
    const defaultDeck: Deck = {
      id: 'default',
      name: 'Starter Deck',
      cards: [],
      stats: {
        totalHealth: 100,
        totalDamage: 50,
        projectedFireRate: 2.0
      }
    };
    return defaultDeck;
  };

  // Create AI deck based on difficulty
  const createAIDeck = async (difficulty: string): Promise<Deck> => {
    const baseStats = {
      easy: { health: 80, damage: 30, fireRate: 1.5 },
      medium: { health: 100, damage: 50, fireRate: 2.0 },
      hard: { health: 120, damage: 70, fireRate: 2.5 }
    };

    const stats = baseStats[difficulty as keyof typeof baseStats] || baseStats.medium;

    const aiDeck: Deck = {
      id: `ai_${difficulty}_${Date.now()}`,
      name: `AI ${difficulty}`,
      cards: [],
      stats: {
        totalHealth: stats.health,
        totalDamage: stats.damage,
        projectedFireRate: stats.fireRate
      }
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

    // Customize based on battle type
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
      duration: results.duration,
      playerStats: results.playerStats,
      rewards: {
        ...rewards,
        cards: results.playerStats.cards.filter((card: any) => card.rarity === 'rare' || Math.random() < 0.1)
      }
    };
  };

  // Apply rewards to user
  const applyRewards = async (rewards: { xp: number; coins: number; cards?: any[] }) => {
    addXP(rewards.xp);
    addCoins(rewards.coins);
    
    if (rewards.cards) {
      for (const card of rewards.cards) {
        await unlockCard(card);
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
    initializeBattle,
    startBattle,
    getBattleState,
    controlBattle,
    cleanup
  };
};

// Export types for use in components
export type { BattleIntegrationConfig, BattleResults };