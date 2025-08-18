import type { Card } from '../../components/types';

// Simple placeholder cards for atomic design testing
export const commonCards: Card[] = [
  {
    id: 'common-001',
    name: 'Fire Emoji 🔥',
    description: 'A basic fire emoji card',
    rarity: 'common',
    emoji: '🔥',
    stats: {
      attack: 2,
      defense: 1,
      health: 3
    }
  },
  {
    id: 'common-002',
    name: 'Water Drop 💧',
    description: 'A refreshing water drop',
    rarity: 'common',
    emoji: '💧',
    stats: {
      attack: 1,
      defense: 2,
      health: 3
    }
  }
];
