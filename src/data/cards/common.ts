import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

// Common cards (1/2 probability) - Everyday memes
export const commonCards: Card[] = [
  {
    // Core Identity
    id: 'common-001',
    name: 'Fire Ember 🔥',
    rarity: 2,                   // 1/2 probability
    luck: 5,                     // Low luck for common
    emojis: [
      {
        character: '🔥',
        damage: 3,
        speed: 3,
        trajectory: 'straight',
        effect: EffectType.BURN,
        target: 'OPPONENT'
      },
      {
        character: '🔥',
        damage: 3,
        speed: 3,
        trajectory: 'straight',
        effect: EffectType.BURN,
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'This is fine - the classic fire meme representing chaos',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 15,
    
    // Display
    emoji: '🔥',
    description: 'A blazing ember that burns with steady determination',
    visual: CardUtils.getDefaultVisual(2, 1),
    
    // Optional Combat
    hp: 105,  // 100 base + luck/10
    cardEffects: [{
      trigger: TriggerType.ON_HIT,
      chance: 0.25,
      effect: EffectType.BURN,
      duration: 3
    }],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-002',
    name: 'Water Drop 💧',
    description: 'A refreshing drop of pure water with healing properties',
    emoji: '💧',
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 8,
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Tears of joy - crying from laughter meme',
    goldReward: 12,
    
    // Game Mechanics
        cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 2,
    health: 3,
    attackSpeed: 0.8,
    
    // Enhanced Combat System - Support emoji for healing
    emojis: [
      {
        character: '💚',  // Green Heart from spec
        damage: 0,  // Healing emoji, no damage
        speed: 2,
        trajectory: 'arc',
        effects: [EffectType.HEAL],  // Heal 5 HP from spec
        target: 'SELF',  // Heals self
        fireRate: 0.8,
        piercing: false,
        homing: false,
        bounces: 0
      },
      {
        character: '💚',  // Second identical healing emoji
        damage: 0,
        speed: 2,
        trajectory: 'arc',
        effects: [EffectType.HEAL],
        target: 'SELF',
        fireRate: 0.8,
        piercing: false,
        homing: false,
        bounces: 0
      }
    ],
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
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 6,
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Rock solid - immovable object meme',
    goldReward: 14,
    
    // Game Mechanics
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
      character: '🪨',
      damage: 1,
      speed: 1,
      trajectory: 'straight',
      effects: [EffectType.KNOCKBACK, EffectType.STUN],
      target: 'OPPONENT'
    },
    
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
      bonusEmojis: ['🗿', '⛰️'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#8B7D6B',
      borderColor: '#A0522D',
      backgroundColor: '#F5F5DC',
      textColor: '#654321'
    },
    
    // Enhanced Combat System
    emojis: [{
      character: '🪨',
      damage: 1,
      speed: 1,
      trajectory: 'straight',
      effects: [EffectType.KNOCKBACK, EffectType.STUN],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'fortify_proc',
      name: 'Stone Wall',
      description: 'Chance to block incoming damage',
      trigger: TriggerType.ON_DAMAGE,
      chance: 0.2,
      effect: EffectType.SHIELD,
      value: 2,
      duration: 1,
      cooldown: 3
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS],
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.DEFENSE, EffectType.KNOCKBACK, EffectType.STUN],
    tags: ['earth', 'common', 'defense'],
    flavor: 'Steady and unmovable, like the mountains themselves.',
    lore: 'Forged in the depths of the earth, these stones have witnessed the rise and fall of civilizations.',
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
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 7,
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Gone with the wind - swift movement meme',
    goldReward: 13,
    
    // Game Mechanics
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
      character: '💨',
      damage: 2,
      speed: 4,
      trajectory: 'wave',
      effects: [EffectType.PUSH, EffectType.SPEED_BOOST],
      target: 'OPPONENT'
    },
    
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
      bonusEmojis: ['🌬️', '🌀'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#E0E0E0',
      borderColor: '#C0C0C0',
      backgroundColor: '#F8F8FF',
      textColor: '#696969'
    },
    
    // Enhanced Combat System
    emojis: [{
      character: '💨',
      damage: 2,
      speed: 4,
      trajectory: 'wave',
      effects: [EffectType.PUSH, EffectType.SPEED_BOOST],
      target: 'OPPONENT',
      fireRate: 1.5,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'swift_proc',
      name: 'Tailwind',
      description: 'Chance to boost team attack speed',
      trigger: TriggerType.PERIODIC,
      chance: 0.15,
      effect: EffectType.SPEED_BOOST,
      value: 1,
      duration: 2,
      cooldown: 4
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS],
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.SPEED, EffectType.PUSH, EffectType.SUPPORT],
    tags: ['air', 'common', 'support'],
    flavor: 'Swift as the wind, light as a feather.',
    lore: 'The essence of freedom itself, captured in a gentle breeze that can become a mighty gale.',
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
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 9,
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Shocked Pikachu - electric surprise meme',
    goldReward: 16,
    
    // Game Mechanics
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
      character: '⚡',
      damage: 3,
      speed: 5,
      trajectory: 'homing',
      effects: [EffectType.CHAIN, EffectType.PARALYZE],
      target: 'OPPONENT'
    },
    
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
      bonusEmojis: ['🌩️', '⚙'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FFD700',
      borderColor: '#FF6347',
      backgroundColor: '#FFFACD',
      textColor: '#B8860B'
    },
    
    // Enhanced Combat System
    emojis: [{
      character: '⚡',
      damage: 3,
      speed: 5,
      trajectory: 'homing',
      effects: [EffectType.CHAIN, EffectType.PARALYZE],
      target: 'OPPONENT',
      fireRate: 1.8,
      piercing: true,
      homing: true,
      bounces: 2
    }],
    cardEffects: [{
      id: 'chain_proc',
      name: 'Lightning Storm',
      description: 'Chance to chain to multiple enemies',
      trigger: TriggerType.ON_HIT,
      chance: 0.35,
      effect: EffectType.CHAIN,
      value: 2,
      duration: 0,
      cooldown: 2
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS],
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.LIGHTNING, EffectType.CHAIN, EffectType.PARALYZE],
    tags: ['lightning', 'common', 'spell'],
    flavor: 'Power courses through every bolt.',
    lore: 'Born from the fury of thunderstorms, these sparks contain the raw energy of nature itself.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-006',
    name: 'Trollface Classic 😈',
    description: 'U mad bro? The classic internet troll',
    emoji: '😈',
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 7,
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Trollface - the iconic meme representing internet trolling culture',
    goldReward: 18,
    
    // Game Mechanics
        cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 1,
    health: 2,
    attackSpeed: 1.6,
    
    // Enhanced Combat System
    emojis: [{
      character: '😈',
      damage: 2,
      speed: 4,
      trajectory: 'random',
      effects: [EffectType.CHAOS],
      target: 'OPPONENT',
      fireRate: 1.6,
      piercing: false,
      homing: false,
      bounces: 2
    }],
    cardEffects: [{
      id: 'troll_chaos',
      name: 'Trolling',
      description: 'Random chance to cause confusion',
      trigger: TriggerType.ON_HIT,
      chance: 0.2,
      effect: EffectType.CHAOS,
      value: 1,
      duration: 2,
      cooldown: 4
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET],
    
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
      bonusEmojis: ['😏', '😎'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#9CA3AF',
      borderColor: '#D1D5DB',
      backgroundColor: '#F9FAFB',
      textColor: '#374151'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.CHAOS],
    tags: ['troll', 'common', 'chaos'],
    flavor: 'U mad bro?',
    lore: 'The original internet troll, spreading chaos and confusion wherever it goes.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-007',
    name: 'Grumpy Cat 😾',
    description: 'Eternally unimpressed feline',
    emoji: '😾',
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 6,
    family: MemeFamily.ANIMALS,
    reference: 'Grumpy Cat - the famous perpetually grumpy-looking cat',
    goldReward: 14,
    
    // Game Mechanics
        cost: 2,
    
    // Combat Stats
    attack: 1,
    defense: 3,
    health: 4,
    attackSpeed: 0.9,
    
    // Enhanced Combat System
    emojis: [{
      character: '😾',
      damage: 1,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.POISON],
      target: 'OPPONENT',
      fireRate: 0.9,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'grumpy_aura',
      name: 'Grumpy Aura',
      description: 'Reduces enemy morale and attack speed',
      trigger: TriggerType.BATTLE_START,
      chance: 0.5,
      effect: EffectType.POISON,
      value: 1,
      duration: 5,
      cooldown: 0
    }],
    synergies: [MemeFamily.ANIMALS],
    
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
      bonusEmojis: ['🐈', '😿'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#9CA3AF',
      borderColor: '#D1D5DB',
      backgroundColor: '#F9FAFB',
      textColor: '#374151'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.POISON],
    tags: ['cat', 'grumpy', 'animal', 'common'],
    flavor: 'NO.',
    lore: 'This perpetually unimpressed cat has mastered the art of disappointment.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-008',
    name: 'Rage Face 😡',
    description: 'FFFUUUUU- The classic rage expression',
    emoji: '😡',
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 4,
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Rage Comics - the classic stick figure expressing frustration',
    goldReward: 16,
    
    // Game Mechanics
        cost: 1,
    
    // Combat Stats
    attack: 3,
    defense: 1,
    health: 2,
    attackSpeed: 1.4,
    
    // Enhanced Combat System
    emojis: [{
      character: '😡',
      damage: 3,
      speed: 3,
      trajectory: 'straight',
      effects: [EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 1.4,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'rage_boost',
      name: 'FFFUUUU',
      description: 'Anger increases attack power temporarily',
      trigger: TriggerType.ON_DAMAGE,
      chance: 0.4,
      effect: EffectType.BOOST,
      value: 2,
      duration: 3,
      cooldown: 5
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET],
    
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
      bonusEmojis: ['🤬', '💢'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#9CA3AF',
      borderColor: '#D1D5DB',
      backgroundColor: '#F9FAFB',
      textColor: '#374151'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BURST],
    tags: ['rage', 'common', 'attack'],
    flavor: 'FFFUUUUU-',
    lore: 'The eternal expression of internet frustration, channeled into pure attacking fury.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-009',
    name: 'Me Gusta 😏',
    description: 'That creepy smile of satisfaction',
    emoji: '😏',
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 9,
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Me Gusta - the creepy satisfied face from rage comics',
    goldReward: 13,
    
    // Game Mechanics
        cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 2,
    health: 3,
    attackSpeed: 1.0,
    
    // Enhanced Combat System
    emojis: [{
      character: '😏',
      damage: 2,
      speed: 2,
      trajectory: 'wave',
      effects: [EffectType.DRAIN],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: false,
      bounces: 1
    }],
    cardEffects: [{
      id: 'creepy_satisfaction',
      name: 'Me Gusta',
      description: 'Gains power from enemy suffering',
      trigger: TriggerType.ON_HIT,
      chance: 0.3,
      effect: EffectType.DRAIN,
      value: 1,
      duration: 0,
      cooldown: 2
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET],
    
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
      bonusEmojis: ['😈', '🙃'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#9CA3AF',
      borderColor: '#D1D5DB',
      backgroundColor: '#F9FAFB',
      textColor: '#374151'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.DRAIN],
    tags: ['me gusta', 'common', 'drain'],
    flavor: 'Me gusta...',
    lore: 'The unsettling satisfaction that comes from others discomfort.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'common-010',
    name: 'Forever Alone 😔',
    description: 'The eternal sadness of solitude',
    emoji: '😔',
    
    // Game Specification Requirements
    rarity: 2,
    rarityProbability: 2,
    luck: 3,
    family: MemeFamily.EMOTIONS_REACTIONS,
    reference: 'Forever Alone - the melancholic figure representing loneliness',
    goldReward: 11,
    
    // Game Mechanics
        cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 4,
    health: 5,
    attackSpeed: 0.7,
    
    // Enhanced Combat System
    emojis: [{
      character: '😔',
      damage: 1,
      speed: 1,
      trajectory: 'arc',
      effects: [EffectType.SHIELD],
      target: 'OPPONENT',
      fireRate: 0.7,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'loneliness_shield',
      name: 'Forever Alone',
      description: 'Loneliness creates a protective barrier',
      trigger: TriggerType.BATTLE_START,
      chance: 0.6,
      effect: EffectType.SHIELD,
      value: 3,
      duration: 10,
      cooldown: 0
    }],
    synergies: [MemeFamily.EMOTIONS_REACTIONS],
    
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
      bonusEmojis: ['😢', '😞'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#9CA3AF',
      borderColor: '#D1D5DB',
      backgroundColor: '#F9FAFB',
      textColor: '#374151'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.SHIELD],
    tags: ['forever alone', 'common', 'defense', 'sad'],
    flavor: 'Okay...',
    lore: 'Sometimes solitude becomes a strength, creating walls that protect the heart.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
