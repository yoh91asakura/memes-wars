import { UnifiedCard, CardRarity, CardType } from '../../models/unified/Card';

export const rareCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'rare-001',
    name: 'Ancient Dragon 🐉',
    description: 'A mighty ancient dragon with devastating breath attacks',
    emoji: '🐉',
    
    // Game Mechanics
    rarity: CardRarity.RARE,
    type: CardType.CREATURE,
    cost: 5,
    
    // Combat Stats
    attack: 6,
    defense: 4,
    health: 8,
    attackSpeed: 0.8,
    
    // Advanced Properties
    passiveAbility: {
      name: 'Dragon Breath',
      description: 'Deals area damage to all enemies in front',
      trigger: 'onAttack',
      effect: 'area_damage',
      value: 3
    },
    emojiProjectile: {
      emoji: '🔥',
      damage: 6,
      speed: 2,
      trajectory: 'straight',
      effects: ['burn', 'area', 'intimidate']
    },
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 6,
    
    // Visual & UI
    visual: {
      glow: '#4169E1',
      borderColor: '#0000CD',
      backgroundColor: '#F0F8FF',
      textColor: '#00008B'
    },
    
    // Metadata
    effects: ['fire', 'area', 'intimidate', 'flying'],
    tags: ['dragon', 'rare', 'creature', 'fire'],
    flavor: 'Where dragons soar, legends are born.',
    lore: 'The last of the ancient dragons, keeper of forgotten magics and guardian of hidden treasures.',
    craftable: true,
    craftCost: 25,
    isActive: true,
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'rare-002',
    name: 'Phoenix Rising 🔥',
    description: 'A mythical phoenix that resurrects from its ashes',
    emoji: '🔥',
    
    // Game Mechanics
    rarity: CardRarity.RARE,
    type: CardType.CREATURE,
    cost: 4,
    
    // Combat Stats
    attack: 5,
    defense: 3,
    health: 6,
    attackSpeed: 1.0,
    
    // Advanced Properties
    passiveAbility: {
      name: 'Rebirth',
      description: 'Returns to hand when destroyed, costs 1 less mana',
      trigger: 'onDeath',
      effect: 'resurrect',
      value: 1
    },
    emojiProjectile: {
      emoji: '🔥',
      damage: 5,
      speed: 3,
      trajectory: 'spiral',
      effects: ['burn', 'heal_self']
    },
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 6,
    
    // Visual & UI
    visual: {
      glow: '#FF4500',
      borderColor: '#DC143C',
      backgroundColor: '#FFF8DC',
      textColor: '#B22222'
    },
    
    // Metadata
    effects: ['fire', 'resurrect', 'flying'],
    tags: ['phoenix', 'rare', 'creature', 'fire'],
    flavor: 'From ashes, eternal life.',
    lore: 'Born from the eternal flames, the phoenix represents the cycle of death and rebirth.',
    craftable: true,
    craftCost: 20,
    isActive: true,
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
