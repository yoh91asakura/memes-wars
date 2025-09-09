// Currency Store - Manage game currencies (gold and tickets)
// Integrates with RewardService and RollService for the game economy

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface CurrencyState {
  // Currencies
  gold: number;
  tickets: number;
  gems?: number; // For premium currency
  
  // Transaction history
  transactions: CurrencyTransaction[];
  
  // Daily bonuses
  dailyBonus: {
    lastClaimed: number;
    streak: number;
    nextReward: DailyReward;
  };
  
  // Actions
  addGold: (amount: number, source?: string) => void;
  spendGold: (amount: number, purpose?: string) => boolean;
  addTickets: (amount: number, source?: string) => void;
  spendTickets: (amount: number, purpose?: string) => boolean;
  addGems: (amount: number, source?: string) => void;
  spendGems: (amount: number, purpose?: string) => boolean;
  
  // Roll economy integration
  canAffordRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => boolean;
  getRollCost: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => number;
  purchaseRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => boolean;
  
  // Daily bonus
  canClaimDailyBonus: () => boolean;
  claimDailyBonus: () => DailyReward | null;
  
  // Utilities
  getTotalWealth: () => number;
  getTransactionHistory: (filter?: TransactionFilter) => CurrencyTransaction[];
  resetDaily: () => void;
}

export interface CurrencyTransaction {
  id: string;
  timestamp: number;
  type: 'gain' | 'spend';
  currency: 'gold' | 'tickets' | 'gems';
  amount: number;
  source: string;
  balance: number;
}

export interface DailyReward {
  gold: number;
  tickets: number;
  gems?: number;
  bonus?: string;
}

export interface TransactionFilter {
  currency?: 'gold' | 'tickets' | 'gems';
  type?: 'gain' | 'spend';
  dateRange?: { start: number; end: number };
  source?: string;
}

// Roll costs configuration
const ROLL_COSTS = {
  gold: {
    single: 100,
    ten: 900,    // 10% discount
    hundred: 8000 // 20% discount
  },
  tickets: {
    single: 1,
    ten: 9,      // 10% discount  
    hundred: 80  // 20% discount
  }
};

// Daily rewards progression
const DAILY_REWARDS: DailyReward[] = [
  { gold: 100, tickets: 1 },
  { gold: 150, tickets: 2 },
  { gold: 200, tickets: 3 },
  { gold: 250, tickets: 4 },
  { gold: 300, tickets: 5 },
  { gold: 400, tickets: 7, bonus: 'Free rare card' },
  { gold: 500, tickets: 10, gems: 10, bonus: 'Bonus weekend' }
];

export const useCurrencyStore = create<CurrencyState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        gold: 1000, // Starting gold
        tickets: 5,  // Starting tickets
        gems: 0,
        
        transactions: [],
        
        dailyBonus: {
          lastClaimed: 0,
          streak: 0,
          nextReward: DAILY_REWARDS[0]
        },

        // Currency operations
        addGold: (amount: number, source = 'unknown') => {
          set(state => {
            const newGold = state.gold + amount;
            const transaction: CurrencyTransaction = {
              id: `gold_${Date.now()}_${Math.random()}`,
              timestamp: Date.now(),
              type: 'gain',
              currency: 'gold',
              amount,
              source,
              balance: newGold
            };

            return {
              gold: newGold,
              transactions: [transaction, ...state.transactions].slice(0, 1000) // Keep last 1000
            };
          });
        },

        spendGold: (amount: number, purpose = 'unknown') => {
          const state = get();
          if (state.gold < amount) {
            return false;
          }

          set(currentState => {
            const newGold = currentState.gold - amount;
            const transaction: CurrencyTransaction = {
              id: `gold_${Date.now()}_${Math.random()}`,
              timestamp: Date.now(),
              type: 'spend',
              currency: 'gold',
              amount,
              source: purpose,
              balance: newGold
            };

            return {
              gold: newGold,
              transactions: [transaction, ...currentState.transactions].slice(0, 1000)
            };
          });

          return true;
        },

        addTickets: (amount: number, source = 'unknown') => {
          set(state => {
            const newTickets = state.tickets + amount;
            const transaction: CurrencyTransaction = {
              id: `tickets_${Date.now()}_${Math.random()}`,
              timestamp: Date.now(),
              type: 'gain',
              currency: 'tickets',
              amount,
              source,
              balance: newTickets
            };

            return {
              tickets: newTickets,
              transactions: [transaction, ...state.transactions].slice(0, 1000)
            };
          });
        },

        spendTickets: (amount: number, purpose = 'unknown') => {
          const state = get();
          if (state.tickets < amount) {
            return false;
          }

          set(currentState => {
            const newTickets = currentState.tickets - amount;
            const transaction: CurrencyTransaction = {
              id: `tickets_${Date.now()}_${Math.random()}`,
              timestamp: Date.now(),
              type: 'spend',
              currency: 'tickets',
              amount,
              source: purpose,
              balance: newTickets
            };

            return {
              tickets: newTickets,
              transactions: [transaction, ...currentState.transactions].slice(0, 1000)
            };
          });

          return true;
        },

        addGems: (amount: number, source = 'unknown') => {
          set(state => {
            const newGems = (state.gems || 0) + amount;
            const transaction: CurrencyTransaction = {
              id: `gems_${Date.now()}_${Math.random()}`,
              timestamp: Date.now(),
              type: 'gain',
              currency: 'gems',
              amount,
              source,
              balance: newGems
            };

            return {
              gems: newGems,
              transactions: [transaction, ...state.transactions].slice(0, 1000)
            };
          });
        },

        spendGems: (amount: number, purpose = 'unknown') => {
          const state = get();
          if ((state.gems || 0) < amount) {
            return false;
          }

          set(currentState => {
            const newGems = (currentState.gems || 0) - amount;
            const transaction: CurrencyTransaction = {
              id: `gems_${Date.now()}_${Math.random()}`,
              timestamp: Date.now(),
              type: 'spend',
              currency: 'gems',
              amount,
              source: purpose,
              balance: newGems
            };

            return {
              gems: newGems,
              transactions: [transaction, ...currentState.transactions].slice(0, 1000)
            };
          });

          return true;
        },

        // Roll economy
        canAffordRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => {
          const state = get();
          const cost = ROLL_COSTS[method][type];
          
          if (method === 'gold') {
            return state.gold >= cost;
          } else {
            return state.tickets >= cost;
          }
        },

        getRollCost: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => {
          return ROLL_COSTS[method][type];
        },

        purchaseRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => {
          const cost = ROLL_COSTS[method][type];
          
          if (method === 'gold') {
            return get().spendGold(cost, `Roll (${type})`);
          } else {
            return get().spendTickets(cost, `Roll (${type})`);
          }
        },

        // Daily bonus
        canClaimDailyBonus: () => {
          const state = get();
          const now = Date.now();
          const dayMs = 24 * 60 * 60 * 1000;
          
          return (now - state.dailyBonus.lastClaimed) >= dayMs;
        },

        claimDailyBonus: () => {
          const state = get();
          
          if (!state.canClaimDailyBonus()) {
            return null;
          }

          const now = Date.now();
          const dayMs = 24 * 60 * 60 * 1000;
          const timeDiff = now - state.dailyBonus.lastClaimed;
          
          // Check if streak continues (claimed within 48 hours)
          const streakContinues = timeDiff < (2 * dayMs);
          const newStreak = streakContinues ? state.dailyBonus.streak + 1 : 1;
          
          // Get reward based on streak (cycle through rewards)
          const rewardIndex = Math.min(newStreak - 1, DAILY_REWARDS.length - 1);
          const reward = DAILY_REWARDS[rewardIndex];
          
          // Apply rewards
          get().addGold(reward.gold, 'Daily bonus');
          get().addTickets(reward.tickets, 'Daily bonus');
          if (reward.gems) {
            get().addGems(reward.gems, 'Daily bonus');
          }

          // Update daily bonus state
          set(currentState => ({
            dailyBonus: {
              lastClaimed: now,
              streak: newStreak,
              nextReward: DAILY_REWARDS[Math.min(newStreak, DAILY_REWARDS.length - 1)]
            }
          }));

          return reward;
        },

        // Utilities
        getTotalWealth: () => {
          const state = get();
          // Convert everything to gold equivalent
          return state.gold + (state.tickets * 100) + ((state.gems || 0) * 1000);
        },

        getTransactionHistory: (filter?: TransactionFilter) => {
          const state = get();
          let transactions = state.transactions;

          if (!filter) return transactions;

          if (filter.currency) {
            transactions = transactions.filter(t => t.currency === filter.currency);
          }
          
          if (filter.type) {
            transactions = transactions.filter(t => t.type === filter.type);
          }
          
          if (filter.source) {
            transactions = transactions.filter(t => t.source.includes(filter.source));
          }
          
          if (filter.dateRange) {
            transactions = transactions.filter(t => 
              t.timestamp >= filter.dateRange!.start && 
              t.timestamp <= filter.dateRange!.end
            );
          }

          return transactions;
        },

        resetDaily: () => {
          set(state => ({
            dailyBonus: {
              lastClaimed: 0,
              streak: 0,
              nextReward: DAILY_REWARDS[0]
            }
          }));
        }
      }),
      {
        name: 'currency-store',
        partialize: (state) => ({
          gold: state.gold,
          tickets: state.tickets,
          gems: state.gems,
          transactions: state.transactions.slice(0, 100), // Persist last 100 transactions
          dailyBonus: state.dailyBonus
        })
      }
    )
  )
);

// Selectors
export const useGold = () => useCurrencyStore(state => state.gold);
export const useTickets = () => useCurrencyStore(state => state.tickets);
export const useGems = () => useCurrencyStore(state => state.gems);
export const useDailyBonus = () => useCurrencyStore(state => state.dailyBonus);
export const useCanClaimDaily = () => useCurrencyStore(state => state.canClaimDailyBonus());

// Actions
export const currencyActions = {
  // Direct currency actions
  addGold: (amount: number, source?: string) => 
    useCurrencyStore.getState().addGold(amount, source),
  
  addTickets: (amount: number, source?: string) => 
    useCurrencyStore.getState().addTickets(amount, source),
  
  addGems: (amount: number, source?: string) => 
    useCurrencyStore.getState().addGems(amount, source),

  // Reward distribution
  distributeRewards: (rewards: { gold?: number; tickets?: number; gems?: number }, source: string) => {
    const state = useCurrencyStore.getState();
    if (rewards.gold) state.addGold(rewards.gold, source);
    if (rewards.tickets) state.addTickets(rewards.tickets, source);
    if (rewards.gems) state.addGems(rewards.gems, source);
  },

  // Roll purchases
  purchaseRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') =>
    useCurrencyStore.getState().purchaseRoll(type, method),

  // Daily bonus
  claimDaily: () => useCurrencyStore.getState().claimDailyBonus()
};

export default useCurrencyStore;