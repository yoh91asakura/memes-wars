// Combat Engine - Core battle system logic

import { 
  CombatState, 
  CombatArena, 
  CombatPlayer, 
  EmojiProjectile, 
  Collision, 
  ActiveEffect, 
  Position, 
  Vector2D, 
  BoundingBox,
  CombatEvent,
  CombatEventType,
  CombatResult,
  ProjectileEffect
} from '../models/Combat';
import { Deck } from '../models/unified/Deck';
import { UnifiedCard } from '../models/unified/Card';

export interface ICombatEngine {
  initialize(playerDeck: Deck, opponentDeck: Deck): void;
  startBattle(): void;
  processFrame(deltaTime: number): void;
  checkCollisions(): Collision[];
  applyEffects(effects: Effect[]): void;
  determineWinner(): CombatPlayer | null;
}

export class CombatEngine implements ICombatEngine {
  private state: CombatState;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private eventCallbacks: Map<CombatEventType, ((event: CombatEvent) => void)[]> = new Map();

  constructor(arena: CombatArena) {
    this.state = this.createInitialState(arena);
  }

  public initialize(playerDeck: Deck, opponentDeck: Deck): void {
    // Create players from decks
    const player1 = this.createPlayerFromDeck(playerDeck, 'player1', this.state.arena.playerSpawns[0]);
    const player2 = this.createPlayerFromDeck(opponentDeck, 'player2', this.state.arena.playerSpawns[1]);

    this.state.players = [player1, player2];
    this.state.phase = 'waiting';
    this.state.startTime = Date.now();

    this.emitEvent('match_started', {
      players: this.state.players.map(p => ({ id: p.id, username: p.username })),
      arena: this.state.arena.id
    });
  }

  public startBattle(): void {
    this.state.phase = 'countdown';
    this.state.timeRemaining = this.state.arena.settings.roundDuration;
    
    // Start countdown sequence
    this.startCountdown(() => {
      this.state.phase = 'active';
      this.startGameLoop();
    });
  }

  public processFrame(deltaTime: number): void {
    if (this.state.phase !== 'active') return;

    this.frameCount++;
    this.lastFrameTime = deltaTime;

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update effects
    this.updateActiveEffects(deltaTime);

    // Process AI for bot players
    this.updateAI(deltaTime);

    // Check collisions
    const collisions = this.checkCollisions();
    this.processCollisions(collisions);

    // Update time
    this.state.timeRemaining -= deltaTime;

    // Check win conditions
    this.checkWinConditions();

    // Update statistics
    this.updateStatistics(deltaTime);
  }

  public checkCollisions(): Collision[] {
    const collisions: Collision[] = [];

    for (const projectile of this.state.projectiles) {
      if (!projectile.isActive) continue;

      // Check player collisions
      for (const player of this.state.players) {
        if (player.id === projectile.ownerId || !player.isAlive) continue;

        if (this.isColliding(projectile, player)) {
          collisions.push({
            projectileId: projectile.id,
            targetId: player.id,
            targetType: 'player',
            contactPoint: { ...projectile.position },
            damage: projectile.damage,
            effects: projectile.effects,
            timestamp: Date.now()
          });
        }
      }

      // Check boundary collisions
      if (this.isOutOfBounds(projectile)) {
        if (projectile.bounces < projectile.maxBounces) {
          this.bounceProjectile(projectile);
        } else {
          projectile.isActive = false;
        }
      }

      // Check obstacle collisions
      for (const obstacle of this.state.arena.obstacles) {
        if (this.isCollidingWithObstacle(projectile, obstacle)) {
          if (obstacle.type === 'bouncy' && projectile.bounces < projectile.maxBounces) {
            this.bounceProjectileOffObstacle(projectile, obstacle);
          } else {
            projectile.isActive = false;
          }
        }
      }
    }

    return collisions;
  }

  public applyEffects(effects: ActiveEffect[]): void {
    for (const effect of effects) {
      const target = this.state.players.find(p => p.id === effect.targetId);
      if (!target || !target.isAlive) continue;

      switch (effect.type) {
        case 'burn':
          this.applyBurnEffect(target, effect);
          break;
        case 'freeze':
          this.applyFreezeEffect(target, effect);
          break;
        case 'poison':
          this.applyPoisonEffect(target, effect);
          break;
        case 'heal':
          this.applyHealEffect(target, effect);
          break;
        case 'shield':
          this.applyShieldEffect(target, effect);
          break;
        case 'speed':
          this.applySpeedEffect(target, effect);
          break;
        case 'stun':
          this.applyStunEffect(target, effect);
          break;
      }
    }
  }

  public determineWinner(): CombatPlayer | null {
    const alivePlayers = this.state.players.filter(p => p.isAlive);
    
    if (alivePlayers.length === 1) {
      return alivePlayers[0];
    }
    
    if (this.state.timeRemaining <= 0) {
      // Determine winner by health percentage
      const healthPercentages = this.state.players.map(p => ({
        player: p,
        healthPercent: p.health / p.maxHealth
      }));
      
      healthPercentages.sort((a, b) => b.healthPercent - a.healthPercent);
      return healthPercentages[0].player;
    }

    return null;
  }

  // Public methods for external control
  public pause(): void {
    this.state.phase = 'paused';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resume(): void {
    if (this.state.phase === 'paused') {
      this.state.phase = 'active';
      this.startGameLoop();
    }
  }

  public getState(): CombatState {
    return { ...this.state };
  }

  public addEventListener(eventType: CombatEventType, callback: (event: CombatEvent) => void): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  public removeEventListener(eventType: CombatEventType, callback: (event: CombatEvent) => void): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Private implementation methods
  private createInitialState(arena: CombatArena): CombatState {
    return {
      phase: 'waiting',
      arena,
      players: [],
      projectiles: [],
      effects: [],
      currentPhase: {
        name: 'normal',
        duration: arena.settings.roundDuration,
        effects: {
          gravity: arena.settings.gravity,
          projectileSpeed: 1.0,
          fireRate: 1.0,
          damageMultiplier: 1.0
        },
        triggers: []
      },
      timeRemaining: arena.settings.roundDuration,
      events: [],
      stats: {
        duration: 0,
        totalProjectiles: 0,
        totalDamage: 0,
        totalHealing: 0,
        collisions: 0,
        killCount: 0,
        survivorCount: 2,
        averageFPS: 60,
        peakProjectileCount: 0
      },
      startTime: 0
    };
  }

  private createPlayerFromDeck(deck: Deck, playerId: string, spawnPosition: Position): CombatPlayer {
    const totalHP = deck.stats.totalHealth || 100;
    const fireRate = deck.stats.projectedFireRate || 1.0;
    
    // Calculate damage from unified cards
    const totalDamage = deck.cards.reduce((sum, card) => {
      return sum + (card.stats?.damage || card.attack || 10);
    }, 0);

    return {
      id: playerId,
      username: deck.name || `Player ${playerId}`,
      position: { ...spawnPosition },
      health: totalHP,
      maxHealth: totalHP,
      shield: 0,
      maxShield: totalHP * 0.5,
      deck: {
        id: deck.id,
        cards: deck.cards,
        activeProjectiles: [],
        firePattern: {
          type: this.getFirePatternFromCards(deck.cards),
          projectilesPerFire: Math.min(deck.cards.length, 3),
          spreadAngle: this.calculateSpreadAngle(deck.cards),
          fireRate: fireRate,
          cooldown: 1000 / fireRate
        },
        totalDamage: totalDamage,
        totalHealth: totalHP,
        specialAbilities: this.extractSpecialAbilities(deck.cards)
      },
      activeEffects: [],
      lastFireTime: 0,
      fireRate: fireRate,
      moveSpeed: this.calculateMoveSpeed(deck.cards),
      isAlive: true,
      kills: 0,
      damage: 0,
      accuracy: 0,
      shotsFired: 0,
      shotsHit: 0
    };
  }

  private startCountdown(onComplete: () => void): void {
    let count = 3;
    const countdownInterval = setInterval(() => {
      this.emitEvent('phase_changed', { phase: 'countdown', count });
      count--;
      
      if (count < 0) {
        clearInterval(countdownInterval);
        onComplete();
      }
    }, 1000);
  }

  private startGameLoop(): void {
    let lastTime = performance.now();
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      this.processFrame(deltaTime);

      if (this.state.phase === 'active') {
        this.animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  private updateProjectiles(deltaTime: number): void {
    for (const projectile of this.state.projectiles) {
      if (!projectile.isActive) continue;

      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Apply gravity
      projectile.velocity.y += this.state.arena.settings.gravity * deltaTime;

      // Update rotation
      projectile.rotation += Math.atan2(projectile.velocity.y, projectile.velocity.x);

      // Update lifespan
      projectile.lifespan += deltaTime;
      if (projectile.lifespan >= projectile.maxLifespan) {
        projectile.isActive = false;
      }

      // Update trail
      projectile.trail.push({ ...projectile.position });
      if (projectile.trail.length > 10) {
        projectile.trail.shift();
      }
    }

    // Remove inactive projectiles
    this.state.projectiles = this.state.projectiles.filter(p => p.isActive);
  }

  private updateActiveEffects(deltaTime: number): void {
    const currentTime = Date.now();

    for (const effect of this.state.effects) {
      effect.remainingDuration -= deltaTime * 1000;

      // Apply effect tick
      if (currentTime - effect.lastTick >= effect.tickInterval) {
        this.applyEffects([effect]);
        effect.lastTick = currentTime;
      }
    }

    // Remove expired effects
    this.state.effects = this.state.effects.filter(e => e.remainingDuration > 0);
  }

  private updateAI(deltaTime: number): void {
    // Simple AI logic - each player automatically fires projectiles
    for (const player of this.state.players) {
      if (!player.isAlive) continue;

      const currentTime = Date.now();
      if (currentTime - player.lastFireTime >= player.deck.firePattern.cooldown) {
        this.fireProjectile(player);
        player.lastFireTime = currentTime;
      }
    }
  }

  private fireProjectile(player: CombatPlayer): void {
    const target = this.state.players.find(p => p.id !== player.id && p.isAlive);
    if (!target) return;

    // Calculate direction to target
    const direction = {
      x: target.position.x - player.position.x,
      y: target.position.y - player.position.y
    };
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    
    if (length === 0) return;

    direction.x /= length;
    direction.y /= length;

    const projectile: EmojiProjectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      emoji: this.getRandomEmoji(player.deck.cards),
      position: { ...player.position },
      velocity: {
        x: direction.x * 300, // Base speed
        y: direction.y * 300
      },
      damage: 10 + Math.random() * 20,
      size: 32,
      rotation: 0,
      ownerId: player.id,
      bounces: 0,
      maxBounces: 2,
      lifespan: 0,
      maxLifespan: 5,
      effects: [],
      trail: [],
      isActive: true
    };

    this.state.projectiles.push(projectile);
    this.state.stats.totalProjectiles++;
    player.shotsFired++;

    this.emitEvent('projectile_fired', {
      playerId: player.id,
      projectileId: projectile.id,
      emoji: projectile.emoji,
      position: projectile.position
    });
  }

  private getRandomEmoji(cards: UnifiedCard[]): string {
    // Use card emoji or default to random
    if (cards.length > 0) {
      const card = cards[Math.floor(Math.random() * cards.length)];
      return card.emoji || this.getEmojiForCardType(card.rarity || 'common');
    }
    
    const emojis = ['💥', '🔥', '⚡', '💨', '🌟', '💯', '🎯', '💢'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  private getEmojiForCardType(rarity: string): string {
    const emojiMap: Record<string, string> = {
      common: '💥',
      rare: '🔥',
      epic: '⚡',
      legendary: '🌟',
      mythic: '💎',
      cosmic: '🌌'
    };
    return emojiMap[rarity.toLowerCase()] || '💥';
  }

  private getFirePatternFromCards(cards: UnifiedCard[]): 'single' | 'burst' | 'spread' | 'spiral' | 'beam' {
    const rarities = cards.map(card => card.rarity || 'common');
    
    if (rarities.some(r => r === 'cosmic')) return 'beam';
    if (rarities.filter(r => r === 'legendary').length >= 2) return 'spiral';
    if (rarities.filter(r => r === 'epic').length >= 3) return 'spread';
    if (rarities.filter(r => r === 'rare').length >= 4) return 'burst';
    
    return 'single';
  }

  private calculateSpreadAngle(cards: UnifiedCard[]): number {
    const rarityValue = cards.reduce((sum, card) => {
      const values: Record<string, number> = {
        common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, cosmic: 6
      };
      return sum + (values[card.rarity || 'common'] || 1);
    }, 0);
    
    return Math.min(45, rarityValue * 5);
  }

  private calculateMoveSpeed(cards: UnifiedCard[]): number {
    const speedCards = cards.filter(card => card.stats?.speed);
    const baseSpeed = 200;
    const bonusSpeed = speedCards.reduce((sum, card) => sum + (card.stats?.speed || 0), 0);
    return Math.max(100, Math.min(400, baseSpeed + bonusSpeed * 10));
  }

  private extractSpecialAbilities(cards: UnifiedCard[]): any[] {
    return cards
      .filter(card => card.stats?.ability)
      .map(card => ({
        id: card.id,
        name: card.name,
        description: card.description || card.stats?.ability || 'Special Ability',
        cooldown: card.stats?.cooldown || 5000,
        lastUsed: 0,
        manaCost: card.stats?.manaCost || 10,
        effects: this.convertCardToEffects(card),
        trigger: { type: 'manual' as const }
      }));
  }

  private convertCardToEffects(card: UnifiedCard): ProjectileEffect[] {
    const effects: ProjectileEffect[] = [];
    
    if (card.stats?.burn) {
      effects.push({
        type: 'burn',
        duration: card.stats.burn.duration || 3000,
        intensity: card.stats.burn.intensity || 5,
        stackable: true
      });
    }
    
    if (card.stats?.freeze) {
      effects.push({
        type: 'freeze',
        duration: card.stats.freeze.duration || 2000,
        intensity: card.stats.freeze.intensity || 0.5,
        stackable: false
      });
    }
    
    if (card.stats?.poison) {
      effects.push({
        type: 'poison',
        duration: card.stats.poison.duration || 5000,
        intensity: card.stats.poison.intensity || 3,
        stackable: true
      });
    }
    
    return effects;
  }

  private isColliding(projectile: EmojiProjectile, player: CombatPlayer): boolean {
    const distance = Math.sqrt(
      (projectile.position.x - player.position.x) ** 2 +
      (projectile.position.y - player.position.y) ** 2
    );
    return distance < (projectile.size / 2 + 25); // Player radius ~25px
  }

  private isOutOfBounds(projectile: EmojiProjectile): boolean {
    return projectile.position.x < 0 ||
           projectile.position.x > this.state.arena.width ||
           projectile.position.y < 0 ||
           projectile.position.y > this.state.arena.height;
  }

  private isCollidingWithObstacle(projectile: EmojiProjectile, obstacle: any): boolean {
    // Simple AABB collision
    return projectile.position.x < obstacle.position.x + obstacle.size.width &&
           projectile.position.x + projectile.size > obstacle.position.x &&
           projectile.position.y < obstacle.position.y + obstacle.size.height &&
           projectile.position.y + projectile.size > obstacle.position.y;
  }

  private bounceProjectile(projectile: EmojiProjectile): void {
    if (projectile.position.x <= 0 || projectile.position.x >= this.state.arena.width) {
      projectile.velocity.x *= -this.state.arena.settings.bounceMultiplier;
    }
    if (projectile.position.y <= 0 || projectile.position.y >= this.state.arena.height) {
      projectile.velocity.y *= -this.state.arena.settings.bounceMultiplier;
    }
    projectile.bounces++;
  }

  private bounceProjectileOffObstacle(projectile: EmojiProjectile, obstacle: any): void {
    // Simple bounce logic - reverse appropriate velocity component
    projectile.velocity.x *= -this.state.arena.settings.bounceMultiplier;
    projectile.velocity.y *= -this.state.arena.settings.bounceMultiplier;
    projectile.bounces++;
  }

  private processCollisions(collisions: Collision[]): void {
    for (const collision of collisions) {
      if (collision.targetType === 'player') {
        const player = this.state.players.find(p => p.id === collision.targetId);
        const projectile = this.state.projectiles.find(p => p.id === collision.projectileId);
        
        if (player && projectile && player.isAlive) {
          // Apply damage
          const actualDamage = Math.max(0, collision.damage - player.shield);
          player.health -= actualDamage;
          this.state.stats.totalDamage += actualDamage;

          // Update shield
          player.shield = Math.max(0, player.shield - collision.damage);

          // Apply effects
          for (const effect of collision.effects) {
            this.addActiveEffect(player.id, effect, projectile.ownerId);
          }

          // Update shooter accuracy
          const shooter = this.state.players.find(p => p.id === projectile.ownerId);
          if (shooter) {
            shooter.shotsHit++;
            shooter.damage += actualDamage;
            shooter.accuracy = shooter.shotsHit / shooter.shotsFired;
          }

          // Check if player died
          if (player.health <= 0) {
            player.isAlive = false;
            this.state.stats.killCount++;
            this.state.stats.survivorCount--;
            
            if (shooter) {
              shooter.kills++;
            }

            this.emitEvent('player_killed', {
              playerId: player.id,
              killerId: projectile.ownerId,
              damage: actualDamage
            });
          } else {
            this.emitEvent('player_damaged', {
              playerId: player.id,
              damage: actualDamage,
              remainingHealth: player.health
            });
          }

          // Deactivate projectile
          projectile.isActive = false;
          this.state.stats.collisions++;

          this.emitEvent('projectile_hit', {
            projectileId: projectile.id,
            targetId: player.id,
            damage: actualDamage
          });
        }
      }
    }
  }

  private checkWinConditions(): void {
    const winner = this.determineWinner();
    if (winner) {
      this.endMatch(winner);
    }
  }

  private endMatch(winner: CombatPlayer): void {
    this.state.phase = 'ended';
    this.state.winner = winner.id;
    this.state.endTime = Date.now();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emitEvent('match_ended', {
      winner: winner.id,
      duration: this.state.endTime - this.state.startTime,
      reason: this.state.timeRemaining <= 0 ? 'timeout' : 'elimination'
    });
  }

  private updateStatistics(deltaTime: number): void {
    this.state.stats.duration += deltaTime;
    this.state.stats.averageFPS = this.frameCount / this.state.stats.duration;
    this.state.stats.peakProjectileCount = Math.max(
      this.state.stats.peakProjectileCount,
      this.state.projectiles.length
    );
  }

  private addActiveEffect(targetId: string, effect: ProjectileEffect, sourceId: string): void {
    const activeEffect: ActiveEffect = {
      id: `effect_${Date.now()}_${Math.random()}`,
      type: effect.type,
      remainingDuration: effect.duration,
      intensity: effect.intensity,
      sourceId,
      targetId,
      tickInterval: 1000, // 1 second
      lastTick: Date.now()
    };

    this.state.effects.push(activeEffect);

    this.emitEvent('effect_applied', {
      effectId: activeEffect.id,
      type: effect.type,
      targetId,
      sourceId,
      duration: effect.duration
    });
  }

  private applyBurnEffect(target: CombatPlayer, effect: ActiveEffect): void {
    const damage = effect.intensity * 2;
    target.health -= damage;
    this.state.stats.totalDamage += damage;
  }

  private applyFreezeEffect(target: CombatPlayer, effect: ActiveEffect): void {
    target.moveSpeed *= 0.5;
    target.fireRate *= 0.7;
  }

  private applyPoisonEffect(target: CombatPlayer, effect: ActiveEffect): void {
    const damage = effect.intensity;
    target.health -= damage;
    target.maxHealth -= damage * 0.1; // Reduces max health
    this.state.stats.totalDamage += damage;
  }

  private applyHealEffect(target: CombatPlayer, effect: ActiveEffect): void {
    const healing = effect.intensity;
    target.health = Math.min(target.maxHealth, target.health + healing);
    this.state.stats.totalHealing += healing;
  }

  private applyShieldEffect(target: CombatPlayer, effect: ActiveEffect): void {
    const shieldAmount = effect.intensity;
    target.shield = Math.min(target.maxShield, target.shield + shieldAmount);
  }

  private applySpeedEffect(target: CombatPlayer, effect: ActiveEffect): void {
    target.moveSpeed *= 1.5;
    target.fireRate *= 1.3;
  }

  private applyStunEffect(target: CombatPlayer, effect: ActiveEffect): void {
    target.moveSpeed = 0;
    target.fireRate = 0;
  }

  private emitEvent(type: CombatEventType, data: Record<string, unknown>, position?: Position): void {
    const event: CombatEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      type,
      timestamp: Date.now(),
      data,
      position
    };

    this.state.events.push(event);

    // Call registered callbacks
    const callbacks = this.eventCallbacks.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }
}