import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const mythicCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'mythic-001',
    name: 'Galaxy Brain 🧠🌌',
    description: 'Transcendent intelligence beyond mortal comprehension',
    emoji: '🧠',
    
    // Game Specification Requirements
    rarity: CardRarity.MYTHIC,
    rarityProbability: 1000,     // 1/1000 chance
    luck: 350,                   // Mythic luck range 200-500
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Galaxy Brain - expanding brain meme representing ultimate intelligence',
    goldReward: 2250,            // Random value in 1500-3000 range
    
    // Game Mechanics
    type: CardType.SPELL,
    cost: 6,
    
    // Combat Stats
    attack: 12,
    defense: 8,
    health: 20,
    attackSpeed: 0.8,
    
    // Enhanced Combat System - Mythic cards have 6-8 emojis with ultimate synergies
    emojis: [
      {
        character: '💥',  // Explosion - massive area damage
        damage: 8,
        speed: 2,
        trajectory: 'arc',
        effects: [EffectType.AREA],
        target: 'OPPONENT',
        fireRate: 0.8,
        piercing: false,
        homing: false,
        bounces: 0
      },
      {
        character: '⚡',  // Lightning - chain attacks
        damage: 5,
        speed: 5,
        trajectory: 'homing',
        effects: [EffectType.CHAIN],
        target: 'OPPONENT',
        fireRate: 1.2,
        piercing: true,
        homing: true,
        bounces: 2
      },
      {
        character: '💠',  // Skull - execution
        damage: 6,
        speed: 3,
        trajectory: 'straight',
        effects: [EffectType.EXECUTE],
        target: 'OPPONENT',
        fireRate: 0.5,
        piercing: true,
        homing: false,
        bounces: 0
      },
      {
        character: '✨',  // Sparkles - buff attack
        damage: 1,
        speed: 4,
        trajectory: 'wave',
        effects: [EffectType.BOOST],
        target: 'SELF',
        fireRate: 1.5,
        piercing: false,
        homing: false,
        bounces: 2
      },
      {
        character: '🔋',  // Battery - energy generation
        damage: 1,
        speed: 2,
        trajectory: 'arc',
        effects: [EffectType.ENERGY],
        target: 'SELF',
        fireRate: 0.8,
        piercing: false,
        homing: false,
        bounces: 0
      },
      {
        character: '👑',  // Crown - majesty buff
        damage: 4,
        speed: 3,
        trajectory: 'straight',
        effects: [EffectType.BOOST],
        target: 'SELF',
        fireRate: 0.6,
        piercing: false,
        homing: false,
        bounces: 0
      },
      {
        character: '🎈',  // Chaos - random effects
        damage: 3,
        speed: 3,
        trajectory: 'random',
        effects: [EffectType.CHAOS],
        target: 'OPPONENT',
        fireRate: 1.0,
        piercing: false,
        homing: false,
        bounces: 3
      }],
    cardEffects: [{
      id: 'omniscience',
      name: 'Omniscience',
      description: 'Sees all possible outcomes and adapts strategy',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,               // 100% chance
      effect: EffectType.CHAOS,
      value: 15,
      duration: 20,
      cooldown: 0
    }, {
      id: 'reality_warp',
      name: 'Reality Warp',
      description: 'Randomly triggers any effect in the game',
      trigger: TriggerType.PERIODIC,
      chance: 0.5,
      effect: EffectType.CHAOS,
      value: 10,
      duration: 2,
      cooldown: 3
    }, {
      id: 'transcendence',
      name: 'Transcendence',
      description: 'Becomes temporarily invulnerable and multiplies all damage',
      trigger: TriggerType.LOW_HP,
      chance: 0.8,
      effect: EffectType.BARRIER,
      value: 5,
      duration: 5,
      cooldown: 15
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS, MemeFamily.INTERNET_CULTURE, MemeFamily.MYTHOLOGY],
    
    // Economic System
    goldGeneration: 150,
    dustValue: 1600,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 2,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🎆', '🌠', '🔭', '⚛️'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#EF4444',
      borderColor: '#DC2626',
      backgroundColor: '#FEF2F2',
      textColor: '#991B1B',
      animation: 'electric',
      particles: true
    },
    
    // Collection & Social
    craftable: true,
    craftCost: 8000,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.CHAOS, EffectType.MULTIPLY, EffectType.BARRIER, EffectType.DRAIN],
    tags: ['galaxy', 'brain', 'mythic', 'intelligence', 'chaos'],
    flavor: 'I have achieved enlightenment beyond your comprehension.',
    lore: 'The Galaxy Brain has transcended all known limits of intelligence, seeing patterns across dimensions and realities.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
