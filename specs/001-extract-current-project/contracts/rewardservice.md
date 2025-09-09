# RewardService Contract

## Overview
The RewardService handles post-combat reward calculation and distribution based on performance metrics, stage difficulty, and player achievements.

## Interface Definition

### Core Methods

#### calculateRewards(combatResult, baseRewards, playerBonuses?)
**Purpose**: Calculate rewards based on combat performance and bonuses
**Parameters**:
- `combatResult: CombatResult` - Combat outcome with performance metrics
- `baseRewards: StageRewards` - Base reward amounts for the stage
- `playerBonuses?: PlayerBonus[]` - Optional player-specific bonus modifiers

**Returns**: `RewardCalculation`
```typescript
interface RewardCalculation {
  baseRewards: CurrencyAmount;
  performanceMultiplier: number;
  bonusRewards: CurrencyAmount;
  totalRewards: CurrencyAmount;
  breakdown: RewardBreakdown[];
}
```

#### distributeRewards(calculation, playerLevel)
**Purpose**: Apply calculated rewards to player currencies and progression
**Parameters**:
- `calculation: RewardCalculation` - Pre-calculated reward amounts
- `playerLevel: number` - Player level for experience calculations

**Returns**: `Promise<RewardDistribution>`
```typescript
interface RewardDistribution {
  success: boolean;
  currencyChanges: CurrencyTransaction[];
  experienceGained: number;
  achievementsUnlocked: Achievement[];
  errors?: string[];
}
```

#### getPerformanceBonuses(combatResult)
**Purpose**: Calculate performance-based bonus multipliers
**Parameters**:
- `combatResult: CombatResult` - Combat metrics and outcome

**Returns**: `PerformanceBonus[]`
```typescript
interface PerformanceBonus {
  type: 'perfect_victory' | 'speed_bonus' | 'survival_bonus' | 'combo_bonus';
  multiplier: number;
  reason: string;
}
```

## Data Models

### CombatResult
```typescript
interface CombatResult {
  winner: 'player' | 'ai' | 'draw';
  duration: number; // milliseconds
  playerHealthRemaining: number;
  aiHealthRemaining: number;
  totalDamageDealt: number;
  perfectVictory: boolean; // won without taking damage
  comboCount: number;
  stage: number;
}
```

### StageRewards
```typescript
interface StageRewards {
  baseGold: number;
  baseTickets: number;
  baseExperience: number;
  bonusMultiplier: number; // stage difficulty multiplier
}
```

### RewardBreakdown
```typescript
interface RewardBreakdown {
  source: string; // 'base', 'performance', 'achievement', 'bonus'
  amount: CurrencyAmount;
  description: string;
}
```

### CurrencyAmount
```typescript
interface CurrencyAmount {
  gold: number;
  tickets: number;
  gems?: number;
  experience?: number;
}
```

## Performance Bonuses

### Perfect Victory Bonus
- **Trigger**: Player wins without taking any damage
- **Bonus**: +50% to all rewards
- **Description**: "Flawless Victory!"

### Speed Bonus
- **Trigger**: Combat completed in under 30 seconds
- **Bonus**: +25% to all rewards
- **Description**: "Lightning Fast!"

### Survival Bonus
- **Trigger**: Player wins with less than 20% health remaining
- **Bonus**: +15% to all rewards
- **Description**: "Clutch Victory!"

### Combo Bonus
- **Trigger**: Player achieves 10+ consecutive hits
- **Bonus**: +10% per 5 combo hits (max +30%)
- **Description**: "Combo Master!"

## Integration Points

### CurrencyStore Integration
```typescript
// Automatic currency updates
const distribution = await rewardService.distributeRewards(calculation, playerLevel);
if (distribution.success) {
  distribution.currencyChanges.forEach(transaction => {
    currencyStore.addCurrency(transaction.type, transaction.amount);
  });
}
```

### CombatEngine Integration
```typescript
// Post-combat reward flow
const combatResult = combatEngine.getResult();
const baseRewards = stageService.getStageRewards(currentStage);
const calculation = rewardService.calculateRewards(combatResult, baseRewards);
const distribution = await rewardService.distributeRewards(calculation, playerLevel);
```

## Error Handling

### Common Errors
- **INVALID_COMBAT_RESULT**: Combat result is malformed or incomplete
- **INSUFFICIENT_BASE_REWARDS**: Stage rewards not properly configured
- **CURRENCY_UPDATE_FAILED**: Failed to update player currencies
- **CALCULATION_OVERFLOW**: Reward calculation exceeded maximum values

### Error Recovery
- Failed currency updates should be retried with exponential backoff
- Calculation errors should fall back to base rewards only
- All errors should be logged with full context for debugging

## Performance Requirements

### Response Times
- `calculateRewards()`: < 50ms for complex bonus calculations
- `distributeRewards()`: < 100ms for currency store updates
- `getPerformanceBonuses()`: < 10ms for real-time feedback

### Resource Usage
- Memory: < 5MB for reward calculation caching
- CPU: Batch operations for multiple concurrent calculations
- Storage: Persistent reward history for analytics

## Testing Considerations

### Unit Tests
- Verify all performance bonus calculations
- Test edge cases (zero damage, maximum combo)
- Validate currency distribution accuracy
- Check error handling paths

### Integration Tests
- End-to-end combat → reward → currency flow
- Multi-stage reward accumulation
- Achievement unlock triggering
- Performance under concurrent calculations

### Performance Tests
- Reward calculation speed benchmarks
- Memory usage during extended gameplay
- Currency store integration latency
- Concurrent user reward processing