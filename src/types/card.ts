export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cosmic';
export type CardType = 'spell' | 'attack' | 'defense' | 'healing' | 'support';

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  type: CardType;
  cost: number;
  damage: number;
  description: string;
  emoji: string;
  color: string;
  stats: {
    attack: number;
    defense: number;
    health: number;
  };
  effects: string[];
  tags: string[];
  lore: string;
}

export interface CardFilter {
  rarity?: Rarity;
  cost?: number;
  type?: CardType;
  attack?: number;
  defense?: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  totalCards: number;
  totalCost: number;
}

export interface GameState {
  playerHealth: number;
  opponentHealth: number;
  playerMana: number;
  opponentMana: number;
  playerHand: Card[];
  opponentHand: Card[];
  playerBoard: Card[];
  opponentBoard: Card[];
}