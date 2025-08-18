// Unified Store Architecture Index
// This file provides the consolidated store architecture with proper separation of concerns

export { usePlayerStore } from './playerStoreSimple';
export { useCardsStore } from './cardsStore';
export { useGameStore } from './gameStore';
export { useUIStore } from './uiStore';

// Store types
import type { PlayerStore } from './playerStoreSimple';
import type { CardsStore } from './cardsStore';
import type { GameStore } from './gameStore';
import type { UIStore } from './uiStore';

export type { PlayerStore, CardsStore, GameStore, UIStore };

// Combined root store interface for type safety
export interface RootStore {
  player: PlayerStore;
  cards: CardsStore;
  game: GameStore;
  ui: UIStore;
}

// Store middleware and utilities
export { createStoreMiddleware } from './middleware';