import { 
  UnifiedCard, 
  CardRarity, 
  CardType, 
  MemeFamily, 
  EffectType, 
  TriggerType 
} from '../../models/unified/Card';

export const legendaryCards: UnifiedCard[] = [
  {
    // Core Identity
    id: 'legendary-001',
    name: 'Stonks Master 📈',
    description: 'Number go up! To the moon!',
    emoji: '📈',
    
    // Game Specification Requirements
    rarity: CardRarity.LEGENDARY,
    rarityProbability: 200,      // 1/200 chance
    luck: 180,                   // Enhanced luck (120-200 range)
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Stonks - the deliberate misspelling representing financial success',
    goldReward: 750,             // Random value in 500-1000 range
    
    // Game Mechanics
    type: CardType.SUPPORT,
    cost: 5,
    
    // Combat Stats (card-database.md scaling)
    attack: 15,
    defense: 12,
    health: 250,                 // Enhanced HP 200-280 range
    attackSpeed: 2.8,            // Legendary range 2.5-3.0
    
    // Enhanced Combat System
    emojis: [{
      character: '📈',
      damage: 6,
      speed: 2,
      trajectory: 'spiral',
      effects: [EffectType.LUCKY, EffectType.MULTIPLY],
      target: 'OPPONENT',
      fireRate: 1.0,
      piercing: false,
      homing: false,
      bounces: 0
    }, {
      character: '💰',
      damage: 4,
      speed: 3,
      trajectory: 'arc',
      effects: [EffectType.LUCKY],
      target: 'OPPONENT',
      fireRate: 1.2,
      piercing: false,
      homing: false,
      bounces: 2
    }, {
      character: '🚀',
      damage: 8,
      speed: 5,
      trajectory: 'homing',
      effects: [EffectType.BURST, EffectType.MULTIPLY],
      target: 'OPPONENT',
      fireRate: 0.6,
      piercing: true,
      homing: true,
      bounces: 0
    }, {
      character: '🌙',
      damage: 5,
      speed: 3,
      trajectory: 'wave',
      effects: [EffectType.BOOST],
      target: 'OPPONENT',
      fireRate: 0.8,
      piercing: false,
      homing: false,
      bounces: 1
    }, {
      character: '💸',
      damage: 3,
      speed: 4,
      trajectory: 'random',
      effects: [EffectType.LUCKY, EffectType.CHAOS],
      target: 'OPPONENT',
      fireRate: 1.5,
      piercing: false,
      homing: false,
      bounces: 3
    }],
    cardEffects: [{
      id: 'stonks_surge',
      name: 'Stonks Surge',
      description: 'Massively increases gold generation for entire team',
      trigger: TriggerType.BATTLE_START,
      chance: 1.0,               // 100% chance
      effect: EffectType.LUCKY,
      value: 10,
      duration: 15,
      cooldown: 0
    }, {
      id: 'diamond_hands',
      name: 'Diamond Hands',
      description: 'Periodic chance to double all projectiles',
      trigger: TriggerType.PERIODIC,
      chance: 0.3,
      effect: EffectType.MULTIPLY,
      value: 2,
      duration: 3,
      cooldown: 8
    }],
    synergies: [MemeFamily.ABSTRACT_CONCEPTS, MemeFamily.INTERNET_CULTURE],
    
    // Economic System
    goldGeneration: 50,
    dustValue: 400,
    tradeable: true,
    
    // Progression System
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 3,
    stackBonus: {
      luckMultiplier: 0.1,
      goldMultiplier: 0.15,
      bonusEmojis: ['💵', '💴', '💶', '💷'],
      effectBonus: 0.05,
      damageBonus: 0.1
    },
    
    // Visual & UI
    visual: {
      glow: '#F59E0B',
      borderColor: '#D97706',
      backgroundColor: '#FFFBEB',
      textColor: '#92400E',
      animation: 'sparkle',
      particles: true
    },
    
    // Collection & Social
    craftable: true,
    craftCost: 2000,
    isActive: true,
    isLimited: false,
    
    // Metadata
    effects: [EffectType.LUCKY, EffectType.MULTIPLY, EffectType.CHAOS],
    tags: ['stonks', 'legendary', 'economy', 'moon'],
    flavor: 'HODL! To the moon! 🚀🚀🚀',
    lore: 'The legendary Stonks Master has transcended mere financial advice to become a force of pure economic energy.',
    releaseDate: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
