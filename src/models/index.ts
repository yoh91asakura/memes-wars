// Models Index - Single source of truth for all model imports
// This file provides a unified interface to both Card models for compatibility

// Primary exports from unified Card model
export type {
  Card,
  CardEffect,
  EmojiAttack,
  PassiveAbility
} from './unified/Card';

export {
  CardRarity,
  MemeFamily,
  EffectType,
  TriggerType,
  CardValidator,
  CardUtils
} from './unified/Card';

// Re-export additional types from original model if needed
export type {
  Emoji,
  StackBonus,
  VisualProperties
} from './Card';

// Export other models
export * from './Deck';
export * from './unified/Stage';
export * from './Combat';
export * from './Player';

// Default Card interface for easy importing
export type { Card as DefaultCard } from './unified/Card';