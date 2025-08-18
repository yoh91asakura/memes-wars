import { Card, CardType, CardRarity } from '@/types/Card';

export const uncommonCards: Card[] = [
  {
    id: 'uncommon-001',
    name: 'Lightning Dragon',
    rarity: CardRarity.UNCOMMON,
    emoji: '⚡🐉',
    attack: 4,
    defense: 2,
    cost: 3,
    ability: 'lightning_strike',
    flavor: 'A swift dragon that strikes with electric fury!',
    type: CardType.CREATURE
  },
  {
    id: 'uncommon-002',
    name: 'Crystal Shield',
    rarity: CardRarity.UNCOMMON,
    emoji: '💎🛡️',
    attack: 0,
    defense: 4,
    cost: 2,
    ability: 'reflect_damage',
    flavor: 'A magical shield that reflects damage back to attackers',
    type: CardType.DEFENSE
  },
  {
    id: 'uncommon-003',
    name: 'Shadow Assassin',
    rarity: CardRarity.UNCOMMON,
    emoji: '🌑🥷',
    attack: 5,
    defense: 1,
    cost: 3,
    ability: 'stealth',
    flavor: 'A stealthy killer that strikes from the shadows',
    type: CardType.CREATURE
  },
  {
    id: 'uncommon-004',
    name: 'Flame Phoenix',
    rarity: CardRarity.UNCOMMON,
    emoji: '🔥🐦',
    attack: 3,
    defense: 2,
    cost: 4,
    ability: 'rebirth',
    flavor: 'A fiery bird that rises stronger from defeat',
    type: CardType.CREATURE
  },
  {
    id: 'uncommon-005',
    name: 'Frost Giant',
    rarity: CardRarity.UNCOMMON,
    emoji: '❄️🗿',
    attack: 4,
    defense: 4,
    cost: 4,
    ability: 'freeze_aura',
    flavor: 'A mighty giant that freezes enemies with every step',
    type: CardType.CREATURE
  },
  {
    id: 'uncommon-006',
    name: 'Poison Cloud',
    rarity: CardRarity.UNCOMMON,
    emoji: '☠️☁️',
    attack: 3,
    defense: 0,
    cost: 3,
    ability: 'poison_aoe',
    flavor: 'A toxic cloud that spreads poison to all enemies',
    type: CardType.SPELL
  },
  {
    id: 'uncommon-007',
    name: 'Healing Spring',
    rarity: CardRarity.UNCOMMON,
    emoji: '💧🌸',
    attack: 0,
    defense: 1,
    cost: 2,
    ability: 'heal_all',
    flavor: 'A magical spring that restores health to allies',
    type: CardType.SUPPORT
  },
  {
    id: "uncommon-008",
    name: "Thunder Hammer",
    rarity: CardRarity.UNCOMMON,
    emoji: "⚡🔨",
    attack: 5,
    defense: 1,
    cost: 3,
    ability: 'lightning_bolt',
    flavor: 'A mighty hammer that calls down lightning strikes',
    type: CardType.ATTACK
  },
  {
    id: 'uncommon-009',
    name: 'Mirror Image',
    rarity: CardRarity.UNCOMMON,
    emoji: '🪞👥',
    attack: 0,
    defense: 2,
    cost: 3,
    ability: 'illusion',
    flavor: 'Creates illusory copies that confuse enemies',
    type: CardType.SPELL
  },
  {
    id: 'uncommon-010',
    name: 'Wind Tornado',
    rarity: CardRarity.UNCOMMON,
    emoji: '🌪️💨',
    attack: 4,
    defense: 0,
    cost: 4,
    ability: 'tornado',
    flavor: 'A powerful tornado that sweeps enemies away',
    type: CardType.SPELL
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