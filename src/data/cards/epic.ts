import { Card } from '../../types/card';

export const epicCards: Card[] = [
  {
    id: 'epic_1',
    name: 'Phoenix',
    rarity: 'epic',
    type: 'creature',
    cost: 7,
    attack: 6,
    defense: 4,
    emoji: '🔥🦅',
    description: 'When dies, resurrect with full health next turn',
    color: '#9775FA',
    ability: 'Rebirth',
    tags: ['legendary', 'fire', 'resurrection']
  },
  {
    id: 'epic_2',
    name: 'Black Hole',
    rarity: 'epic',
    type: 'spell',
    cost: 8,
    emoji: '⚫',
    description: 'Destroy all creatures on the board',
    color: '#9775FA',
    effects: ['board wipe'],
    tags: ['cosmic', 'destruction']
  },
  {
    id: 'epic_3',
    name: 'Time Lord',
    rarity: 'epic',
    type: 'creature',
    cost: 6,
    attack: 4,
    defense: 6,
    emoji: '⏰',
    description: 'Battlecry: Take an extra turn after this one',
    color: '#9775FA',
    ability: 'Extra Turn',
    tags: ['time', 'control']
  },
  {
    id: 'epic_4',
    name: 'Infinity Stone',
    rarity: 'epic',
    type: 'support',
    cost: 5,
    emoji: '♾️',
    description: 'Your hand size is unlimited',
    color: '#9775FA',
    effects: ['unlimited hand'],
    tags: ['artifact', 'power']
  }
];
