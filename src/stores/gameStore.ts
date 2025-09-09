// Game Store - Manages game sessions, matches, and game-specific state
// Focused only on active game state, separated from player progression

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../models';

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameMatch {
  id: string;
  type: 'pvp' | 'pve' | 'practice';
  status: 'waiting' | 'active' | 'completed' | 'disconnected';
  players: {
    id: string;
    username: string;
    deck: Deck;
    health: number;
    maxHealth: number;
  }[];
  startTime?: string;
  endTime?: string;
  winner?: string;
}

export interface GameStore {
  // Current Game Session
  currentMatch: GameMatch | null;
  isInGame: boolean;
  isConnected: boolean;
  
  // Deck Management
  decks: Deck[];
  activeDeck: Deck | null;
  maxDeckSize: number;
  minDeckSize: number;
  
  // Game Settings
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    effectsEnabled: boolean;
    autoSave: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
  };
  
  // Match Actions
  startMatch: (matchData: Partial<GameMatch>) => void;
  endMatch: (result: { winner?: string; reason?: string }) => void;
  updateMatchStatus: (status: GameMatch['status']) => void;
  updatePlayerHealth: (playerId: string, health: number) => void;
  
  // Deck Actions
  createDeck: (name: string, cards?: Card[]) => Deck;
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  deleteDeck: (deckId: string) => void;
  setActiveDeck: (deckId: string) => void;
  addCardToDeck: (deckId: string, card: Card) => boolean;
  removeCardFromDeck: (deckId: string, cardId: string) => void;
  duplicateDeck: (deckId: string, newName: string) => Deck;
  
  // Settings Actions
  updateSettings: (newSettings: Partial<GameStore['settings']>) => void;
  
  // Connection Actions
  setConnectionStatus: (connected: boolean) => void;
  
  // Computed Getters
  getValidDecks: () => Deck[];
  getDeckById: (deckId: string) => Deck | undefined;
  getActiveDeck: () => Deck | null;
  canAddCardToDeck: (deckId: string, card: Card) => boolean;
  
  // Utilities
  reset: () => void;
  resetGameSession: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
        // Initial state
        currentMatch: null,
        isInGame: false,
        isConnected: false,
        decks: [],
        activeDeck: null,
        maxDeckSize: 30,
        minDeckSize: 15,
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          effectsEnabled: true,
          autoSave: true,
          difficulty: 'normal'
        },
        
        // Match Actions
        startMatch: (matchData: Partial<GameMatch>) => {
          const newMatch: GameMatch = {
            id: `match-${Date.now()}`,
            type: 'practice',
            status: 'waiting',
            players: [],
            startTime: new Date().toISOString(),
            ...matchData
          };
          
          set({
            currentMatch: newMatch,
            isInGame: true
          });
        },
        
        endMatch: (result: { winner?: string; reason?: string }) => {
          const state = get();
          if (state.currentMatch) {
            set({
              currentMatch: {
                ...state.currentMatch,
                status: 'completed',
                endTime: new Date().toISOString(),
                winner: result.winner
              },
              isInGame: false
            });
          }
        },
        
        updateMatchStatus: (status: GameMatch['status']) => {
          const state = get();
          if (state.currentMatch) {
            set({
              currentMatch: {
                ...state.currentMatch,
                status
              }
            });
          }
        },
        
        updatePlayerHealth: (playerId: string, health: number) => {
          const state = get();
          if (state.currentMatch) {
            const updatedPlayers = state.currentMatch.players.map(player =>
              player.id === playerId ? { ...player, health } : player
            );
            
            set({
              currentMatch: {
                ...state.currentMatch,
                players: updatedPlayers
              }
            });
          }
        },
        
        // Deck Actions
        createDeck: (name: string, cards: Card[] = []) => {
          const newDeck: Deck = {
            id: `deck-${Date.now()}`,
            name,
            cards,
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const state = get();
          set({
            decks: [...state.decks, newDeck],
            activeDeck: state.decks.length === 0 ? newDeck : state.activeDeck
          });
          
          return newDeck;
        },
        
        updateDeck: (deckId: string, updates: Partial<Deck>) => {
          const state = get();
          const updatedDecks = state.decks.map(deck =>
            deck.id === deckId
              ? { ...deck, ...updates, updatedAt: new Date().toISOString() }
              : deck
          );
          
          set({
            decks: updatedDecks,
            activeDeck: state.activeDeck?.id === deckId
              ? { ...state.activeDeck, ...updates, updatedAt: new Date().toISOString() }
              : state.activeDeck
          });
        },
        
        deleteDeck: (deckId: string) => {
          const state = get();
          const updatedDecks = state.decks.filter(deck => deck.id !== deckId);
          
          set({
            decks: updatedDecks,
            activeDeck: state.activeDeck?.id === deckId
              ? (updatedDecks.length > 0 ? updatedDecks[0] : null)
              : state.activeDeck
          });
        },
        
        setActiveDeck: (deckId: string) => {
          const state = get();
          const deck = state.decks.find(d => d.id === deckId);
          if (deck) {
            set({ activeDeck: deck });
          }
        },
        
        addCardToDeck: (deckId: string, card: Card) => {
          const state = get();
          const deck = state.decks.find(d => d.id === deckId);
          
          if (!deck || deck.cards.length >= state.maxDeckSize) {
            return false;
          }
          
          const updatedDeck = {
            ...deck,
            cards: [...deck.cards, card],
            updatedAt: new Date().toISOString()
          };
          
          get().updateDeck(deckId, updatedDeck);
          return true;
        },
        
        removeCardFromDeck: (deckId: string, cardId: string) => {
          const state = get();
          const deck = state.decks.find(d => d.id === deckId);
          
          if (deck) {
            const updatedCards = deck.cards.filter(card => card.id !== cardId);
            get().updateDeck(deckId, { cards: updatedCards });
          }
        },
        
        duplicateDeck: (deckId: string, newName: string) => {
          const state = get();
          const originalDeck = state.decks.find(d => d.id === deckId);
          
          if (originalDeck) {
            return get().createDeck(newName, [...originalDeck.cards]);
          }
          
          return get().createDeck(newName);
        },
        
        // Settings Actions
        updateSettings: (newSettings: Partial<GameStore['settings']>) => {
          const state = get();
          set({
            settings: { ...state.settings, ...newSettings }
          });
        },
        
        // Connection Actions
        setConnectionStatus: (connected: boolean) => {
          set({ isConnected: connected });
        },
        
        // Computed Getters
        getValidDecks: () => {
          const state = get();
          return state.decks.filter(deck =>
            deck.cards.length >= state.minDeckSize && deck.cards.length <= state.maxDeckSize
          );
        },
        
        getDeckById: (deckId: string) => {
          const state = get();
          return state.decks.find(deck => deck.id === deckId);
        },
        
        getActiveDeck: () => {
          const state = get();
          return state.activeDeck;
        },
        
        canAddCardToDeck: (deckId: string, _card: Card) => {
          const state = get();
          const deck = state.decks.find(d => d.id === deckId);
          return deck ? deck.cards.length < state.maxDeckSize : false;
        },
        
        // Utilities
        reset: () => {
          set({
            currentMatch: null,
            isInGame: false,
            isConnected: false,
            decks: [],
            activeDeck: null,
            settings: {
              soundEnabled: true,
              musicEnabled: true,
              effectsEnabled: true,
              autoSave: true,
              difficulty: 'normal'
            }
          });
        },
        
        resetGameSession: () => {
          set({
            currentMatch: null,
            isInGame: false
          });
        }
      }),
      {
        name: 'game-store',
        partialize: (state) => ({
          // Persist important game data but not temporary session state
          decks: state.decks,
          activeDeck: state.activeDeck,
          maxDeckSize: state.maxDeckSize,
          minDeckSize: state.minDeckSize,
          settings: state.settings,
          // DO NOT persist: currentMatch, isInGame, isConnected (session data)
        })
      }
    )
);