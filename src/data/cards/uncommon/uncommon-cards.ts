import { Card, CardType } from '@/types/card';

export const uncommonCards: Card[] = [
  {
    id: 'uncommon-001',
    name: 'Lightning Dragon',
    rarity: 'uncommon',
    emoji: '⚡🐉',
    attack: 4,
    defense: 2,
    cost: 3,
    ability: 'lightning_strike',
    flavor: 'A swift dragon that strikes with electric fury!',
    type: 'creature' as CardType
  },
  {
    id: 'uncommon-002',
    name: 'Crystal Shield',
    rarity: 'uncommon',
    emoji: '💎🛡️',
    attack: 0,
    defense: 4,
    cost: 2,
    ability: 'reflect_damage',
    flavor: 'A magical shield that reflects damage back to attackers',
    type: 'defense' as CardType
  },
  {
    id: 'uncommon-003',
    name: 'Shadow Assassin',
    rarity: 'uncommon',
    emoji: '🌑🥷',
    attack: 5,
    defense: 1,
    cost: 3,
    ability: 'stealth',
    flavor: 'A stealthy killer that strikes from the shadows',
    type: 'creature' as CardType
  },
  {
    id: 'uncommon-004',
    name: 'Flame Phoenix',
    rarity: 'uncommon',
    emoji: '🔥🐦',
    attack: 3,
    defense: 2,
    cost: 4,
    ability: 'rebirth',
    flavor: 'A fiery bird that rises stronger from defeat',
    type: 'creature' as CardType
  },
  {
    id: 'uncommon-005',
    name: 'Frost Giant',
    rarity: 'uncommon',
    emoji: '❄️🗿',
    attack: 4,
    defense: 4,
    cost: 4,
    ability: 'freeze_aura',
    flavor: 'A mighty giant that freezes enemies with every step',
    type: 'creature' as CardType
  },
  {
    id: 'uncommon-006',
    name: 'Poison Cloud',
    rarity: 'uncommon',
    emoji: '☠️☁️',
    attack: 3,
    defense: 0,
    cost: 3,
    ability: 'poison_aoe',
    flavor: 'A toxic cloud that spreads poison to all enemies',
    type: 'spell' as CardType
  },
  {
    id: 'uncommon-007',
    name: 'Healing Spring',
    rarity: 'uncommon',
    emoji: '💧🌸',
    attack: 0,
    defense: 1,
    cost: 2,
    ability: 'heal_all',
    flavor: 'A magical spring that restores health to allies',
    type: 'support' as CardType
  },
  {
    id: "uncommon-008",
    name: "Thunder Hammer",
    rarity: "uncommon",
    emoji: "⚡🔨",
    attack: 5,
    defense: 1,
    cost: 3,
    ability: 'lightning_bolt',
    flavor: 'A mighty hammer that calls down lightning strikes',
    type: 'attack' as CardType
  },
  {
    id: 'uncommon-009',
    name: 'Mirror Image',
    rarity: 'uncommon',
    emoji: '🪞👥',
    attack: 0,
    defense: 2,
    cost: 3,
    ability: 'illusion',
    flavor: 'Creates illusory copies that confuse enemies',
    type: 'spell' as CardType
  },
  {
    id: 'uncommon-010',
    name: 'Wind Tornado',
    rarity: 'uncommon',
    emoji: '🌪️💨',
    attack: 4,
    defense: 0,
    cost: 4,
    ability: 'tornado',
    flavor: 'A powerful tornado that sweeps enemies away',
    type: 'spell' as CardType
  }
];

export const getUncommonCards = () => uncommonCards;
export const getUncommonCardById = (id: string) => 
  uncommonCards.find(card => card.id === id);
export const getUncommonCardsByCost = (cost: number) =>
  uncommonCards.filter(card => card.cost === cost);
export const getRandomUncommonCard = () =>
  uncommonCards[Math.floor(Math.random() * uncommonCards.length)];
export const getUncommonCardsByType = (type: Card['type']) =>
  uncommonCards.filter(card => card.type === type);