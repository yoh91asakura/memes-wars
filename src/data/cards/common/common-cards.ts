import { Card, CardType, CardRarity } from '@/types/Card';

export const commonCards: Card[] = [
  {
    id: 'common-001',
    name: 'Smiling Face',
    rarity: CardRarity.COMMON,
    emoji: '😊',
    attack: 2,
    defense: 1,
    cost: 1,
    ability: 'draw_1',
    flavor: 'A friendly face that brings good fortune',
    type: CardType.CREATURE
  },
  {
    id: 'common-002',
    name: 'Rocket',
    rarity: CardRarity.COMMON,
    emoji: '🚀',
    attack: 3,
    defense: 0,
    cost: 2,
    ability: 'haste',
    flavor: 'Fast and furious, straight to the target',
    type: CardType.CREATURE
  },
  {
    id: 'common-003',
    name: 'Star',
    rarity: CardRarity.COMMON,
    emoji: '🌟',
    attack: 1,
    defense: 2,
    cost: 1,
    ability: 'inspire',
    flavor: 'Shines bright and inspires allies',
    type: CardType.CREATURE
  },
  {
    id: 'common-004',
    name: 'Strong',
    rarity: CardRarity.COMMON,
    emoji: '💪',
    attack: 3,
    defense: 1,
    cost: 2,
    ability: 'power',
    flavor: 'Pure muscle power in emoji form',
    type: CardType.CREATURE
  },
  {
    id: 'common-005',
    name: 'Shield',
    rarity: CardRarity.COMMON,
    emoji: '🛡️',
    attack: 0,
    defense: 3,
    cost: 1,
    ability: 'protect',
    flavor: 'Stands strong to protect what matters',
    type: CardType.CREATURE
  },
  {
    id: 'common-006',
    name: 'Lightning',
    rarity: CardRarity.COMMON,
    emoji: '⚡',
    attack: 2,
    defense: 1,
    cost: 1,
    ability: 'quick',
    flavor: 'Strikes fast and disappears',
    type: CardType.CREATURE
  },
  {
    id: 'common-007',
    name: 'Target',
    rarity: CardRarity.COMMON,
    emoji: '🎯',
    attack: 1,
    defense: 1,
    cost: 1,
    ability: 'focus',
    flavor: 'Never misses its mark',
    type: CardType.CREATURE
  },
  {
    id: 'common-008',
    name: 'Heart',
    rarity: CardRarity.COMMON,
    emoji: '❤️',
    attack: 1,
    defense: 2,
    cost: 1,
    ability: 'heal_1',
    flavor: 'Heals with the power of love',
    type: CardType.CREATURE
  },
  {
    id: 'common-009',
    name: 'Fire',
    rarity: CardRarity.COMMON,
    emoji: '🔥',
    attack: 2,
    defense: 0,
    cost: 1,
    ability: 'burn',
    flavor: 'Burns bright but fragile',
    type: CardType.CREATURE
  },
  {
    id: 'common-010',
    name: 'Ice',
    rarity: CardRarity.COMMON,
    emoji: '❄️',
    attack: 1,
    defense: 1,
    cost: 1,
    ability: 'freeze',
    flavor: 'Freezes enemies in their tracks',
    type: CardType.CREATURE
  }
];

export const getCommonCards = () => commonCards;
export const getCommonCardById = (id: string) => 
  commonCards.find(card => card.id === id);
export const getCommonCardsByCost = (cost: number) =>
  commonCards.filter(card => card.cost === cost);
export const getRandomCommonCard = () =>
  commonCards[Math.floor(Math.random() * commonCards.length)];