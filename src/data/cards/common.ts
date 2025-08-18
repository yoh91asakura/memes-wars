import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

// Common cards with meme themes + proper emoji-powers.md stats
export const commonCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'common-001',
    name: 'Doge Basic 🐕',
    description: 'Such wow. Very meme. Much classic.',
    emoji: '🐕',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,        // 1/2 chance
    luck: 15,                    // Enhanced luck for common (10-20 range)
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Doge - the Shiba Inu meme that launched "such wow" language',
    goldReward: 15,              // 10-20 range
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 1,
    
    // Combat Stats (card-database.md scaling)
    attack: 2,
    defense: 1,
    health: 15,                  // Enhanced HP
    attackSpeed: 0.8,            // Common range 0.5-1.0
    
    // Enhanced Combat System (emoji-powers.md compliant)
    emojis: [{
      character: '🔥',           // Fire damage emoji
      damage: 3,                 // Base damage from emoji-powers.md
      speed: 3,
      trajectory: 'straight',
      effects: [EffectType.BURN],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '🍀',           // Lucky charm emoji
      damage: 2,
      speed: 2,
      trajectory: 'homing',
      effects: [EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: false,
      homing: true,
      bounces: 0
    }],
    cardEffects: [{
      id: 'such_wow',
      name: 'Such Wow',
      description: 'Random chance to generate bonus gold (Lucky effect)',
      trigger: TriggerType.RANDOM,
      chance: 0.15,               // 15% chance
      effect: EffectType.LUCKY,
      value: 1,
      duration: 2,
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
      bonusEmojis: ['🦴', '🏀'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FFA500',
      borderColor: '#FF8C00',
      backgroundColor: '#FFF8DC',
      textColor: '#8B4513',
      animation: 'float',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BURN, EffectType.LUCKY],
    tags: ['doge', 'classic', 'meme', 'shiba'],
    flavor: 'Such wow. Much meme. Very classic.',
    lore: 'The original Doge meme featuring Kabosu the Shiba Inu. Known for broken English phrases like "such wow" and "very amaze".',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  
  {
    // Core Identity
    id: 'common-002',
    name: 'Baby Pepe 🐸',
    description: 'Feels good man - the classic reaction',
    emoji: '🐸',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,        // 1/2 chance
    luck: 18,                    // Enhanced luck
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Pepe the Frog - Matt Furie\'s character that became the internet\'s reaction face',
    goldReward: 12,              // 10-20 range
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 2,
    health: 20,                  // Higher HP for support role
    attackSpeed: 0.5,
    
    // Enhanced Combat System
    emojis: [{
      character: '💚',           // Green heart healing
      damage: 0,                 // Heal emoji
      speed: 2,
      trajectory: 'arc',
      effects: [EffectType.HEAL],
      target: 'OPPONENT',
      fireRate: 0.5,
      piercing: false,
      homing: false,
      bounces: 1
    }, {
      character: '❤️',           // Red heart heal + shield
      damage: 0,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.HEAL, EffectType.SHIELD],
      target: 'OPPONENT',
      fireRate: 0.3,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'feels_good',
      name: 'Feels Good',
      description: 'Healing over time (Green Heart effect)',
      trigger: TriggerType.ON_DAMAGE,
      chance: 0.3,
      effect: EffectType.HEAL,
      value: 5,                  // 5 HP heal from emoji-powers.md
      duration: 1,
      cooldown: 3
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.EMOTIONS_REACTIONS],
    
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
      bonusEmojis: ['🌿', '🪷'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#32CD32',
      borderColor: '#228B22',
      backgroundColor: '#F0FFF0',
      textColor: '#006400',
      animation: 'pulse',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.HEAL, EffectType.SHIELD],
    tags: ['pepe', 'classic', 'reaction', 'feels'],
    flavor: 'Feels good man',
    lore: 'The original Pepe from Matt Furie\'s "Boy\'s Club" comic. Became the internet\'s most versatile reaction face.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-003',
    name: 'Trollface Classic 😈',
    description: 'Problem? U mad bro?',
    emoji: '😈',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 12,
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Trollface - the classic rage comic face for internet trolling',
    goldReward: 18,
    
    // Game Mechanics
    type: CardType.ATTACK,
    cost: 1,
    
    // Combat Stats
    attack: 3,
    defense: 1,
    health: 12,
    attackSpeed: 1.0,
    
    // Enhanced Combat System
    emojis: [{
      character: '⚡',           // Lightning damage + chain
      damage: 5,                 // From emoji-powers.md
      speed: 4,
      trajectory: 'random',
      effects: [EffectType.CHAIN],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: false,
      bounces: 2                 // Chain lightning effect
    }],
    cardEffects: [{
      id: 'trolling',
      name: 'Trolling',
      description: 'Chain lightning hits up to 3 targets',
      trigger: TriggerType.RANDOM,
      chance: 0.25,
      effect: EffectType.CHAIN,
      value: 2,                  // 2 additional bounces
      duration: 0,
      cooldown: 4
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET],
    
    // Economic System
    goldGeneration: 2,
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
      bonusEmojis: ['🎭', '🃏'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#8B0000',
      borderColor: '#DC143C',
      backgroundColor: '#FFE4E1',
      textColor: '#8B0000',
      animation: 'shake',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.CHAIN],
    tags: ['trollface', 'troll', 'rage', 'comic'],
    flavor: 'Problem? U mad bro?',
    lore: 'The iconic Trollface from rage comics. Represents the essence of internet trolling.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-004',
    name: 'This Is Fine Dog 🔥',
    description: 'Everything is totally fine. Definitely.',
    emoji: '🔥',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 8,
    family: MemeFamily.MEME_FORMATS,
    reference: 'This Is Fine - KC Green\'s webcomic showing acceptance in chaos',
    goldReward: 14,
    
    // Game Mechanics
    type: CardType.DEFENSE,
    cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 3,
    health: 18,                  // Tank-oriented HP
    attackSpeed: 0.6,
    
    // Enhanced Combat System
    emojis: [{
      character: '🔥',           // Fire burn damage
      damage: 3,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.BURN],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '🛡️',          // Shield block
      damage: 0,
      speed: 1,
      trajectory: 'straight',
      effects: [EffectType.SHIELD],
      target: 'OPPONENT',
      fireRate: 0.4,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'acceptance',
      name: 'Stoic Acceptance',
      description: 'Blocks incoming hits (Shield effect)',
      trigger: TriggerType.ON_DAMAGE,
      chance: 0.3,
      effect: EffectType.SHIELD,
      value: 3,                  // Blocks 3 hits
      duration: 3,
      cooldown: 5
    }],
    synergies: [MemeFamily.MEME_FORMATS, MemeFamily.EMOTIONS_REACTIONS],
    
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
      bonusEmojis: ['☕', '🏠'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FF4500',
      borderColor: '#FF6347',
      backgroundColor: '#FFF8DC',
      textColor: '#8B4513',
      animation: 'flame',
      particles: true
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BURN, EffectType.SHIELD],
    tags: ['fine', 'fire', 'chaos', 'acceptance'],
    flavor: 'This is fine. Everything is fine.',
    lore: 'From KC Green\'s Gunshow webcomic. The dog calmly sipping coffee while his house burns down.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-005',
    name: 'Surprised Pikachu ⚡',
    description: 'When the obvious happens and you\'re somehow shocked',
    emoji: '⚡',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 16,
    family: MemeFamily.EMOTIONS_REACTIONS,
    reference: 'Surprised Pikachu - the perfect reaction for obvious outcomes',
    goldReward: 16,
    
    // Game Mechanics
    type: CardType.SPELL,
    cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 1,
    health: 14,
    attackSpeed: 0.7,
    
    // Enhanced Combat System
    emojis: [{
      character: '⚡',           // Lightning chain damage
      damage: 5,
      speed: 5,
      trajectory: 'straight',
      effects: [EffectType.CHAIN],
      target: 'OPPONENT',
      fireRate: 0.7,
      piercing: true,
      homing: false,
      bounces: 2
    }, {
      character: '❄️',          // Ice freeze
      damage: 2,
      speed: 3,
      trajectory: 'arc',
      effects: [EffectType.FREEZE],
      target: 'OPPONENT',
      fireRate: 0.5,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'surprise_stun',
      name: 'Surprise Attack',
      description: 'Freeze stops enemy fire rate for 2 seconds',
      trigger: TriggerType.RANDOM,
      chance: 0.2,
      effect: EffectType.FREEZE,
      value: 2,                  // 2 second freeze
      duration: 2,
      cooldown: 6
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
      bonusEmojis: ['😮', '😲'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FFD700',
      borderColor: '#FFA500',
      backgroundColor: '#FFFAF0',
      textColor: '#FF8C00',
      animation: 'electric',
      particles: true
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.CHAIN, EffectType.FREEZE],
    tags: ['pikachu', 'surprise', 'reaction', 'obvious'],
    flavor: '*surprised pikachu face*',
    lore: 'The perfect reaction face for when something predictable happens but you\'re still somehow shocked.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-006',
    name: 'Yes Chad ✅',
    description: 'Yes. Absolutely yes.',
    emoji: '✅',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 19,                    // High luck for chad energy
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Yes Chad - the confident affirmative response meme',
    goldReward: 19,
    
    // Game Mechanics
    type: CardType.SUPPORT,
    cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 2,
    health: 17,
    attackSpeed: 0.7,
    
    // Enhanced Combat System
    emojis: [{
      character: '✨',           // Sparkles buff attack
      damage: 1,
      speed: 3,
      trajectory: 'straight',
      effects: [EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 0.7,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '💪',          // Muscle strength boost
      damage: 1,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 0.5,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'positive_energy',
      name: 'Positive Energy',
      description: 'Buff attack +50% for 3 seconds',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,
      effect: EffectType.BOOST,
      value: 50,                 // +50% damage boost
      duration: 3,
      cooldown: 0
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
      bonusEmojis: ['👍', '💪'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#32CD32',
      borderColor: '#228B22',
      backgroundColor: '#F0FFF0',
      textColor: '#006400',
      animation: 'glow',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BOOST],
    tags: ['yes', 'chad', 'positive', 'confidence'],
    flavor: 'Yes.',
    lore: 'The embodiment of confident agreement. When someone asks if you\'re sure about something, this is the only appropriate response.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-007',
    name: 'No Virgin ❌',
    description: 'Absolutely not. Never.',
    emoji: '❌',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 5,
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Virgin vs Chad - the classic comparison meme showing rejection',
    goldReward: 11,
    
    // Game Mechanics
    type: CardType.DEFENSE,
    cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 3,
    health: 16,
    attackSpeed: 0.5,
    
    // Enhanced Combat System
    emojis: [{
      character: '🛡️',          // Shield block
      damage: 0,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.SHIELD],
      target: 'OPPONENT',
      fireRate: 0.5,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '🌵',          // Cactus thorns reflect
      damage: 2,
      speed: 1,
      trajectory: 'straight',
      effects: [EffectType.REFLECT],
      target: 'OPPONENT',
      fireRate: 0.3,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'rejection',
      name: 'Absolute Rejection',
      description: 'Reflects 25% damage back (Thorns effect)',
      trigger: TriggerType.ON_DAMAGE,
      chance: 0.25,
      effect: EffectType.REFLECT,
      value: 25,                 // 25% reflection
      duration: 2,
      cooldown: 4
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
      bonusEmojis: ['🚫', '⛔'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#DC143C',
      borderColor: '#B22222',
      backgroundColor: '#FFE4E1',
      textColor: '#8B0000',
      animation: 'pulse',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.SHIELD, EffectType.REFLECT],
    tags: ['no', 'virgin', 'rejection', 'defense'],
    flavor: 'No.',
    lore: 'The counterpart to Yes Chad. Sometimes you need to put your foot down and say absolutely not.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-008',
    name: 'Crying Wojak 😭',
    description: 'When life hits you with the feels',
    emoji: '😭',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 4,
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Wojak - the "feels guy" representing raw human emotion',
    goldReward: 10,
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 1,
    
    // Combat Stats
    attack: 1,
    defense: 1,
    health: 11,                  // Low HP but special abilities
    attackSpeed: 0.6,
    
    // Enhanced Combat System
    emojis: [{
      character: '💙',          // Blue heart mana restore
      damage: 0,
      speed: 1,
      trajectory: 'arc',
      effects: [EffectType.HEAL],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '🌊',          // Wave slow effect
      damage: 3,
      speed: 2,
      trajectory: 'wave',
      effects: [EffectType.FREEZE],
      target: 'OPPONENT',
      fireRate: 0.4,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'emotional_damage',
      name: 'Emotional Damage',
      description: 'Sadness slows enemy attack speed by 50%',
      trigger: TriggerType.PERIODIC,
      chance: 0.3,
      effect: EffectType.FREEZE,
      value: 50,                 // 50% slow
      duration: 3,
      cooldown: 8
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.EMOTIONS_REACTIONS],
    
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
      bonusEmojis: ['💧', '🌧️'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#4682B4',
      borderColor: '#1E90FF',
      backgroundColor: '#F0F8FF',
      textColor: '#191970',
      animation: 'float',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.HEAL, EffectType.FREEZE],
    tags: ['wojak', 'crying', 'feels', 'sad'],
    flavor: 'I know that feel bro',
    lore: 'The original "feels guy" from 4chan. Wojak represents the raw, unfiltered emotions of internet culture.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-009',
    name: 'Laughing Pepe 😂',
    description: 'KEK! Top kek! The ancient laughter',
    emoji: '😂',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 20,                    // Max luck for common
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Laughing Pepe - when something is so funny you need the perfect reaction',
    goldReward: 20,              // Max gold for common
    
    // Game Mechanics
    type: CardType.SUPPORT,
    cost: 1,
    
    // Combat Stats
    attack: 2,
    defense: 1,
    health: 13,
    attackSpeed: 0.8,
    
    // Enhanced Combat System
    emojis: [{
      character: '🌟',          // Star multi-hit
      damage: 3,
      speed: 4,
      trajectory: 'wave',
      effects: [EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 3                 // Hits 3 times
    }, {
      character: '🍀',          // Lucky clover
      damage: 2,
      speed: 2,
      trajectory: 'homing',
      effects: [EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: false,
      homing: true,
      bounces: 0
    }],
    cardEffects: [{
      id: 'infectious_laughter',
      name: 'Infectious Laughter',
      description: 'Lucky effect doubles coin rewards',
      trigger: TriggerType.ON_HIT,
      chance: 0.3,
      effect: EffectType.LUCKY,
      value: 2,                  // 2x coin multiplier
      duration: 3,
      cooldown: 5
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.EMOTIONS_REACTIONS],
    
    // Economic System
    goldGeneration: 2,
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
      bonusEmojis: ['🤣', '🎭'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#FFD700',
      borderColor: '#FFA500',
      backgroundColor: '#FFFAF0',
      textColor: '#FF8C00',
      animation: 'pulse',
      particles: true
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BURST, EffectType.LUCKY],
    tags: ['pepe', 'laughing', 'kek', 'funny'],
    flavor: 'KEK! TOP KEK!',
    lore: 'When regular laughter isn\'t enough, you need the ancient power of KEK. This Pepe has transcended mere amusement.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },

  {
    // Core Identity
    id: 'common-010',
    name: 'Grumpy Cat 😾',
    description: 'I had fun once. It was awful.',
    emoji: '😾',
    
    // Game Specification Requirements
    rarity: CardRarity.COMMON,
    rarityProbability: 2,
    luck: 1,                     // Lowest luck (grumpy)
    family: MemeFamily.ANIMALS,
    reference: 'Grumpy Cat - Tardar Sauce, the perpetually annoyed feline internet star',
    goldReward: 13,
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 1,
    
    // Combat Stats
    attack: 3,
    defense: 2,
    health: 10,                  // Lowest HP but high attack
    attackSpeed: 1.0,
    
    // Enhanced Combat System
    emojis: [{
      character: '🧪',          // Poison damage over time
      damage: 2,
      speed: 3,
      trajectory: 'straight',
      effects: [EffectType.POISON],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '🐍',          // Snake venom stacking
      damage: 3,
      speed: 2,
      trajectory: 'arc',
      effects: [EffectType.POISON],
      target: 'OPPONENT',
      fireRate: 0.7,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'grumpy_aura',
      name: 'Grumpy Aura',
      description: 'Poison damage over time (5s, 1 dmg/s)',
      trigger: TriggerType.PERIODIC,
      chance: 0.4,
      effect: EffectType.POISON,
      value: 1,                  // 1 damage per second
      duration: 5,               // 5 seconds
      cooldown: 3
    }],
    synergies: [MemeFamily.ANIMALS, MemeFamily.EMOTIONS_REACTIONS],
    
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
      bonusEmojis: ['🙄', '😒'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#696969',
      borderColor: '#2F4F4F',
      backgroundColor: '#F5F5F5',
      textColor: '#000000',
      animation: 'none',
      particles: false
    },
    
    // Collection & Social
    craftable: false,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.POISON],
    tags: ['grumpy', 'cat', 'annoyed', 'negative'],
    flavor: 'NO.',
    lore: 'Tardar Sauce, known as Grumpy Cat, became internet royalty with her permanent scowl.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];