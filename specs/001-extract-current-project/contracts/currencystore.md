# CurrencyStore Contract

## Overview
The CurrencyStore manages the game's economy with gold, tickets, and gems. Integrates with combat rewards and roll purchases.

## Interface Definition

### Core Methods

#### addCurrency(type, amount)
**Purpose**: Add currency from rewards or purchases
**Parameters**: `type: 'gold'|'tickets'|'gems'`, `amount: number`
**Returns**: `boolean` (success)

#### spendCurrency(type, amount)
**Purpose**: Spend currency for rolls or upgrades
**Parameters**: `type: 'gold'|'tickets'|'gems'`, `amount: number`
**Returns**: `boolean` (success if sufficient funds)

#### getCurrency(type)
**Purpose**: Get current currency amount
**Parameters**: `type: 'gold'|'tickets'|'gems'`
**Returns**: `number`

#### getTransactionHistory()
**Purpose**: Get recent currency transactions
**Returns**: `CurrencyTransaction[]`

## Data Models

```typescript
interface CurrencyState {
  gold: number;
  tickets: number;
  gems: number;
  transactions: CurrencyTransaction[];
}

interface CurrencyTransaction {
  id: string;
  type: 'gold' | 'tickets' | 'gems';
  amount: number; // positive = earned, negative = spent
  source: string; // 'combat', 'roll', 'achievement'
  timestamp: number;
}
```

## Integration Points

### RewardService Integration
```typescript
// Automatic currency distribution after combat
const distribution = await rewardService.distributeRewards(calculation, playerLevel);
currencyStore.addCurrency('gold', distribution.totalRewards.gold);
currencyStore.addCurrency('tickets', distribution.totalRewards.tickets);
```

### RollService Integration
```typescript
// Currency spending for rolls
const cost = rollService.getRollCost();
if (currencyStore.spendCurrency('gold', cost.gold)) {
  const result = rollService.rollSingle();
}
```

## Performance Requirements
- Currency updates: < 10ms
- Transaction logging: < 5ms
- Persistent storage: Automatic on change