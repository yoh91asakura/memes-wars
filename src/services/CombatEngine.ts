// Combat Engine - Core battle system logic

// #region AI_NAV_IMPORTS
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
import { Deck } from '../models/Deck';
import { EMOJI_EFFECTS, EmojiEffectsManager } from '../data/emojiEffects';
import passiveEffectsService, { PassiveActivation, PassiveTriggerEvent } from './PassiveEffectsService';
import SynergySystem, { ActiveSynergy } from './SynergySystem';
import EmojiLoader, { EmojiCombatSequence } from './EmojiLoader';
// #endregion

// #region AI_NAV_INTERFACES
export interface ICombatEngine {
  initialize(playerDeck: Deck, opponentDeck: Deck): void;
  startBattle(): void;
  processFrame(deltaTime: number): void;
  checkCollisions(): Collision[];
  applyEffects(effects: ActiveEffect[]): void;
  determineWinner(): CombatPlayer | null;
}
// #endregion

// #region AI_NAV_MAIN_CLASS
export class CombatEngine implements ICombatEngine {
  private state: CombatState;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private eventCallbacks: Map<CombatEventType, ((event: CombatEvent) => void)[]> = new Map();

  // Synergy tracking
  private playerSynergies: Map<string, ActiveSynergy[]> = new Map();

  // Emoji sequences for each player
  private playerEmojiSequences: Map<string, EmojiCombatSequence> = new Map();

  constructor(arena: CombatArena) {
    this.state = this.createInitialState(arena);
  }
  // #endregion

  // #region AI_NAV_PUBLIC_METHODS
  public initialize(playerDeck: Deck, opponentDeck: Deck): void {
    // Create players from decks
    const spawn1 = this.state.arena.playerSpawns[0] || { x: 100, y: 300 };
    const spawn2 = this.state.arena.playerSpawns[1] || { x: 700, y: 300 };
    const player1 = this.createPlayerFromDeck(playerDeck, 'player1', spawn1);
    const player2 = this.createPlayerFromDeck(opponentDeck, 'player2', spawn2);

    this.state.players = [player1, player2];
    this.state.phase = 'waiting';
    this.state.startTime = Date.now();

    // Initialize passive effects for both players
    passiveEffectsService.initializePassives(player1, playerDeck.cards);
    passiveEffectsService.initializePassives(player2, opponentDeck.cards);

    // Initialize synergies for both players
    this.initializeSynergies(player1, playerDeck.cards);
    this.initializeSynergies(player2, opponentDeck.cards);

    // Initialize emoji sequences for both players
    this.initializeEmojiSequences(player1, playerDeck.cards);
    this.initializeEmojiSequences(player2, opponentDeck.cards);

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

    // Process passive effects
    this.processPassiveEffects(deltaTime);

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
  // #endregion

  // #region AI_NAV_PRIVATE_METHODS
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
    // Calculate stats from cards if deck.stats is not available
    let totalHP = 100; // Default fallback
    let fireRate = 1.0; // Default fallback
    let totalDamage = 0;

    if (deck.stats) {
      totalHP = deck.stats.totalHealth || 100;
      fireRate = deck.stats.projectedFireRate || 1.0;
      totalDamage = deck.stats.totalDamage || 0;
    } else if (deck.cards && deck.cards.length > 0) {
      // Calculate stats from cards
      totalHP = deck.cards.reduce((sum, card) => sum + (card.health || 10), 0);
      totalDamage = deck.cards.reduce((sum, card) => sum + (card.attack || 5), 0);
      fireRate = Math.min(5, deck.cards.length * 0.5); // Scale fire rate with deck size

      console.warn(`Deck ${deck.id} missing stats, calculated from cards: HP=${totalHP}, FireRate=${fireRate}`);
    } else {
      console.warn(`Deck ${deck.id} has no stats or cards, using defaults`);
    }

    return {
      id: playerId,
      username: `Player ${playerId}`,
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
          type: 'single',
          projectilesPerFire: 1,
          spreadAngle: 0,
          fireRate: fireRate,
          cooldown: 1000 / fireRate
        },
        totalDamage: totalDamage,
        totalHealth: totalHP,
        specialAbilities: []
      },
      activeEffects: [],
      lastFireTime: 0,
      fireRate: fireRate,
      moveSpeed: 200,
      isAlive: true,
      kills: 0,
      damage: 0,
      accuracy: 0,
      shotsFired: 0,
      shotsHit: 0
    };
  }

  // Initialize synergies for a player
  private initializeSynergies(player: CombatPlayer, cards: any[]): void {
    const synergyResult = SynergySystem.detectSynergies(cards);
    this.playerSynergies.set(player.id, synergyResult.activeSynergies);

    // Apply synergy bonuses to player stats
    this.applySynergyBonuses(player, synergyResult.activeSynergies);

    // Emit synergy information
    this.emitEvent('synergies_initialized', {
      playerId: player.id,
      synergies: synergyResult.activeSynergies.map(s => ({
        id: s.synergyId,
        level: s.level,
        strength: s.strength
      })),
      deckArchetype: synergyResult.deckStats.deckArchetype
    });
  }

  // Apply synergy bonuses to player
  private applySynergyBonuses(player: CombatPlayer, synergies: ActiveSynergy[]): void {
    for (const synergy of synergies) {
      for (const bonus of synergy.bonuses) {
        switch (bonus.type) {
          case 'damage':
            // Damage bonus will be applied during projectile firing
            break;

          case 'health':
            const healthBonus = bonus.isPercentage
              ? player.maxHealth * (bonus.value / 100)
              : bonus.value;
            player.maxHealth += healthBonus;
            player.health += healthBonus;
            break;

          case 'speed':
            const speedBonus = bonus.isPercentage
              ? player.fireRate * (bonus.value / 100)
              : bonus.value;
            player.fireRate += speedBonus;
            break;

          case 'luck':
            // Luck bonus will be tracked and applied to rewards
            break;

          case 'special':
            // Special effects handled per synergy type
            this.applySpecialSynergyEffect(player, synergy.synergyId, bonus);
            break;
        }
      }
    }
  }

  // Apply special synergy effects
  private applySpecialSynergyEffect(player: CombatPlayer, synergyId: string, bonus: any): void {
    switch (synergyId) {
      case 'TANK_BUILD':
        // Add initial shield
        if (bonus.description.includes('shield')) {
          player.shield = Math.min(player.maxShield, player.shield + bonus.value);
        }
        break;

      case 'ANCIENT_POWER':
        // Revive once capability - would be handled in death logic
        break;

      case 'FORCE_BUILD':
        // Critical hit chance - handled during damage application
        break;

      case 'SPEED_BUILD':
        // Projectile speed bonus - handled during firing
        break;
    }
  }

  // Initialize emoji sequences for a player based on their deck
  private initializeEmojiSequences(player: CombatPlayer, cards: any[]): void {
    try {
      // Load emojis synchronously for immediate combat initialization
      EmojiLoader.loadEmojisFromDeck(cards).then(loadedEmojis => {
        const combatSequence = EmojiLoader.generateProjectileSequence(loadedEmojis);

        this.playerEmojiSequences.set(player.id, combatSequence);

        // Get stats for logging
        const emojiStats = EmojiLoader.getEmojiStats(loadedEmojis);

        console.log(`Emoji sequence initialized for ${player.id}:`, {
          totalEmojis: emojiStats.totalEmojis,
          averageDamage: emojiStats.averageDamage,
          hasSpecialEffects: emojiStats.hasSpecialEffects,
          topEmojis: emojiStats.topEmojis.slice(0, 3).map(e => e.emoji)
        });

        // Emit emoji information
        this.emitEvent('emojis_loaded', {
          playerId: player.id,
          totalEmojis: emojiStats.totalEmojis,
          averageDamage: emojiStats.averageDamage,
          specialEffectsCount: combatSequence.specialEffectsCount
        });
      }).catch(error => {
        console.error(`Failed to load emojis for ${player.id}:`, error);

        // Set default emoji sequence as fallback
        const defaultEmoji = this.getDefaultLoadedEmoji();
        this.playerEmojiSequences.set(player.id, {
          sequence: [defaultEmoji],
          totalWeight: 1,
          averageDamage: defaultEmoji.effect.damage,
          specialEffectsCount: 0
        });
      });
    } catch (error) {
      console.error(`Failed to initialize emoji sequence for ${player.id}:`, error);

      // Create fallback sequence
      const defaultEmoji = EmojiLoader.getRandomEmojiFromSequence({
        sequence: [],
        totalWeight: 0,
        averageDamage: 0,
        specialEffectsCount: 0
      });

      this.playerEmojiSequences.set(player.id, {
        sequence: [defaultEmoji],
        totalWeight: 1,
        averageDamage: defaultEmoji.effect.damage,
        specialEffectsCount: 0
      });
    }
  }

  // Get the current emoji sequence for a player
  public getPlayerEmojiSequence(playerId: string): EmojiCombatSequence | null {
    return this.playerEmojiSequences.get(playerId) || null;
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

    // Get emoji from loaded sequence (real emojis from player's deck)
    const emojiSequence = this.playerEmojiSequences.get(player.id);
    const loadedEmoji = emojiSequence
      ? EmojiLoader.getRandomEmojiFromSequence(emojiSequence)
      : this.getDefaultLoadedEmoji();

    const emojiChar = loadedEmoji.emoji;
    const emojiEffect = loadedEmoji.effect;

    // Calculate direction to target
    const direction = {
      x: target.position.x - player.position.x,
      y: target.position.y - player.position.y
    };
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);

    if (length === 0) return;

    direction.x /= length;
    direction.y /= length;

    // Use emoji effect data from loaded emoji
    const baseSpeed = emojiEffect.speed * 60; // Convert to pixels/sec
    let damage = emojiEffect.damage;

    // Apply synergy damage bonuses
    damage = this.applySynergyDamageBonus(player.id, damage);

    // Apply trajectory-based velocity calculation
    let velocity = { x: direction.x * baseSpeed, y: direction.y * baseSpeed };

    // Apply synergy speed bonuses
    velocity = this.applySynergySpeedBonus(player.id, velocity);

    if (emojiEffect?.trajectory === 'wave') {
      velocity.y += Math.sin(Date.now() * 0.01) * baseSpeed * 0.3;
    } else if (emojiEffect?.trajectory === 'arc') {
      velocity.y -= baseSpeed * 0.5; // Initial upward arc
    } else if (emojiEffect?.trajectory === 'spiral') {
      const angle = Date.now() * 0.005;
      velocity.x += Math.cos(angle) * baseSpeed * 0.2;
      velocity.y += Math.sin(angle) * baseSpeed * 0.2;
    }

    // Convert emoji effects to projectile effects
    const projectileEffects: ProjectileEffect[] = [];
    if (emojiEffect?.effects) {
      for (const effect of emojiEffect.effects) {
        projectileEffects.push({
          type: effect.type,
          duration: effect.duration || 3,
          intensity: effect.value || effect.tickDamage || 1
        });
      }
    }

    const projectile: EmojiProjectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      emoji: emojiChar,
      position: { ...player.position },
      velocity,
      damage,
      size: 32,
      rotation: 0,
      ownerId: player.id,
      bounces: 0,
      maxBounces: emojiEffect?.trajectory === 'spiral' ? 1 : 2,
      lifespan: 0,
      maxLifespan: emojiEffect?.speed ? Math.max(3, 8 - emojiEffect.speed) : 5,
      effects: projectileEffects,
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
      position: projectile.position,
      emojiEffect: emojiEffect?.type || 'direct'
    });

    // Check for synergy special effects on projectile fire
    this.checkSynergySpecialEffects(player.id, 'projectile_fire', { projectileId: projectile.id });
  }

  private getRandomEmoji(cards: any[]): string {
    // Get emojis from cards first, fall back to system emojis
    const cardEmojis = cards.flatMap(card =>
      card.emojis?.map((emoji: any) => emoji.character) || [card.emoji]
    ).filter(Boolean);

    if (cardEmojis.length > 0) {
      return cardEmojis[Math.floor(Math.random() * cardEmojis.length)];
    }

    // Fallback to system emoji pool
    const systemEmojis = EmojiEffectsManager.getAllEmojis();
    return systemEmojis[Math.floor(Math.random() * systemEmojis.length)];
  }

  private getDefaultLoadedEmoji(): { emoji: string; effect: any } {
    return {
      emoji: '💥',
      effect: {
        emoji: '💥',
        damage: 15,
        speed: 250,
        trajectory: 'straight' as const,
        type: 'direct' as const,
        description: 'Default combat projectile',
        rarity: 'common' as const
      }
    };
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

          // Apply effects from projectile
          for (const effect of collision.effects) {
            this.addActiveEffect(player.id, effect, projectile.ownerId);
          }

          // Update shooter accuracy
          const shooter = this.state.players.find(p => p.id === projectile.ownerId);

          // Apply emoji-specific effects using new system
          const emojiEffect = EmojiEffectsManager.getEffect(projectile.emoji);
          if (emojiEffect?.effects) {
            for (const effect of emojiEffect.effects) {
              // Apply immediate or over-time effects based on emoji type
              this.applyEmojiEffect(player, shooter, effect, emojiEffect);
            }
          }

          // Trigger ON_HIT passives for shooter
          if (shooter) {
            shooter.shotsHit++;
            shooter.damage += actualDamage;
            shooter.accuracy = shooter.shotsHit / shooter.shotsFired;

            this.triggerPassives('ON_HIT', shooter.id, {
              targetId: player.id,
              damage: actualDamage,
              projectileEmoji: projectile.emoji
            });
          }

          // Trigger ON_DAMAGE passives for target
          this.triggerPassives('ON_DAMAGE', player.id, {
            sourceId: shooter?.id,
            damage: actualDamage,
            remainingHealth: player.health
          });

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
            // Check for low HP triggers
            this.checkLowHpTriggers(player);

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

          // Check for synergy special effects on projectile hit
          if (shooter) {
            this.checkSynergySpecialEffects(shooter.id, 'projectile_hit', {
              targetId: player.id,
              damage: actualDamage
            });
          }
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

    // Clean up passive effects for all players
    for (const player of this.state.players) {
      passiveEffectsService.cleanup(player.id);
    }

    this.emitEvent('match_ended', {
      winner: winner.id,
      duration: this.state.endTime - this.state.startTime,
      reason: this.state.timeRemaining <= 0 ? 'timeout' : 'elimination',
      passiveStats: this.state.players.map(p => ({
        playerId: p.id,
        stats: passiveEffectsService.getPassiveStats(p.id)
      }))
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

  // New method for emoji-specific effect handling
  private applyEmojiEffect(target: CombatPlayer | undefined, shooter: CombatPlayer | undefined, effect: any, emojiEffect: any): void {
    if (!target) return;

    switch (effect.type) {
      case 'BURN':
        if (effect.tickDamage && effect.duration) {
          // Create burn effect over time
          this.addActiveEffect(target.id, {
            type: 'burn',
            duration: effect.duration * 1000,
            intensity: effect.tickDamage
          }, shooter?.id || 'system');
        }
        break;

      case 'FREEZE':
        if (effect.value && effect.duration) {
          // Slow down target
          const originalSpeed = target.moveSpeed;
          const originalFireRate = target.fireRate;
          target.moveSpeed *= effect.value;
          target.fireRate *= effect.value;

          // Reset after duration
          setTimeout(() => {
            target.moveSpeed = originalSpeed;
            target.fireRate = originalFireRate;
          }, effect.duration * 1000);
        }
        break;

      case 'HEAL':
        if (effect.value && shooter) {
          // Heal the shooter, not the target
          shooter.health = Math.min(shooter.maxHealth, shooter.health + effect.value);
          this.state.stats.totalHealing += effect.value;

          this.emitEvent('player_healed', {
            playerId: shooter.id,
            healAmount: effect.value,
            currentHealth: shooter.health
          });
        }
        break;

      case 'POISON':
        if (effect.tickDamage && effect.duration) {
          // Apply poison damage over time
          this.addActiveEffect(target.id, {
            type: 'poison',
            duration: effect.duration * 1000,
            intensity: effect.tickDamage
          }, shooter?.id || 'system');
        }
        break;

      case 'SHIELD':
        if (effect.value && shooter) {
          // Shield the shooter
          shooter.shield = Math.min(shooter.maxShield, shooter.shield + effect.value);

          this.emitEvent('shield_applied', {
            playerId: shooter.id,
            shieldAmount: effect.value,
            currentShield: shooter.shield
          });
        }
        break;

      case 'BOOST':
        if (effect.value && effect.duration && shooter) {
          // Boost shooter's performance
          const originalFireRate = shooter.fireRate;
          shooter.fireRate *= effect.value;

          setTimeout(() => {
            shooter.fireRate = originalFireRate;
          }, effect.duration * 1000);
        }
        break;

      case 'STUN':
        if (effect.duration && Math.random() < (effect.chance || 1)) {
          // Stun target
          const originalSpeed = target.moveSpeed;
          const originalFireRate = target.fireRate;
          target.moveSpeed = 0;
          target.fireRate = 0;

          setTimeout(() => {
            target.moveSpeed = originalSpeed;
            target.fireRate = originalFireRate;
          }, effect.duration * 1000);
        }
        break;

      case 'DRAIN':
        if (effect.value && shooter) {
          // Drain health from target to shooter
          const drainAmount = Math.min(effect.value, target.health);
          target.health -= drainAmount;
          shooter.health = Math.min(shooter.maxHealth, shooter.health + drainAmount);
          this.state.stats.totalDamage += drainAmount;
          this.state.stats.totalHealing += drainAmount;
        }
        break;

      case 'LUCKY':
        if (effect.value && shooter) {
          // Increase reward multiplier temporarily
          // This would need to be tracked in player stats or game state
          this.emitEvent('luck_boost_applied', {
            playerId: shooter.id,
            multiplier: effect.value,
            duration: effect.duration || 10
          });
        }
        break;

      case 'MULTIPLY':
        if (Math.random() < (effect.chance || 0.2) && shooter) {
          // Create additional projectile
          setTimeout(() => {
            this.fireProjectile(shooter);
          }, 100);
        }
        break;

      default:
        console.log(`Unhandled emoji effect: ${effect.type}`);
        break;
    }
  }

  // Passive effects integration methods
  private processPassiveEffects(deltaTime: number): void {
    // Process periodic passives
    const periodicActivations = passiveEffectsService.processPeriodicEffects(deltaTime);
    this.applyPassiveActivations(periodicActivations);
  }

  private triggerPassives(triggerType: string, playerId: string, metadata: any = {}): void {
    const event: PassiveTriggerEvent = {
      type: triggerType as any, // Will be mapped to TriggerType
      playerId,
      timestamp: Date.now(),
      ...metadata
    };

    const activations = passiveEffectsService.triggerPassives(event);
    this.applyPassiveActivations(activations);
  }

  private checkLowHpTriggers(player: CombatPlayer): void {
    const activations = passiveEffectsService.checkLowHpTriggers(player);
    this.applyPassiveActivations(activations);
  }

  private applyPassiveActivations(activations: PassiveActivation[]): void {
    for (const activation of activations) {
      const player = this.state.players.find(p => p.id === activation.playerId);
      if (!player) continue;

      switch (activation.type) {
        case 'heal':
          const healAmount = activation.value;
          player.health = Math.min(player.maxHealth, player.health + healAmount);
          this.state.stats.totalHealing += healAmount;

          this.emitEvent('passive_heal', {
            playerId: player.id,
            amount: healAmount,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'boost':
          const boostMultiplier = activation.value;
          const originalFireRate = player.fireRate;
          player.fireRate *= boostMultiplier;

          // Reset after duration
          setTimeout(() => {
            player.fireRate = originalFireRate;
          }, activation.duration * 1000);

          this.emitEvent('passive_boost', {
            playerId: player.id,
            multiplier: boostMultiplier,
            duration: activation.duration,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'shield':
          const shieldAmount = activation.value;
          player.shield = Math.min(player.maxShield, player.shield + shieldAmount);

          this.emitEvent('passive_shield', {
            playerId: player.id,
            amount: shieldAmount,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'burn':
        case 'freeze':
        case 'poison':
          // Create over-time effect
          this.addActiveEffect(player.id, {
            type: activation.type,
            duration: activation.duration * 1000,
            intensity: activation.value
          }, 'passive');

          this.emitEvent('passive_debuff', {
            playerId: player.id,
            type: activation.type,
            value: activation.value,
            duration: activation.duration,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'lucky':
          // Track luck bonus (would need to be stored in player stats)
          this.emitEvent('passive_luck', {
            playerId: player.id,
            multiplier: activation.value,
            duration: activation.duration,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'burst':
          // Mark next attack for extra damage
          this.emitEvent('passive_burst', {
            playerId: player.id,
            multiplier: activation.value,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'reflect':
          // Add reflection capability temporarily
          this.emitEvent('passive_reflect', {
            playerId: player.id,
            percentage: activation.value * 100,
            duration: activation.duration,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        case 'multiply':
          // Fire additional projectiles
          const additionalShots = activation.value - 1;
          for (let i = 0; i < additionalShots; i++) {
            setTimeout(() => {
              this.fireProjectile(player);
            }, i * 50); // Stagger shots slightly
          }

          this.emitEvent('passive_multiply', {
            playerId: player.id,
            additionalShots,
            description: activation.description,
            passiveId: activation.id
          });
          break;

        default:
          console.warn(`Unhandled passive activation type: ${activation.type}`);
      }
    }
  }

  // Synergy bonus application methods
  private applySynergyDamageBonus(playerId: string, baseDamage: number): number {
    const synergies = this.playerSynergies.get(playerId) || [];
    let damageMultiplier = 1;

    for (const synergy of synergies) {
      for (const bonus of synergy.bonuses) {
        if (bonus.type === 'damage') {
          if (bonus.isPercentage) {
            damageMultiplier += bonus.value / 100;
          } else {
            baseDamage += bonus.value;
          }
        }
      }
    }

    // Check for critical hits from Force Build
    const forceBuilds = synergies.filter(s => s.synergyId === 'FORCE_BUILD');
    for (const forceBuild of forceBuilds) {
      const criticalBonus = forceBuild.bonuses.find(b => b.description.includes('critical'));
      if (criticalBonus && Math.random() < criticalBonus.value) {
        baseDamage *= 2; // Critical hit!
        this.emitEvent('critical_hit', { playerId, damage: baseDamage });
      }
    }

    return baseDamage * damageMultiplier;
  }

  private applySynergySpeedBonus(playerId: string, baseVelocity: { x: number; y: number }): { x: number; y: number } {
    const synergies = this.playerSynergies.get(playerId) || [];
    let speedMultiplier = 1;

    for (const synergy of synergies) {
      // Speed Build projectile speed bonus
      if (synergy.synergyId === 'SPEED_BUILD') {
        const speedBonus = synergy.bonuses.find(b => b.description.includes('2x faster'));
        if (speedBonus) {
          speedMultiplier *= speedBonus.value;
        }
      }

      // General speed bonuses
      for (const bonus of synergy.bonuses) {
        if (bonus.type === 'special' && bonus.description.includes('faster')) {
          speedMultiplier *= bonus.value;
        }
      }
    }

    return {
      x: baseVelocity.x * speedMultiplier,
      y: baseVelocity.y * speedMultiplier
    };
  }

  private checkSynergySpecialEffects(playerId: string, context: string, data: any = {}): void {
    const synergies = this.playerSynergies.get(playerId) || [];

    for (const synergy of synergies) {
      switch (synergy.synergyId) {
        case 'ELEMENTAL_MASTERY':
          if (context === 'projectile_hit') {
            const randomEffect = synergy.bonuses.find(b => b.description.includes('random elemental'));
            if (randomEffect && Math.random() < randomEffect.value) {
              this.applyRandomElementalEffect(data.targetId);
            }
          }
          break;

        case 'MEME_LORD':
          if (context === 'projectile_fire') {
            const chaosEffect = synergy.bonuses.find(b => b.description.includes('chaos'));
            if (chaosEffect && Math.random() < chaosEffect.value) {
              this.applyChaosEffect(playerId);
            }
          }
          break;

        case 'RAINBOW_CHAOS':
          if (context === 'any') {
            const randomPowerful = synergy.bonuses.find(b => b.description.includes('random powerful'));
            if (randomPowerful && Math.random() < randomPowerful.value) {
              this.applyRandomPowerfulEffect(playerId);
            }
          }
          break;

        case 'LUCK_BUILD':
          if (context === 'reward_calculation') {
            const doubleRewards = synergy.bonuses.find(b => b.description.includes('double rewards'));
            if (doubleRewards && Math.random() < doubleRewards.value) {
              data.rewardMultiplier = (data.rewardMultiplier || 1) * 2;
            }
          }
          break;
      }
    }
  }

  private applyRandomElementalEffect(targetId: string): void {
    const effects = ['burn', 'freeze', 'poison'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];

    this.addActiveEffect(targetId, {
      type: randomEffect,
      duration: 3000,
      intensity: 5
    }, 'synergy');

    this.emitEvent('synergy_elemental_proc', {
      targetId,
      effectType: randomEffect,
      source: 'ELEMENTAL_MASTERY'
    });
  }

  private applyChaosEffect(playerId: string): void {
    const chaosEffects = [
      'boost_damage',
      'random_teleport',
      'duplicate_projectile',
      'shield_burst',
      'heal_random'
    ];

    const effect = chaosEffects[Math.floor(Math.random() * chaosEffects.length)];

    this.emitEvent('synergy_chaos_proc', {
      playerId,
      effectType: effect,
      source: 'MEME_LORD'
    });
  }

  private applyRandomPowerfulEffect(playerId: string): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return;

    const powerfulEffects = [
      () => { player.health = Math.min(player.maxHealth, player.health + 50); }, // Big heal
      () => { player.shield = Math.min(player.maxShield, player.shield + 100); }, // Big shield
      () => { this.fireProjectile(player); this.fireProjectile(player); }, // Double shot
      () => { player.fireRate *= 3; setTimeout(() => player.fireRate /= 3, 5000); } // Temp speed
    ];

    const randomEffect = powerfulEffects[Math.floor(Math.random() * powerfulEffects.length)];
    randomEffect();

    this.emitEvent('synergy_rainbow_chaos_proc', {
      playerId,
      source: 'RAINBOW_CHAOS'
    });
  }

  private getSynergyInfo(playerId: string): any {
    const synergies = this.playerSynergies.get(playerId) || [];
    return {
      activeSynergies: synergies.length,
      synergyIds: synergies.map(s => s.synergyId),
      totalStrength: synergies.reduce((sum, s) => sum + s.strength, 0)
    };
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
  // #endregion
}