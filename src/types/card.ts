export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cosmic';
export type CardType = 'creature' | 'spell' | 'artifact';

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  emoji: string;
  attack: number;
  defense: number;
  cost: number;
  ability: string;
  flavor: string;
  type: CardType;
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