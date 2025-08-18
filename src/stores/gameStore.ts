import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardService } from '../services/CardService';
import gameConfig from '../../config/game/game.config.json';

// Legacy card type for compatibility with existing stores
type LegacyCard = any;

interface GameStore {
  // Player state
  coins: number;
  gems: number;
  experience: number;
  level: number;
  
  // Collection
  collection: LegacyCard[];
  currentDeck: LegacyCard[];
  
  // Game state
  currentMatch: any | null;
  gameState: any | null;
  
  // Actions
  rollCard: () => Promise<LegacyCard>;
  spendCoins: (amount: number) => Promise<boolean>;
  spendGems: (amount: number) => Promise<boolean>;
  addToCollection: (card: LegacyCard) => void;
  addToDeck: (card: LegacyCard) => boolean;
  removeFromDeck: (cardId: string) => void;
  gainExperience: (amount: number) => void;
  
  // Socket integration methods
  updateGameState: (data: any) => void;
  startMatch: (data: any) => void;
  
  // Utilities
  reset: () => void;
}

const cardService = new CardService();

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      coins: gameConfig.game.startingCoins || 1000,
      gems: gameConfig.game.startingGems || 10,
      experience: 0,
      level: 1,
      collection: [],
      currentDeck: [],
      currentMatch: null,
      gameState: null,
      
      // Roll a new card
      rollCard: async () => {
        const state = get();
        if (state.coins < gameConfig.game.rollCost) {
          throw new Error('Not enough coins');
        }
        
        // Generate a new card
        const newCard = await cardService.generateCard();
        
        // Add to collection (simplified - no stacking for simple cards)
        set(state => ({
          collection: [...state.collection, newCard]
        }));
        
        return newCard;
      },
      
      // Spend coins
      spendCoins: async (amount: number) => {
        const state = get();
        if (state.coins < amount) {
          return false;
        }
        
        set(state => ({
          coins: state.coins - amount
        }));
        
        return true;
      },
      
      // Spend gems
      spendGems: async (amount: number) => {
        const state = get();
        if (state.gems < amount) {
          return false;
        }
        
        set(state => ({
          gems: state.gems - amount
        }));
        
        return true;
      },
      
      // Add card to collection
      addToCollection: (card: LegacyCard) => {
        set(state => ({
          collection: [...state.collection, card]
        }));
      },
      
      // Add card to deck
      addToDeck: (card: LegacyCard) => {
        const state = get();
        if (state.currentDeck.length >= gameConfig.game.maxDeckSize) {
          return false;
        }
        
        // Check if card is already in deck
        if (state.currentDeck.find(c => c.id === card.id)) {
          return false;
        }
        
        set(state => ({
          currentDeck: [...state.currentDeck, card]
        }));
        
        return true;
      },
      
      // Remove card from deck
      removeFromDeck: (cardId: string) => {
        set(state => ({
          currentDeck: state.currentDeck.filter(c => c.id !== cardId)
        }));
      },
      
      // Gain experience
      gainExperience: (amount: number) => {
        set(state => {
          const newExp = state.experience + amount;
          const expNeeded = Math.floor(
            gameConfig.progression.experienceFormula.base * 
            Math.pow(state.level, gameConfig.progression.experienceFormula.multiplier)
          );
          
          if (newExp >= expNeeded) {
            // Level up!
            return {
              experience: newExp - expNeeded,
              level: state.level + 1,
              coins: state.coins + 500, // Bonus coins on level up
            };
          }
          
          return {
            experience: newExp
          };
        });
      },
      
      // Update game state from socket
      updateGameState: (data: any) => {
        set(() => ({
          gameState: data
        }));
      },
      
      // Start a match from socket
      startMatch: (data: any) => {
        set(() => ({
          currentMatch: data
        }));
      },
      
      // Reset game state
      reset: () => {
        set({
          coins: gameConfig.game.startingCoins || 1000,
          gems: gameConfig.game.startingGems || 10,
          experience: 0,
          level: 1,
          collection: [],
          currentDeck: [],
          currentMatch: null,
          gameState: null,
        });
      },
    }),
    {
      name: 'emoji-mayhem-game-state',
      partialize: (state) => ({
        coins: state.coins,
        gems: state.gems,
        experience: state.experience,
        level: state.level,
        collection: state.collection,
        currentDeck: state.currentDeck,
        currentMatch: state.currentMatch,
        gameState: state.gameState,
      }),
    }
  )
);
