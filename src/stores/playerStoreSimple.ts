// Player Store - Simplified working version
import { create } from 'zustand';
import { CardUtils } from '../models/Card';
import { persist } from 'zustand/middleware';
import gameConfig from '../../config/game/game.config.json';

export interface PlayerStats {
  totalRolls: number;
  rollsSinceRare: number;
  rollsSinceEpic: number;
  rollsSinceLegendary: number;
  rollsSinceMythic: number;
  rollsSinceCosmic: number;
  collectedByRarity: Record<string, number>;
}

export interface PlayerStore {
  // Player Economy
  coins: number;
  gems: number;
  
  // Player Progression
  experience: number;
  level: number;
  
  // Player Statistics
  stats: PlayerStats;
  
  // Economy Actions
  spendCoins: (amount: number) => Promise<boolean>;
  addCoins: (amount: number) => void;
  spendGems: (amount: number) => Promise<boolean>;
  addGems: (amount: number) => void;
  
  // Progression Actions
  gainExperience: (amount: number) => void;
  
  // Statistics Actions
  updateStats: (stats: Partial<PlayerStats>) => void;
  incrementRollCount: () => void;
  resetPityCounter: (rarity: string) => void;
  
  // Utilities
  canAfford: (cost: number, currency: 'coins' | 'gems') => boolean;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      coins: gameConfig.game?.startingCoins || 1000,
      gems: gameConfig.game?.startingGems || 10,
      experience: 0,
      level: 1,
      stats: {
        totalRolls: 0,
        rollsSinceRare: 0,
        rollsSinceEpic: 0,
        rollsSinceLegendary: 0,
        rollsSinceMythic: 0,
        rollsSinceCosmic: 0,
        collectedByRarity: {
          common: 0,
          uncommon: 0,
          rare: 0,
          epic: 0,
          legendary: 0,
          mythic: 0,
          cosmic: 0
        }
      },
      
      // Economy Actions
      spendCoins: async (amount: number) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },
      
      addCoins: (amount: number) => {
        const state = get();
        set({ coins: state.coins + amount });
      },
      
      spendGems: async (amount: number) => {
        const state = get();
        if (state.gems >= amount) {
          set({ gems: state.gems - amount });
          return true;
        }
        return false;
      },
      
      addGems: (amount: number) => {
        const state = get();
        set({ gems: state.gems + amount });
      },
      
      // Progression Actions
      gainExperience: (amount: number) => {
        const state = get();
        const newExp = state.experience + amount;
        const expForNextLevel = 100 * Math.pow(1.2, state.level);
        
        if (newExp >= expForNextLevel) {
          // Level up
          set({ 
            level: state.level + 1,
            experience: 0,
            coins: state.coins + (state.level * 100)
          });
        } else {
          set({ experience: newExp });
        }
      },
      
      // Statistics Actions
      updateStats: (newStats: Partial<PlayerStats>) => {
        const state = get();
        set({ 
          stats: { ...state.stats, ...newStats }
        });
      },
      
      incrementRollCount: () => {
        const state = get();
        set({
          stats: {
            ...state.stats,
            totalRolls: state.stats.totalRolls + 1,
            rollsSinceRare: state.stats.rollsSinceRare + 1,
            rollsSinceEpic: state.stats.rollsSinceEpic + 1,
            rollsSinceLegendary: state.stats.rollsSinceLegendary + 1,
            rollsSinceMythic: state.stats.rollsSinceMythic + 1,
            rollsSinceCosmic: state.stats.rollsSinceCosmic + 1
          }
        });
      },
      
      resetPityCounter: (rarity: string) => {
        const state = get();
        const newStats = { ...state.stats };
        
        switch (typeof rarity === 'string' ? rarity.toLowerCase() : CardUtils.getRarityName(rarity).toLowerCase()) {
          case 'rare':
            newStats.rollsSinceRare = 0;
            break;
          case 'epic':
            newStats.rollsSinceEpic = 0;
            newStats.rollsSinceRare = 0;
            break;
          case 'legendary':
            newStats.rollsSinceLegendary = 0;
            newStats.rollsSinceEpic = 0;
            newStats.rollsSinceRare = 0;
            break;
          case 'mythic':
            newStats.rollsSinceMythic = 0;
            newStats.rollsSinceLegendary = 0;
            newStats.rollsSinceEpic = 0;
            newStats.rollsSinceRare = 0;
            break;
          case 'cosmic':
            newStats.rollsSinceCosmic = 0;
            newStats.rollsSinceMythic = 0;
            newStats.rollsSinceLegendary = 0;
            newStats.rollsSinceEpic = 0;
            newStats.rollsSinceRare = 0;
            break;
        }
        
        set({ stats: newStats });
      },
      
      // Utilities
      canAfford: (cost: number, currency: 'coins' | 'gems') => {
        const state = get();
        return currency === 'coins' ? state.coins >= cost : state.gems >= cost;
      },
      
      reset: () => {
        set({
          coins: gameConfig.game?.startingCoins || 1000,
          gems: gameConfig.game?.startingGems || 10,
          experience: 0,
          level: 1,
          stats: {
            totalRolls: 0,
            rollsSinceRare: 0,
            rollsSinceEpic: 0,
            rollsSinceLegendary: 0,
            rollsSinceMythic: 0,
            rollsSinceCosmic: 0,
            collectedByRarity: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              legendary: 0,
              mythic: 0,
              cosmic: 0
            }
          }
        });
      }
    }),
    {
      name: 'player-store'
    }
  )
);