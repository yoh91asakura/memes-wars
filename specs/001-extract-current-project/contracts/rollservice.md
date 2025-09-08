# RollService Contract

## Interface Definition

```typescript
interface IRollService {
  // Single card roll with pity system
  rollSingle(): RollResult;
  
  // Multi-card roll (10x standard)
  rollMultiple(count: number): RollResult[];
  
  // Get current pity status
  getPityStatus(): PityStatus;
  
  // Get roll statistics
  getStatistics(): RollStatistics;
  
  // Reset pity counters (dev/testing only)
  resetPity(): void;
}

interface RollResult {
  card: Card;
  pityTriggered: boolean;
  rarityBoosted: boolean;
  rollNumber: number;
  timestamp: Date;
}

interface PityStatus {
  rollsWithoutRare: number;
  rollsWithoutEpic: number;
  rollsWithoutLegendary: number;
  rollsWithoutMythic: number;
  nextGuaranteed?: CardRarity;
  rollsUntilGuaranteed?: number;
}

interface RollStatistics {
  totalRolls: number;
  cardsByRarity: Record<CardRarity, number>;
  averageRollsPerRare: number;
  pityTriggeredCount: number;
  currentStreak: Record<CardRarity, number>;
}
```

## Behavior Contracts

### Single Roll Contract
**GIVEN** player has sufficient roll currency
**WHEN** `rollSingle()` is called
**THEN** 
- Return exactly one RollResult
- Deduct roll cost from player currency
- Update pity counters
- Trigger pity system if thresholds reached
- Add card to player collection
- Update roll statistics

### Pity System Contract
**GIVEN** player has rolled without rare drops
**WHEN** rare pity threshold (10 rolls) is reached
**THEN**
- Next roll MUST contain rare+ card
- Pity counter resets to 0
- `pityTriggered` flag set to true in result

### Multi-Roll Contract
**GIVEN** player requests 10x roll
**WHEN** `rollMultiple(10)` is called
**THEN**
- Return exactly 10 RollResult objects
- Process each roll individually (pity can trigger mid-batch)
- All currency deductions processed atomically
- If insufficient currency, reject entire batch

### Drop Rate Contract
**GIVEN** default drop rates configuration
**WHEN** no pity modifiers active
**THEN** drop rates MUST match:
- Common: 65%
- Uncommon: 25% 
- Rare: 7%
- Epic: 2.5%
- Legendary: 0.4%
- Mythic: 0.09%
- Cosmic: 0.01%

### Error Handling Contract
**GIVEN** invalid roll request
**WHEN** insufficient currency OR invalid count
**THEN**
- Throw `InsufficientCurrencyError` or `InvalidRollCountError`
- No state changes occur
- No cards added to collection
- No pity counters modified

## Test Scenarios

### Happy Path Tests
```typescript
describe('RollService Happy Path', () => {
  test('single roll returns valid card', () => {
    // Mock RNG to return known value
    // Call rollSingle()
    // Assert card properties valid
    // Assert currency deducted
    // Assert pity counters updated
  });
  
  test('pity system triggers at threshold', () => {
    // Set pity counter to 9
    // Call rollSingle()
    // Assert rare+ card returned
    // Assert pityTriggered = true
    // Assert pity counter reset
  });
});
```

### Edge Case Tests
```typescript
describe('RollService Edge Cases', () => {
  test('insufficient currency throws error', () => {
    // Set player currency to 0
    // Expect rollSingle() to throw
    // Assert no state changes
  });
  
  test('multi-roll partial pity trigger', () => {
    // Set pity counter to 7
    // Call rollMultiple(5)
    // Assert 3rd roll triggers pity
    // Assert remaining rolls use normal rates
  });
});
```

## Dependencies
- PlayerProgress (currency and pity state)
- Card collection (for adding new cards)
- Random number generator (mockable for testing)
- Configuration service (for drop rates)