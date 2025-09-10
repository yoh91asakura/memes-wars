/**
 * Test data fixtures for E2E tests
 */

import type { Card } from '../../src/models/Card';
import type { CardCollection } from '../../src/models/CardCollection';
import type { CardFilter } from '../../src/models/CardFilter';

export const MOCK_PLAYER_ID = 'test-player-e2e';
export const MOCK_COLLECTION_ID = 'test-collection-e2e';

// Sample cards for testing
export const sampleCards: Card[] = [
  {
    id: 'fire-dragon-001',
    name: 'Ancient Fire Dragon',
    description: 'A mighty dragon that breathes scorching flames',
    image: '/images/cards/fire-dragon.png',
    rarity: 200, // Legendary
    luck: 850,
    cost: 8,
    hp: 300,
    attack: 150,
    defense: 100,
    abilities: ['Flying', 'Fire Breath', 'Intimidate'],
    family: 'Dragon',
    type: 'Creature',
    createdAt: '2025-01-01T00:00:00Z',
    stackLevel: 1,
    goldReward: 50
  },
  {
    id: 'water-phoenix-002',
    name: 'Azure Phoenix',
    description: 'A mystical phoenix with power over water',
    image: '/images/cards/water-phoenix.png',
    rarity: 50, // Epic
    luck: 650,
    cost: 6,
    hp: 200,
    attack: 120,
    defense: 80,
    abilities: ['Flying', 'Regenerate', 'Water Shield'],
    family: 'Phoenix',
    type: 'Creature',
    createdAt: '2025-01-01T01:00:00Z',
    stackLevel: 1,
    goldReward: 30
  },
  {
    id: 'shadow-spell-003',
    name: 'Shadow Bolt',
    description: 'A dark spell that strikes with shadow energy',
    image: '/images/cards/shadow-bolt.png',
    rarity: 10, // Rare
    luck: 400,
    cost: 3,
    hp: 0,
    attack: 80,
    defense: 0,
    abilities: ['Instant', 'Shadow Damage', 'Piercing'],
    family: 'Shadow',
    type: 'Spell',
    createdAt: '2025-01-01T02:00:00Z',
    stackLevel: 1,
    goldReward: 15
  },
  {
    id: 'earth-golem-004',
    name: 'Stone Golem',
    description: 'A massive construct made of living stone',
    image: '/images/cards/stone-golem.png',
    rarity: 4, // Uncommon
    luck: 200,
    cost: 5,
    hp: 250,
    attack: 80,
    defense: 120,
    abilities: ['Defender', 'Stone Skin', 'Earthquake'],
    family: 'Earth',
    type: 'Creature',
    createdAt: '2025-01-01T03:00:00Z',
    stackLevel: 1,
    goldReward: 20
  },
  {
    id: 'light-heal-005',
    name: 'Divine Healing',
    description: 'A sacred spell that restores health',
    image: '/images/cards/divine-healing.png',
    rarity: 2, // Common
    luck: 150,
    cost: 2,
    hp: 0,
    attack: 0,
    defense: 0,
    abilities: ['Instant', 'Heal', 'Holy'],
    family: 'Light',
    type: 'Spell',
    createdAt: '2025-01-01T04:00:00Z',
    stackLevel: 1,
    goldReward: 10
  }
];

// Generate large collection for performance testing
export function generateLargeCardCollection(size: number): Card[] {
  const baseNames = [
    'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Sphinx', 'Kraken', 'Leviathan',
    'Behemoth', 'Chimera', 'Hydra', 'Basilisk', 'Wyvern', 'Manticore', 'Cerberus'
  ];
  
  const adjectives = [
    'Ancient', 'Mighty', 'Fierce', 'Noble', 'Dark', 'Light', 'Fire', 'Ice',
    'Storm', 'Earth', 'Shadow', 'Golden', 'Silver', 'Crimson', 'Azure', 'Jade'
  ];
  
  const rarities = [2, 4, 10, 50, 200, 1000]; // Common to Mythic
  const families = ['Fire', 'Water', 'Earth', 'Air', 'Dark', 'Light', 'Neutral'];
  const types = ['Creature', 'Spell', 'Artifact', 'Enchantment'];
  
  const abilities = [
    'Flying', 'Trample', 'First Strike', 'Deathtouch', 'Lifelink', 'Vigilance',
    'Haste', 'Reach', 'Hexproof', 'Indestructible', 'Regenerate', 'Flash'
  ];

  const cards: Card[] = [];

  for (let i = 0; i < size; i++) {
    const baseName = baseNames[i % baseNames.length];
    const adjective = adjectives[i % adjectives.length];
    const cardName = `${adjective} ${baseName}`;
    
    cards.push({
      id: `generated-card-${i.toString().padStart(6, '0')}`,
      name: cardName,
      description: `A ${adjective.toLowerCase()} ${baseName.toLowerCase()} with mysterious powers. Generated card #${i}.`,
      image: `/images/cards/generated-${i}.png`,
      rarity: rarities[i % rarities.length],
      luck: (i % 1000) + 1,
      cost: (i % 15) + 1,
      hp: (i % 500) + 50,
      attack: (i % 200) + 10,
      defense: (i % 150) + 5,
      abilities: [
        abilities[i % abilities.length],
        abilities[(i + 1) % abilities.length]
      ].filter((ability, index, arr) => arr.indexOf(ability) === index), // Remove duplicates
      family: families[i % families.length],
      type: types[i % types.length],
      createdAt: new Date(Date.now() - (i * 60000)).toISOString(), // Cards created 1 minute apart
      stackLevel: (i % 10) + 1,
      goldReward: Math.floor((i % 100) + 10)
    });
  }

  return cards;
}

// Mock collection for testing
export const mockCardCollection: CardCollection = {
  playerId: MOCK_PLAYER_ID,
  collectionId: MOCK_COLLECTION_ID,
  cards: [...sampleCards, ...generateLargeCardCollection(242)], // Total 247 cards
  totalCards: 247,
  page: 1,
  limit: 50,
  totalPages: 5,
  hasNextPage: true,
  hasPreviousPage: false,
  lastSync: new Date().toISOString(),
  cacheVersion: 'v1.0.0',
  metadata: {
    tags: ['test-collection'],
    notes: 'Test collection for E2E tests',
    customSettings: {
      defaultSort: 'name',
      defaultView: 'grid'
    },
    usageCount: 100,
    lastUsed: new Date().toISOString(),
    userRating: 5,
    favorite: false,
    locked: false
  }
};

// Sample filters for testing
export const sampleFilters: CardFilter[] = [
  {
    id: 'legendary-filter',
    name: 'Legendary Cards Only',
    criteria: {
      rarities: ['Legendary'],
      textSearch: '',
      costRange: undefined,
      types: [],
      families: [],
      abilities: [],
      tags: [],
      customOnly: false
    },
    active: false,
    createdDate: new Date('2025-01-01'),
    lastUsed: new Date('2025-01-01'),
    playerId: MOCK_PLAYER_ID
  },
  {
    id: 'dragon-filter',
    name: 'Dragon Family',
    criteria: {
      rarities: [],
      textSearch: '',
      costRange: undefined,
      types: [],
      families: ['Dragon'],
      abilities: [],
      tags: [],
      customOnly: false
    },
    active: false,
    createdDate: new Date('2025-01-01'),
    lastUsed: new Date('2025-01-01'),
    playerId: MOCK_PLAYER_ID
  },
  {
    id: 'high-cost-filter',
    name: 'High Cost Cards',
    criteria: {
      rarities: [],
      textSearch: '',
      costRange: { min: 6, max: undefined },
      types: [],
      families: [],
      abilities: [],
      tags: [],
      customOnly: false
    },
    active: false,
    createdDate: new Date('2025-01-01'),
    lastUsed: new Date('2025-01-01'),
    playerId: MOCK_PLAYER_ID
  }
];

// API response mock helpers
export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: `req-${Date.now()}`,
    duration: Math.floor(Math.random() * 100) + 50
  }
});

export const createErrorResponse = (message: string, code = 'UNKNOWN_ERROR') => ({
  success: false,
  error: {
    code,
    message,
    details: []
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: `req-${Date.now()}`,
    duration: Math.floor(Math.random() * 100) + 50
  }
});

// Common test scenarios
export const TEST_SCENARIOS = {
  EMPTY_COLLECTION: {
    description: 'Empty collection with no cards',
    data: {
      ...mockCardCollection,
      cards: [],
      totalCards: 0
    }
  },
  
  SMALL_COLLECTION: {
    description: 'Small collection with 5 cards',
    data: {
      ...mockCardCollection,
      cards: sampleCards,
      totalCards: 5
    }
  },
  
  LARGE_COLLECTION: {
    description: 'Large collection for performance testing',
    data: {
      ...mockCardCollection,
      cards: generateLargeCardCollection(1000),
      totalCards: 1000
    }
  },
  
  SERVER_ERROR: {
    description: 'Server error response',
    response: createErrorResponse('Internal server error', 'INTERNAL_ERROR')
  },
  
  NETWORK_ERROR: {
    description: 'Network connectivity error',
    response: createErrorResponse('Network error', 'NETWORK_ERROR')
  }
} as const;

export default {
  sampleCards,
  mockCardCollection,
  sampleFilters,
  generateLargeCardCollection,
  createSuccessResponse,
  createErrorResponse,
  TEST_SCENARIOS,
  MOCK_PLAYER_ID,
  MOCK_COLLECTION_ID
};