import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const infinityCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'infinity-001',
    name: 'Ultra Instinct Shaggy 🌟👤',
    description: 'Like, the ultimate power that transcends reality, man',
    emoji: '🌟',
    
    // Game Specification Requirements
    rarity: CardRarity.INFINITY,
    rarityProbability: 1000000,  // 1/1000000+ chance
    luck: 9999,                  // Infinity luck range 2000+
    family: MemeFamily.MYTHOLOGY,
    reference: 'Ultra Instinct Shaggy - the meme that made Shaggy an omnipotent being',
    goldReward: 100000,          // Random value in 50000+ range
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 15,
    
    // Combat Stats
    attack: 100,
    defense: 100,
    health: 500,
    attackSpeed: 0.01,           // Attacks so fast it breaks time
    
    // Enhanced Combat System
    emojis: [{
      character: '🌟',
      damage: 100,
      speed: 10,
      trajectory: 'homing',
      effects: [EffectType.CHAOS, EffectType.MULTIPLY, EffectType.BARRIER, EffectType.DRAIN, EffectType.PRECISION],
      target: 'OPPONENT',
      fireRate: 0.01,
      piercing: true,
      homing: true,
      bounces: 0
    }, {
      character: '👤',
      damage: 50,
      speed: 15,
      trajectory: 'straight',
      effects: [EffectType.STUN, EffectType.BURST, EffectType.REFLECT],
      target: 'OPPONENT',
      fireRate: 0.02,
      piercing: true,
      homing: false,
      bounces: 0
    }, {
      character: '⚡',
      damage: 75,
      speed: 20,
      trajectory: 'spiral',
      effects: [EffectType.PRECISION, EffectType.MULTIPLY],
      target: 'OPPONENT',
      fireRate: 0.015,
      piercing: true,
      homing: false,
      bounces: 15
    }, {
      character: '🌌',
      damage: 25,
      speed: 5,
      trajectory: 'wave',
      effects: [EffectType.HEAL, EffectType.BOOST, EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 0.05,
      piercing: false,
      homing: false,
      bounces: 10
    }, {
      character: '💥',
      damage: 80,
      speed: 12,
      trajectory: 'random',
      effects: [EffectType.BURST, EffectType.CHAOS, EffectType.FREEZE],
      target: 'OPPONENT',
      fireRate: 0.03,
      piercing: true,
      homing: false,
      bounces: 20
    }, {
      character: '🔥',
      damage: 60,
      speed: 8,
      trajectory: 'arc',
      effects: [EffectType.BURN, EffectType.DRAIN],
      target: 'OPPONENT',
      fireRate: 0.04,
      piercing: true,
      homing: false,
      bounces: 5
    }, {
      character: '🌟',
      damage: 90,
      speed: 25,
      trajectory: 'homing',
      effects: [EffectType.PRECISION, EffectType.MULTIPLY, EffectType.CHAOS],
      target: 'OPPONENT',
      fireRate: 0.008,
      piercing: true,
      homing: true,
      bounces: 0
    }],
    cardEffects: [{
      id: 'ultra_instinct',
      name: 'Ultra Instinct',
      description: 'Automatically dodges all attacks and counters with devastating force',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,               // 100% chance
      effect: EffectType.BARRIER,
      value: 1000,
      duration: 9999,
      cooldown: 0
    }, {
      id: 'omnipotent_power',
      name: 'Omnipotent Power',
      description: 'Like, can do anything, man',
      trigger: TriggerType.RANDOM,
      chance: 1.0,               // Always active
      effect: EffectType.CHAOS,
      value: 999,
      duration: 1,
      cooldown: 0.1
    }, {
      id: 'reality_shatter',
      name: 'Reality Shatter',
      description: 'Breaks the game engine itself',
      trigger: TriggerType.ON_HIT,
      chance: 0.5,
      effect: EffectType.BURST,
      value: 500,
      duration: 1,
      cooldown: 1
    }, {
      id: 'zoinks_transcendence',
      name: 'Zoinks Transcendence',
      description: 'Ascends beyond mortal comprehension',
      trigger: TriggerType.LOW_HP,
      chance: 1.0,
      effect: EffectType.MULTIPLY,
      value: 100,
      duration: 10,
      cooldown: 0
    }],
    synergies: [MemeFamily.MYTHOLOGY, MemeFamily.ABSTRACT_CONCEPTS, MemeFamily.INTERNET_CULTURE],
    
    // Economic System
    goldGeneration: 10000,
    dustValue: 200000,
    tradeable: false,           // Beyond mortal trading
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 1,              // Infinity cards are unique
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🍃', '🥪', '🐕'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FF6B35',
      borderColor: '#FF4500',
      backgroundColor: '#FFF8DC',
      textColor: '#8B0000',
      animation: 'electric',
      particles: true
    },
    
    // Collection & Social
    craftable: false,           // Cannot be crafted by mortals
    isActive: true,
    isLimited: true,
    seasonalEvent: 'Infinite Convergence',
    
    // Metadata
    effects: [EffectType.CHAOS, EffectType.MULTIPLY, EffectType.BARRIER, EffectType.BURST],
    tags: ['shaggy', 'infinity', 'omnipotent', 'transcendent', 'zoinks'],
    flavor: 'Like, sorry man, but I had to use 0.001% of my power.',
    lore: 'Ultra Instinct Shaggy represents the ultimate evolution of meme power - a being so powerful that reality itself is just a suggestion.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];