# PassiveEffectsService Contract

## Overview
The PassiveEffectsService manages card passive abilities integration with the combat engine, handling trigger-based effect activation, cooldown management, and stat modifications during battles.

## Interface Definition

### Primary Methods

```typescript
interface PassiveEffectsService {
  // Lifecycle Management
  initializePassives(player: CombatPlayer, deck: Card[]): void;
  cleanup(playerId: string): void;
  resetPassives(playerId: string): void;
  
  // Effect Triggering
  triggerPassives(event: PassiveTriggerEvent): PassiveActivation[];
  processPeriodicEffects(deltaTime: number): PassiveActivation[];
  
  // Combat Integration
  checkLowHpTriggers(player: CombatPlayer): PassiveActivation[];
  checkHighComboTriggers(playerId: string, comboCount: number): PassiveActivation[];
  
  // State Management
  getActivePassives(playerId: string): ActivePassive[];
  useItem(itemId: string): boolean;
  disablePassive(passiveId: string): void;
  
  // Statistics
  getPassiveStats(playerId: string): PassiveStats;
}
```

### Key Data Structures

```typescript
interface ActivePassive {
  id: string;
  cardId: string;
  playerId: string;
  effect: CardEffect;
  isActive: boolean;
  cooldownRemaining: number;
  procCount: number;
  lastProcTime: number;
}

interface PassiveTriggerEvent {
  type: TriggerType;
  playerId: string;
  targetId?: string;
  damage?: number;
  timestamp: number;
  metadata?: any;
}

interface PassiveActivation {
  id: string;
  type: string;
  playerId: string;
  value: number;
  duration: number;
  description: string;
}

enum TriggerType {
  BATTLE_START = 'battle_start',
  LOW_HP = 'low_hp',
  HIGH_COMBO = 'high_combo',
  PERIODIC = 'periodic'
}

enum EffectType {
  HEAL = 'heal',
  BOOST = 'boost',
  SHIELD = 'shield',
  BURN = 'burn',
  FREEZE = 'freeze',
  POISON = 'poison',
  LUCKY = 'lucky',
  BURST = 'burst',
  REFLECT = 'reflect',
  MULTIPLY = 'multiply'
}
```

## Implementation Requirements

### Trigger System
1. **Battle Start Triggers**
   - Activate immediately when combat begins
   - Applied before first projectile launch
   - Support multiple passives per player

2. **Low HP Triggers** (≤25% health)
   - Monitor health percentage continuously
   - Trigger once per low-health state
   - Reset on health recovery above threshold

3. **High Combo Triggers** (≥5 consecutive hits)
   - Track combo counters per player
   - Activate on combo milestone achievement
   - Support stacking effects for higher combos

4. **Periodic Triggers**
   - Process every 1 second during combat
   - Respect cooldown periods between activations
   - Maintain consistent timing regardless of framerate

### Effect Processing
- **Heal**: Restore health with overflow protection
- **Boost**: Temporary stat multipliers with duration tracking
- **Shield**: Absorb damage with depletion management
- **Burn/Poison**: Damage-over-time with tick processing
- **Freeze**: Movement/attack speed reduction
- **Lucky**: RNG modifier application
- **Burst**: Next-attack damage multiplier
- **Reflect**: Damage redirection percentage
- **Multiply**: Projectile duplication effects

### Performance Requirements
- Trigger evaluation: < 1ms per passive per frame
- Effect activation: < 5ms for complex effects
- Memory usage: < 10MB for 100+ active passives
- Cooldown tracking: Frame-accurate timing

### Integration Requirements

#### With Combat Engine
- Seamless integration with frame-based processing
- Real-time stat modification application
- Event-driven trigger activation
- Performance-optimized effect calculations

#### With Card System
- Automatic passive detection from card effects
- Support for all card rarities with passive abilities
- Dynamic passive list based on deck composition

#### With Player Stats
- Persistent tracking of passive performance
- Integration with achievement system
- Statistical analysis for balance adjustments

## Validation Rules
- Effect chances must be between 0-1 (0-100%)
- Cooldowns must be positive numbers or zero
- Duration values must be positive for temporary effects
- Trigger conditions must be properly validated
- Player health calculations must prevent negative values

## Error Handling
- Graceful handling of invalid card effects
- Automatic cleanup of orphaned passives
- Rollback support for failed activations
- Comprehensive logging for debugging

## Testing Requirements

### Unit Tests
- Individual trigger type processing
- Effect activation and duration management
- Cooldown enforcement accuracy
- Statistical tracking correctness

### Integration Tests
- Full combat integration with multiple passives
- Performance under high passive count scenarios
- Cross-passive interaction validation
- Memory leak prevention

### Performance Tests
- Frame rate impact with 50+ active passives
- Memory usage scaling with passive count
- Trigger evaluation speed optimization
- Effect processing efficiency

## Success Metrics
- Trigger accuracy: 100% when conditions met
- Effect application speed: <5ms average
- Memory efficiency: Zero leaked passive references
- Combat performance: No frame drops with full passive load
- Statistical accuracy: 100% tracking fidelity