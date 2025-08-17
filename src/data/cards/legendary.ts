import { Card } from '../../types/card';

export const legendaryCards: Card[] = [
  {
    id: 'legendary_1',
    name: 'God Emperor',
    rarity: 'legendary',
    type: 'creature',
    cost: 10,
    attack: 8,
    defense: 8,
    emoji: '⚡👑⚡',
    description: 'Immune. Your other creatures have +3/+3',
    color: '#FD7E14',
    ability: 'Divine Shield, Global Buff',
    tags: ['divine', 'ruler']
  },
  {
    id: 'legendary_2',
    name: 'Reality Bender',
    rarity: 'legendary',
    type: 'spell',
    cost: 9,
    emoji: '🌌',
    description: 'Swap all creatures on the board',
    color: '#FD7E14',
    effects: ['board swap'],
    tags: ['reality', 'chaos']
  },
  {
    id: 'legendary_3',
    name: 'Ancient Dragon Lord',
    rarity: 'legendary',
    type: 'creature',
    cost: 12,
    attack: 10,
    defense: 10,
    emoji: '🐲👑',
    description: 'When played, summon two 5/5 dragons',
    color: '#FD7E14',
    ability: 'Summon Dragons',
    tags: ['dragon', 'summoner']
  }
];
