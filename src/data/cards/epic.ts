import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const epicCards: Card[] = [
  {
    // Core Identity
    id: 'epic-001',
    name: 'Chad Thundercock 💪',
    rarity: 50,                   // 1/50 probability
    luck: 75,
    emojis: [
      {
        character: '💪',
        damage: 10,
        speed: 3,
        trajectory: 'straight',
        effect: EffectType.BOOST,
        target: 'OPPONENT'
      },
      {
        character: '💥',
        damage: 5,
        speed: 3,
        trajectory: 'arc',
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Chad vs Virgin - the classic comparison meme representing confidence',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 300,
    
    // Display
    emoji: '💪',
    description: 'The ultimate alpha male energy',
    visual: CardUtils.getDefaultVisual(50, 1),
    
    // Optional Combat
    hp: 107,
    cardEffects: [
      {
        trigger: TriggerType.RANDOM,
        chance: 0.5,
        effect: EffectType.BOOST,
        duration: 1
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];