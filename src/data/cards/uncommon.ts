import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const uncommonCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'uncommon-001',
    name: 'Doge Wisdom 🐕',
    description: 'Much wisdom, very smart, wow',
    emoji: '🐕',
    
    // Game Specification Requirements
    rarity: CardRarity.UNCOMMON,
    rarityProbability: 4,        // 1/4 chance
    luck: 18,                    // Uncommon luck range 10-25
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Doge - the classic Shiba Inu meme representing wisdom and positivity',
    goldReward: 35,              // Random value in 25-50 range
    
    // Game Mechanics
    type: CardType.SUPPORT,
    cost: 2,
    
    // Combat Stats
    attack: 3,
    defense: 2,
    health: 4,
    attackSpeed: 1.1,
    
    // Enhanced Combat System
    emojis: [{
      character: '🐕',
      damage: 3,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 1.1,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '🌟',
      damage: 2,
      speed: 3,
      trajectory: 'wave',
      effects: [EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 1
    }],
    cardEffects: [{
      id: 'wisdom_proc',
      name: 'Much Wisdom',
      description: 'Chance to boost team attack speed',
      trigger: TriggerType.BATTLE_START,
      chance: 0.4,               // 40% chance
      effect: EffectType.BOOST,
      value: 2,
      duration: 5,
      cooldown: 0
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.ANIMALS],
    
    // Economic System
    goldGeneration: 3,
    dustValue: 5,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 8,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🚀', '💎'],
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
    isLimited: false,
    
    // Metadata
    effects: [EffectType.LUCKY, EffectType.BOOST],
    tags: ['doge', 'uncommon', 'support', 'classic'],
    flavor: 'Much wisdom. Very strategic. Wow.',
    lore: 'The wise Doge has seen many battles and learned that true strength comes from helping your allies shine.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'uncommon-002',
    name: 'Surprised Pikachu 😱',
    description: 'Express shock and disbelief',
    emoji: '😱',
    
    // Game Specification Requirements
    rarity: CardRarity.UNCOMMON,
    rarityProbability: 4,
    luck: 22,
    family: MemeFamily.EMOTIONS_REACTIONS,
    reference: 'Surprised Pikachu face - classic reaction meme for unexpected situations',
    goldReward: 42,
    
    // Game Mechanics
    type: CardType.SPELL,
    cost: 2,
    
    // Combat Stats
    attack: 4,
    defense: 1,
    health: 3,
    attackSpeed: 1.5,
    
    // Enhanced Combat System
    emojis: [{
      character: '😱',
      damage: 4,
      speed: 4,
      trajectory: 'homing',
      effects: [EffectType.STUN],
      target: 'OPPONENT',
      fireRate: 1.5,
      piercing: false,
      homing: true,
      bounces: 0
    }, {
      character: '⚡',
      damage: 3,
      speed: 5,
      trajectory: 'straight',
      effects: [EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 1.2,
      piercing: true,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'surprise_stun',
      name: 'Shocking Surprise',
      description: 'Chance to stun enemy on hit',
      trigger: TriggerType.ON_HIT,
      chance: 0.35,
      effect: EffectType.STUN,
      value: 1,
      duration: 2,
      cooldown: 3
    }],
    synergies: [MemeFamily.EMOTIONS_REACTIONS],
    
    // Economic System
    goldGeneration: 3,
    dustValue: 5,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 8,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['🤯', '💥'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#F59E0B',
      borderColor: '#D97706',
      backgroundColor: '#FFFBEB',
      textColor: '#92400E',
      animation: 'pulse'
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.STUN, EffectType.BURST],
    tags: ['pikachu', 'shock', 'reaction', 'uncommon'],
    flavor: 'The face you make when your opponent plays this card.',
    lore: 'This reaction captures the universal moment of complete surprise and disbelief.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
