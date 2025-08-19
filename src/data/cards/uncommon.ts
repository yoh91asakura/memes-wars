import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const uncommonCards: Card[] = [
  {
    // Core Identity
    id: 'uncommon-001',
    name: 'Doge Wisdom 🐕',
    rarity: 4,                   // 1/4 probability
    luck: 18,
    emojis: [
      {
        character: '🐕',
        damage: 10,
        speed: 3,
        trajectory: 'straight',
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
    reference: 'Doge - the classic Shiba Inu meme representing wisdom and positivity',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 35,
    
    // Display
    emoji: '🐕',
    description: 'Much wisdom, very smart, wow',
    visual: CardUtils.getDefaultVisual(4, 1),
    
    // Optional Combat
    hp: 101,
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'wisdom_proc',
    name: 'Much Wisdom',
    rarity: 4,                   // 1/4 probability
    luck: 22,
    emojis: [
      {
        character: '😱',
        damage: 10,
        speed: 3,
        trajectory: 'arc',
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
    family: MemeFamily.INTERNET_CULTURE,
    reference: 'Surprised Pikachu face - classic reaction meme for unexpected situations',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 42,
    
    // Display
    emoji: '😱',
    description: 'Express shock and disbelief',
    visual: CardUtils.getDefaultVisual(4, 1),
    
    // Optional Combat
    hp: 102,
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];