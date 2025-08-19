import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const divineCards: Card[] = [
  {
    // Core Identity
    id: 'divine-001',
    name: 'The One Meme ∞',
    rarity: 100000,                   // 1/100000 probability
    luck: 1500,
    emojis: [
      {
        character: '∞',
        damage: 35,
        speed: 1,
        trajectory: 'spiral',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      },
      {
        character: '🌌',
        damage: 25,
        speed: 1,
        trajectory: 'spiral',
        target: 'OPPONENT'
      },
      {
        character: '✨',
        damage: 15,
        speed: 3,
        trajectory: 'wave',
        target: 'OPPONENT'
      },
      {
        character: '🔮',
        damage: 30,
        speed: 2,
        trajectory: 'wave',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Meta-meme representing the concept of memes themselves',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 20000,
    
    // Display
    emoji: '∞',
    description: 'The source code of all memes - pure memetic energy',
    visual: CardUtils.getDefaultVisual(100000, 1),
    
    // Optional Combat
    hp: 1600,
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.CHAOS,
        duration: 60
      },
      {
        trigger: TriggerType.RANDOM,
        chance: 0.3,
        effect: EffectType.CHAOS,
        duration: 5
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'divine-002',
    name: 'Primordial Pepe 🐸👑',
    rarity: 100000,                   // 1/100000 probability
    luck: 1750,
    emojis: [
      {
        character: '🐸',
        damage: 30,
        speed: 2,
        trajectory: 'arc',
        effect: EffectType.MULTIPLY,
        target: 'OPPONENT'
      },
      {
        character: '👑',
        damage: 20,
        speed: 2,
        trajectory: 'straight',
        target: 'OPPONENT'
      },
      {
        character: '💚',
        damage: 10,
        speed: 4,
        trajectory: 'wave',
        effect: EffectType.HEAL,
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Pepe the Frog - the primordial form that spawned countless variants',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 22500,
    
    // Display
    emoji: '🐸',
    description: 'The first and most powerful Pepe, origin of all variants',
    visual: CardUtils.getDefaultVisual(100000, 1),
    
    // Optional Combat
    hp: 1850,
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.MULTIPLY,
        duration: 30
      },
      {
        trigger: TriggerType.PERIODIC,
        chance: 0.6,
        effect: EffectType.HEAL,
        duration: 3
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];