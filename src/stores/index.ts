// Unified Store Architecture Index
// This file provides the consolidated store architecture with proper separation of concerns

export { usePlayerStore } from './playerStoreSimple';
export { useCardsStore } from './cardsStore';
export { useCraftStore } from './craftStore';
export { useGameStore } from './gameStore';
export { useUIStore } from './uiStore';

// Currency Store - Primary currency system
export { 
  useCurrencyStore, 
  useGold, 
  useTickets, 
  useGems,
  currencyActions
} from './currencyStore';

// Store types
import type { PlayerStore } from './playerStoreSimple';
import type { CardsStore } from './cardsStore';
import type { CraftStore } from './craftStore';
import type { GameStore } from './gameStore';
import type { UIStore } from './uiStore';
import type { CurrencyState } from './currencyStore';

export type { PlayerStore, CardsStore, CraftStore, GameStore, UIStore, CurrencyState };

// Combined root store interface for type safety
export interface RootStore {
  player: PlayerStore;
  cards: CardsStore;
  craft: CraftStore;
  game: GameStore;
  ui: UIStore;
}

// Store middleware and utilities
export { createStoreMiddleware } from './middleware';