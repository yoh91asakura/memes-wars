/**
 * Card.ts - Core card system models for Emoji Mayhem TCG
 * Following SPARC methodology with TDD approach
 */

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  COSMIC = 'COSMIC'
}

export enum EffectType {
  FREEZE = 'FREEZE',
  BURN = 'BURN',
  HEAL = 'HEAL',
  BOOST = 'BOOST',
  SHIELD = 'SHIELD',
  POISON = 'POISON',
  LUCKY = 'LUCKY'
}

export enum TrajectoryPattern {
  STRAIGHT = 'STRAIGHT',
  WAVE = 'WAVE',
  SPIRAL = 'SPIRAL',
  HOMING = 'HOMING',
  RANDOM = 'RANDOM'
}

export interface EmojiEffect {
  type: EffectType;
  duration?: number; // in seconds
  power?: number;    // effect strength
  chance?: number;   // trigger probability (0-1)
}

export interface EmojiProjectile {
  character: string;           // The emoji character
  damage: number;              // Base damage per hit
  speed: number;               // Projectile velocity (pixels/second)
  effect?: EmojiEffect;        // Special effect on hit
  trajectory: TrajectoryPattern; // Movement pattern
}

export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  triggerChance: number; // 0-1 probability
  cooldown?: number;     // seconds between triggers
  effect: () => void;    // Effect implementation
}

export interface Card {
  // Identification
  id: string;
  name: string;
  description?: string;
  
  // Card properties
  rarity: Rarity;
  emojis: EmojiProjectile[];
  hp: number;
  attackSpeed: number; // shots per second
  
  // Passive ability
  passive: PassiveAbility;
  
  // Progression
  stackLevel: number;
  experience: number;
  
  // Visual
  borderColor?: string;
  glowIntensity?: number;
  imageUrl?: string;
}

export interface CardStats {
  totalDamage: number;
  totalHp: number;
  totalAttackSpeed: number;
  emojiCount: number;
}

export interface RarityConfig {
  rarity: Rarity;
  dropRate: number;      // Base drop percentage
  hpRange: [number, number];
  attackSpeedRange: [number, number];
  emojiCountRange: [number, number];
  color: string;
  glowColor?: string;
  sparkles?: boolean;
  rainbow?: boolean;
}

export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  [Rarity.COMMON]: {
    rarity: Rarity.COMMON,
    dropRate: 50,
    hpRange: [10, 20],
    attackSpeedRange: [0.5, 1.0],
    emojiCountRange: [1, 2],
    color: '#808080',
  },
  [Rarity.UNCOMMON]: {
    rarity: Rarity.UNCOMMON,
    dropRate: 25,
    hpRange: [20, 40],
    attackSpeedRange: [1.0, 1.5],
    emojiCountRange: [2, 3],
    color: '#40C057',
    glowColor: '#60E077',
  },
  [Rarity.RARE]: {
    rarity: Rarity.RARE,
    dropRate: 15,
    hpRange: [40, 80],
    attackSpeedRange: [1.5, 2.0],
    emojiCountRange: [3, 4],
    color: '#339AF0',
    glowColor: '#53BAFF',
  },
  [Rarity.EPIC]: {
    rarity: Rarity.EPIC,
    dropRate: 7,
    hpRange: [80, 150],
    attackSpeedRange: [2.0, 2.5],
    emojiCountRange: [4, 5],
    color: '#9775FA',
    glowColor: '#B795FF',
  },
  [Rarity.LEGENDARY]: {
    rarity: Rarity.LEGENDARY,
    dropRate: 2.5,
    hpRange: [150, 300],
    attackSpeedRange: [2.5, 3.0],
    emojiCountRange: [5, 6],
    color: '#FD7E14',
    glowColor: '#FF9E34',
  },
  [Rarity.MYTHIC]: {
    rarity: Rarity.MYTHIC,
    dropRate: 0.45,
    hpRange: [300, 500],
    attackSpeedRange: [3.0, 4.0],
    emojiCountRange: [6, 8],
    color: '#FA5252',
    glowColor: '#FF7272',
    sparkles: true,
  },
  [Rarity.COSMIC]: {
    rarity: Rarity.COSMIC,
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

// Calculate card stats with stacking bonuses
export function calculateCardStats(card: Card): CardStats {
  const hpWithStacks = card.hp * Math.pow(1 + STACK_BONUSES.HP_MULTIPLIER, card.stackLevel);
  const attackSpeedWithStacks = card.attackSpeed * Math.pow(1 + STACK_BONUSES.ATTACK_SPEED_MULTIPLIER, card.stackLevel);
  
  const totalDamage = card.emojis.reduce((sum, emoji) => sum + emoji.damage, 0) * attackSpeedWithStacks;
  
  return {
    totalDamage,
    totalHp: hpWithStacks,
    totalAttackSpeed: attackSpeedWithStacks,
    emojiCount: card.emojis.length + (card.stackLevel * STACK_BONUSES.EMOJI_BONUS_PER_STACK),
  };
}

// Generate a random value within a range
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Determine card rarity based on drop rates
export function rollRarity(luckBonus: number = 0): Rarity {
  const roll = Math.random() * 100;
  let cumulativeRate = 0;
  
  // Apply luck bonus (reduces common, increases rare+)
  const adjustedRates = { ...RARITY_CONFIGS };
  if (luckBonus > 0) {
    const mythicBonus = Math.min(luckBonus / 200, 0.1); // Max 10% bonus
    adjustedRates[Rarity.COMMON].dropRate -= mythicBonus * 100;
    adjustedRates[Rarity.MYTHIC].dropRate += mythicBonus * 100;
  }
  
  for (const rarity of Object.values(Rarity)) {
    cumulativeRate += adjustedRates[rarity].dropRate;
    if (roll <= cumulativeRate) {
      return rarity;
    }
  }
  
  return Rarity.COMMON; // Fallback
}
