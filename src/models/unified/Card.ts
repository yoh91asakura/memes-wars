/**
 * Unified Card Model - Combines both TCG system and simple card mechanics
 * This model unifies src/models/Card.ts and src/types/card.ts
 */

// Unified Rarity enum (combines both systems)
export enum UnifiedRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  COSMIC = 'cosmic'
}

// Card types from simple card system
export enum CardType {
  CREATURE = 'creature',
  SPELL = 'spell',
  ATTACK = 'attack',
  DEFENSE = 'defense',
  HEALING = 'healing',
  SUPPORT = 'support'
}

// Effect types for combat system
export enum EffectType {
  FREEZE = 'FREEZE',
  BURN = 'BURN',
  HEAL = 'HEAL',
  BOOST = 'BOOST',
  SHIELD = 'SHIELD',
  POISON = 'POISON',
  LUCKY = 'LUCKY'
}

// Trajectory patterns for projectiles
export enum TrajectoryPattern {
  STRAIGHT = 'STRAIGHT',
  WAVE = 'WAVE',
  SPIRAL = 'SPIRAL',
  HOMING = 'HOMING',
  RANDOM = 'RANDOM'
}

// Emoji effect interface
export interface EmojiEffect {
  type: EffectType;
  duration?: number; // in seconds
  power?: number;    // effect strength
  chance?: number;   // trigger probability (0-1)
}

// Emoji projectile interface
export interface EmojiProjectile {
  character: string;           // The emoji character
  damage: number;              // Base damage per hit
  speed: number;               // Projectile velocity (pixels/second)
  effect?: EmojiEffect;        // Special effect on hit
  trajectory: TrajectoryPattern; // Movement pattern
}

// Passive ability interface
export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  triggerChance: number; // 0-1 probability
  cooldown?: number;     // seconds between triggers
  effect?: () => void;   // Effect implementation (optional for data)
}

// Card stats interface
export interface CardStats {
  attack: number;
  defense: number;
  health: number;
}

// Main unified card interface
export interface UnifiedCard {
  // === Core Identity ===
  id: string;
  name: string;
  description?: string;
  
  // === Classification ===
  rarity: UnifiedRarity;
  type: CardType;
  
  // === TCG Properties (from Card.ts) ===
  emojis: EmojiProjectile[];
  hp: number;
  attackSpeed: number; // shots per second
  passive: PassiveAbility;
  
  // === Simple Card Properties (from card.ts) ===
  cost: number;
  attack?: number;
  defense?: number;
  damage?: number; // For spells and direct damage
  
  // === Enhanced Stats ===
  stats?: CardStats; // Structured stats
  
  // === Progression System ===
  stackLevel: number;
  experience: number;
  luck: number;          // Luck bonus percentage (0-100)
  dropChance?: string;   // Drop rate display (e.g., "1/5000")
  
  // === Visual & UI ===
  emoji?: string;        // Primary emoji (backward compatibility)
  borderColor?: string;
  color?: string;        // Card theme color
  glowIntensity?: number;
  imageUrl?: string;
  
  // === Metadata ===
  ability?: string;      // Ability description
  flavor?: string;       // Flavor text
  lore?: string;         // Extended lore
  effects?: string[];    // Effect descriptions
  tags?: string[];       // Tags for filtering
}

// Calculated card stats interface
export interface CalculatedCardStats {
  totalDamage: number;
  totalHp: number;
  totalAttackSpeed: number;
  emojiCount: number;
  effectiveCost: number;
}

// Rarity configuration
export interface RarityConfig {
  rarity: UnifiedRarity;
  dropRate: number;      // Base drop percentage
  hpRange: [number, number];
  attackSpeedRange: [number, number];
  emojiCountRange: [number, number];
  color: string;
  glowColor?: string;
  sparkles?: boolean;
  rainbow?: boolean;
}

// Rarity configurations
export const RARITY_CONFIGS: Record<UnifiedRarity, RarityConfig> = {
  [UnifiedRarity.COMMON]: {
    rarity: UnifiedRarity.COMMON,
    dropRate: 50,
    hpRange: [10, 20],
    attackSpeedRange: [0.5, 1.0],
    emojiCountRange: [1, 2],
    color: '#808080',
  },
  [UnifiedRarity.UNCOMMON]: {
    rarity: UnifiedRarity.UNCOMMON,
    dropRate: 25,
    hpRange: [20, 40],
    attackSpeedRange: [1.0, 1.5],
    emojiCountRange: [2, 3],
    color: '#40C057',
    glowColor: '#60E077',
  },
  [UnifiedRarity.RARE]: {
    rarity: UnifiedRarity.RARE,
    dropRate: 15,
    hpRange: [40, 80],
    attackSpeedRange: [1.5, 2.0],
    emojiCountRange: [3, 4],
    color: '#339AF0',
    glowColor: '#53BAFF',
  },
  [UnifiedRarity.EPIC]: {
    rarity: UnifiedRarity.EPIC,
    dropRate: 7,
    hpRange: [80, 150],
    attackSpeedRange: [2.0, 2.5],
    emojiCountRange: [4, 5],
    color: '#9775FA',
    glowColor: '#B795FF',
  },
  [UnifiedRarity.LEGENDARY]: {
    rarity: UnifiedRarity.LEGENDARY,
    dropRate: 2.5,
    hpRange: [150, 300],
    attackSpeedRange: [2.5, 3.0],
    emojiCountRange: [5, 6],
    color: '#FD7E14',
    glowColor: '#FF9E34',
  },
  [UnifiedRarity.MYTHIC]: {
    rarity: UnifiedRarity.MYTHIC,
    dropRate: 0.45,
    hpRange: [300, 500],
    attackSpeedRange: [3.0, 4.0],
    emojiCountRange: [6, 8],
    color: '#FA5252',
    glowColor: '#FF7272',
    sparkles: true,
  },
  [UnifiedRarity.COSMIC]: {
    rarity: UnifiedRarity.COSMIC,
    dropRate: 0.05,
    hpRange: [500, 1000],
    attackSpeedRange: [4.0, 5.0],
    emojiCountRange: [8, 10],
    color: '#FF00FF',
    glowColor: '#FF44FF',
    sparkles: true,
    rainbow: true,
  },
};

// Stack system constants
export const STACK_BONUSES = {
  HP_MULTIPLIER: 0.2,        // +20% HP per stack
  ATTACK_SPEED_MULTIPLIER: 0.15, // +15% attack speed per stack
  EMOJI_BONUS_PER_STACK: 1,  // +1 emoji variant per stack
  MAX_STACK_LEVEL: 10,
};

// === UTILITY FUNCTIONS ===

/**
 * Calculate card stats with stacking bonuses
 */
export function calculateCardStats(card: UnifiedCard): CalculatedCardStats {
  const hpWithStacks = card.hp * Math.pow(1 + STACK_BONUSES.HP_MULTIPLIER, card.stackLevel);
  const attackSpeedWithStacks = card.attackSpeed * Math.pow(1 + STACK_BONUSES.ATTACK_SPEED_MULTIPLIER, card.stackLevel);
  
  const totalDamage = card.emojis.reduce((sum, emoji) => sum + emoji.damage, 0) * attackSpeedWithStacks;
  
  return {
    totalDamage,
    totalHp: hpWithStacks,
    totalAttackSpeed: attackSpeedWithStacks,
    emojiCount: card.emojis.length + (card.stackLevel * STACK_BONUSES.EMOJI_BONUS_PER_STACK),
    effectiveCost: card.cost,
  };
}

/**
 * Generate a random value within a range
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Determine card rarity based on drop rates with luck bonus
 */
export function rollRarity(luckBonus: number = 0): UnifiedRarity {
  const roll = Math.random() * 100;
  let cumulativeRate = 0;
  
  // Apply luck bonus (reduces common, increases rare+)
  const adjustedRates = { ...RARITY_CONFIGS };
  if (luckBonus > 0) {
    const mythicBonus = Math.min(luckBonus / 200, 0.1); // Max 10% bonus
    adjustedRates[UnifiedRarity.COMMON].dropRate -= mythicBonus * 100;
    adjustedRates[UnifiedRarity.MYTHIC].dropRate += mythicBonus * 100;
  }
  
  for (const rarity of Object.values(UnifiedRarity)) {
    cumulativeRate += adjustedRates[rarity].dropRate;
    if (roll <= cumulativeRate) {
      return rarity;
    }
  }
  
  return UnifiedRarity.COMMON; // Fallback
}

/**
 * Create a default passive ability for cards that don't have one
 */
export function createDefaultPassive(): PassiveAbility {
  return {
    id: 'default_passive',
    name: 'No Special Ability',
    description: 'This card has no special passive ability.',
    triggerChance: 0,
    cooldown: 0,
  };
}

/**
 * Create default emoji projectiles for cards that don't have them
 */
export function createDefaultEmojis(emoji: string, rarity: UnifiedRarity): EmojiProjectile[] {
  const config = RARITY_CONFIGS[rarity];
  const emojiCount = Math.floor(randomInRange(config.emojiCountRange[0], config.emojiCountRange[1]));
  
  return Array.from({ length: emojiCount }, () => ({
    character: emoji,
    damage: Math.floor(randomInRange(5, 15) * (Object.values(UnifiedRarity).indexOf(rarity) + 1)),
    speed: randomInRange(100, 300),
    trajectory: TrajectoryPattern.STRAIGHT,
  }));
}

/**
 * Check if a card is a valid unified card
 */
export function isValidUnifiedCard(card: any): card is UnifiedCard {
  return (
    card &&
    typeof card.id === 'string' &&
    typeof card.name === 'string' &&
    Object.values(UnifiedRarity).includes(card.rarity) &&
    Object.values(CardType).includes(card.type) &&
    Array.isArray(card.emojis) &&
    typeof card.hp === 'number' &&
    typeof card.attackSpeed === 'number' &&
    card.passive &&
    typeof card.cost === 'number' &&
    typeof card.stackLevel === 'number' &&
    typeof card.experience === 'number' &&
    typeof card.luck === 'number'
  );
}

// === ADAPTER FUNCTIONS (for backward compatibility) ===

/**
 * Convert from old Card model (models/Card.ts) to UnifiedCard
 */
export function adaptFromTCGCard(oldCard: any): UnifiedCard {
  return {
    id: oldCard.id,
    name: oldCard.name,
    description: oldCard.description,
    rarity: oldCard.rarity.toLowerCase() as UnifiedRarity,
    type: CardType.CREATURE, // Default for old TCG cards
    emojis: oldCard.emojis || [],
    hp: oldCard.hp,
    attackSpeed: oldCard.attackSpeed,
    passive: oldCard.passive,
    cost: Math.ceil(oldCard.hp / 10), // Estimated cost based on HP
    stackLevel: oldCard.stackLevel || 0,
    experience: oldCard.experience || 0,
    luck: oldCard.luck || 0,
    dropChance: oldCard.dropChance,
    emoji: oldCard.emojis?.[0]?.character,
    borderColor: oldCard.borderColor,
    glowIntensity: oldCard.glowIntensity,
    imageUrl: oldCard.imageUrl,
    tags: ['tcg'],
  };
}

/**
 * Convert from old simple card (types/card.ts) to UnifiedCard
 */
export function adaptFromSimpleCard(oldCard: any): UnifiedCard {
  const rarity = oldCard.rarity as UnifiedRarity;
  const emojis = oldCard.emoji ? createDefaultEmojis(oldCard.emoji, rarity) : [];
  
  return {
    id: oldCard.id,
    name: oldCard.name,
    description: oldCard.description,
    rarity: rarity,
    type: oldCard.type,
    emojis: emojis,
    hp: oldCard.stats?.health || oldCard.defense || 20,
    attackSpeed: 1.0, // Default attack speed
    passive: createDefaultPassive(),
    cost: oldCard.cost,
    attack: oldCard.attack || oldCard.stats?.attack,
    defense: oldCard.defense || oldCard.stats?.defense,
    damage: oldCard.damage,
    stats: oldCard.stats,
    stackLevel: 0,
    experience: 0,
    luck: 0,
    emoji: oldCard.emoji,
    color: oldCard.color,
    ability: oldCard.ability,
    flavor: oldCard.flavor,
    lore: oldCard.lore,
    effects: oldCard.effects,
    tags: oldCard.tags,
  };
}

/**
 * Convert UnifiedCard back to simple card format (for compatibility)
 */
export function adaptToSimpleCard(unifiedCard: UnifiedCard): any {
  return {
    id: unifiedCard.id,
    name: unifiedCard.name,
    rarity: unifiedCard.rarity,
    type: unifiedCard.type,
    cost: unifiedCard.cost,
    damage: unifiedCard.damage,
    description: unifiedCard.description,
    emoji: unifiedCard.emoji || unifiedCard.emojis[0]?.character,
    emojis: unifiedCard.emojis.map(e => e.character),
    color: unifiedCard.color,
    attack: unifiedCard.attack,
    defense: unifiedCard.defense,
    ability: unifiedCard.ability,
    flavor: unifiedCard.flavor,
    stats: unifiedCard.stats,
    effects: unifiedCard.effects,
    tags: unifiedCard.tags,
    lore: unifiedCard.lore,
  };
}

// Export legacy types for compatibility
export type Card = UnifiedCard;
export type Rarity = UnifiedRarity;
export type LegacyCard = any;