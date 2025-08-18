import { EmojiPower, EmojiCategory, EmojiEffectType } from '../types/emoji';

/**
 * Comprehensive emoji database with all 50+ emojis and their powers
 */
const EMOJI_POWERS_DATABASE: Record<string, EmojiPower> = {
  // Fire/Heat Emojis
  '🔥': {
    character: '🔥',
    name: 'Flame',
    category: EmojiCategory.DAMAGE,
    baseDamage: 3,
    effectType: EmojiEffectType.BURN,
    effectValue: 2,
    effectDuration: 3,
    projectileSpeed: 1.2,
    trajectory: 'straight',
    description: 'Burns target for continuous damage',
  },
  '💥': {
    character: '💥',
    name: 'Explosion',
    category: EmojiCategory.DAMAGE,
    baseDamage: 8,
    effectType: EmojiEffectType.AREA,
    effectValue: 80, // AoE radius
    effectDuration: 0,
    projectileSpeed: 0.8,
    trajectory: 'straight',
    description: 'Area of effect explosion damage',
  },
  '⚡': {
    character: '⚡',
    name: 'Lightning',
    category: EmojiCategory.DAMAGE,
    baseDamage: 5,
    effectType: EmojiEffectType.CHAIN,
    effectValue: 3, // Chain count
    effectDuration: 0,
    projectileSpeed: 2.5,
    trajectory: 'homing',
    description: 'Lightning that chains between enemies',
  },
  '🌪️': {
    character: '🌪️',
    name: 'Tornado',
    category: EmojiCategory.DAMAGE,
    baseDamage: 4,
    effectType: EmojiEffectType.KNOCKBACK,
    effectValue: 100, // Knockback force
    effectDuration: 0,
    projectileSpeed: 1.0,
    trajectory: 'spiral',
    description: 'Knocks back enemies with spiral movement',
  },
  '🗲': {
    character: '🗲',
    name: 'Thunderbolt',
    category: EmojiCategory.DAMAGE,
    baseDamage: 7,
    effectType: EmojiEffectType.PIERCE,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 3.0,
    trajectory: 'straight',
    description: 'Pierces through multiple enemies',
  },

  // Ice/Cold Emojis
  '❄️': {
    character: '❄️',
    name: 'Snowflake',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.FREEZE,
    effectValue: 0,
    effectDuration: 2,
    projectileSpeed: 1.0,
    trajectory: 'straight',
    description: 'Freezes target, preventing movement',
  },
  '🧊': {
    character: '🧊',
    name: 'Ice Cube',
    category: EmojiCategory.CONTROL,
    baseDamage: 3,
    effectType: EmojiEffectType.SLOW,
    effectValue: 50, // 50% slow
    effectDuration: 4,
    projectileSpeed: 0.8,
    trajectory: 'straight',
    description: 'Slows enemy movement and attack speed',
  },
  '🌨️': {
    character: '🌨️',
    name: 'Snow Cloud',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.AREA,
    effectValue: 120, // Large AoE
    effectDuration: 0,
    projectileSpeed: 0.6,
    trajectory: 'arc',
    description: 'Creates freezing AoE cloud',
  },

  // Water Emojis
  '🌊': {
    character: '🌊',
    name: 'Wave',
    category: EmojiCategory.DAMAGE,
    baseDamage: 4,
    effectType: EmojiEffectType.KNOCKBACK,
    effectValue: 150,
    effectDuration: 0,
    projectileSpeed: 1.2,
    trajectory: 'wave',
    description: 'Wave motion that pushes enemies back',
  },
  '💧': {
    character: '💧',
    name: 'Water Drop',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.HEAL,
    effectValue: 3,
    effectDuration: 0,
    projectileSpeed: 1.5,
    trajectory: 'homing',
    description: 'Heals friendly targets',
  },

  // Nature/Plant Emojis
  '🌿': {
    character: '🌿',
    name: 'Leaf',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.REGEN,
    effectValue: 1,
    effectDuration: 5,
    projectileSpeed: 0.8,
    trajectory: 'arc',
    description: 'Provides health regeneration over time',
  },
  '🌳': {
    character: '🌳',
    name: 'Tree',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.ROOT,
    effectValue: 0,
    effectDuration: 3,
    projectileSpeed: 0.5,
    trajectory: 'straight',
    description: 'Roots enemies in place',
  },
  '🍄': {
    character: '🍄',
    name: 'Mushroom',
    category: EmojiCategory.DEBUFF,
    baseDamage: 2,
    effectType: EmojiEffectType.POISON,
    effectValue: 1,
    effectDuration: 6,
    projectileSpeed: 1.0,
    trajectory: 'arc',
    description: 'Poisons target for damage over time',
  },
  '🌺': {
    character: '🌺',
    name: 'Hibiscus',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.CHARM,
    effectValue: 0,
    effectDuration: 2,
    projectileSpeed: 1.1,
    trajectory: 'homing',
    description: 'Charms enemies to fight for you',
  },

  // Weapon/Combat Emojis
  '🗡️': {
    character: '🗡️',
    name: 'Sword',
    category: EmojiCategory.DAMAGE,
    baseDamage: 6,
    effectType: EmojiEffectType.PIERCE,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 2.0,
    trajectory: 'straight',
    description: 'High damage piercing attack',
  },
  '🏹': {
    character: '🏹',
    name: 'Bow and Arrow',
    category: EmojiCategory.DAMAGE,
    baseDamage: 4,
    effectType: EmojiEffectType.DAMAGE,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 2.5,
    trajectory: 'straight',
    description: 'Fast, precise ranged attack',
  },
  '🛡️': {
    character: '🛡️',
    name: 'Shield',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.SHIELD,
    effectValue: 5,
    effectDuration: 0,
    projectileSpeed: 1.0,
    trajectory: 'homing',
    description: 'Grants damage absorption shield',
  },
  '⚔️': {
    character: '⚔️',
    name: 'Crossed Swords',
    category: EmojiCategory.DAMAGE,
    baseDamage: 5,
    effectType: EmojiEffectType.MULTI_HIT,
    effectValue: 2, // Additional hits
    effectDuration: 0,
    projectileSpeed: 1.8,
    trajectory: 'straight',
    description: 'Multiple slashing attacks',
  },

  // Magic/Mystical Emojis
  '✨': {
    character: '✨',
    name: 'Sparkles',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.BUFF_ATTACK,
    effectValue: 25, // +25% attack
    effectDuration: 8,
    projectileSpeed: 1.5,
    trajectory: 'homing',
    description: 'Increases attack power',
  },
  '🔮': {
    character: '🔮',
    name: 'Crystal Ball',
    category: EmojiCategory.ENERGY,
    baseDamage: 3,
    effectType: EmojiEffectType.FORESIGHT,
    effectValue: 0,
    effectDuration: 10,
    projectileSpeed: 1.0,
    trajectory: 'homing',
    description: 'Reveals enemy positions and grants tactical advantage',
  },
  '🌟': {
    character: '🌟',
    name: 'Star',
    category: EmojiCategory.ENERGY,
    baseDamage: 4,
    effectType: EmojiEffectType.LUCKY,
    effectValue: 20, // +20% crit chance
    effectDuration: 5,
    projectileSpeed: 1.3,
    trajectory: 'homing',
    description: 'Increases critical hit chance',
  },
  '🌙': {
    character: '🌙',
    name: 'Crescent Moon',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.SLEEP,
    effectValue: 0,
    effectDuration: 3,
    projectileSpeed: 1.0,
    trajectory: 'arc',
    description: 'Puts enemies to sleep',
  },

  // Animal Emojis
  '🐲': {
    character: '🐲',
    name: 'Dragon',
    category: EmojiCategory.DAMAGE,
    baseDamage: 10,
    effectType: EmojiEffectType.BURN,
    effectValue: 4,
    effectDuration: 4,
    projectileSpeed: 1.2,
    trajectory: 'homing',
    description: 'Powerful dragon fire attack',
  },
  '🦅': {
    character: '🦅',
    name: 'Eagle',
    category: EmojiCategory.DAMAGE,
    baseDamage: 3,
    effectType: EmojiEffectType.RAPID_FIRE,
    effectValue: 3, // Extra shots
    effectDuration: 0,
    projectileSpeed: 2.2,
    trajectory: 'homing',
    description: 'Swift attacks with rapid fire',
  },
  '🐍': {
    character: '🐍',
    name: 'Snake',
    category: EmojiCategory.DEBUFF,
    baseDamage: 3,
    effectType: EmojiEffectType.VENOM,
    effectValue: 2,
    effectDuration: 8,
    projectileSpeed: 1.4,
    trajectory: 'wave',
    description: 'Venomous bite that spreads',
  },
  '🕷️': {
    character: '🕷️',
    name: 'Spider',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.WEB,
    effectValue: 0,
    effectDuration: 4,
    projectileSpeed: 1.1,
    trajectory: 'straight',
    description: 'Webs that slow and trap enemies',
  },

  // Heart/Emotion Emojis
  '💚': {
    character: '💚',
    name: 'Green Heart',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.HEAL,
    effectValue: 6,
    effectDuration: 0,
    projectileSpeed: 1.8,
    trajectory: 'homing',
    description: 'Strong healing power',
  },
  '💙': {
    character: '💙',
    name: 'Blue Heart',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.MANA_RESTORE,
    effectValue: 4,
    effectDuration: 0,
    projectileSpeed: 1.6,
    trajectory: 'homing',
    description: 'Restores mana/energy',
  },
  '🖤': {
    character: '🖤',
    name: 'Black Heart',
    category: EmojiCategory.DEBUFF,
    baseDamage: 4,
    effectType: EmojiEffectType.FEAR,
    effectValue: 0,
    effectDuration: 3,
    projectileSpeed: 1.0,
    trajectory: 'straight',
    description: 'Instills fear, reducing enemy accuracy',
  },

  // Death/Dark Emojis
  '💀': {
    character: '💀',
    name: 'Skull',
    category: EmojiCategory.DEBUFF,
    baseDamage: 8,
    effectType: EmojiEffectType.EXECUTE,
    effectValue: 15, // Execute below 15% HP
    effectDuration: 0,
    projectileSpeed: 1.0,
    trajectory: 'straight',
    description: 'Executes low-health enemies instantly',
  },
  '☠️': {
    character: '☠️',
    name: 'Skull and Crossbones',
    category: EmojiCategory.DEBUFF,
    baseDamage: 6,
    effectType: EmojiEffectType.POISON,
    effectValue: 3,
    effectDuration: 10,
    projectileSpeed: 1.1,
    trajectory: 'straight',
    description: 'Deadly poison that spreads to nearby enemies',
  },

  // Food Emojis
  '🍎': {
    character: '🍎',
    name: 'Apple',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.HEAL,
    effectValue: 2,
    effectDuration: 0,
    projectileSpeed: 1.0,
    trajectory: 'arc',
    description: 'Small healing apple',
  },
  '🌶️': {
    character: '🌶️',
    name: 'Hot Pepper',
    category: EmojiCategory.DAMAGE,
    baseDamage: 3,
    effectType: EmojiEffectType.BURN,
    effectValue: 1,
    effectDuration: 4,
    projectileSpeed: 1.3,
    trajectory: 'straight',
    description: 'Spicy burn damage over time',
  },

  // Tool/Object Emojis
  '⚙️': {
    character: '⚙️',
    name: 'Gear',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.BUFF_SPEED,
    effectValue: 30, // +30% speed
    effectDuration: 6,
    projectileSpeed: 1.0,
    trajectory: 'straight',
    description: 'Increases movement and attack speed',
  },
  '⏰': {
    character: '⏰',
    name: 'Alarm Clock',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.TIME_WARP,
    effectValue: 50, // 50% time slow
    effectDuration: 5,
    projectileSpeed: 1.2,
    trajectory: 'straight',
    description: 'Slows down time for enemies',
  },

  // Misc Special Emojis
  '🎯': {
    character: '🎯',
    name: 'Target',
    category: EmojiCategory.DAMAGE,
    baseDamage: 7,
    effectType: EmojiEffectType.DAMAGE,
    effectValue: 100, // 100% accuracy
    effectDuration: 0,
    projectileSpeed: 2.0,
    trajectory: 'homing',
    description: 'Never misses, high damage',
  },
  '🎪': {
    character: '🎪',
    name: 'Circus Tent',
    category: EmojiCategory.CONTROL,
    baseDamage: 3,
    effectType: EmojiEffectType.CONFUSE,
    effectValue: 0,
    effectDuration: 4,
    projectileSpeed: 1.0,
    trajectory: 'random',
    description: 'Confuses enemies with chaotic movement',
  },
  '🌈': {
    character: '🌈',
    name: 'Rainbow',
    category: EmojiCategory.ENERGY,
    baseDamage: 2,
    effectType: EmojiEffectType.HARMONY,
    effectValue: 15, // +15% all stats
    effectDuration: 12,
    projectileSpeed: 1.5,
    trajectory: 'arc',
    description: 'Harmonious boost to all abilities',
  },
};

/**
 * Get emoji power data by character
 */
export function getEmojiPower(character: string): EmojiPower | null {
  return EMOJI_POWERS_DATABASE[character] || null;
}

/**
 * Get all emoji powers in a category
 */
export function getEmojisByCategory(category: EmojiCategory): EmojiPower[] {
  return Object.values(EMOJI_POWERS_DATABASE).filter(emoji => emoji.category === category);
}

/**
 * Get random emoji from category
 */
export function getRandomEmojiFromCategory(category: EmojiCategory): EmojiPower | null {
  const emojis = getEmojisByCategory(category);
  if (emojis.length === 0) return null;
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Get all available emoji characters
 */
export function getAllEmojiCharacters(): string[] {
  return Object.keys(EMOJI_POWERS_DATABASE);
}

/**
 * Check if emoji exists in database
 */
export function isValidEmoji(character: string): boolean {
  return character in EMOJI_POWERS_DATABASE;
}

/**
 * Get emoji power level (for balancing)
 */
export function getEmojiPowerLevel(character: string): number {
  const emoji = getEmojiPower(character);
  if (!emoji) return 0;
  
  // Calculate power level based on damage, effect value, and special properties
  let powerLevel = emoji.baseDamage;
  
  if (emoji.effectValue) {
    powerLevel += emoji.effectValue * 0.1;
  }
  
  if (emoji.effectDuration) {
    powerLevel += emoji.effectDuration * 0.2;
  }
  
  // Bonus for special trajectory types
  if (emoji.trajectory === 'homing') powerLevel += 1;
  if (emoji.trajectory === 'spiral') powerLevel += 0.5;
  
  return Math.round(powerLevel * 10) / 10;
}

/**
 * Calculate total base damage from emoji characters
 */
export function calculateTotalBaseDamage(emojiCharacters: string[]): number {
  return emojiCharacters.reduce((total, character) => {
    const emoji = getEmojiPower(character);
    return total + (emoji ? emoji.baseDamage : 0);
  }, 0);
}

export { EMOJI_POWERS_DATABASE };

// Alias for backward compatibility
export { EMOJI_POWERS_DATABASE as COMPLETE_EMOJI_DATABASE };
