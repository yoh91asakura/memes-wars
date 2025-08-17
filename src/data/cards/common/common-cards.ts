import { Card, CardType } from '@/types/card';

export const commonCards: Card[] = [
  {
    id: 'common-001',
    name: 'Smiling Face',
    rarity: 'common',
    emoji: '😊',
    attack: 2,
    defense: 1,
    cost: 1,
    ability: 'draw_1',
    flavor: 'A friendly face that brings good fortune',
    type: 'creature' as CardType
  },
  {
    id: 'common-002',
    name: 'Rocket',
    rarity: 'common',
    emoji: '🚀',
    attack: 3,
    defense: 0,
    cost: 2,
    ability: 'haste',
    flavor: 'Fast and furious, straight to the target',
    type: 'creature' as CardType
  },
  {
    id: 'common-003',
    name: 'Star',
    rarity: 'common',
    emoji: '🌟',
    attack: 1,
    defense: 2,
    cost: 1,
    ability: 'inspire',
    flavor: 'Shines bright and inspires allies',
    type: 'creature' as CardType
  },
  {
    id: 'common-004',
    name: 'Strong',
    rarity: 'common',
    emoji: '💪',
    attack: 3,
    defense: 1,
    cost: 2,
    ability: 'power',
    flavor: 'Pure muscle power in emoji form',
    type: 'creature' as CardType
  },
  {
    id: 'common-005',
    name: 'Shield',
    rarity: 'common',
    emoji: '🛡️',
    attack: 0,
    defense: 3,
    cost: 1,
    ability: 'protect',
    flavor: 'Stands strong to protect what matters',
    type: 'creature' as CardType
  },
  {
    id: 'common-006',
    name: 'Lightning',
    rarity: 'common',
    emoji: '⚡',
    attack: 2,
    defense: 1,
    cost: 1,
    ability: 'quick',
    flavor: 'Strikes fast and disappears',
    type: 'creature' as CardType
  },
  {
    id: 'common-007',
    name: 'Target',
    rarity: 'common',
    emoji: '🎯',
    attack: 1,
    defense: 1,
    cost: 1,
    ability: 'focus',
    flavor: 'Never misses its mark',
    type: 'creature' as CardType
  },
  {
    id: 'common-008',
    name: 'Heart',
    rarity: 'common',
    emoji: '❤️',
    attack: 1,
    defense: 2,
    cost: 1,
    ability: 'heal_1',
    flavor: 'Heals with the power of love',
    type: 'creature' as CardType
  },
  {
    id: 'common-009',
    name: 'Fire',
    rarity: 'common',
    emoji: '🔥',
    attack: 2,
    defense: 0,
    cost: 1,
    ability: 'burn',
    flavor: 'Burns bright but fragile',
    type: 'creature' as CardType
  },
  {
    id: 'common-010',
    name: 'Ice',
    rarity: 'common',
    emoji: '❄️',
    attack: 1,
    defense: 1,
    cost: 1,
    ability: 'freeze',
    flavor: 'Freezes enemies in their tracks',
    type: 'creature' as CardType
  }
];

export const getCommonCards = () => commonCards;
export const getCommonCardById = (id: string) => 
  commonCards.find(card => card.id === id);
export const getCommonCardsByCost = (cost: number) =>
  commonCards.filter(card => card.cost === cost);
export const getRandomCommonCard = () =>
  commonCards[Math.floor(Math.random() * commonCards.length)];