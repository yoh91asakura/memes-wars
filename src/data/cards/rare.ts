import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const rareCards: Card[] = [
  {
    // Core Identity
    id: 'rare-001',
    name: 'Ancient Dragon 🐉',
    rarity: 10,                   // 1/10 probability
    luck: 35,
    emojis: [
      {
        character: '🐉',
        damage: 7,
        speed: 2,
        trajectory: 'arc',
        effect: EffectType.BURN,
        target: 'OPPONENT'
      },
      {
        character: '🔥',
        damage: 3,
        speed: 3,
        trajectory: 'straight',
        target: 'OPPONENT'
      },
      {
        character: '⚡',
        damage: 5,
        speed: 5,
        trajectory: 'straight',
        effect: EffectType.STUN,
        target: 'OPPONENT'
      },
      {
        character: '💥',
        damage: 8,
        speed: 2,
        trajectory: 'arc',
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.MYTHOLOGY,
    reference: 'Dragon hoard - legendary wealth and power meme',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 100,
    
    // Display
    emoji: '🐉',
    description: 'A mighty ancient dragon with devastating breath attacks',
    visual: CardUtils.getDefaultVisual(10, 1),
    
    // Optional Combat
    hp: 103,
    cardEffects: [
      {
        trigger: TriggerType.ON_HIT,
        chance: 0.4,
        effect: EffectType.BURN,
        duration: 5
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'rare-002',
    name: 'Phoenix Rising 🔥🦅',
    rarity: 10,                   // 1/10 probability
    luck: 40,
    emojis: [
      {
        character: '🦅',
        damage: 6,
        speed: 3,
        trajectory: 'arc',
        effect: EffectType.BURN,
        target: 'OPPONENT'
      },
      {
        character: '🔥',
        damage: 3,
        speed: 3,
        trajectory: 'spiral',
        target: 'OPPONENT'
      },
      {
        character: '💚',
        damage: 0,
        speed: 2,
        trajectory: 'arc',
        effect: EffectType.HEAL,
        target: 'OPPONENT'
      },
      {
        character: '✨',
        damage: 1,
        speed: 4,
        trajectory: 'wave',
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.MYTHOLOGY,
    reference: 'Rise from the ashes - comeback meme',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 110,
    
    // Display
    emoji: '🦅',
    description: 'A mythical phoenix that resurrects from its ashes',
    visual: CardUtils.getDefaultVisual(10, 1),
    
    // Optional Combat
    hp: 104,
    cardEffects: [
      {
        trigger: TriggerType.LOW_HP,
        chance: 0.5,
        effect: EffectType.RESURRECT,
        duration: 1
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
