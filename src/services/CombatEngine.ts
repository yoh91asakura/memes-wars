import { EmojiProjectile, EmojiFactory } from '../systems/emoji-system';
import { getEmojiPower } from '../systems/emoji-database';
import { EmojiSynergyCalculator } from './EmojiSynergyCalculator';
import { Card } from '../types/card';
import { EmojiPower } from '../types/emoji';

export interface CombatEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  attackSpeed: number;
  // Legacy emoji support
  emojis: string[];
  
  // New multi-emoji system
  card?: Card;
  emojiPowers: EmojiPower[];
  synergyBonuses: {
    damageBonus: number;
    healingBonus: number;
    controlBonus: number;
    energyBonus: number;
  };
  
  isPlayer: boolean;
  isAlive: boolean;
  
  // Status effects
  effects: Map<string, StatusEffect>;
  
  // Methods
  takeDamage(damage: number): void;
  heal(amount: number): void;
  applyEffect(effect: StatusEffect): void;
  removeEffect(effectId: string): void;
}

export interface StatusEffect {
  id: string;
  type: string;
  value: number;
  duration: number;
  tickDamage?: number;
}

export interface AABBCollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Main Combat Engine - Handles bullet hell combat at 60 FPS
 * Integrates with existing emoji-system.ts
 */
export class CombatEngine {
  private entities: Map<string, CombatEntity> = new Map();
  private projectiles: EmojiProjectile[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private targetFPS: number = 60;
  private frameTime: number = 1000 / this.targetFPS;
  
  // Performance tracking
  private frameCount: number = 0;
  private fpsCounter: number = 0;
  private lastFpsUpdate: number = 0;
  
  // Auto-fire system
  private autoFireTimers: Map<string, number> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = 1200;
    this.canvas.height = 800;
  }

  /**
   * Start combat engine loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  /**
   * Stop combat engine
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Main game loop - 60 FPS with RequestAnimationFrame
   */
  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Frame rate limiting to 60 FPS
    if (deltaTime >= this.frameTime) {
      this.update(deltaTime / 1000); // Convert to seconds
      this.render();
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      // FPS tracking
      if (currentTime - this.lastFpsUpdate >= 1000) {
        this.fpsCounter = this.frameCount;
        this.frameCount = 0;
        this.lastFpsUpdate = currentTime;
      }
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Update all game objects
   */
  private update(deltaTime: number): void {
    // Update entities
    for (const entity of this.entities.values()) {
      this.updateEntity(entity, deltaTime);
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(deltaTime);
      return projectile.active;
    });

    // Handle auto-fire
    this.updateAutoFire(deltaTime);

    // Clean up dead entities
    this.cleanupDeadEntities();
  }

  /**
   * Update individual entity
   */
  private updateEntity(entity: CombatEntity, deltaTime: number): void {
    if (!entity.isAlive) return;

    // Update status effects
    for (const [effectId, effect] of entity.effects) {
      effect.duration -= deltaTime;
      
      // Apply tick damage
      if (effect.tickDamage && effect.duration > 0) {
        entity.takeDamage(effect.tickDamage * deltaTime);
      }
      
      // Remove expired effects
      if (effect.duration <= 0) {
        entity.removeEffect(effectId);
      }
    }
  }

  /**
   * Auto-fire system for all entities
   */
  private updateAutoFire(deltaTime: number): void {
    for (const entity of this.entities.values()) {
      if (!entity.isAlive || entity.emojis.length === 0) continue;

      const timerId = entity.id;
      const currentTimer = this.autoFireTimers.get(timerId) || 0;
      const fireRate = entity.attackSpeed; // attacks per second
      const fireInterval = 1 / fireRate; // seconds between shots

      if (currentTimer >= fireInterval) {
        this.fireEntityEmojis(entity);
        this.autoFireTimers.set(timerId, 0);
      } else {
        this.autoFireTimers.set(timerId, currentTimer + deltaTime);
      }
    }
  }

  /**
   * Fire all emojis from an entity (updated for new emoji system)
   */
  private fireEntityEmojis(entity: CombatEntity): void {
    const targets = this.getTargetsForEntity(entity);
    if (targets.length === 0) return;

    // Use new emoji powers if available
    if (entity.emojiPowers && entity.emojiPowers.length > 0) {
      entity.emojiPowers.forEach((emojiPower, index) => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        
        // Create emoji-like object from power data
        const emoji = {
          character: emojiPower.character,
          name: emojiPower.name,
          baseDamage: emojiPower.baseDamage,
          effectType: emojiPower.effectType,
          effectValue: emojiPower.effectValue || 0,
          effectDuration: emojiPower.effectDuration || 0,
          projectileSpeed: emojiPower.projectileSpeed || 1,
          trajectory: emojiPower.trajectory || 'straight',
          applyEffect: function(target: any) {
            // Apply base damage with synergy bonuses
            const baseDamage = this.baseDamage;
            const damageBonus = entity.synergyBonuses.damageBonus;
            const totalDamage = baseDamage + (baseDamage * damageBonus / 100);
            
            target.takeDamage(totalDamage);
            
            // Apply special effects (basic implementation)
            // This would be expanded to include all emoji effects
          }
        };
        
        // Calculate spawn position (spread emojis around entity)
        const angleOffset = (index / entity.emojiPowers.length) * Math.PI * 2;
        const spawnRadius = 30;
        const spawnX = entity.x + Math.cos(angleOffset) * spawnRadius;
        const spawnY = entity.y + Math.sin(angleOffset) * spawnRadius;
        
        const projectile = new EmojiProjectile(emoji as any, spawnX, spawnY, target, entity);
        this.projectiles.push(projectile);
      });
    } 
    // Fallback to legacy emoji system
    else {
      entity.emojis.forEach((emojiChar, index) => {
        try {
          const emoji = EmojiFactory.createEmoji(emojiChar);
          const target = targets[Math.floor(Math.random() * targets.length)];
          
          // Calculate spawn position
          const angleOffset = (index / entity.emojis.length) * Math.PI * 2;
          const spawnRadius = 30;
          const spawnX = entity.x + Math.cos(angleOffset) * spawnRadius;
          const spawnY = entity.y + Math.sin(angleOffset) * spawnRadius;
          
          const projectile = new EmojiProjectile(emoji, spawnX, spawnY, target, entity);
          this.projectiles.push(projectile);
        } catch {
          console.warn(`Unknown emoji: ${emojiChar}`);
        }
      });
    }
  }

  /**
   * Get valid targets for an entity
   */
  private getTargetsForEntity(entity: CombatEntity): CombatEntity[] {
    const targets: CombatEntity[] = [];
    
    for (const target of this.entities.values()) {
      if (target.isAlive && target.isPlayer !== entity.isPlayer) {
        targets.push(target);
      }
    }
    
    return targets;
  }

  /**
   * AABB Collision Detection
   */
  checkAABBCollision(box1: AABBCollisionBox, box2: AABBCollisionBox): boolean {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  }

  /**
   * Check projectile collision with entity
   */
  checkProjectileCollision(projectile: EmojiProjectile, entity: CombatEntity): boolean {
    const projectileBox: AABBCollisionBox = {
      x: projectile.x - 10,
      y: projectile.y - 10,
      width: 20,
      height: 20
    };

    const entityBox: AABBCollisionBox = {
      x: entity.x - entity.width / 2,
      y: entity.y - entity.height / 2,
      width: entity.width,
      height: entity.height
    };

    return this.checkAABBCollision(projectileBox, entityBox);
  }

  /**
   * Render everything
   */
  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render entities
    for (const entity of this.entities.values()) {
      this.renderEntity(entity);
    }

    // Render projectiles
    this.projectiles.forEach(projectile => {
      projectile.render(this.ctx);
    });

    // Render UI
    this.renderUI();
  }

  /**
   * Render individual entity
   */
  private renderEntity(entity: CombatEntity): void {
    const ctx = this.ctx;
    
    // Entity body
    ctx.fillStyle = entity.isPlayer ? '#4CAF50' : '#F44336';
    ctx.fillRect(
      entity.x - entity.width / 2,
      entity.y - entity.height / 2,
      entity.width,
      entity.height
    );

    // Health bar
    const barWidth = entity.width;
    const barHeight = 8;
    const barY = entity.y - entity.height / 2 - 15;
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(entity.x - barWidth / 2, barY, barWidth, barHeight);
    
    // Health
    const healthPercent = entity.hp / entity.maxHp;
    ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
    ctx.fillRect(entity.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);

    // Render emojis around entity
    entity.emojis.forEach((emoji, index) => {
      const angle = (index / entity.emojis.length) * Math.PI * 2;
      const radius = 40;
      const x = entity.x + Math.cos(angle) * radius;
      const y = entity.y + Math.sin(angle) * radius;
      
      ctx.font = '20px Arial';
      ctx.fillText(emoji, x - 10, y + 10);
    });
  }

  /**
   * Render UI elements
   */
  private renderUI(): void {
    const ctx = this.ctx;
    
    // FPS counter
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${this.fpsCounter}`, 10, 30);
    
    // Projectile count
    ctx.fillText(`Projectiles: ${this.projectiles.length}`, 10, 50);
    
    // Entity count
    ctx.fillText(`Entities: ${this.entities.size}`, 10, 70);
  }

  /**
   * Add entity to combat
   */
  addEntity(entity: CombatEntity): void {
    this.entities.set(entity.id, entity);
    this.autoFireTimers.set(entity.id, 0);
  }

  /**
   * Create combat entity from card with new emoji system
   */
  createEntityFromCard(
    card: Card, 
    id: string, 
    x: number, 
    y: number, 
    isPlayer: boolean = false
  ): CombatEntity {
    // Get emoji powers from card
    const emojiPowers: EmojiPower[] = [];
    const emojis = card.emojis || (card.emoji ? [card.emoji] : []);
    
    for (const emojiChar of emojis) {
      const power = getEmojiPower(emojiChar);
      if (power) {
        emojiPowers.push(power);
      }
    }
    
    // Calculate synergy bonuses
    const synergies = card.emojiData?.activeSynergies || EmojiSynergyCalculator.calculateSynergies(emojis);
    const synergyBonuses = {
      damageBonus: EmojiSynergyCalculator.calculateSynergyDamageBonus(emojis, synergies),
      healingBonus: EmojiSynergyCalculator.calculateSynergyHealingBonus(synergies),
      controlBonus: EmojiSynergyCalculator.calculateControlDurationBonus(synergies),
      energyBonus: EmojiSynergyCalculator.calculateEnergyBonus(synergies)
    };
    
    // Calculate base stats
    const baseHp = card.stats?.health || card.defense || 10;
    
    const entity: CombatEntity = {
      id,
      x,
      y,
      width: 64,
      height: 64,
      hp: baseHp,
      maxHp: baseHp,
      attackSpeed: 1.0,
      
      // Legacy support
      emojis,
      
      // New emoji system
      emojiPowers,
      synergyBonuses,
      
      isPlayer,
      isAlive: true,
      effects: new Map(),
      
      // Methods
      takeDamage: function(damage: number) {
        this.hp = Math.max(0, this.hp - damage);
        this.isAlive = this.hp > 0;
      },
      
      heal: function(amount: number) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
      },
      
      applyEffect: function(effect: StatusEffect) {
        this.effects.set(effect.id, effect);
      },
      
      removeEffect: function(effectId: string) {
        this.effects.delete(effectId);
      }
    };
    
    return entity;
  }

  /**
   * Remove entity from combat
   */
  removeEntity(entityId: string): void {
    this.entities.delete(entityId);
    this.autoFireTimers.delete(entityId);
  }


  /**
   * Clean up dead entities
   */
  private cleanupDeadEntities(): void {
    for (const [id, entity] of this.entities) {
      if (!entity.isAlive) {
        this.removeEntity(id);
      }
    }
  }

  /**
   * Get performance stats
   */
  getPerformanceStats(): { fps: number; projectiles: number; entities: number } {
    return {
      fps: this.fpsCounter,
      projectiles: this.projectiles.length,
      entities: this.entities.size
    };
  }

  /**
   * Start a combat between two cards
   */
  startCombat(playerCard: Card, enemyCard: Card): void {
    // Clear existing entities
    this.entities.clear();
    this.projectiles.length = 0;
    this.autoFireTimers.clear();

    // Create player entity
    const playerEntity = this.createEntityFromCard(playerCard, 'player', 200, 400, true);
    this.addEntity(playerEntity);

    // Create enemy entity
    const enemyEntity = this.createEntityFromCard(enemyCard, 'enemy', 1000, 400, false);
    this.addEntity(enemyEntity);

    // Start the engine
    this.start();
  }

  /**
   * Check if combat is over
   */
  isCombatOver(): { isOver: boolean; winner?: 'player' | 'enemy' } {
    const alivePlayers = Array.from(this.entities.values()).filter(e => e.isAlive && e.isPlayer);
    const aliveEnemies = Array.from(this.entities.values()).filter(e => e.isAlive && !e.isPlayer);

    if (alivePlayers.length === 0) {
      return { isOver: true, winner: 'enemy' };
    }
    
    if (aliveEnemies.length === 0) {
      return { isOver: true, winner: 'player' };
    }

    return { isOver: false };
  }
}