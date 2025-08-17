import { EmojiPower, EmojiCategory, EmojiEffectType } from '../types/emoji';

/**
 * Complete Emoji Database - All 50 emojis with their powers and effects
 * Based on the specifications in docs/specifications/emoji-powers.md
 */
export const COMPLETE_EMOJI_DATABASE: Record<string, EmojiPower> = {
  // === DAMAGE EMOJIS (Base Attack) ===
  '🔥': {
    character: '🔥',
    name: 'Fire',
    category: EmojiCategory.DAMAGE,
    baseDamage: 3,
    effectType: EmojiEffectType.BURN,
    effectValue: 1,
    effectDuration: 3,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Applies burning damage over time'
  },
  '⚡': {
    character: '⚡',
    name: 'Lightning',
    category: EmojiCategory.DAMAGE,
    baseDamage: 5,
    effectType: EmojiEffectType.CHAIN,
    effectValue: 2,
    effectDuration: 0,
    projectileSpeed: 2,
    trajectory: 'straight',
    description: 'Hits up to 3 targets in sequence'
  },
  '💥': {
    character: '💥',
    name: 'Explosion',
    category: EmojiCategory.DAMAGE,
    baseDamage: 8,
    effectType: EmojiEffectType.AREA,
    effectValue: 50,
    effectDuration: 0,
    projectileSpeed: 0.8,
    trajectory: 'arc',
    description: 'Damages in small radius'
  },
  '🗡️': {
    character: '🗡️',
    name: 'Sword',
    category: EmojiCategory.DAMAGE,
    baseDamage: 4,
    effectType: EmojiEffectType.PIERCE,
    effectValue: 25,
    effectDuration: 0,
    projectileSpeed: 1.5,
    trajectory: 'straight',
    description: 'Ignores 25% armor'
  },
  '🏹': {
    character: '🏹',
    name: 'Arrow',
    category: EmojiCategory.DAMAGE,
    baseDamage: 2,
    effectType: EmojiEffectType.DAMAGE,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 2,
    trajectory: 'straight',
    description: 'Fast projectile with 2x speed'
  },
  '🔫': {
    character: '🔫',
    name: 'Gun',
    category: EmojiCategory.DAMAGE,
    baseDamage: 3,
    effectType: EmojiEffectType.RAPID_FIRE,
    effectValue: 30,
    effectDuration: 0,
    projectileSpeed: 1.8,
    trajectory: 'straight',
    description: 'Triggers extra shot 30% chance'
  },
  '💣': {
    character: '💣',
    name: 'Bomb',
    category: EmojiCategory.DAMAGE,
    baseDamage: 10,
    effectType: EmojiEffectType.DELAYED_EXPLOSION,
    effectValue: 1,
    effectDuration: 1,
    projectileSpeed: 0.6,
    trajectory: 'arc',
    description: 'Explodes after 1s delay'
  },
  '🎯': {
    character: '🎯',
    name: 'Target',
    category: EmojiCategory.DAMAGE,
    baseDamage: 4,
    effectType: EmojiEffectType.HOMING,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 1.2,
    trajectory: 'homing',
    description: 'Seeks nearest enemy'
  },
  '☄️': {
    character: '☄️',
    name: 'Meteor',
    category: EmojiCategory.DAMAGE,
    baseDamage: 12,
    effectType: EmojiEffectType.KNOCKBACK,
    effectValue: 100,
    effectDuration: 0,
    projectileSpeed: 0.5,
    trajectory: 'arc',
    description: 'Pushes enemy emojis back'
  },
  '🌟': {
    character: '🌟',
    name: 'Star',
    category: EmojiCategory.DAMAGE,
    baseDamage: 3,
    effectType: EmojiEffectType.MULTI_HIT,
    effectValue: 3,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Hits 3 times'
  },

  // === CONTROL EMOJIS (Crowd Control) ===
  '❄️': {
    character: '❄️',
    name: 'Ice',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.FREEZE,
    effectValue: 0,
    effectDuration: 2,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Stops enemy fire rate'
  },
  '🌊': {
    character: '🌊',
    name: 'Wave',
    category: EmojiCategory.CONTROL,
    baseDamage: 3,
    effectType: EmojiEffectType.SLOW,
    effectValue: 50,
    effectDuration: 3,
    projectileSpeed: 0.8,
    trajectory: 'wave',
    description: 'Reduces enemy attack speed'
  },
  '🌪️': {
    character: '🌪️',
    name: 'Tornado',
    category: EmojiCategory.CONTROL,
    baseDamage: 4,
    effectType: EmojiEffectType.SCATTER,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 1.5,
    trajectory: 'spiral',
    description: 'Displaces enemy projectiles'
  },
  '🕸️': {
    character: '🕸️',
    name: 'Web',
    category: EmojiCategory.CONTROL,
    baseDamage: 1,
    effectType: EmojiEffectType.ROOT,
    effectValue: 0,
    effectDuration: 1.5,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Prevents emoji movement'
  },
  '🌙': {
    character: '🌙',
    name: 'Moon',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.SLEEP,
    effectValue: 0,
    effectDuration: 2,
    projectileSpeed: 0.8,
    trajectory: 'arc',
    description: 'Disables random enemy emoji'
  },
  '🌈': {
    character: '🌈',
    name: 'Rainbow',
    category: EmojiCategory.CONTROL,
    baseDamage: 1,
    effectType: EmojiEffectType.CONFUSE,
    effectValue: 0,
    effectDuration: 2,
    projectileSpeed: 1.2,
    trajectory: 'wave',
    description: 'Reverses enemy controls'
  },
  '💨': {
    character: '💨',
    name: 'Wind',
    category: EmojiCategory.CONTROL,
    baseDamage: 2,
    effectType: EmojiEffectType.PUSH,
    effectValue: 80,
    effectDuration: 0,
    projectileSpeed: 1.8,
    trajectory: 'straight',
    description: 'Pushes projectiles away'
  },
  '🧲': {
    character: '🧲',
    name: 'Magnet',
    category: EmojiCategory.CONTROL,
    baseDamage: 1,
    effectType: EmojiEffectType.PULL,
    effectValue: 60,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'homing',
    description: 'Attracts enemy projectiles'
  },
  '⏰': {
    character: '⏰',
    name: 'Clock',
    category: EmojiCategory.CONTROL,
    baseDamage: 0,
    effectType: EmojiEffectType.TIME_WARP,
    effectValue: 50,
    effectDuration: 3,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Slows all projectiles 50%'
  },
  '🔒': {
    character: '🔒',
    name: 'Lock',
    category: EmojiCategory.CONTROL,
    baseDamage: 1,
    effectType: EmojiEffectType.DISABLE,
    effectValue: 0,
    effectDuration: 1,
    projectileSpeed: 1.2,
    trajectory: 'straight',
    description: 'Locks random enemy emoji'
  },

  // === SUPPORT EMOJIS (Healing/Buffs) ===
  '💚': {
    character: '💚',
    name: 'Green Heart',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.HEAL,
    effectValue: 5,
    effectDuration: 0,
    projectileSpeed: 1.2,
    trajectory: 'homing',
    description: 'Restores health'
  },
  '❤️': {
    character: '❤️',
    name: 'Red Heart',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.HEAL,
    effectValue: 3,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'homing',
    description: 'Small heal with shield'
  },
  '💙': {
    character: '💙',
    name: 'Blue Heart',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.MANA_RESTORE,
    effectValue: 2,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'homing',
    description: 'Reduces ability cooldowns'
  },
  '🛡️': {
    character: '🛡️',
    name: 'Shield',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.SHIELD,
    effectValue: 3,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Blocks 3 hits'
  },
  '✨': {
    character: '✨',
    name: 'Sparkles',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.BUFF_ATTACK,
    effectValue: 50,
    effectDuration: 3,
    projectileSpeed: 1.5,
    trajectory: 'straight',
    description: 'Increases damage output +50%'
  },
  '🍀': {
    character: '🍀',
    name: 'Clover',
    category: EmojiCategory.SUPPORT,
    baseDamage: 2,
    effectType: EmojiEffectType.LUCKY,
    effectValue: 200,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Doubles coin rewards if kills'
  },
  '🌱': {
    character: '🌱',
    name: 'Sprout',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.REGEN,
    effectValue: 2,
    effectDuration: 5,
    projectileSpeed: 1,
    trajectory: 'homing',
    description: 'Healing over time 2 HP/s for 5s'
  },
  '💪': {
    character: '💪',
    name: 'Muscle',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.BUFF_STRENGTH,
    effectValue: 100,
    effectDuration: 2,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Temporary damage boost +100%'
  },
  '🏃': {
    character: '🏃',
    name: 'Runner',
    category: EmojiCategory.SUPPORT,
    baseDamage: 1,
    effectType: EmojiEffectType.BUFF_SPEED,
    effectValue: 100,
    effectDuration: 2,
    projectileSpeed: 2,
    trajectory: 'straight',
    description: 'Temporary attack speed boost +100%'
  },
  '🎵': {
    character: '🎵',
    name: 'Music',
    category: EmojiCategory.SUPPORT,
    baseDamage: 0,
    effectType: EmojiEffectType.HARMONY,
    effectValue: 0,
    effectDuration: 4,
    projectileSpeed: 1,
    trajectory: 'wave',
    description: 'All emojis sync fire rate'
  },

  // === DEBUFF EMOJIS (Status Effects) ===
  '🧪': {
    character: '🧪',
    name: 'Poison',
    category: EmojiCategory.DEBUFF,
    baseDamage: 2,
    effectType: EmojiEffectType.POISON,
    effectValue: 1,
    effectDuration: 5,
    projectileSpeed: 1.1,
    trajectory: 'arc',
    description: 'Damage over time 1 dmg/s for 5s'
  },
  '💀': {
    character: '💀',
    name: 'Skull',
    category: EmojiCategory.DEBUFF,
    baseDamage: 6,
    effectType: EmojiEffectType.EXECUTE,
    effectValue: 20,
    effectDuration: 0,
    projectileSpeed: 0.9,
    trajectory: 'straight',
    description: 'Instant kill if enemy <20% HP'
  },
  '👻': {
    character: '👻',
    name: 'Ghost',
    category: EmojiCategory.DEBUFF,
    baseDamage: 3,
    effectType: EmojiEffectType.PHASE,
    effectValue: 50,
    effectDuration: 2,
    projectileSpeed: 1.5,
    trajectory: 'homing',
    description: '50% miss chance for 2s'
  },
  '🦠': {
    character: '🦠',
    name: 'Virus',
    category: EmojiCategory.DEBUFF,
    baseDamage: 1,
    effectType: EmojiEffectType.SPREAD,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 0.8,
    trajectory: 'straight',
    description: 'Spreads to nearby enemies'
  },
  '🕷️': {
    character: '🕷️',
    name: 'Spider',
    category: EmojiCategory.DEBUFF,
    baseDamage: 2,
    effectType: EmojiEffectType.FEAR,
    effectValue: 0,
    effectDuration: 1,
    projectileSpeed: 1.3,
    trajectory: 'straight',
    description: 'Makes emojis flee'
  },
  '🐍': {
    character: '🐍',
    name: 'Snake',
    category: EmojiCategory.DEBUFF,
    baseDamage: 3,
    effectType: EmojiEffectType.VENOM,
    effectValue: 1,
    effectDuration: 0,
    projectileSpeed: 1.2,
    trajectory: 'straight',
    description: 'Stacks poison damage'
  },
  '🦂': {
    character: '🦂',
    name: 'Scorpion',
    category: EmojiCategory.DEBUFF,
    baseDamage: 4,
    effectType: EmojiEffectType.PARALYZE,
    effectValue: 0,
    effectDuration: 0.5,
    projectileSpeed: 1.1,
    trajectory: 'straight',
    description: 'Brief stun'
  },
  '🌵': {
    character: '🌵',
    name: 'Cactus',
    category: EmojiCategory.DEBUFF,
    baseDamage: 2,
    effectType: EmojiEffectType.THORNS,
    effectValue: 25,
    effectDuration: 0,
    projectileSpeed: 0.8,
    trajectory: 'straight',
    description: 'Reflects 25% damage'
  },
  '🍄': {
    character: '🍄',
    name: 'Mushroom',
    category: EmojiCategory.DEBUFF,
    baseDamage: 1,
    effectType: EmojiEffectType.SPORE_CLOUD,
    effectValue: 30,
    effectDuration: 3,
    projectileSpeed: 0.6,
    trajectory: 'arc',
    description: 'Creates damaging area'
  },
  '🗿': {
    character: '🗿',
    name: 'Statue',
    category: EmojiCategory.DEBUFF,
    baseDamage: 5,
    effectType: EmojiEffectType.PETRIFY,
    effectValue: 0,
    effectDuration: 1,
    projectileSpeed: 0.5,
    trajectory: 'straight',
    description: 'Turns to stone briefly'
  },

  // === ENERGY EMOJIS (Resource Management) ===
  '🔋': {
    character: '🔋',
    name: 'Battery',
    category: EmojiCategory.ENERGY,
    baseDamage: 1,
    effectType: EmojiEffectType.CHARGE,
    effectValue: 1,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Adds energy for abilities'
  },
  '💫': {
    character: '💫',
    name: 'Energy Zap',
    category: EmojiCategory.ENERGY,
    baseDamage: 3,
    effectType: EmojiEffectType.ENERGY_STEAL,
    effectValue: 1,
    effectDuration: 0,
    projectileSpeed: 2,
    trajectory: 'homing',
    description: 'Steals 1 energy from enemy'
  },
  '💎': {
    character: '💎',
    name: 'Diamond',
    category: EmojiCategory.ENERGY,
    baseDamage: 2,
    effectType: EmojiEffectType.VALUE_BONUS,
    effectValue: 50,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Increases coin rewards +50%'
  },
  '🪙': {
    character: '🪙',
    name: 'Coin',
    category: EmojiCategory.ENERGY,
    baseDamage: 1,
    effectType: EmojiEffectType.GOLD_RUSH,
    effectValue: 10,
    effectDuration: 0,
    projectileSpeed: 1.5,
    trajectory: 'straight',
    description: '+10 coins on hit'
  },
  '🎲': {
    character: '🎲',
    name: 'Dice',
    category: EmojiCategory.ENERGY,
    baseDamage: 3,
    effectType: EmojiEffectType.RANDOM_DAMAGE,
    effectValue: 6,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Random damage 1-6'
  },
  '🎰': {
    character: '🎰',
    name: 'Slot',
    category: EmojiCategory.ENERGY,
    baseDamage: 5,
    effectType: EmojiEffectType.JACKPOT,
    effectValue: 10,
    effectDuration: 0,
    projectileSpeed: 0.8,
    trajectory: 'straight',
    description: '10% chance for 10x damage'
  },
  '🔮': {
    character: '🔮',
    name: 'Crystal',
    category: EmojiCategory.ENERGY,
    baseDamage: 3,
    effectType: EmojiEffectType.FORESIGHT,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Shows next enemy emoji'
  },
  '📿': {
    character: '📿',
    name: 'Beads',
    category: EmojiCategory.ENERGY,
    baseDamage: 2,
    effectType: EmojiEffectType.COMBO,
    effectValue: 25,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Damage increases +25% per hit'
  },
  '🏆': {
    character: '🏆',
    name: 'Trophy',
    category: EmojiCategory.ENERGY,
    baseDamage: 5,
    effectType: EmojiEffectType.VICTORY_BONUS,
    effectValue: 100,
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'Bonus coins if wins'
  },
  '👑': {
    character: '👑',
    name: 'Crown',
    category: EmojiCategory.ENERGY,
    baseDamage: 4,
    effectType: EmojiEffectType.MAJESTY,
    effectValue: 25,
    effectDuration: 5,
    projectileSpeed: 1,
    trajectory: 'straight',
    description: 'All emojis +25% damage'
  }
};

/**
 * Get emoji power by character
 */
export function getEmojiPower(character: string): EmojiPower | undefined {
  return COMPLETE_EMOJI_DATABASE[character];
}

/**
 * Get all emojis by category
 */
export function getEmojisByCategory(category: EmojiCategory): EmojiPower[] {
  return Object.values(COMPLETE_EMOJI_DATABASE).filter(
    emoji => emoji.category === category
  );
}

/**
 * Get total base damage for array of emoji characters
 */
export function calculateTotalBaseDamage(emojiCharacters: string[]): number {
  return emojiCharacters.reduce((total, char) => {
    const emoji = getEmojiPower(char);
    return total + (emoji?.baseDamage || 0);
  }, 0);
}

/**
 * Check if emoji character exists in database
 */
export function isValidEmoji(character: string): boolean {
  return character in COMPLETE_EMOJI_DATABASE;
}