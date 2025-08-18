import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

// Common cards using the unified card model
export const commonCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'common-001',
    name: 'Fire Ember 🔥',
    description: 'A blazing ember that burns with steady determination',
    emoji: '🔥',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,        // 1/2 chance
    luck: 5,                     // Low luck for common
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'This is fine - the classic fire meme representing chaos',
    goldReward: 15,              // Random value in 10-20 range
    
    // Game Mechanics
    type: CardType.ATTACK,
    cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 1,
    health: 3,
    attackSpeed: 1.2,
    
    // Enhanced Combat System
    emojis: [{
      character: '🔥',
      damage: 2,
      speed: 3,
      trajectory: 'straight',
      effects: [EffectType.BURN],
      target: 'OPPONENT',
      fireRate: 1.2,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'burn_proc',
      name: 'Ignite',
      description: 'Chance to apply burn effect on hit',
      trigger: TriggerType.ON_HIT,
      chance: 0.25,               // 25% chance
      effect: EffectType.BURN,
      value: 1,
      duration: 3,
      cooldown: 2
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS],
    
    // Economic System
    goldGeneration: 1,
    dustValue: 1,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 10,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['💥', '🌶️'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FF6B35',
      borderColor: '#FF4500',
      backgroundColor: '#FFF8DC',
      textColor: '#8B0000',
      animation: 'flame',
      particles: true
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BURN],
    tags: ['fire', 'common', 'attack', 'burn'],
    flavor: 'Even the smallest flame can ignite a great fire.',
    lore: 'Born from the first spark of creation, fire embers are the foundation of all flame magic. In the meme wars, this represents the "This is Fine" dog sitting in a burning room, accepting chaos with determination.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    
    // Legacy Compatibility
    passiveAbility: {
      name: 'Burn',
      description: 'Deals 1 damage per turn for 2 turns',
      trigger: 'onAttack',
      effect: 'burn',
      value: 1
    }
  },
  {
    // Core Identity
    id: 'common-002',
    name: 'Water Drop 💧',
    description: 'A refreshing drop of pure water with healing properties',
    emoji: '💧',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 8,
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Tears of joy - crying from laughter meme',
    goldReward: 12,
    
    // Game Mechanics
    type: CardType.HEALING,
    cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 2,
    health: 3,
    attackSpeed: 0.8,
    
    // Enhanced Combat System
    emojis: [{
      character: '💧',
      damage: 1,
      speed: 2,
      trajectory: 'arc',
      effects: [EffectType.HEAL],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'refresh_proc',
      name: 'Refresh',
      description: 'Chance to heal self when attacking',
      trigger: TriggerType.ON_HIT,
      chance: 0.3,
      effect: EffectType.HEAL,
      value: 1,
      duration: 0,
      cooldown: 3
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS],
    
    // Economic System
    goldGeneration: 1,
    dustValue: 1,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 10,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['😢', '💦'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#00CED1',
      borderColor: '#4682B4',
      backgroundColor: '#F0F8FF',
      textColor: '#191970'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.HEAL],
    tags: ['water', 'common', 'healing'],
    flavor: 'Life flows where water goes.',
    lore: 'These mystical drops contain the essence of all natural springs and can restore vitality.',
    craftable: false,
    isActive: true,
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-003',
    name: 'Earth Stone 🪨',
    description: 'A solid stone that provides reliable defense',
    emoji: '🪨',
    
    // Game Mechanics
    rarity: CardRarity.COMMON,
    type: CardType.DEFENSE,
    cost: 2,
    
    // Combat Stats
    attack: 1,
    defense: 4,
    health: 4,
    attackSpeed: 0.6,
    
    // Advanced Properties
    passiveAbility: {
      name: 'Fortify',
      description: 'Increases defense by 1 each turn, max 3',
      trigger: 'onTurnStart',
      effect: 'buff_defense',
      value: 1
    },
    emojiProjectile: {
      emoji: '🪨',
      damage: 1,
      speed: 1,
      trajectory: 'straight',
      effects: ['knockback', 'stun']
    },
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 10,
    
    // Visual & UI
    visual: {
      glow: '#8B7D6B',
      borderColor: '#A0522D',
      backgroundColor: '#F5F5DC',
      textColor: '#654321'
    },
    
    // Metadata
    effects: ['defense', 'knockback', 'stun'],
    tags: ['earth', 'common', 'defense'],
    flavor: 'Steady and unmovable, like the mountains themselves.',
    lore: 'Forged in the depths of the earth, these stones have witnessed the rise and fall of civilizations.',
    craftable: false,
    isActive: true,
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-004',
    name: 'Wind Breeze 💨',
    description: 'A swift breeze that enhances speed and agility',
    emoji: '💨',
    
    // Game Mechanics
    rarity: CardRarity.COMMON,
    type: CardType.SUPPORT,
    cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 1,
    health: 2,
    attackSpeed: 1.5,
    
    // Advanced Properties
    passiveAbility: {
      name: 'Swiftness',
      description: 'Increases attack speed of adjacent cards by 25%',
      trigger: 'onPlay',
      effect: 'buff_speed',
      value: 25
    },
    emojiProjectile: {
      emoji: '💨',
      damage: 2,
      speed: 4,
      trajectory: 'wave',
      effects: ['push', 'speed_boost']
    },
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 10,
    
    // Visual & UI
    visual: {
      glow: '#E0E0E0',
      borderColor: '#C0C0C0',
      backgroundColor: '#F8F8FF',
      textColor: '#696969'
    },
    
    // Metadata
    effects: ['speed', 'push', 'support'],
    tags: ['air', 'common', 'support'],
    flavor: 'Swift as the wind, light as a feather.',
    lore: 'The essence of freedom itself, captured in a gentle breeze that can become a mighty gale.',
    craftable: false,
    isActive: true,
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-005',
    name: 'Lightning Spark ⚡',
    description: 'A crackling spark of electricity with shocking power',
    emoji: '⚡',
    
    // Game Mechanics
    rarity: CardRarity.COMMON,
    type: CardType.SPELL,
    cost: 2,
    
    // Combat Stats
    attack: 3,
    defense: 1,
    health: 2,
    attackSpeed: 1.8,
    
    // Advanced Properties
    passiveAbility: {
      name: 'Chain Lightning',
      description: 'Damage jumps to nearby enemies with 50% power',
      trigger: 'onAttack',
      effect: 'chain',
      value: 50
    },
    emojiProjectile: {
      emoji: '⚡',
      damage: 3,
      speed: 5,
      trajectory: 'homing',
      effects: ['chain', 'paralyze']
    },
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 10,
    
    // Visual & UI
    visual: {
      glow: '#FFD700',
      borderColor: '#FF6347',
      backgroundColor: '#FFFACD',
      textColor: '#B8860B'
    },
    
    // Metadata
    effects: ['lightning', 'chain', 'paralyze'],
    tags: ['lightning', 'common', 'spell'],
    flavor: 'Power courses through every bolt.',
    lore: 'Born from the fury of thunderstorms, these sparks contain the raw energy of nature itself.',
    craftable: false,
    isActive: true,
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
