/**
 * Combat Entity - High-performance game entity with card integration
 * Optimized for 60 FPS animations and emoji-based effects
 */

import { Card } from '../../../models/Card';
import { CombatStats } from '../types/combat.types';

export interface StatusEffect {
  id: string;
  type: 'DAMAGE' | 'HEALING' | 'SHIELD' | 'BUFF' | 'DEBUFF';
  value: number;
  duration: number;
  tickRate: number;
  remaining: number;
  source?: string;
}

export interface CombatEntityConfig {
  card: Card;
  position: { x: number; y: number };
  isPlayer: boolean;
  scale?: number;
}

export class CombatEntity {
  public readonly id: string;
  public readonly card: Card;
  public position: { x: number; y: number };
  public isPlayer: boolean;
  public isAlive: boolean = true;
  
  // Combat stats derived from card
  public stats: CombatStats;
  
  // Current state
  public health: number;
  public maxHealth: number;
  public energy: number;
  public maxEnergy: number;
  public shield: number = 0;
  
  // Status effects
  public effects: Map<string, StatusEffect> = new Map();
  
  // Animation state
  public animationState: 'idle' | 'attacking' | 'defending' | 'damaged' | 'dead' = 'idle';
  public animationProgress: number = 0;
  public scale: number;
  
  // Performance optimization
  private lastUpdateTime: number = 0;
  private cachedBounds: { x: number; y: number; width: number; height: number } | null = null;

  constructor(config: CombatEntityConfig) {
    this.id = `${config.isPlayer ? 'player' : 'enemy'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.card = config.card;
    this.position = config.position;
    this.isPlayer = config.isPlayer;
    this.scale = config.scale || 1;
    
    // Initialize stats from card
    this.stats = this.calculateStatsFromCard(config.card);
    this.maxHealth = this.stats.health;
    this.health = this.maxHealth;
    this.maxEnergy = this.stats.energy;
    this.energy = this.maxEnergy;
  }

  /**
   * Calculate combat stats from card properties
   */
  private calculateStatsFromCard(card: Card): CombatStats {
    // Base stats from card rarity and level
    const rarityMultiplier = this.getRarityMultiplier(card.rarity);
    const levelBonus = Math.max(0, (card.level || 1) - 1) * 0.1;
    
    return {
      attack: Math.floor((card.attack || 10) * rarityMultiplier * (1 + levelBonus)),
      defense: Math.floor((card.defense || 5) * rarityMultiplier * (1 + levelBonus)),
      health: Math.floor((card.health || 50) * rarityMultiplier * (1 + levelBonus)),
      energy: Math.floor((card.energyCost || 5) * rarityMultiplier),
      speed: Math.floor((card.speed || 5) * rarityMultiplier),
      range: Math.floor((card.range || 1) * rarityMultiplier)
    };
  }

  /**
   * Get rarity multiplier for stat scaling
   */
  private getRarityMultiplier(rarity: string): number {
    const multipliers = {
      'common': 1.0,
      'uncommon': 1.5,
      'rare': 2.0,
      'epic': 3.0,
      'legendary': 4.0,
      'mythic': 5.0,
      'cosmic': 6.0
    };
    return multipliers[rarity.toLowerCase() as keyof typeof multipliers] || 1.0;
  }

  /**
   * Update entity state (optimized for 60 FPS)
   */
  update(deltaTime: number): void {
    const currentTime = performance.now();
    
    // Update status effects
    this.updateEffects(deltaTime);
    
    // Update animations
    this.updateAnimations(deltaTime);
    
    // Regenerate energy over time
    this.regenerateEnergy(deltaTime);
    
    this.lastUpdateTime = currentTime;
  }

  /**
   * Update status effects with tick-based processing
   */
  private updateEffects(deltaTime: number): void {
    for (const [effectId, effect] of this.effects) {
      effect.remaining -= deltaTime;
      
      // Apply tick effects
      if (effect.type === 'DAMAGE' && effect.tickRate > 0) {
        const ticks = Math.floor(deltaTime / effect.tickRate);
        const damage = effect.value * ticks;
        this.takeDamage(damage);
      }
      
      // Remove expired effects
      if (effect.remaining <= 0) {
        this.effects.delete(effectId);
        this.onEffectExpired(effect);
      }
    }
  }

  /**
   * Update animations for smooth 60 FPS playback
   */
  private updateAnimations(deltaTime: number): void {
    if (this.animationState !== 'idle') {
      this.animationProgress += deltaTime;
      
      // Reset to idle after animation completes
      if (this.animationProgress >= 1.0) {
        this.animationState = 'idle';
        this.animationProgress = 0;
      }
    }
  }

  /**
   * Regenerate energy over time
   */
  private regenerateEnergy(deltaTime: number): void {
    const regenRate = 1; // 1 energy per second
    this.energy = Math.min(this.maxEnergy, this.energy + regenRate * deltaTime);
  }

  /**
   * Take damage with shield and effect calculations
   */
  takeDamage(amount: number, source?: string): number {
    if (!this.isAlive) return 0;
    
    let actualDamage = amount;
    
    // Apply shield
    if (this.shield > 0) {
      const shieldDamage = Math.min(this.shield, actualDamage);
      this.shield -= shieldDamage;
      actualDamage -= shieldDamage;
    }
    
    // Apply defense reduction
    const damageReduction = this.stats.defense / 100;
    actualDamage = Math.max(1, actualDamage * (1 - damageReduction));
    
    // Apply damage
    this.health = Math.max(0, this.health - actualDamage);
    
    if (this.health <= 0) {
      this.die();
    } else {
      this.animationState = 'damaged';
      this.animationProgress = 0;
    }
    
    return actualDamage;
  }

  /**
   * Heal entity
   */
  heal(amount: number): number {
    if (!this.isAlive) return 0;
    
    const actualHeal = Math.min(amount, this.maxHealth - this.health);
    this.health += actualHeal;
    
    return actualHeal;
  }

  /**
   * Apply status effect
   */
  applyEffect(effect: StatusEffect): void {
    // Remove existing effect of same type
    for (const [id, existingEffect] of this.effects) {
      if (existingEffect.type === effect.type) {
        this.effects.delete(id);
        break;
      }
    }
    
    // Add new effect
    this.effects.set(effect.id, effect);
  }

  /**
   * Remove status effect
   */
  removeEffect(effectId: string): void {
    this.effects.delete(effectId);
  }

  /**
   * Die and trigger death effects
   */
  die(): void {
    this.isAlive = false;
    this.animationState = 'dead';
    this.animationProgress = 0;
    
    // Clear all effects
    this.effects.clear();
  }

  /**
   * Attack another entity
   */
  attack(target: CombatEntity): { damage: number; critical: boolean } {
    if (!this.isAlive || !target.isAlive) {
      return { damage: 0, critical: false };
    }
    
    // Check energy cost
    const energyCost = Math.floor(this.stats.attack / 10);
    if (this.energy < energyCost) {
      return { damage: 0, critical: false };
    }
    
    this.energy -= energyCost;
    
    // Calculate damage with crit chance
    let damage = this.stats.attack;
    const critical = Math.random() < 0.1; // 10% crit chance
    
    if (critical) {
      damage *= 2;
    }
    
    // Apply damage to target
    const actualDamage = target.takeDamage(damage, this.id);
    
    // Animation
    this.animationState = 'attacking';
    this.animationProgress = 0;
    
    return { damage: actualDamage, critical };
  }

  /**
   * Get bounds for collision detection (cached for performance)
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    if (!this.cachedBounds) {
      this.cachedBounds = {
        x: this.position.x - 30 * this.scale,
        y: this.position.y - 30 * this.scale,
        width: 60 * this.scale,
        height: 60 * this.scale
      };
    }
    return this.cachedBounds;
  }

  /**
   * Invalidate bounds cache when position changes
   */
  invalidateBounds(): void {
    this.cachedBounds = null;
  }

  /**
   * Check if entity can perform action
   */
  canAct(): boolean {
    return this.isAlive && this.animationState === 'idle' && this.energy > 0;
  }

  /**
   * Get health percentage
   */
  getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }

  /**
   * Get energy percentage
   */
  getEnergyPercentage(): number {
    return this.energy / this.maxEnergy;
  }

  /**
   * Get entity state for serialization
   */
  serialize(): any {
    return {
      id: this.id,
      card: this.card,
      position: this.position,
      isPlayer: this.isPlayer,
      health: this.health,
      maxHealth: this.maxHealth,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      shield: this.shield,
      stats: this.stats,
      effects: Array.from(this.effects.values()),
      animationState: this.animationState,
      scale: this.scale
    };
  }

  /**
   * Create entity from serialized state
   */
  static deserialize(data: any): CombatEntity {
    const entity = new CombatEntity({
      card: data.card,
      position: data.position,
      isPlayer: data.isPlayer,
      scale: data.scale
    });
    
    entity.health = data.health;
    entity.maxHealth = data.maxHealth;
    entity.energy = data.energy;
    entity.maxEnergy = data.maxEnergy;
    entity.shield = data.shield;
    entity.effects = new Map(data.effects.map((e: any) => [e.id, e]));
    entity.animationState = data.animationState;
    
    return entity;
  }

  // Event handlers
  private onEffectExpired(effect: StatusEffect): void {
    // Handle effect expiration
  }
}