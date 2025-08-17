import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RollService, RollResult, RollStats, MultiRollResult } from '../services/RollService';
import { Card } from '../types/card';
import rollConfig from '../../config/game/roll.config.json';

interface RollHistory {
  id: string;
  timestamp: number;
  cards: RollResult[];
  type: 'single' | 'ten' | 'hundred';
  cost: number;
}

interface RollStore {
  // Roll statistics
  stats: RollStats;
  
  // Roll history
  history: RollHistory[];
  maxHistorySize: number;
  
  // Current roll state
  isRolling: boolean;
  currentRoll: RollResult | null;
  animationQueue: RollResult[];
  
  // Achievements
  achievements: Record<string, boolean>;
  
  // Actions
  performSingleRoll: () => Promise<RollResult>;
  performTenRoll: () => Promise<MultiRollResult>;
  performHundredRoll: () => Promise<MultiRollResult>;
  
  // Animation control
  startRollAnimation: (result: RollResult) => void;
  completeRollAnimation: () => void;
  skipAnimation: () => void;
  
  // History management
  addToHistory: (roll: RollHistory) => void;
  clearHistory: () => void;
  
  // Statistics
  updateStats: (newStats: RollStats) => void;
  resetStats: () => void;
  getTotalValue: () => number;
  getRarityDistribution: () => Record<string, number>;
  
  // Achievements
  checkAchievements: () => void;
  unlockAchievement: (id: string) => void;
  
  // Utilities
  canAffordRoll: (type: 'single' | 'ten' | 'hundred', coins: number) => boolean;
  getRollCost: (type: 'single' | 'ten' | 'hundred') => number;
  getPityProgress: () => Record<string, { current: number; max: number; percentage: number }>;
}

const rollService = RollService.getInstance();

const initialStats: RollStats = {
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
};

export const useRollStore = create<RollStore>()(
  persist(
    (set, get) => ({
      // Initial state
      stats: initialStats,
      history: [],
      maxHistorySize: 50,
      isRolling: false,
      currentRoll: null,
      animationQueue: [],
      achievements: {},
      
      // Perform single roll
      performSingleRoll: async () => {
        const state = get();
        if (state.isRolling) {
          throw new Error('Roll already in progress');
        }
        
        set({ isRolling: true });
        
        try {
          const result = rollService.rollSingle(state.stats);
          const newStats = updateStatsAfterRoll(state.stats, result.card.rarity);
          
          // Add to history
          const historyEntry: RollHistory = {
            id: `single_${Date.now()}`,
            timestamp: Date.now(),
            cards: [result],
            type: 'single',
            cost: rollConfig.rollCosts.single
          };
          
          set(state => ({
            stats: newStats,
            currentRoll: result,
            history: [historyEntry, ...state.history].slice(0, state.maxHistorySize)
          }));
          
          // Check achievements
          get().checkAchievements();
          
          return result;
        } finally {
          // Animation will complete separately
        }
      },
      
      // Perform ten roll
      performTenRoll: async () => {
        const state = get();
        if (state.isRolling) {
          throw new Error('Roll already in progress');
        }
        
        set({ isRolling: true });
        
        try {
          const result = rollService.rollTen(state.stats);
          let newStats = { ...state.stats };
          
          // Update stats for each card
          result.cards.forEach(rollResult => {
            newStats = updateStatsAfterRoll(newStats, rollResult.card.rarity);
          });
          
          // Add to history
          const historyEntry: RollHistory = {
            id: `ten_${Date.now()}`,
            timestamp: Date.now(),
            cards: result.cards,
            type: 'ten',
            cost: rollConfig.rollCosts.ten
          };
          
          set(state => ({
            stats: newStats,
            animationQueue: result.cards,
            history: [historyEntry, ...state.history].slice(0, state.maxHistorySize)
          }));
          
          // Check achievements
          get().checkAchievements();
          
          return result;
        } finally {
          // Animation will complete separately
        }
      },
      
      // Perform hundred roll
      performHundredRoll: async () => {
        const state = get();
        if (state.isRolling) {
          throw new Error('Roll already in progress');
        }
        
        set({ isRolling: true });
        
        try {
          // Perform 10 ten-rolls for hundred roll
          const allCards: RollResult[] = [];
          let newStats = { ...state.stats };
          
          for (let i = 0; i < 10; i++) {
            const tenRollResult = rollService.rollTen(newStats);
            allCards.push(...tenRollResult.cards);
            
            // Update stats
            tenRollResult.cards.forEach(rollResult => {
              newStats = updateStatsAfterRoll(newStats, rollResult.card.rarity);
            });
          }
          
          const result: MultiRollResult = {
            cards: allCards,
            guaranteedTriggered: true, // Hundred roll always has guarantees
            bonusCards: [],
            totalValue: allCards.reduce((sum, r) => sum + getCardValue(r.card), 0)
          };
          
          // Add to history
          const historyEntry: RollHistory = {
            id: `hundred_${Date.now()}`,
            timestamp: Date.now(),
            cards: result.cards,
            type: 'hundred',
            cost: rollConfig.rollCosts.hundred
          };
          
          set(state => ({
            stats: newStats,
            animationQueue: result.cards,
            history: [historyEntry, ...state.history].slice(0, state.maxHistorySize)
          }));
          
          // Check achievements
          get().checkAchievements();
          
          return result;
        } finally {
          // Animation will complete separately
        }
      },
      
      // Animation control
      startRollAnimation: (result: RollResult) => {
        set({ currentRoll: result });
      },
      
      completeRollAnimation: () => {
        set({ 
          isRolling: false, 
          currentRoll: null,
          animationQueue: []
        });
      },
      
      skipAnimation: () => {
        set({ 
          isRolling: false, 
          currentRoll: null,
          animationQueue: []
        });
      },
      
      // History management
      addToHistory: (roll: RollHistory) => {
        set(state => ({
          history: [roll, ...state.history].slice(0, state.maxHistorySize)
        }));
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      // Statistics
      updateStats: (newStats: RollStats) => {
        set({ stats: newStats });
      },
      
      resetStats: () => {
        set({ 
          stats: initialStats,
          history: [],
          achievements: {}
        });
      },
      
      getTotalValue: () => {
        const state = get();
        return state.history.reduce((total, entry) => {
          return total + entry.cards.reduce((entryTotal, result) => {
            return entryTotal + getCardValue(result.card);
          }, 0);
        }, 0);
      },
      
      getRarityDistribution: () => {
        const state = get();
        return state.stats.collectedByRarity;
      },
      
      // Achievements
      checkAchievements: () => {
        const state = get();
        const { stats, achievements } = state;
        const newAchievements = { ...achievements };
        
        // Roll count achievements
        rollConfig.achievementTriggers.rollCounts.forEach(count => {
          const achievementId = `rolls_${count}`;
          if (stats.totalRolls >= count && !achievements[achievementId]) {
            newAchievements[achievementId] = true;
          }
        });
        
        // Collection achievements
        const totalCollected = Object.values(stats.collectedByRarity).reduce((sum, count) => sum + count, 0);
        rollConfig.achievementTriggers.collectionMilestones.forEach(milestone => {
          const achievementId = `collection_${milestone}`;
          if (totalCollected >= milestone && !achievements[achievementId]) {
            newAchievements[achievementId] = true;
          }
        });
        
        // First rarity achievements
        Object.entries(rollConfig.achievementTriggers.rarityCollected).forEach(([rarity, reward]) => {
          const rarityKey = rarity.replace('first', '').toLowerCase();
          const achievementId = `first_${rarityKey}`;
          if (stats.collectedByRarity[rarityKey] > 0 && !achievements[achievementId]) {
            newAchievements[achievementId] = true;
          }
        });
        
        if (Object.keys(newAchievements).length > Object.keys(achievements).length) {
          set({ achievements: newAchievements });
        }
      },
      
      unlockAchievement: (id: string) => {
        set(state => ({
          achievements: { ...state.achievements, [id]: true }
        }));
      },
      
      // Utilities
      canAffordRoll: (type: 'single' | 'ten' | 'hundred', coins: number) => {
        const cost = get().getRollCost(type);
        return coins >= cost;
      },
      
      getRollCost: (type: 'single' | 'ten' | 'hundred') => {
        return rollConfig.rollCosts[type];
      },
      
      getPityProgress: () => {
        const state = get();
        return rollService.getPityInfo(state.stats);
      }
    }),
    {
      name: 'emoji-mayhem-roll-state',
      partialize: (state) => ({
        stats: state.stats,
        history: state.history,
        achievements: state.achievements
      })
    }
  )
);

// Helper functions
function updateStatsAfterRoll(stats: RollStats, rarity: string): RollStats {
  const newStats = { ...stats };
  newStats.totalRolls += 1;
  
  // Reset counters for obtained rarity and higher
  switch (rarity) {
    case 'cosmic':
      newStats.rollsSinceCosmic = 0;
      newStats.rollsSinceMythic = 0;
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
    case 'legendary':
      newStats.rollsSinceLegendary = 0;
      newStats.rollsSinceEpic = 0;
      newStats.rollsSinceRare = 0;
      break;
    case 'epic':
      newStats.rollsSinceEpic = 0;
      newStats.rollsSinceRare = 0;
      break;
    case 'rare':
      newStats.rollsSinceRare = 0;
      break;
    default:
      // Increment all counters for common/uncommon
      newStats.rollsSinceRare += 1;
      newStats.rollsSinceEpic += 1;
      newStats.rollsSinceLegendary += 1;
      newStats.rollsSinceMythic += 1;
      newStats.rollsSinceCosmic += 1;
  }

  // Update collection stats
  newStats.collectedByRarity[rarity] = (newStats.collectedByRarity[rarity] || 0) + 1;

  return newStats;
}

function getCardValue(card: Card): number {
  const rarityValues = {
    common: 1,
    uncommon: 5,
    rare: 25,
    epic: 100,
    legendary: 500,
    mythic: 2500,
    cosmic: 10000
  };
  
  return rarityValues[card.rarity as keyof typeof rarityValues] || 1;
}