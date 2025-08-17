/**
 * Unified Card Model - Entry Point
 * 
 * This module provides a unified card model that combines:
 * - TCG combat system (from models/Card.ts)
 * - Simple card mechanics (from types/card.ts)
 */

export * from './Card';

// Legacy imports for backward compatibility
export type { UnifiedCard as Card } from './Card';
export type { UnifiedRarity as Rarity } from './Card';