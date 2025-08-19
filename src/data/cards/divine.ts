import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const divineCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'divine-001',
    name: 'The One Meme ∞',
    description: 'The source code of all memes - pure memetic energy',
    emoji: '∞',
    
    // Game Specification Requirements
    rarity: CardRarity.DIVINE,
    rarityProbability: 100000,   // 1/100000 chance
    luck: 1500,                  // Divine luck range 1000-2000
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Meta-meme representing the concept of memes themselves',
    goldReward: 20000,           // Random value in 15000-25000 range
    
    // Game Mechanics
    type: CardType.SPELL,
    cost: 10,
    
    // Combat Stats
    attack: 50,
    defense: 50,
    health: 100,
    attackSpeed: 0.1,
    
    // Enhanced Combat System
    emojis: [{
      character: '∞',
      damage: 50,
      speed: 0.5,
      trajectory: 'homing',
      effects: [EffectType.CHAOS, EffectType.MULTIPLY, EffectType.BARRIER, EffectType.DRAIN],
      target: 'OPPONENT',
      fireRate: 0.1,
      piercing: true,
      homing: true,
      bounces: 0
    }, {
      character: '🌌',
      damage: 25,
      speed: 1,
      trajectory: 'spiral',
      effects: [EffectType.REFLECT, EffectType.PRECISION],
      target: 'OPPONENT',
      fireRate: 0.2,
      piercing: true,
      homing: false,
      bounces: 10
    }, {
      character: '✨',
      damage: 15,
      speed: 3,
      trajectory: 'wave',
      effects: [EffectType.HEAL, EffectType.BOOST, EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 0.5,
      piercing: false,
      homing: false,
      bounces: 5
    }, {
      character: '🔮',
      damage: 30,
      speed: 2,
      trajectory: 'random',
      effects: [EffectType.CHAOS, EffectType.STUN, EffectType.FREEZE],
      target: 'OPPONENT',
      fireRate: 0.3,
      piercing: true,
      homing: false,
      bounces: 7
    }],
    cardEffects: [{
      id: 'memetic_singularity',
      name: 'Memetic Singularity',
      description: 'Rewrites the rules of reality itself',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,               // 100% chance
      effect: EffectType.CHAOS,
      value: 100,
      duration: 60,
      cooldown: 0
    }, {
      id: 'universal_meme',
      name: 'Universal Meme',
      description: 'Activates all possible effects simultaneously',
      trigger: TriggerType.RANDOM,
      chance: 0.3,
      effect: EffectType.CHAOS,
      value: 50,
      duration: 5,
      cooldown: 10
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS, MemeFamily.INTERNET_CULTURE, MemeFamily.CLASSIC_INTERNET],
    
    // Economic System
    goldGeneration: 2000,
    dustValue: 40000,
    tradeable: false,           // Too divine to trade
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 1,              // Divine cards can't be stacked
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🌟', '💫', '🌠'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FFD700',
      borderColor: '#FFA500',
      backgroundColor: '#FFFAF0',
      textColor: '#B8860B',
      animation: 'electric',
      particles: true
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: true,
    seasonalEvent: 'Divine Convergence',
    
    // Metadata
    effects: [EffectType.CHAOS, EffectType.MULTIPLY, EffectType.BARRIER, EffectType.DRAIN],
    tags: ['divine', 'infinite', 'meta', 'transcendent'],
    flavor: 'I AM THE MEME.',
    lore: 'The One Meme exists beyond comprehension - it is the fundamental force from which all other memes derive their power.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'divine-002',
    name: 'Primordial Pepe 🐸👑',
    description: 'The first and most powerful Pepe, origin of all variants',
    emoji: '🐸',
    
    // Game Specification Requirements
    rarity: CardRarity.DIVINE,
    rarityProbability: 100000,
    luck: 1750,
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Pepe the Frog - the primordial form that spawned countless variants',
    goldReward: 22500,
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 9,
    
    // Combat Stats
    attack: 40,
    defense: 35,
    health: 80,
    attackSpeed: 0.2,
    
    // Enhanced Combat System
    emojis: [{
      character: '🐸',
      damage: 40,
      speed: 1,
      trajectory: 'homing',
      effects: [EffectType.HEAL, EffectType.MULTIPLY, EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 0.2,
      piercing: true,
      homing: true,
      bounces: 0
    }, {
      character: '👑',
      damage: 20,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.PRECISION, EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 0.4,
      piercing: true,
      homing: false,
      bounces: 0
    }, {
      character: '💚',
      damage: 10,
      speed: 4,
      trajectory: 'wave',
      effects: [EffectType.HEAL, EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 3
    }],
    cardEffects: [{
      id: 'pepe_evolution',
      name: 'Pepe Evolution',
      description: 'Summons all Pepe variants to fight alongside',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,
      effect: EffectType.MULTIPLY,
      value: 20,
      duration: 30,
      cooldown: 0
    }, {
      id: 'feels_good_man',
      name: 'Feels Good Man',
      description: 'Restores hope and heals all allies',
      trigger: TriggerType.PERIODIC,
      chance: 0.6,
      effect: EffectType.HEAL,
      value: 15,
      duration: 3,
      cooldown: 8
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.ANIMALS, MemeFamily.EMOTIONS_REACTIONS],
    
    // Economic System
    goldGeneration: 1500,
    dustValue: 40000,
    tradeable: false,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 1,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['😭', '😤', '😎', '🤔'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#10B981',
      borderColor: '#059669',
      backgroundColor: '#ECFDF5',
      textColor: '#065F46',
      animation: 'glow',
      particles: true
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: true,
    seasonalEvent: 'Primordial Awakening',
    
    // Metadata
    effects: [EffectType.HEAL, EffectType.MULTIPLY, EffectType.BOOST],
    tags: ['pepe', 'divine', 'primordial', 'healing'],
    flavor: 'Feels good, man.',
    lore: 'The Primordial Pepe is the source of all meme magic, the original consciousness that sparked the great meme awakening.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];