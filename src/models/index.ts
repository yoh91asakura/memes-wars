// Models Index - Single source of truth for all model imports
// Unified to use only Card.ts as primary source

// Primary exports from Card model
export type {
  Card,
  Emoji,
  CardEffect,
  PassiveAbility,
  StackBonus,
  VisualProperties
} from './Card';

export {
  MemeFamily,
  EffectType,
  TriggerType,
  CardUtils
} from './Card';

// Export other models
export * from './Deck';
export * from './Combat';
export * from './Player';

// Default Card interface for easy importing
export type { Card as DefaultCard } from './Card';