/**
 * Combat Resolver - High-performance action resolution system
 * Handles turn-based combat resolution with emoji-based effects
 */

import { CombatAction, CombatResult, DamageCalculation, EffectApplication } from '../types/combat.types';
import { CombatEntity } from './CombatEntity';
import { BattleState } from '../types/combat.types';

export interface ResolutionConfig {
  enableLogging: boolean;
  maxActionQueue: number;
  enableEffectChaining: boolean;
  damageCalculationMode: 'standard' | 'advanced';
}

export class CombatResolver {
  private config: ResolutionConfig;
  private actionQueue: CombatAction[] = [];
  private resolutionStack: CombatResult[] = [];
  private effectChain: any[] = [];

  constructor(config: ResolutionConfig) {
    this.config = config;
  }

  /**
   * Queue combat action for resolution
   */
  queueAction(action: CombatAction): boolean {
    if (this.actionQueue.length >= this.config.maxActionQueue) {
      return false;
    }

    if (!this.validateAction(action)) {
      return false;
    }

    this.actionQueue.push(action);
    return true;
  }

  /**
   * Process all queued actions
   */
  processQueue(): CombatResult[] {
    const results: CombatResult[] = [];
    
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift();
      if (action) {
        const result = this.resolveAction(action);
        results.push(result);
        this.resolutionStack.push(result);
      }
    }

    return results;
  }

  /**
   * Resolve individual combat action
   */
  private resolveAction(action: CombatAction): CombatResult {
    const startTime = performance.now();
    
    try {
      let result: CombatResult;

      switch (action.type) {
        case 'ATTACK':
          result = this.resolveAttack(action);
          break;
        case 'DEFEND':
          result = this.resolveDefend(action);
          break;
        case 'SPECIAL':
          result = this.resolveSpecial(action);
          break;
        case 'PLAY_CARD':
          result = this.resolvePlayCard(action);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      if (this.config.enableLogging) {
        this.logResolution(action, result, performance.now() - startTime);
      }

      return result;
    } catch (error) {
      return this.createErrorResult(action, error);
    }
  }

  /**
   * Resolve attack action with damage calculation
   */
  private resolveAttack(action: CombatAction): CombatResult {
    const attacker = action.source;
    const defender = action.target;

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return this.createInvalidResult(action, 'Invalid attack target');
    }

    // Calculate damage
    const damage = this.calculateDamage(attacker, defender, action);
    
    // Apply damage
    const actualDamage = defender.takeDamage(damage.total);
    
    // Create result
    return {
      id: this.generateResultId(),
      actionId: action.id,
      type: 'ATTACK_RESOLUTION',
      success: true,
      data: {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: actualDamage,
        critical: damage.critical,
        effects: damage.effects,
        remainingHealth: defender.health
      },
      timestamp: Date.now()
    };
  }

  /**
   * Calculate damage with all modifiers and effects
   */
  private calculateDamage(attacker: CombatEntity, defender: CombatEntity, action: CombatAction): DamageCalculation {
    let baseDamage = attacker.stats.attack;
    
    // Apply attacker effects
    for (const effect of attacker.effects.values()) {
      if (effect.type === 'BUFF' && effect.value > 0) {
        baseDamage *= (1 + effect.value / 100);
      }
    }

    // Apply defender effects
    for (const effect of defender.effects.values()) {
      if (effect.type === 'DEBUFF' && effect.value < 0) {
        baseDamage *= (1 + effect.value / 100);
      }
    }

    // Apply defense
    const defenseReduction = defender.stats.defense / 100;
    const finalDamage = Math.max(1, baseDamage * (1 - defenseReduction));

    // Critical hit calculation
    const critical = Math.random() < 0.15; // 15% base crit chance
    const criticalMultiplier = critical ? 2.0 : 1.0;

    // Special effects from card
    const effects = this.calculateSpecialEffects(attacker, defender, action);

    return {
      base: baseDamage,
      final: Math.floor(finalDamage * criticalMultiplier),
      critical,
      effects
    };
  }

  /**
   * Resolve defend action
   */
  private resolveDefend(action: CombatAction): CombatResult {
    const defender = action.source;
    
    if (!defender || !defender.isAlive) {
      return this.createInvalidResult(action, 'Invalid defender');
    }

    // Apply defensive buff
    const shieldAmount = Math.floor(defender.stats.defense * 0.5);
    defender.shield += shieldAmount;

    return {
      id: this.generateResultId(),
      actionId: action.id,
      type: 'DEFEND_RESOLUTION',
      success: true,
      data: {
        defenderId: defender.id,
        shieldAmount,
        totalShield: defender.shield
      },
      timestamp: Date.now()
    };
  }

  /**
   * Resolve special ability action
   */
  private resolveSpecial(action: CombatAction): CombatResult {
    const caster = action.source;
    
    if (!caster || !caster.isAlive) {
      return this.createInvalidResult(action, 'Invalid caster');
    }

    const ability = action.data?.ability;
    if (!ability) {
      return this.createInvalidResult(action, 'Missing ability data');
    }

    // Apply special effects based on emoji
    const effects = this.applySpecialEffects(caster, action);

    return {
      id: this.generateResultId(),
      actionId: action.id,
      type: 'SPECIAL_RESOLUTION',
      success: true,
      data: {
        casterId: caster.id,
        ability,
        effects
      },
      timestamp: Date.now()
    };
  }

  /**
   * Resolve play card action
   */
  private resolvePlayCard(action: CombatAction): CombatResult {
    const player = action.source;
    const card = action.data?.card;
    
    if (!player || !card) {
      return this.createInvalidResult(action, 'Invalid card play');
    }

    // Check energy cost
    const energyCost = card.energyCost || 0;
    if (player.energy < energyCost) {
      return this.createInvalidResult(action, 'Insufficient energy');
    }

    // Consume energy
    player.energy -= energyCost;

    // Apply card effects
    const effects = this.applyCardEffects(player, card, action);

    return {
      id: this.generateResultId(),
      actionId: action.id,
      type: 'CARD_PLAY_RESOLUTION',
      success: true,
      data: {
        playerId: player.id,
        card,
        energyCost,
        remainingEnergy: player.energy,
        effects
      },
      timestamp: Date.now()
    };
  }

  /**
   * Calculate special effects based on card emoji
   */
  private calculateSpecialEffects(attacker: CombatEntity, defender: CombatEntity, action: CombatAction): EffectApplication[] {
    const effects: EffectApplication[] = [];
    
    // Emoji-based effects
    const emoji = attacker.card.emoji;
    if (emoji) {
      switch (emoji) {
        case '🔥':
          effects.push({
            type: 'BURN',
            value: Math.floor(attacker.stats.attack * 0.2),
            duration: 3,
            target: defender
          });
          break;
        case '❄️':
          effects.push({
            type: 'FREEZE',
            value: 50, // 50% speed reduction
            duration: 2,
            target: defender
          });
          break;
        case '⚡':
          effects.push({
            type: 'STUN',
            value: 1,
            duration: 1,
            target: defender
          });
          break;
        case '🛡️':
          effects.push({
            type: 'SHIELD',
            value: Math.floor(attacker.stats.defense * 0.5),
            duration: 3,
            target: attacker
          });
          break;
      }
    }

    return effects;
  }

  /**
   * Apply special effects based on card abilities
   */
  private applySpecialEffects(caster: CombatEntity, action: CombatAction): EffectApplication[] {
    const effects: EffectApplication[] = [];
    const ability = action.data?.ability;
    
    // Implement special ability logic
    if (ability && ability.type === 'AOE_DAMAGE') {
      // Area of effect damage
      effects.push({
        type: 'AOE_DAMAGE',
        value: caster.stats.attack,
        duration: 1,
        target: caster // Will be distributed to nearby enemies
      });
    }

    return effects;
  }

  /**
   * Apply card effects
   */
  private applyCardEffects(player: CombatEntity, card: any, action: CombatAction): EffectApplication[] {
    const effects: EffectApplication[] = [];
    
    // Apply card-specific effects
    if (card.effects) {
      card.effects.forEach((effect: any) => {
        effects.push({
          type: effect.type,
          value: effect.value,
          duration: effect.duration,
          target: player
        });
      });
    }

    return effects;
  }

  /**
   * Validate action before processing
   */
  private validateAction(action: CombatAction): boolean {
    return action.source?.isAlive && action.type && action.id;
  }

  /**
   * Generate unique result ID
   */
  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create error result
   */
  private createErrorResult(action: CombatAction, error: any): CombatResult {
    return {
      id: this.generateResultId(),
      actionId: action.id,
      type: 'ERROR',
      success: false,
      data: {
        error: error.message,
        action: action
      },
      timestamp: Date.now()
    };
  }

  /**
   * Create invalid result
   */
  private createInvalidResult(action: CombatAction, reason: string): CombatResult {
    return {
      id: this.generateResultId(),
      actionId: action.id,
      type: 'INVALID',
      success: false,
      data: {
        reason,
        action: action
      },
      timestamp: Date.now()
    };
  }

  /**
   * Log resolution for debugging
   */
  private logResolution(action: CombatAction, result: CombatResult, duration: number): void {
    console.log(`[CombatResolver] Action ${action.type} resolved in ${duration}ms`, {
      action,
      result,
      queueLength: this.actionQueue.length
    });
  }

  /**
   * Get resolution statistics
   */
  getStats() {
    return {
      queuedActions: this.actionQueue.length,
      resolvedActions: this.resolutionStack.length,
      effectChainLength: this.effectChain.length
    };
  }

  /**
   * Clear all queues
   */
  clear(): void {
    this.actionQueue = [];
    this.resolutionStack = [];
    this.effectChain = [];
  }
}