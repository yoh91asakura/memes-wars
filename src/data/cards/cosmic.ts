import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const cosmicCards: Card[] = [
  {
    // Core Identity
    id: 'cosmic-001',
    name: 'Big Chungus Supreme 🐰🌌',
    rarity: 10000,                   // 1/10000 probability
    luck: 777,
    emojis: [
      {
        character: '🐰',
        damage: 25,
        speed: 2,
        trajectory: 'arc',
        effect: EffectType.STUN,
        target: 'OPPONENT'
      },
      {
        character: '🍰',
        damage: 15,
        speed: 2,
        trajectory: 'arc',
        target: 'OPPONENT'
      },
      {
        character: '💪',
        damage: 20,
        speed: 1,
        trajectory: 'spiral',
        effect: EffectType.BURST,
        target: 'OPPONENT'
      },
      {
        character: '🎆',
        damage: 12,
        speed: 4,
        trajectory: 'spiral',
        target: 'OPPONENT'
      },
      {
        character: '🌌',
        damage: 30,
        speed: 1,
        trajectory: 'wave',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      },
      {
        character: '💥',
        damage: 18,
        speed: 3,
        trajectory: 'wave',
        target: 'OPPONENT'
      },
      {
        character: '✨',
        damage: 8,
        speed: 5,
        trajectory: 'straight',
        target: 'OPPONENT'
      },
      {
        character: '🔥',
        damage: 22,
        speed: 2,
        trajectory: 'straight',
        effect: EffectType.BURN,
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Big Chungus - the ultimate form of Bugs Bunny meme that became legendary',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 7500,
    
    // Display
    emoji: '🐰',
    description: 'The absolute unit that broke the internet',
    visual: CardUtils.getDefaultVisual(10000, 1),
    
    // Optional Combat
    hp: 877,  // 100 + luck
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.BARRIER,
        duration: 30
      },
      {
        trigger: TriggerType.RANDOM,
        chance: 0.1,
        effect: EffectType.BURST,
        duration: 1
      },
      {
        trigger: TriggerType.LOW_HP,
        chance: 0.75,
        effect: EffectType.CHAOS,
        duration: 10
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
