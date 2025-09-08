// Passive Effects Service - Connect card passives to combat system
// Implementation to link card abilities to CombatEngine

import { Card, CardEffect, TriggerType, EffectType } from '../models';
import { CombatPlayer } from '../models/Combat';

export interface ActivePassive {
  id: string;
  cardId: string;
  playerId: string;
  effect: CardEffect;
  isActive: boolean;
  cooldownRemaining: number;
  procCount: number;
  lastProcTime: number;
}

export interface PassiveTriggerEvent {
  type: TriggerType;
  playerId: string;
  targetId?: string;
  damage?: number;
  timestamp: number;
  metadata?: any;
}

export class PassiveEffectsService {
  private activePassives: Map<string, ActivePassive[]> = new Map(); // playerId -> passives
  private combatStartTime: number = 0;
  private lastPeriodicCheck: number = 0;
  
  // Initialize passives from deck at battle start
  initializePassives(player: CombatPlayer, deck: Card[]): void {
    const passives: ActivePassive[] = [];
    
    for (const card of deck) {
      if (card.cardEffects && card.cardEffects.length > 0) {
        for (const effect of card.cardEffects) {
          const passiveId = `passive_${card.id}_${effect.trigger}_${Date.now()}_${Math.random()}`;
          
          passives.push({
            id: passiveId,
            cardId: card.id,
            playerId: player.id,
            effect,
            isActive: true,
            cooldownRemaining: 0,
            procCount: 0,
            lastProcTime: 0
          });
        }
      }
    }
    
    this.activePassives.set(player.id, passives);
    this.combatStartTime = Date.now();
    
    // Trigger BATTLE_START passives immediately
    this.triggerPassives({
      type: TriggerType.BATTLE_START,
      playerId: player.id,
      timestamp: Date.now()
    });
  }
  
  // Main trigger function called by CombatEngine
  triggerPassives(event: PassiveTriggerEvent): PassiveActivation[] {
    const playerPassives = this.activePassives.get(event.playerId) || [];
    const activations: PassiveActivation[] = [];
    const currentTime = Date.now();
    
    for (const passive of playerPassives) {
      if (!passive.isActive) continue;
      if (passive.cooldownRemaining > 0) {
        passive.cooldownRemaining = Math.max(0, passive.cooldownRemaining - (currentTime - passive.lastProcTime));
        continue;
      }
      
      // Check if trigger matches
      if (passive.effect.trigger !== event.type) continue;
      
      // Roll for chance
      if (Math.random() > passive.effect.chance) continue;
      
      // Trigger the passive
      const activation = this.activatePassive(passive, event);
      if (activation) {
        activations.push(activation);
        passive.procCount++;
        passive.lastProcTime = currentTime;
        passive.cooldownRemaining = (passive.effect.cooldown || 0) * 1000; // Convert to ms
      }
    }
    
    return activations;
  }
  
  // Process periodic effects (called every frame)
  processPeriodicEffects(deltaTime: number): PassiveActivation[] {
    const currentTime = Date.now();
    const activations: PassiveActivation[] = [];
    
    // Check periodics every 1 second
    if (currentTime - this.lastPeriodicCheck < 1000) {
      return activations;
    }
    this.lastPeriodicCheck = currentTime;
    
    // Process all players' periodic passives
    for (const [playerId, passives] of this.activePassives.entries()) {
      for (const passive of passives) {
        if (passive.effect.trigger === TriggerType.PERIODIC && passive.isActive) {
          const activation = this.triggerPassives({
            type: TriggerType.PERIODIC,
            playerId,
            timestamp: currentTime
          });
          activations.push(...activation);
        }
      }
    }
    
    return activations;
  }
  
  // Handle low HP triggers
  checkLowHpTriggers(player: CombatPlayer): PassiveActivation[] {
    const healthPercent = player.health / player.maxHealth;
    if (healthPercent <= 0.25) { // Low HP threshold
      return this.triggerPassives({
        type: TriggerType.LOW_HP,
        playerId: player.id,
        timestamp: Date.now(),
        metadata: { healthPercent }
      });
    }
    return [];
  }
  
  // Handle high combo triggers
  checkHighComboTriggers(playerId: string, comboCount: number): PassiveActivation[] {
    if (comboCount >= 5) { // High combo threshold
      return this.triggerPassives({
        type: TriggerType.HIGH_COMBO,
        playerId,
        timestamp: Date.now(),
        metadata: { comboCount }
      });
    }
    return [];
  }
  
  // Activate a specific passive effect
  private activatePassive(passive: ActivePassive, event: PassiveTriggerEvent): PassiveActivation | null {
    const effect = passive.effect;
    
    switch (effect.effect) {
      case EffectType.HEAL:
        return {
          id: passive.id,
          type: 'heal',
          playerId: event.playerId,
          value: effect.value || 5,
          duration: effect.duration || 0,
          description: `Healed ${effect.value || 5} HP`
        };
        
      case EffectType.BOOST:
        return {
          id: passive.id,
          type: 'boost',
          playerId: event.playerId,
          value: effect.value || 1.5,
          duration: effect.duration || 3,
          description: `Attack speed boosted by ${((effect.value || 1.5) - 1) * 100}%`
        };
        
      case EffectType.SHIELD:
        return {
          id: passive.id,
          type: 'shield',
          playerId: event.playerId,
          value: effect.value || 10,
          duration: effect.duration || 5,
          description: `Shield applied: ${effect.value || 10} HP`
        };
        
      case EffectType.BURN:
        return {
          id: passive.id,
          type: 'burn',
          playerId: event.targetId || event.playerId,
          value: effect.value || 2,
          duration: effect.duration || 3,
          description: `Burn applied: ${effect.value || 2} damage/sec`
        };
        
      case EffectType.FREEZE:
        return {
          id: passive.id,
          type: 'freeze',
          playerId: event.targetId || event.playerId,
          value: effect.value || 0.5,
          duration: effect.duration || 2,
          description: `Target slowed by ${(1 - (effect.value || 0.5)) * 100}%`
        };
        
      case EffectType.POISON:
        return {
          id: passive.id,
          type: 'poison',
          playerId: event.targetId || event.playerId,
          value: effect.value || 1,
          duration: effect.duration || 4,
          description: `Poison applied: ${effect.value || 1} damage/sec`
        };
        
      case EffectType.LUCKY:
        return {
          id: passive.id,
          type: 'lucky',
          playerId: event.playerId,
          value: effect.value || 1.25,
          duration: effect.duration || 10,
          description: `Luck increased by ${((effect.value || 1.25) - 1) * 100}%`
        };
        
      case EffectType.BURST:
        return {
          id: passive.id,
          type: 'burst',
          playerId: event.playerId,
          value: effect.value || 2,
          duration: effect.duration || 1,
          description: `Next attack deals ${(effect.value || 2)}x damage`
        };
        
      case EffectType.REFLECT:
        return {
          id: passive.id,
          type: 'reflect',
          playerId: event.playerId,
          value: effect.value || 0.5,
          duration: effect.duration || 3,
          description: `Reflects ${(effect.value || 0.5) * 100}% of damage`
        };
        
      case EffectType.MULTIPLY:
        return {
          id: passive.id,
          type: 'multiply',
          playerId: event.playerId,
          value: effect.value || 2,
          duration: 0,
          description: `Duplicated projectiles x${effect.value || 2}`
        };
        
      default:
        console.warn(`Unhandled passive effect type: ${effect.effect}`);
        return null;
    }
  }
  
  // Get active passives for a player
  getActivePassives(playerId: string): ActivePassive[] {
    return this.activePassives.get(playerId) || [];
  }
  
  // Get passive statistics
  getPassiveStats(playerId: string): PassiveStats {
    const passives = this.activePassives.get(playerId) || [];
    
    return {
      totalPassives: passives.length,
      activePassives: passives.filter(p => p.isActive).length,
      totalProcs: passives.reduce((sum, p) => sum + p.procCount, 0),
      passivesByTrigger: this.groupPassivesByTrigger(passives),
      mostProcced: passives.reduce((max, p) => p.procCount > max.procCount ? p : max, passives[0])
    };
  }
  
  // Clean up on battle end
  cleanup(playerId: string): void {
    this.activePassives.delete(playerId);
  }
  
  // Reset all passives for player
  resetPassives(playerId: string): void {
    const passives = this.activePassives.get(playerId) || [];
    for (const passive of passives) {
      passive.procCount = 0;
      passive.cooldownRemaining = 0;
      passive.lastProcTime = 0;
      passive.isActive = true;
    }
  }
  
  // Disable specific passive
  disablePassive(passiveId: string): void {
    for (const passives of this.activePassives.values()) {
      const passive = passives.find(p => p.id === passiveId);
      if (passive) {
        passive.isActive = false;
        break;
      }
    }
  }
  
  // Helper methods
  private groupPassivesByTrigger(passives: ActivePassive[]): Record<string, number> {
    return passives.reduce((acc, passive) => {
      const trigger = passive.effect.trigger;
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Types for passive activations
export interface PassiveActivation {
  id: string;
  type: string;
  playerId: string;
  value: number;
  duration: number;
  description: string;
}

export interface PassiveStats {
  totalPassives: number;
  activePassives: number;
  totalProcs: number;
  passivesByTrigger: Record<string, number>;
  mostProcced?: ActivePassive;
}

// Singleton instance for global access
export const passiveEffectsService = new PassiveEffectsService();
export default passiveEffectsService;