import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const cosmicCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'cosmic-001',
    name: 'Big Chungus Supreme 🐰🌌',
    description: 'The absolute unit that broke the internet',
    emoji: '🐰',
    
    // Game Specification Requirements
    rarity: CardRarity.COSMIC,
    rarityProbability: 10000,    // 1/10000 chance
    luck: 888,                   // Enhanced luck (max cosmic range)
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Big Chungus - the ultimate form of Bugs Bunny meme that became legendary',
    goldReward: 7500,            // Random value in 5000-10000 range
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 8,
    
    // Combat Stats (card-database.md scaling)
    attack: 50,
    defense: 40,
    health: 1000,                // Enhanced HP max cosmic
    attackSpeed: 5.0,            // Max cosmic range
    
    // Enhanced Combat System
    emojis: [{
      character: '🐰',
      damage: 25,
      speed: 1,
      trajectory: 'straight',
      effects: [EffectType.STUN, EffectType.BURST, EffectType.MULTIPLY],
      target: 'OPPONENT',
      fireRate: 0.5,
      piercing: true,
      homing: false,
      bounces: 0
    }, {
      character: '🍰',
      damage: 15,
      speed: 2,
      trajectory: 'arc',
      effects: [EffectType.HEAL, EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 3
    }, {
      character: '💪',
      damage: 20,
      speed: 1,
      trajectory: 'homing',
      effects: [EffectType.PRECISION, EffectType.DRAIN],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: true,
      homing: true,
      bounces: 0
    }, {
      character: '🎆',
      damage: 12,
      speed: 4,
      trajectory: 'spiral',
      effects: [EffectType.CHAOS, EffectType.REFLECT],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: false,
      bounces: 5
    }, {
      character: '🌌',
      damage: 30,
      speed: 0.5,
      trajectory: 'random',
      effects: [EffectType.BARRIER, EffectType.MULTIPLY, EffectType.CHAOS],
      target: 'OPPONENT',
      fireRate: 0.3,
      piercing: true,
      homing: false,
      bounces: 10
    }, {
      character: '💥',
      damage: 18,
      speed: 3,
      trajectory: 'wave',
      effects: [EffectType.BURST, EffectType.STUN],
      target: 'OPPONENT',
      fireRate: 0.7,
      piercing: false,
      homing: false,
      bounces: 2
    }, {
      character: '✨',
      damage: 8,
      speed: 5,
      trajectory: 'homing',
      effects: [EffectType.LUCKY, EffectType.MULTIPLY],
      target: 'OPPONENT',
      fireRate: 1.5,
      piercing: false,
      homing: true,
      bounces: 1
    }, {
      character: '🔥',
      damage: 22,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.BURN, EffectType.PRECISION],
      target: 'OPPONENT',
      fireRate: 0.4,
      piercing: true,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'absolute_unit',
      name: 'Absolute Unit',
      description: 'Presence alone intimidates enemies and boosts allies',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,               // 100% chance
      effect: EffectType.BARRIER,
      value: 20,
      duration: 30,
      cooldown: 0
    }, {
      id: 'chungus_smash',
      name: 'Chungus Smash',
      description: 'Devastating attack that can end battles instantly',
      trigger: TriggerType.RANDOM,
      chance: 0.1,               // 10% chance for ultimate move
      effect: EffectType.BURST,
      value: 50,
      duration: 1,
      cooldown: 30
    }, {
      id: 'meme_transcendence',
      name: 'Meme Transcendence',
      description: 'Transcends reality to become pure meme energy',
      trigger: TriggerType.LOW_HP,
      chance: 0.75,
      effect: EffectType.CHAOS,
      value: 25,
      duration: 10,
      cooldown: 60
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.ANIMALS, MemeFamily.INTERNET_CULTURE],
    
    // Economic System
    goldGeneration: 500,
    dustValue: 8000,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 1,               // Cosmic cards can't be stacked
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🏆', '👑', '🌍'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#EC4899',
      borderColor: '#DB2777',
      backgroundColor: '#FDF2F8',
      textColor: '#831843',
      animation: 'sparkle',
      particles: true
    },
    
    // Collection & Social
    craftable: false,           // Too rare to craft
    isActive: true,
    isLimited: true,
    seasonalEvent: 'Cosmic Convergence',
    
    // Metadata
    effects: [EffectType.STUN, EffectType.BURST, EffectType.BARRIER, EffectType.CHAOS],
    tags: ['chungus', 'cosmic', 'legendary', 'absolute', 'unit'],
    flavor: 'Chunky.',
    lore: 'Big Chungus Supreme represents the pinnacle of meme evolution - a being so absolute in its unit-ness that reality itself bends to accommodate its presence.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
