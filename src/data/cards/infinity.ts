import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const infinityCards: Card[] = [
  {
    // Core Identity
    id: 'infinity-001',
    name: 'Omnimeme Nexus 🌍🔮∞',
    rarity: 1000000,                   // 1/1000000 probability
    luck: 5000,
    emojis: [
      {
        character: '🌍',
        damage: 50,
        speed: 1,
        trajectory: 'spiral',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      },
      {
        character: '🔮',
        damage: 40,
        speed: 2,
        trajectory: 'wave',
        effect: EffectType.MULTIPLY,
        target: 'OPPONENT'
      },
      {
        character: '∞',
        damage: 60,
        speed: 1,
        trajectory: 'arc',
        effect: EffectType.BURST,
        target: 'OPPONENT'
      },
      {
        character: '⚡',
        damage: 35,
        speed: 5,
        trajectory: 'straight',
        effect: EffectType.STUN,
        target: 'OPPONENT'
      },
      {
        character: '🌟',
        damage: 30,
        speed: 3,
        trajectory: 'wave',
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'The ultimate convergence of all meme culture - past, present, and future',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 100000,
    
    // Display
    emoji: '🌍',
    description: 'All memes that have been, are, and will be - united as one',
    visual: CardUtils.getDefaultVisual(1000000, 1),
    
    // Optional Combat
    hp: 5100,
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.BARRIER,
        duration: 999
      },
      {
        trigger: TriggerType.RANDOM,
        chance: 0.5,
        effect: EffectType.CHAOS,
        duration: 10
      },
      {
        trigger: TriggerType.LOW_HP,
        chance: 1.0,
        effect: EffectType.RESURRECT,
        duration: 1
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];