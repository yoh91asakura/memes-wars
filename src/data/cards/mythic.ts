import { Card } from '../../types/card';

export const mythicCards: Card[] = [
  {
    id: 'mythic_1',
    name: 'Universe Creator',
    rarity: 'mythic',
    type: 'creature',
    cost: 15,
    attack: 15,
    defense: 15,
    emoji: '✨🌍✨',
    description: 'When played, create a new game rule',
    color: '#FA5252',
    ability: 'Reality Manipulation',
    tags: ['cosmic', 'unique']
  },
  {
    id: 'mythic_2',
    name: 'Omega Protocol',
    rarity: 'mythic',
    type: 'spell',
    cost: 20,
    emoji: '💀⚡💀',
    description: 'Win the game if you have less than 5 health',
    color: '#FA5252',
    effects: ['instant win condition'],
    tags: ['ultimate', 'risky']
  }
];
