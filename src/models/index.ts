// Models Index - Single source of truth for all model imports
// Unified to use only Card.ts as primary source

// Game Models - Core game functionality
export type {
  Card,
  Emoji,
  CardEffect,
  PassiveAbility,
  StackBonus,
  VisualProperties
} from './Card';

export {
  CardRarity,
  MemeFamily,
  EffectType,
  TriggerType,
  CardUtils
} from './Card';

export * from './Deck';
export * from './Combat';
export * from './Player';

// Spec-Kit Models - AI-assisted development system
export * from './AgentContext';
export * from './DocumentationSync';
export * from './ImplementationPlan';
export * from './ServiceContract';
export * from './SpecificationDocument';
export * from './Task';
export * from './TaskList';
export * from './TestCase';
export * from './TestOrchestration';

// Default Card interface for easy importing
export type { Card as DefaultCard } from './Card';