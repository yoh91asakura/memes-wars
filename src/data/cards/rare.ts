import { Card } from '../../types/card';

export const rareCards: Card[] = [
  {
    id: 'rare_1',
    name: 'Dragon',
    rarity: 'rare',
    type: 'creature',
    cost: 6,
    attack: 5,
    defense: 5,
    emoji: '🐉',
    description: 'Flying. Battlecry: Deal 3 damage to all enemies',
    color: '#339AF0',
    ability: 'Flying, AOE Damage',
    tags: ['mythical', 'powerful']
  },
  {
    id: 'rare_2',
    name: 'Diamond',
    rarity: 'rare',
    type: 'support',
    cost: 5,
    emoji: '💎',
    description: 'Double your mana for next turn',
    color: '#339AF0',
    effects: ['mana doubling'],
    tags: ['resource', 'powerful']
  },
  {
    id: 'rare_3',
    name: 'Skull',
    rarity: 'rare',
    type: 'spell',
    cost: 4,
    emoji: '💀',
    description: 'Destroy a random enemy creature',
    color: '#339AF0',
    effects: ['destroy', 'random'],
    tags: ['death', 'removal']
  },
  {
    id: 'rare_4',
    name: 'Crown',
    rarity: 'rare',
    type: 'support',
    cost: 3,
    emoji: '👑',
    description: 'Your creatures get +2/+2',
    color: '#339AF0',
    effects: ['mass buff', 'permanent'],
    tags: ['royal', 'enhancement']
  },
  {
    id: 'rare_5',
    name: 'Explosion',
    rarity: 'rare',
    type: 'spell',
    cost: 5,
    damage: 4,
    emoji: '💥',
    description: 'Deal 4 damage to all enemies',
    color: '#339AF0',
    effects: ['AOE damage'],
    tags: ['explosive', 'board clear']
  },
  {
    id: 'rare_6',
    name: 'Wizard',
    rarity: 'rare',
    type: 'creature',
    cost: 4,
    attack: 3,
    defense: 4,
    emoji: '🧙',
    description: 'Spell Damage +2',
    color: '#339AF0',
    ability: 'Spell Power',
    tags: ['magic', 'synergy']
  }
];
