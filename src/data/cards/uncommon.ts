import { Card } from '../../types/card';

export const uncommonCards: Card[] = [
  {
    id: 'uncommon_1',
    name: 'Fire Blast',
    rarity: 'uncommon',
    type: 'spell',
    cost: 3,
    damage: 4,
    emoji: '🔥',
    description: 'Deal 4 damage and burn for 2 turns',
    color: '#40C057',
    effects: ['damage', 'burn'],
    tags: ['fire', 'damage over time']
  },
  {
    id: 'uncommon_2',
    name: 'Lightning Bolt',
    rarity: 'uncommon',
    type: 'spell',
    cost: 2,
    damage: 3,
    emoji: '⚡',
    description: "Deal 3 damage instantly, can't be blocked",
    color: '#40C057',
    effects: ['damage', 'piercing'],
    tags: ['electric', 'instant']
  },
  {
    id: 'uncommon_3',
    name: 'Shield Bearer',
    rarity: 'uncommon',
    type: 'creature',
    cost: 3,
    attack: 1,
    defense: 6,
    emoji: '🛡️',
    description: 'Taunt. Adjacent emojis get +0/+1',
    color: '#40C057',
    ability: 'Taunt, Adjacent Defense Aura',
    tags: ['defensive', 'aura']
  },
  {
    id: 'uncommon_4',
    name: 'Rocket',
    rarity: 'uncommon',
    type: 'spell',
    cost: 4,
    damage: 5,
    emoji: '🚀',
    description: 'Deal 5 damage to a random enemy',
    color: '#40C057',
    effects: ['damage', 'random target'],
    tags: ['tech', 'explosive']
  },
  {
    id: 'uncommon_5',
    name: 'Unicorn',
    rarity: 'uncommon',
    type: 'creature',
    cost: 4,
    attack: 3,
    defense: 3,
    emoji: '🦄',
    description: 'Magic Immune. Cannot be targeted by spells',
    color: '#40C057',
    ability: 'Magic Immune',
    tags: ['mythical', 'evasive']
  },
  {
    id: 'uncommon_6',
    name: 'Ghost',
    rarity: 'uncommon',
    type: 'creature',
    cost: 3,
    attack: 2,
    defense: 2,
    emoji: '👻',
    description: 'Stealth for 1 turn after played',
    color: '#40C057',
    ability: 'Stealth',
    tags: ['spooky', 'evasive']
  },
  {
    id: 'uncommon_7',
    name: 'Rainbow',
    rarity: 'uncommon',
    type: 'spell',
    cost: 2,
    emoji: '🌈',
    description: 'Draw 2 cards of different rarities',
    color: '#40C057',
    effects: ['draw 2', 'variety'],
    tags: ['magic', 'card draw']
  },
  {
    id: 'uncommon_8',
    name: 'Crystal Ball',
    rarity: 'uncommon',
    type: 'support',
    cost: 3,
    emoji: '🔮',
    description: 'Look at the top 3 cards of your deck',
    color: '#40C057',
    effects: ['scry 3'],
    tags: ['magic', 'prediction']
  }
];
