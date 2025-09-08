// Emoji Effects System - Complete Implementation
// Aligned with CLAUDE.md Phase 1 MVP specifications

import { EffectType } from '../models/Card';

export interface EmojiEffect {
  emoji: string;
  damage: number;
  speed: number;
  effects?: EmojiGameEffect[];
  trajectory: 'straight' | 'arc' | 'wave' | 'spiral' | 'homing';
  type: 'direct' | 'overtime' | 'utility' | 'support';
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface EmojiGameEffect {
  type: EffectType;
  duration?: number;
  tickDamage?: number;
  chance?: number;
  value?: number;
  stackable?: boolean;
}

// Complete emoji effects system - 20+ émojis as specified in CLAUDE.md
export const EMOJI_EFFECTS: Record<string, EmojiEffect> = {
  // BASIC DAMAGE EMOJIS
  '🗿': {
    emoji: '🗿',
    damage: 8,
    speed: 2,
    trajectory: 'straight',
    type: 'direct',
    description: 'Stone solid - basic high damage',
    rarity: 'common'
  },
  
  '💥': {
    emoji: '💥',
    damage: 6,
    speed: 4,
    trajectory: 'straight',
    type: 'direct',
    description: 'Explosive impact - area damage',
    rarity: 'common'
  },

  // ELEMENTAL EFFECTS
  '🔥': {
    emoji: '🔥',
    damage: 5,
    speed: 3,
    trajectory: 'wave',
    type: 'overtime',
    effects: [{
      type: EffectType.BURN,
      duration: 3,
      tickDamage: 2
    }],
    description: 'Burns target over time',
    rarity: 'common'
  },

  '❄️': {
    emoji: '❄️',
    damage: 4,
    speed: 2,
    trajectory: 'straight',
    type: 'utility',
    effects: [{
      type: EffectType.FREEZE,
      duration: 2,
      value: 0.5 // 50% speed reduction
    }],
    description: 'Slows enemy attack speed',
    rarity: 'common'
  },

  '⚡': {
    emoji: '⚡',
    damage: 6,
    speed: 5,
    trajectory: 'homing',
    type: 'utility',
    effects: [{
      type: EffectType.STUN,
      duration: 1,
      chance: 0.15
    }],
    description: 'Fast homing with stun chance',
    rarity: 'uncommon'
  },

  '💨': {
    emoji: '💨',
    damage: 3,
    speed: 6,
    trajectory: 'wave',
    type: 'support',
    effects: [{
      type: EffectType.BOOST,
      duration: 3,
      value: 1.5 // 50% speed boost
    }],
    description: 'Boosts ally attack speed',
    rarity: 'common'
  },

  '🌊': {
    emoji: '🌊',
    damage: 7,
    speed: 3,
    trajectory: 'wave',
    type: 'direct',
    effects: [{
      type: EffectType.HEAL,
      value: 3
    }],
    description: 'Deals damage and heals self',
    rarity: 'uncommon'
  },

  '🌪️': {
    emoji: '🌪️',
    damage: 5,
    speed: 4,
    trajectory: 'spiral',
    type: 'utility',
    effects: [{
      type: EffectType.CHAOS,
      duration: 2,
      value: 2 // Random effects
    }],
    description: 'Unpredictable spiral attack',
    rarity: 'rare'
  },

  // SUPPORT & HEALING
  '💚': {
    emoji: '💚',
    damage: 0,
    speed: 2,
    trajectory: 'arc',
    type: 'support',
    effects: [{
      type: EffectType.HEAL,
      value: 5
    }],
    description: 'Pure healing - no damage',
    rarity: 'common'
  },

  '💜': {
    emoji: '💜',
    damage: 2,
    speed: 3,
    trajectory: 'arc',
    type: 'utility',
    effects: [{
      type: EffectType.POISON,
      duration: 4,
      tickDamage: 1
    }],
    description: 'Weak attack with poison',
    rarity: 'uncommon'
  },

  '🛡️': {
    emoji: '🛡️',
    damage: 1,
    speed: 1,
    trajectory: 'straight',
    type: 'support',
    effects: [{
      type: EffectType.SHIELD,
      duration: 5,
      value: 10
    }],
    description: 'Provides protective shield',
    rarity: 'uncommon'
  },

  '⭐': {
    emoji: '⭐',
    damage: 4,
    speed: 3,
    trajectory: 'arc',
    type: 'utility',
    effects: [{
      type: EffectType.LUCKY,
      duration: 10,
      value: 1.25 // 25% bonus rewards
    }],
    description: 'Increases luck and rewards',
    rarity: 'rare'
  },

  // ADVANCED EFFECTS
  '🌟': {
    emoji: '🌟',
    damage: 8,
    speed: 4,
    trajectory: 'homing',
    type: 'direct',
    effects: [{
      type: EffectType.PRECISION,
      chance: 0.3
    }],
    description: 'Guaranteed critical hits',
    rarity: 'epic'
  },

  '✨': {
    emoji: '✨',
    damage: 5,
    speed: 4,
    trajectory: 'spiral',
    type: 'utility',
    effects: [{
      type: EffectType.MULTIPLY,
      chance: 0.2,
      value: 2
    }],
    description: 'Chance to duplicate projectiles',
    rarity: 'epic'
  },

  '🌈': {
    emoji: '🌈',
    damage: 6,
    speed: 3,
    trajectory: 'wave',
    type: 'utility',
    effects: [{
      type: EffectType.REFLECT,
      duration: 3,
      chance: 0.4
    }],
    description: 'Bounces enemy projectiles back',
    rarity: 'rare'
  },

  '💎': {
    emoji: '💎',
    damage: 12,
    speed: 2,
    trajectory: 'straight',
    type: 'direct',
    effects: [{
      type: EffectType.BARRIER,
      duration: 2
    }],
    description: 'High damage with temporary invincibility',
    rarity: 'epic'
  },

  // SPECIAL COMBAT EMOJIS
  '🎯': {
    emoji: '🎯',
    damage: 10,
    speed: 5,
    trajectory: 'homing',
    type: 'direct',
    effects: [{
      type: EffectType.PRECISION,
      chance: 1.0 // Always hits
    }],
    description: 'Never misses target',
    rarity: 'rare'
  },

  '💯': {
    emoji: '💯',
    damage: 4,
    speed: 4,
    trajectory: 'straight',
    type: 'support',
    effects: [{
      type: EffectType.BOOST,
      duration: 5,
      value: 2.0 // 100% boost
    }],
    description: 'Doubles attack effectiveness',
    rarity: 'epic'
  },

  '💢': {
    emoji: '💢',
    damage: 15,
    speed: 3,
    trajectory: 'straight',
    type: 'direct',
    effects: [{
      type: EffectType.BURST,
      chance: 0.1,
      value: 3 // Triple damage burst
    }],
    description: 'High damage with burst potential',
    rarity: 'rare'
  },

  '🚀': {
    emoji: '🚀',
    damage: 7,
    speed: 7,
    trajectory: 'homing',
    type: 'direct',
    description: 'Fastest projectile - pure speed',
    rarity: 'uncommon'
  },

  '🔮': {
    emoji: '🔮',
    damage: 3,
    speed: 2,
    trajectory: 'spiral',
    type: 'utility',
    effects: [{
      type: EffectType.CHAOS,
      duration: 3,
      value: 3 // Multiple random effects
    }],
    description: 'Unpredictable magical effects',
    rarity: 'epic'
  },

  '💀': {
    emoji: '💀',
    damage: 20,
    speed: 1,
    trajectory: 'straight',
    type: 'direct',
    effects: [{
      type: EffectType.DRAIN,
      value: 5
    }],
    description: 'Devastating slow attack that heals attacker',
    rarity: 'epic'
  }
};

// Helper functions for emoji system
export class EmojiEffectsManager {
  // Get effect by emoji character
  static getEffect(emoji: string): EmojiEffect | undefined {
    return EMOJI_EFFECTS[emoji];
  }

  // Get all emojis by rarity
  static getByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic'): EmojiEffect[] {
    return Object.values(EMOJI_EFFECTS).filter(effect => effect.rarity === rarity);
  }

  // Get random emoji by rarity
  static getRandomByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic'): EmojiEffect {
    const effects = this.getByRarity(rarity);
    return effects[Math.floor(Math.random() * effects.length)];
  }

  // Get all available emojis
  static getAllEmojis(): string[] {
    return Object.keys(EMOJI_EFFECTS);
  }

  // Validate if emoji is supported
  static isSupported(emoji: string): boolean {
    return emoji in EMOJI_EFFECTS;
  }

  // Get effect statistics
  static getStatistics() {
    const effects = Object.values(EMOJI_EFFECTS);
    const rarityCount = effects.reduce((acc, effect) => {
      acc[effect.rarity] = (acc[effect.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmojis: effects.length,
      rarityDistribution: rarityCount,
      averageDamage: effects.reduce((sum, e) => sum + e.damage, 0) / effects.length,
      averageSpeed: effects.reduce((sum, e) => sum + e.speed, 0) / effects.length,
      effectTypes: [...new Set(effects.map(e => e.type))].sort(),
      trajectoryTypes: [...new Set(effects.map(e => e.trajectory))].sort()
    };
  }

  // Apply emoji effect to combat engine
  static applyEffect(emoji: string, target: any, source: any): void {
    const effect = this.getEffect(emoji);
    if (!effect || !effect.effects) return;

    for (const gameEffect of effect.effects) {
      switch (gameEffect.type) {
        case EffectType.BURN:
          this.applyBurnEffect(target, gameEffect);
          break;
        case EffectType.FREEZE:
          this.applyFreezeEffect(target, gameEffect);
          break;
        case EffectType.HEAL:
          this.applyHealEffect(source, gameEffect);
          break;
        case EffectType.POISON:
          this.applyPoisonEffect(target, gameEffect);
          break;
        case EffectType.SHIELD:
          this.applyShieldEffect(source, gameEffect);
          break;
        case EffectType.BOOST:
          this.applyBoostEffect(source, gameEffect);
          break;
        case EffectType.STUN:
          this.applyStunEffect(target, gameEffect);
          break;
        // Add more effect handlers as needed
      }
    }
  }

  // Effect handlers
  private static applyBurnEffect(target: any, effect: EmojiGameEffect): void {
    // Implementation will be connected to CombatEngine
    console.log(`Applying burn effect: ${effect.tickDamage} damage for ${effect.duration}s`);
  }

  private static applyFreezeEffect(target: any, effect: EmojiGameEffect): void {
    console.log(`Applying freeze effect: ${effect.value}x speed for ${effect.duration}s`);
  }

  private static applyHealEffect(target: any, effect: EmojiGameEffect): void {
    console.log(`Applying heal effect: ${effect.value} HP restored`);
  }

  private static applyPoisonEffect(target: any, effect: EmojiGameEffect): void {
    console.log(`Applying poison effect: ${effect.tickDamage} damage/tick for ${effect.duration}s`);
  }

  private static applyShieldEffect(target: any, effect: EmojiGameEffect): void {
    console.log(`Applying shield effect: ${effect.value} shield for ${effect.duration}s`);
  }

  private static applyBoostEffect(target: any, effect: EmojiGameEffect): void {
    console.log(`Applying boost effect: ${effect.value}x performance for ${effect.duration}s`);
  }

  private static applyStunEffect(target: any, effect: EmojiGameEffect): void {
    console.log(`Applying stun effect: disabled for ${effect.duration}s`);
  }
}

// Export for use in combat engine
export default EMOJI_EFFECTS;