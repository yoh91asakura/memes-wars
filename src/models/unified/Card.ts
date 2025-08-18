import { CardEmojiData } from '../../components/types/emoji';

// Unified Card Model - Single Source of Truth
// This model consolidates all card properties and ensures consistency

export enum CardRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  COSMIC = 'COSMIC',
}

export enum CardType {
  CREATURE = 'CREATURE',
  SPELL = 'SPELL',
  ARTIFACT = 'ARTIFACT',
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  HEALING = 'HEALING',
  SUPPORT = 'SUPPORT',
}

// Passive abilities that cards can have
export interface PassiveAbility {
  name: string;
  description: string;
  trigger: 'onPlay' | 'onDeath' | 'onAttack' | 'onDefend' | 'onTurnStart' | 'onTurnEnd';
  effect: string;
  value?: number;
}

// Emoji projectile configuration for combat
export interface EmojiProjectile {
  emoji: string;
  damage: number;
  speed: number;
  trajectory: 'straight' | 'arc' | 'homing' | 'wave' | 'spiral' | 'random';
  effects?: string[];
}

// Visual properties for card display
export interface VisualProperties {
  glow?: string;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  shadowColor?: string;
}

// UNIFIED CARD INTERFACE
export interface UnifiedCard {
  // Core Identity
  id: string;
  name: string;
  description: string;
  emoji: string;
  
  // Game Mechanics
  rarity: CardRarity;
  type: CardType;
  cost: number;
  
  // Combat Stats
  attack: number;
  defense: number;
  health: number;
  attackSpeed?: number;
  
  // Advanced Properties
  passiveAbility?: PassiveAbility;
  emojiProjectile?: EmojiProjectile;
  
  // Progression System
  level: number;
  experience: number;
  stackCount: number;
  maxStacks: number;
  
  // Visual & UI
  visual: VisualProperties;
  
  // Metadata
  effects?: string[];
  tags?: string[];
  flavor?: string;
  lore?: string;
  craftable: boolean;
  craftCost?: number;
  isActive: boolean;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Legacy Compatibility (marked for deprecation)
  /** @deprecated Use attack instead */
  damage?: number;
  /** @deprecated Use passiveAbility instead */
  ability?: string;
  /** @deprecated Use emojiProjectile instead */
  emojis?: string[];
  /** @deprecated Use emojiProjectile instead */
  emojiData?: CardEmojiData;
  /** @deprecated Use flat properties instead */
  stats?: {
    attack: number;
    defense: number;
    health: number;
  };
}

// Type alias for backward compatibility
export type Card = UnifiedCard;

// Utility functions for card management
export class CardUtils {
  // Convert legacy card format to unified format
  static migrateToUnified(legacyCard: any): UnifiedCard {
    const now = new Date().toISOString();
    
    return {
      // Core Identity
      id: legacyCard.id || 'unknown',
      name: legacyCard.name || 'Unknown Card',
      description: legacyCard.description || '',
      emoji: legacyCard.emoji || '❓',
      
      // Game Mechanics
      rarity: this.normalizeRarity(legacyCard.rarity),
      type: legacyCard.type || CardType.CREATURE,
      cost: legacyCard.cost || 1,
      
      // Combat Stats - handle both flat and nested stats
      attack: legacyCard.attack || legacyCard.stats?.attack || legacyCard.damage || 1,
      defense: legacyCard.defense || legacyCard.stats?.defense || 1,
      health: legacyCard.health || legacyCard.stats?.health || 1,
      attackSpeed: legacyCard.attackSpeed || 1,
      
      // Advanced Properties
      passiveAbility: legacyCard.passiveAbility,
      emojiProjectile: legacyCard.emojiProjectile,
      
      // Progression System
      level: legacyCard.level || 1,
      experience: legacyCard.experience || 0,
      stackCount: legacyCard.stackCount || 1,
      maxStacks: legacyCard.maxStacks || this.getMaxStacksByRarity(this.normalizeRarity(legacyCard.rarity)),
      
      // Visual & UI
      visual: legacyCard.visual || this.getDefaultVisualByRarity(this.normalizeRarity(legacyCard.rarity)),
      
      // Metadata
      effects: legacyCard.effects || [],
      tags: legacyCard.tags || [],
      flavor: legacyCard.flavor,
      lore: legacyCard.lore,
      craftable: legacyCard.craftable || false,
      craftCost: legacyCard.craftCost,
      isActive: legacyCard.isActive !== false,
      releaseDate: legacyCard.releaseDate || now,
      createdAt: legacyCard.createdAt || now,
      updatedAt: legacyCard.updatedAt || now,
      
      // Legacy Compatibility
      damage: legacyCard.damage,
      ability: legacyCard.ability,
      emojis: legacyCard.emojis,
      emojiData: legacyCard.emojiData,
      stats: legacyCard.stats,
    };
  }
  
  // Normalize rarity from string to enum
  private static normalizeRarity(rarity: any): CardRarity {
    if (typeof rarity === 'string') {
      const upperRarity = rarity.toUpperCase();
      return CardRarity[upperRarity as keyof typeof CardRarity] || CardRarity.COMMON;
    }
    return rarity || CardRarity.COMMON;
  }
  
  // Get max stacks based on rarity
  private static getMaxStacksByRarity(rarity: CardRarity): number {
    const stackMap = {
      [CardRarity.COMMON]: 10,
      [CardRarity.UNCOMMON]: 8,
      [CardRarity.RARE]: 6,
      [CardRarity.EPIC]: 4,
      [CardRarity.LEGENDARY]: 3,
      [CardRarity.MYTHIC]: 2,
      [CardRarity.COSMIC]: 1,
    };
    return stackMap[rarity] || 5;
  }
  
  // Get default visual properties by rarity
  private static getDefaultVisualByRarity(rarity: CardRarity): VisualProperties {
    const visualMap = {
      [CardRarity.COMMON]: {
        glow: '#9CA3AF',
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
        textColor: '#374151',
      },
      [CardRarity.UNCOMMON]: {
        glow: '#10B981',
        borderColor: '#059669',
        backgroundColor: '#ECFDF5',
        textColor: '#065F46',
      },
      [CardRarity.RARE]: {
        glow: '#3B82F6',
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
        textColor: '#1E3A8A',
      },
      [CardRarity.EPIC]: {
        glow: '#8B5CF6',
        borderColor: '#7C3AED',
        backgroundColor: '#F5F3FF',
        textColor: '#4C1D95',
      },
      [CardRarity.LEGENDARY]: {
        glow: '#F59E0B',
        borderColor: '#D97706',
        backgroundColor: '#FFFBEB',
        textColor: '#92400E',
      },
      [CardRarity.MYTHIC]: {
        glow: '#EF4444',
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
        textColor: '#991B1B',
      },
      [CardRarity.COSMIC]: {
        glow: '#EC4899',
        borderColor: '#DB2777',
        backgroundColor: '#FDF2F8',
        textColor: '#831843',
      },
    };
    return visualMap[rarity] || visualMap[CardRarity.COMMON];
  }
  
  // Calculate total card power based on stats
  static calculatePower(card: UnifiedCard): number {
    return card.attack + card.defense + card.health + (card.cost * 2);
  }
  
  // Check if card is valid
  static isValid(card: UnifiedCard): boolean {
    return (
      !!card.id &&
      !!card.name &&
      !!card.emoji &&
      card.attack >= 0 &&
      card.defense >= 0 &&
      card.health >= 0 &&
      card.cost >= 0 &&
      Object.values(CardRarity).includes(card.rarity) &&
      Object.values(CardType).includes(card.type)
    );
  }
}

// Filter interface for card queries
export interface CardFilter {
  rarity?: CardRarity;
  type?: CardType;
  cost?: number;
  minAttack?: number;
  maxAttack?: number;
  minDefense?: number;
  maxDefense?: number;
  minHealth?: number;
  maxHealth?: number;
  tags?: string[];
  craftable?: boolean;
  isActive?: boolean;
}

// Export the unified types for backward compatibility
export { CardRarity as Rarity, CardType as Type };
