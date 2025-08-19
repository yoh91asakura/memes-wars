import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const legendaryCards: Card[] = [
  {
    // Core Identity
    id: 'legendary-001',
    name: 'Stonks Master 📈',
    rarity: 200,                   // 1/200 probability
    luck: 150,
    emojis: [
      {
        character: '📈',
        damage: 11,
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
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Stonks - the deliberate misspelling representing financial success',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 750,
    
    // Display
    emoji: '📈',
    description: 'Number go up! To the moon!',
    visual: CardUtils.getDefaultVisual(200, 1),
    
    // Optional Combat
    hp: 115,
    cardEffects: [
      {
        trigger: TriggerType.RANDOM,
        chance: 0.2,
        effect: EffectType.BURST,
        duration: 2
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];