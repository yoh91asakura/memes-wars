import { UnifiedCard, CardRarity, CardType, EffectType, MemeFamily, TriggerType } from '../../models/unified/Card';

export const rareCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'rare-001',
    name: 'Galaxy Brain 🧠',
    description: 'Ascended intellect - big brain time activated',
    emoji: '🧠',
    
    // Game Specification Requirements
    rarity: CardRarity.RARE,
    rarityProbability: 10,       // 1/10 chance
    luck: 45,                    // Enhanced luck (35-50 range)
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Galaxy Brain - escalating intelligence meme format',
    goldReward: 65,              // 50-75 range
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 5,
    
    // Combat Stats (card-database.md scaling)
    attack: 7,
    defense: 5,
    health: 65,                  // Enhanced HP 50-75 range
    attackSpeed: 1.8,            // Rare range 1.5-2.0
    
    // Advanced Properties
    passiveAbility: {
      name: 'Dragon Breath',
      description: 'Deals area damage to all enemies in front',
      trigger: 'onAttack',
      effect: 'area_damage',
      value: 3
    },
    emojiProjectile: {
      character: '🔥',
      damage: 6,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.BURN, EffectType.AREA, EffectType.INTIMIDATE],
      target: 'OPPONENT'
    },
    
    // Economic System
    goldGeneration: 3,
    dustValue: 20,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 6,
    stackBonus: {
      luckMultiplier: 0.15,
      goldMultiplier: 0.2,
      bonusEmojis: ['🐲', '🦅'],
      effectBonus: 0.08,
      damageBonus: 0.15
    },
    
    // Visual & UI
    visual: {
      glow: '#4169E1',
      borderColor: '#0000CD',
      backgroundColor: '#F0F8FF',
      textColor: '#00008B'
    },
    
    // Enhanced Combat System (emoji-powers.md compliant)
    emojis: [{
      character: '🧠',           // Brain intelligence
      damage: 8,                 // High damage for rare
      speed: 6,
      trajectory: 'homing',
      effects: [EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 1.8,
      piercing: true,
      homing: true,
      bounces: 0
    }, {
      character: '⚡',           // Lightning quick thinking
      damage: 6,
      speed: 7,
      trajectory: 'straight',
      effects: [EffectType.CHAIN],
      target: 'OPPONENT',
      fireRate: 1.5,
      piercing: true,
      homing: false,
      bounces: 3
    }, {
      character: '🌟',          // Star knowledge
      damage: 5,
      speed: 5,
      trajectory: 'wave',
      effects: [EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 1.6,
      piercing: false,
      homing: false,
      bounces: 4
    }, {
      character: '🎯',          // Target precision
      damage: 10,
      speed: 8,
      trajectory: 'homing',
      effects: [EffectType.CRIT],
      target: 'OPPONENT',
      fireRate: 1.2,
      piercing: false,
      homing: true,
      bounces: 0
    }],
    cardEffects: [{
      id: 'big_brain_energy',
      name: 'Big Brain Energy',
      description: 'Intelligence boost increases all damage by 75%',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,
      effect: EffectType.BOOST,
      value: 75,                 // 75% damage boost
      duration: 10,
      cooldown: 0
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS],
    
    // Collection & Social
    craftable: true,
    craftCost: 25,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.BOOST, EffectType.CHAIN, EffectType.BURST, EffectType.CRIT],
    tags: ['galaxy', 'brain', 'intelligence', 'rare'],
    flavor: 'Ascended beyond mortal comprehension.',
    lore: 'When regular brain time isn\'t enough, you activate Galaxy Brain mode - the ultimate form of intellectual superiority.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'rare-002',
    name: 'Stonks Pepe 📈',
    description: 'To the moon! Number go up! Diamond hands!',
    emoji: '📈',
    
    // Game Specification Requirements
    rarity: CardRarity.RARE,
    rarityProbability: 10,
    luck: 50,                    // Max luck for rare
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Stonks - financial success meme with deliberate misspelling',
    goldReward: 75,              // Max gold for rare
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 4,
    
    // Combat Stats (card-database.md scaling)
    attack: 8,
    defense: 6,
    health: 75,                  // Max HP for rare
    attackSpeed: 2.0,            // Max rare range
    
    // Advanced Properties
    passiveAbility: {
      name: 'Rebirth',
      description: 'Returns to hand when destroyed, costs 1 less mana',
      trigger: 'onDeath',
      effect: 'resurrect',
      value: 1
    },
    emojiProjectile: {
      character: '🔥',
      damage: 5,
      speed: 3,
      trajectory: 'spiral',
      effects: [EffectType.BURN, EffectType.HEAL_SELF],
      target: 'OPPONENT'
    },
    
    // Economic System
    goldGeneration: 3,
    dustValue: 20,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 6,
    stackBonus: {
      luckMultiplier: 0.15,
      goldMultiplier: 0.2,
      bonusEmojis: ['🦅', '✨'],
      effectBonus: 0.08,
      damageBonus: 0.15
    },
    
    // Visual & UI
    visual: {
      glow: '#FF4500',
      borderColor: '#DC143C',
      backgroundColor: '#FFF8DC',
      textColor: '#B22222'
    },
    
    // Enhanced Combat System (emoji-powers.md compliant)
    emojis: [{
      character: '💎',           // Diamond hands
      damage: 7,
      speed: 6,
      trajectory: 'straight',
      effects: [EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 2.0,
      piercing: true,
      homing: false,
      bounces: 0
    }, {
      character: '🚀',          // Rocket to moon
      damage: 12,                // High damage
      speed: 8,
      trajectory: 'homing',
      effects: [EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 1.5,
      piercing: false,
      homing: true,
      bounces: 0
    }, {
      character: '💰',          // Money generation
      damage: 4,
      speed: 4,
      trajectory: 'arc',
      effects: [EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 1.8,
      piercing: false,
      homing: false,
      bounces: 2
    }, {
      character: '📈',          // Stonks chart
      damage: 9,
      speed: 7,
      trajectory: 'wave',
      effects: [EffectType.BURST],
      target: 'OPPONENT',
      fireRate: 1.7,
      piercing: false,
      homing: false,
      bounces: 3
    }],
    cardEffects: [{
      id: 'stonks_multiplier',
      name: 'Stonks Multiplier',
      description: 'Lucky effect triples gold rewards for 8 seconds',
      trigger: TriggerType.ON_HIT,
      chance: 0.4,
      effect: EffectType.LUCKY,
      value: 3,                  // 3x multiplier
      duration: 8,
      cooldown: 6
    }],
    synergies: [MemeFamily.CLASSIC_INTERNET, MemeFamily.ABSTRACT_CONCEPTS],
    
    // Collection & Social
    craftable: true,
    craftCost: 20,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.LUCKY, EffectType.BOOST, EffectType.BURST],
    tags: ['stonks', 'finance', 'money', 'rare'],
    flavor: 'STONKS! Number go up! 💎🙌',
    lore: 'From the depths of r/wallstreetbets comes the ultimate financial meme. Diamond hands hold forever, rockets go to moon.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
