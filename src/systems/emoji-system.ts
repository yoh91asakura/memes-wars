// Emoji System Implementation
// This file defines the core emoji mechanics and effects

/**
 * Emoji Effect Types
 */
export enum EmojiEffectType {
  DAMAGE = 'damage',
  BURN = 'burn',
  FREEZE = 'freeze',
  HEAL = 'heal',
  SHIELD = 'shield',
  POISON = 'poison',
  BOOST = 'boost',
  SLOW = 'slow',
  CHAIN = 'chain',
  AREA = 'area',
  PIERCE = 'pierce',
  EXECUTE = 'execute',
  LIFESTEAL = 'lifesteal',
  STUN = 'stun',
  KNOCKBACK = 'knockback'
}

/**
 * Base Emoji Class
 */
export class Emoji {
  character: string;
  name: string;
  baseDamage: number;
  effectType: EmojiEffectType;
  effectValue: number;
  effectDuration: number;
  projectileSpeed: number;
  trajectory: 'straight' | 'arc' | 'homing' | 'wave' | 'spiral';

  constructor(data: EmojiData) {
    this.character = data.character;
    this.name = data.name;
    this.baseDamage = data.baseDamage;
    this.effectType = data.effectType;
    this.effectValue = data.effectValue || 0;
    this.effectDuration = data.effectDuration || 0;
    this.projectileSpeed = data.projectileSpeed || 1;
    this.trajectory = data.trajectory || 'straight';
  }

  /**
   * Apply effect when emoji hits target
   */
  applyEffect(target: any): void {
    // Apply base damage
    target.takeDamage(this.baseDamage);

    // Apply special effect
    switch (this.effectType) {
      case EmojiEffectType.BURN:
        target.applyBurn(this.effectValue, this.effectDuration);
        break;
      case EmojiEffectType.FREEZE:
        target.applyFreeze(this.effectDuration);
        break;
      case EmojiEffectType.HEAL:
        target.heal(this.effectValue);
        break;
      case EmojiEffectType.POISON:
        target.applyPoison(this.effectValue, this.effectDuration);
        break;
      case EmojiEffectType.SHIELD:
        target.applyShield(this.effectValue);
        break;
      case EmojiEffectType.BOOST:
        target.applyBoost(this.effectValue, this.effectDuration);
        break;
      // Add more effect implementations
    }
  }
}

/**
 * Emoji Database - All 50 emojis defined
 */
export const EMOJI_DATABASE = {
  // Damage Emojis
  '🔥': {
    character: '🔥',
    name: 'Fire',
    baseDamage: 3,
    effectType: EmojiEffectType.BURN,
    effectValue: 1,
    effectDuration: 3,
    projectileSpeed: 1,
    trajectory: 'straight' as const
  },
  '⚡': {
    character: '⚡',
    name: 'Lightning',
    baseDamage: 5,
    effectType: EmojiEffectType.CHAIN,
    effectValue: 2,
    effectDuration: 0,
    projectileSpeed: 2,
    trajectory: 'straight' as const
  },
  '💥': {
    character: '💥',
    name: 'Explosion',
    baseDamage: 8,
    effectType: EmojiEffectType.AREA,
    effectValue: 50, // radius in pixels
    effectDuration: 0,
    projectileSpeed: 0.8,
    trajectory: 'arc' as const
  },
  '🗡️': {
    character: '🗡️',
    name: 'Sword',
    baseDamage: 4,
    effectType: EmojiEffectType.PIERCE,
    effectValue: 25, // 25% armor pierce
    effectDuration: 0,
    projectileSpeed: 1.5,
    trajectory: 'straight' as const
  },
  '🏹': {
    character: '🏹',
    name: 'Arrow',
    baseDamage: 2,
    effectType: EmojiEffectType.DAMAGE,
    effectValue: 0,
    effectDuration: 0,
    projectileSpeed: 2,
    trajectory: 'straight' as const
  },

  // Control Emojis
  '❄️': {
    character: '❄️',
    name: 'Ice',
    baseDamage: 2,
    effectType: EmojiEffectType.FREEZE,
    effectValue: 0,
    effectDuration: 2,
    projectileSpeed: 1,
    trajectory: 'straight' as const
  },
  '🌊': {
    character: '🌊',
    name: 'Wave',
    baseDamage: 3,
    effectType: EmojiEffectType.SLOW,
    effectValue: 50, // 50% slow
    effectDuration: 3,
    projectileSpeed: 0.8,
    trajectory: 'wave' as const
  },

  // Support Emojis
  '💚': {
    character: '💚',
    name: 'Green Heart',
    baseDamage: 0,
    effectType: EmojiEffectType.HEAL,
    effectValue: 5,
    effectDuration: 0,
    projectileSpeed: 1.2,
    trajectory: 'homing' as const
  },
  '🛡️': {
    character: '🛡️',
    name: 'Shield',
    baseDamage: 0,
    effectType: EmojiEffectType.SHIELD,
    effectValue: 3, // blocks 3 hits
    effectDuration: 0,
    projectileSpeed: 1,
    trajectory: 'straight' as const
  },

  // Debuff Emojis
  '🧪': {
    character: '🧪',
    name: 'Poison',
    baseDamage: 2,
    effectType: EmojiEffectType.POISON,
    effectValue: 1,
    effectDuration: 5,
    projectileSpeed: 1.1,
    trajectory: 'arc' as const
  },
  '💀': {
    character: '💀',
    name: 'Skull',
    baseDamage: 6,
    effectType: EmojiEffectType.EXECUTE,
    effectValue: 20, // execute at 20% HP
    effectDuration: 0,
    projectileSpeed: 0.9,
    trajectory: 'straight' as const
  },

  // Add all remaining emojis...
  // This is a partial implementation for demonstration
};

/**
 * Emoji Factory - Creates emoji instances
 */
export class EmojiFactory {
  static createEmoji(character: string): Emoji {
    const emojiData = EMOJI_DATABASE[character];
    if (!emojiData) {
      throw new Error(`Unknown emoji: ${character}`);
    }
    return new Emoji(emojiData);
  }

  static getEmojisByCategory(category: string): Emoji[] {
    // Return emojis filtered by category
    return [];
  }
}

/**
 * Emoji Projectile - Represents an emoji in flight
 */
export class EmojiProjectile {
  emoji: Emoji;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  target: any;
  owner: any;
  lifetime: number;
  active: boolean;

  constructor(emoji: Emoji, startX: number, startY: number, target: any, owner: any) {
    this.emoji = emoji;
    this.x = startX;
    this.y = startY;
    this.target = target;
    this.owner = owner;
    this.lifetime = 0;
    this.active = true;
    
    // Calculate velocity based on trajectory
    this.calculateVelocity();
  }

  calculateVelocity(): void {
    const speed = this.emoji.projectileSpeed;
    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    
    switch (this.emoji.trajectory) {
      case 'straight':
        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;
        break;
      case 'arc':
        // Add arc trajectory logic
        break;
      case 'homing':
        // Will recalculate each frame
        break;
      case 'wave':
        // Add wave pattern
        break;
      case 'spiral':
        // Add spiral pattern
        break;
    }
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    this.lifetime += deltaTime;

    // Update position based on trajectory
    if (this.emoji.trajectory === 'homing') {
      this.calculateVelocity(); // Recalculate for homing
    }

    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Check collision
    if (this.checkCollision()) {
      this.onHit();
    }

    // Check if out of bounds
    if (this.isOutOfBounds()) {
      this.active = false;
    }
  }

  checkCollision(): boolean {
    // Simple distance check
    const dx = this.x - this.target.x;
    const dy = this.y - this.target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 20; // Hit radius
  }

  onHit(): void {
    this.emoji.applyEffect(this.target);
    this.active = false;
    
    // Trigger visual effects
    this.createImpactEffect();
  }

  createImpactEffect(): void {
    // Create visual impact effect at position
    // This would trigger particle effects, damage numbers, etc.
  }

  isOutOfBounds(): boolean {
    // Check if projectile is outside game bounds
    return this.x < 0 || this.x > 1920 || this.y < 0 || this.y > 1080;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    
    ctx.font = '24px Arial';
    ctx.fillText(this.emoji.character, this.x - 12, this.y + 12);
    
    // Add trail effects based on emoji type
    if (this.emoji.effectType === EmojiEffectType.BURN) {
      // Draw fire trail
    } else if (this.emoji.effectType === EmojiEffectType.FREEZE) {
      // Draw ice particles
    }
  }
}

// Type definitions
interface EmojiData {
  character: string;
  name: string;
  baseDamage: number;
  effectType: EmojiEffectType;
  effectValue?: number;
  effectDuration?: number;
  projectileSpeed?: number;
  trajectory?: 'straight' | 'arc' | 'homing' | 'wave' | 'spiral';
}
