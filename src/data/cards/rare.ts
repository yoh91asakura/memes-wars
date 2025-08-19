import { UnifiedCard, CardRarity, CardType, EffectType, MemeFamily, TriggerType } from '../../models/unified/Card';

export const rareCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'rare-001',
    name: 'Ancient Dragon 🐉',
    description: 'A mighty ancient dragon with devastating breath attacks',
    emoji: '🐉',
    
    // Game Specification Requirements
    rarity: CardRarity.RARE,
    rarityProbability: 10,       // 1/10 chance
    luck: 35,                    // Medium-high luck for rare
    family: MemeFamily.MYTHOLOGY,
    reference: 'Dragon hoard - legendary wealth and power meme',
    goldReward: 100,             // High gold reward for rare
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 5,
    
    // Combat Stats
    attack: 6,
    defense: 4,
    health: 8,
    attackSpeed: 0.8,
    
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
    
    // Enhanced Combat System
    emojis: [{
      character: '🔥',
      damage: 6,
      speed: 2,
      trajectory: 'straight',
      effects: [EffectType.BURN, EffectType.AREA, EffectType.INTIMIDATE],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'dragon_fury',
      name: 'Dragon Fury',
      description: 'Unleash devastating fire damage',
      trigger: TriggerType.ON_HIT,
      chance: 0.4,
      effect: EffectType.BURN,
      value: 3,
      duration: 5,
      cooldown: 4
    }],
    synergies: [MemeFamily.MYTHOLOGY],
    
    // Collection & Social
    craftable: true,
    craftCost: 25,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.FIRE, EffectType.AREA, EffectType.INTIMIDATE, EffectType.FLYING],
    tags: ['dragon', 'rare', 'creature', 'fire'],
    flavor: 'Where dragons soar, legends are born.',
    lore: 'The last of the ancient dragons, keeper of forgotten magics and guardian of hidden treasures.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'rare-002',
    name: 'Phoenix Rising 🔥',
    description: 'A mythical phoenix that resurrects from its ashes',
    emoji: '🔥',
    
    // Game Specification Requirements
    rarity: CardRarity.RARE,
    rarityProbability: 10,
    luck: 40,
    family: MemeFamily.MYTHOLOGY,
    reference: 'Rise from the ashes - comeback meme',
    goldReward: 110,
    
    // Game Mechanics
    type: CardType.CREATURE,
    cost: 4,
    
    // Combat Stats
    attack: 5,
    defense: 3,
    health: 6,
    attackSpeed: 1.0,
    
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
    
    // Enhanced Combat System
    emojis: [{
      character: '🔥',
      damage: 5,
      speed: 3,
      trajectory: 'spiral',
      effects: [EffectType.BURN, EffectType.HEAL_SELF],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: false,
      bounces: 0
    }],
    cardEffects: [{
      id: 'rebirth_proc',
      name: 'Eternal Flame',
      description: 'Chance to resurrect on death',
      trigger: TriggerType.LOW_HP,
      chance: 0.5,
      effect: EffectType.RESURRECT,
      value: 1,
      duration: 0,
      cooldown: 10
    }],
    synergies: [MemeFamily.MYTHOLOGY],
    
    // Collection & Social
    craftable: true,
    craftCost: 20,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.FIRE, EffectType.RESURRECT, EffectType.FLYING],
    tags: ['phoenix', 'rare', 'creature', 'fire'],
    flavor: 'From ashes, eternal life.',
    lore: 'Born from the eternal flames, the phoenix represents the cycle of death and rebirth.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
