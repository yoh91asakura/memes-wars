// Unified Card Model - Aligned with Data Model Specification
// Follows specs/001-extract-current-project/data-model.md

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  COSMIC = 'cosmic'
}

export enum MemeFamily {
  CLASSIC_INTERNET = 'CLASSIC_INTERNET',
  MEME_FORMATS = 'MEME_FORMATS',
  MYTHOLOGY = 'MYTHOLOGY',
  HISTORICAL_FIGURES = 'HISTORICAL_FIGURES',
  ANIMALS = 'ANIMALS',
  ABSTRACT_CONCEPTS = 'ABSTRACT_CONCEPTS',
  EMOTIONS_REACTIONS = 'EMOTIONS_REACTIONS',
  INTERNET_CULTURE = 'INTERNET_CULTURE',
  GAMING_ARCHETYPES = 'GAMING_ARCHETYPES',
  LIFE_SITUATIONS = 'LIFE_SITUATIONS'
}

// Special effect types that can proc during combat
export enum EffectType {
  FREEZE = 'FREEZE',           // Slow enemy fire rate
  BURN = 'BURN',               // Damage over time
  HEAL = 'HEAL',               // Restore HP
  BOOST = 'BOOST',             // Increase fire rate
  SHIELD = 'SHIELD',           // Block incoming hits
  POISON = 'POISON',           // Reduce healing
  LUCKY = 'LUCKY',             // Bonus rewards
  BURST = 'BURST',             // Sudden damage spike
  REFLECT = 'REFLECT',         // Bounce emojis back
  MULTIPLY = 'MULTIPLY',       // Duplicate emojis
  STUN = 'STUN',              // Temporary disable
  DRAIN = 'DRAIN',            // Steal HP
  BARRIER = 'BARRIER',        // Temporary invincibility
  CHAOS = 'CHAOS',            // Random effect
  PRECISION = 'PRECISION',    // Guaranteed critical hit
}

// Card effect trigger types
export enum TriggerType {
  RANDOM = 'RANDOM',                    // Random proc during battle
  ON_HIT = 'ON_HIT',                   // When this card's emoji hits opponent
  ON_DAMAGE = 'ON_DAMAGE',             // When player takes damage
  PERIODIC = 'PERIODIC',               // Every X seconds
  BATTLE_START = 'BATTLE_START',       // At beginning of combat
  BATTLE_END = 'BATTLE_END',           // At end of combat
  LOW_HP = 'LOW_HP',                   // When HP below threshold
  HIGH_COMBO = 'HIGH_COMBO',           // After multiple hits
  FAMILY_SYNERGY = 'FAMILY_SYNERGY'    // When other family cards present
}

// Emoji projectile interface
export interface EmojiAttack {
  character: string;            // The emoji character
  damage: number;               // Base damage per hit
  effects?: EffectType[];       // Status effects applied
}

// Card effects that can proc during combat
export interface CardEffect {
  trigger: TriggerType;         // When can this effect happen
  effect: EffectType;           // What happens
  value: number;                // Effect magnitude
  chance: number;               // Activation probability (0-1)
  duration?: number;            // Effect duration in seconds
  cooldown?: number;            // Cooldown between uses
}

// Passive abilities for Legendary+ cards - aligned with data-model.md
export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  effect: string; // JSON string of effect configuration
  trigger: 'combat_start' | 'low_hp' | 'high_combo' | 'synergy';
}

// Card interface aligned with data-model.md specification but compatible with existing code
export interface Card {
  // === CORE IDENTITY ===
  id: string;                    // Unique identifier
  name: string;                  // Display name
  rarity: CardRarity | number;   // Support both enum and numeric rarity
  luck: number;                  // Luck stat affecting rewards and effects
  emojis: string[] | EmojiAttack[]; // Combat projectiles - support both formats
  family: MemeFamily;            // Thematic classification for synergies
  reference: string;             // Specific pop culture reference
  
  // === COMPATIBILITY WITH ORIGINAL MODEL ===
  memeFamily?: MemeFamily;       // Legacy property name
  health?: number;               // HP in combat (legacy)
  hp?: number;                   // HP in combat (new)
  attackDamage?: number;         // Base damage per attack
  attackSpeed?: number;          // Attacks per second (0.1 - 5.0)
  
  // === STACKING SYSTEM ===
  stackLevel: number;            // Current stack level (1-10)
  goldReward: number;            // Gold earned when rolled
  
  // === DISPLAY ===
  emoji: string;                 // Primary emoji for card display
  flavor?: string;               // Humorous description
  description?: string;          // Card description
  imageUrl?: string;             // Card artwork
  
  // === OPTIONAL PROPERTIES ===
  manaCost?: number;            // Deck building cost (higher rarities)
  passiveAbility?: PassiveAbility; // Legendary+ special abilities
  cardEffects?: CardEffect[];   // Effects that can proc during battle
  unlockStage?: number;         // When card becomes available
  
  // === METADATA ===
  createdAt: string;            // When card was created
  updatedAt: string;            // Last update time
  addedAt?: string;             // When added to collection
}

// Card validation utilities - implements constraints from data-model.md
export class CardValidator {
  static isValid(card: Card): boolean {
    // Card ID must be unique within collection
    if (!card.id || card.id.trim() === '') return false;
    
    // Health and damage must be positive integers
    if (card.health <= 0 || !Number.isInteger(card.health)) return false;
    if (card.attackDamage <= 0 || !Number.isInteger(card.attackDamage)) return false;
    
    // Attack speed must be between 0.1 and 5.0
    if (card.attackSpeed < 0.1 || card.attackSpeed > 5.0) return false;
    
    // Emoji array must contain 1-3 valid Unicode emojis
    if (!Array.isArray(card.emojis) || card.emojis.length < 1 || card.emojis.length > 3) return false;
    
    // Passive abilities only on Legendary+ cards
    if (card.passiveAbility && !this.isLegendaryOrHigher(card.rarity)) return false;
    
    return true;
  }
  
  static isLegendaryOrHigher(rarity: CardRarity): boolean {
    return [CardRarity.LEGENDARY, CardRarity.MYTHIC, CardRarity.COSMIC].includes(rarity);
  }
}

// Utility functions for working with Cards - compatible with both models
export const CardUtils = {
  // Create a new card with validation
  createCard(data: Omit<Card, 'id'>): Card {
    const card: Card = {
      ...data,
      id: crypto.randomUUID(),
    };
    
    if (!CardValidator.isValid(card)) {
      throw new Error('Invalid card data provided');
    }
    
    return card;
  },

  // Get rarity name from probability (compatibility with original model)
  getRarityName(probability: number): string {
    if (probability <= 2) return 'Common';
    if (probability <= 4) return 'Uncommon';
    if (probability <= 10) return 'Rare';
    if (probability <= 50) return 'Epic';
    if (probability <= 200) return 'Legendary';
    if (probability <= 1000) return 'Mythic';
    if (probability <= 10000) return 'Cosmic';
    if (probability <= 100000) return 'Divine';
    return 'Infinity';
  },
  
  // Get rarity display color
  getRarityColor(rarity: CardRarity | number): string {
    if (typeof rarity === 'number') {
      // Convert numeric rarity to enum
      if (rarity <= 2) rarity = CardRarity.COMMON;
      else if (rarity <= 4) rarity = CardRarity.UNCOMMON;
      else if (rarity <= 10) rarity = CardRarity.RARE;
      else if (rarity <= 50) rarity = CardRarity.EPIC;
      else if (rarity <= 200) rarity = CardRarity.LEGENDARY;
      else if (rarity <= 1000) rarity = CardRarity.MYTHIC;
      else rarity = CardRarity.COSMIC;
    }
    
    const colors: Record<CardRarity, string> = {
      [CardRarity.COMMON]: '#9CA3AF',      // Gray
      [CardRarity.UNCOMMON]: '#10B981',    // Green
      [CardRarity.RARE]: '#3B82F6',        // Blue
      [CardRarity.EPIC]: '#8B5CF6',        // Purple
      [CardRarity.LEGENDARY]: '#F59E0B',   // Orange
      [CardRarity.MYTHIC]: '#EF4444',      // Red
      [CardRarity.COSMIC]: '#EC4899',      // Pink
    };
    return colors[rarity];
  },
  
  // Get rarity order for sorting
  getRarityOrder(rarity: CardRarity | number): number {
    if (typeof rarity === 'number') {
      return rarity; // Numeric rarity is already ordered
    }
    
    const order: Record<CardRarity, number> = {
      [CardRarity.COMMON]: 1,
      [CardRarity.UNCOMMON]: 2,
      [CardRarity.RARE]: 3,
      [CardRarity.EPIC]: 4,
      [CardRarity.LEGENDARY]: 5,
      [CardRarity.MYTHIC]: 6,
      [CardRarity.COSMIC]: 7,
    };
    return order[rarity];
  },
};