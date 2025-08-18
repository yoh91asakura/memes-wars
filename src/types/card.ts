import { CardEmojiData } from './emoji';

// Types pour correspondre au backend Prisma
export enum CardRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  COSMIC = 'COSMIC',
}

export enum CardType {
  CREATURE = 'CREATURE',
  SPELL = 'SPELL',
  ARTIFACT = 'ARTIFACT',
}

// Alias pour la compatibilité
export type Rarity = CardRarity;
export { CardType as Type };

export interface Card {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: CardRarity;
  type: CardType;
  cost: number;
  attack: number;
  defense: number;
  health: number;
  attackSpeed: number;
  color: string;
  effects: string[];
  tags: string[];
  flavor?: string;
  lore?: string;
  craftable: boolean;
  craftCost?: number;
  isActive: boolean;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Fields pour la compatibilité avec l'ancien système
  damage?: number;
  ability?: string;
  emojis?: string[];
  emojiData?: CardEmojiData;
  stats?: {
    attack: number;
    defense: number;
    health: number;
  };
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