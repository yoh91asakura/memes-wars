import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const epicCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'epic-001',
    name: 'Chad Thundercock 💪',
    description: 'The ultimate alpha male energy',
    emoji: '💪',
    
    // Game Specification Requirements
    rarity: CardRarity.EPIC,
    rarityProbability: 50,       // 1/50 chance
    luck: 85,                    // Enhanced luck (60-100 range)
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Chad vs Virgin - the classic comparison meme representing confidence',
    goldReward: 300,             // Random value in 200-400 range
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 4,
    
    // Combat Stats (card-database.md scaling)
    attack: 10,
    defense: 8,
    health: 115,                 // Enhanced HP 100-125 range
    attackSpeed: 2.3,            // Epic range 2.0-2.5
    
    // Enhanced Combat System
    emojis: [{
      character: '💪',
      damage: 8,
      speed: 3,
      trajectory: 'straight',
      effects: [EffectType.BOOST, EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 1.3,
      piercing: true,
      homing: false,
      bounces: 0
    }, {
      character: '🗿',
      damage: 6,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.STUN],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '⚡',
      damage: 5,
      speed: 4,
      trajectory: 'homing',
      effects: [EffectType.PRECISION],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: true,
      bounces: 1
    }, {
      character: '🔥',
      damage: 4,
      speed: 3,
      trajectory: 'wave',
      effects: [EffectType.BURN],
      target: 'OPPONENT',
      fireRate: 1.1,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'alpha_energy',
      name: 'Alpha Energy',
      description: 'Boosts entire team when played',
      trigger: TriggerType.BATTLE_START,
      chance: 0.8,               // 80% chance
      effect: EffectType.BOOST,
      value: 3,
      duration: 8,
      cooldown: 0
    }, {
      id: 'chad_strike',
      name: 'Chad Strike',
      description: 'Random chance for devastating critical hit',
      trigger: TriggerType.ON_HIT,
      chance: 0.25,
      effect: EffectType.PRECISION,
      value: 5,
      duration: 0,
      cooldown: 2
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.ABSTRACT_CONCEPTS],
    
    // Economic System
    goldGeneration: 20,
    dustValue: 100,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 4,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🏆', '👑', '💎'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#8B5CF6',
      borderColor: '#7C3AED',
      backgroundColor: '#F5F3FF',
      textColor: '#4C1D95',
      animation: 'pulse',
      particles: true
    },
    
    // Collection & Social
    craftable: true,
    craftCost: 400,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BOOST, EffectType.BURST, EffectType.PRECISION],
    tags: ['chad', 'epic', 'alpha', 'boost'],
    flavor: 'Yes.',
    lore: 'The embodiment of pure confidence and success, Chad radiates an energy that inspires allies and intimidates enemies.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
