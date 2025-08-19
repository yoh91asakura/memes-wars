import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const mythicCards: Card[] = [
  {
    // Core Identity
    id: 'mythic-001',
    name: 'Galaxy Brain 🧠🌌',
    rarity: 1000,                   // 1/1000 probability
    luck: 350,
    emojis: [
      {
        character: '🧠',
        damage: 13,
        speed: 3,
        trajectory: 'straight',
        effect: EffectType.BOOST,
        target: 'OPPONENT'
      },
      {
        character: '💥',
        damage: 6,
        speed: 3,
        trajectory: 'arc',
        target: 'OPPONENT'
      },
      {
        character: '✨',
        damage: 6,
        speed: 4,
        trajectory: 'wave',
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Galaxy Brain - expanding brain meme representing ultimate intelligence',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 2250,
    
    // Display
    emoji: '🧠',
    description: 'Transcendent intelligence beyond mortal comprehension',
    visual: CardUtils.getDefaultVisual(1000, 1),
    
    // Optional Combat
    hp: 135,
    cardEffects: [
      {
        trigger: TriggerType.RANDOM,
        chance: 0.9,
        effect: EffectType.BURST,
        duration: 10
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];