// Unified Store Architecture Index
// This file provides the consolidated store architecture with proper separation of concerns

export { usePlayerStore } from './playerStore';
export { useCardsStore } from './cardsStore';
export { useGameStore } from './gameStore';
export { useUIStore } from './uiStore';

// Store types
export type { PlayerStore } from './playerStore';
export type { CardsStore } from './cardsStore';
export type { GameStore } from './gameStore';
export type { UIStore } from './uiStore';

// Combined root store interface for type safety
export interface RootStore {
  player: PlayerStore;
  cards: CardsStore;
  game: GameStore;
  ui: UIStore;
}

// Store middleware and utilities
export { createStoreMiddleware } from './middleware';
export { storeLogger } from './middleware/logger';
export { storePersistence } from './middleware/persistence';
export { storeDebugger } from './middleware/debugger';