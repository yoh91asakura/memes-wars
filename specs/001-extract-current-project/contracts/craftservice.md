# CraftService Contract

## Overview
The CraftService manages the comprehensive crafting system enabling players to create consumable items, permanent upgrades, special cards, and resource conversions using collected cards and currencies.

## Interface Definition

### Primary Methods

```typescript
interface CraftService {
  // Recipe Management
  getAvailableRecipes(): CraftRecipe[];
  getRecipe(id: string): CraftRecipe | undefined;
  
  // Crafting Validation
  canCraft(
    recipeId: string,
    playerCards: Card[],
    playerGold: number,
    playerGems: number,
    playerLevel?: number
  ): { canCraft: boolean; reason?: string };
  
  // Crafting Execution
  craft(
    recipeId: string,
    playerCards: Card[],
    onResourcesSpent?: (gold: number, gems: number, cardsUsed: Card[]) => void,
    onItemReceived?: (result: CraftResult) => void
  ): Promise<{ success: boolean; result?: CraftResult; item?: CraftedItem; error?: string }>;
  
  // Active Item Management
  getActiveItems(): CraftedItem[];
  useItem(itemId: string): boolean;
  
  // Statistics & Data
  getStats(): CraftStats;
  reset(): void;
}
```

### Key Data Structures

```typescript
interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'permanent' | 'upgrade' | 'card';
  
  cost: {
    common?: number;
    uncommon?: number;
    rare?: number;
    epic?: number;
    legendary?: number;
    mythic?: number;
    cosmic?: number;
    gold?: number;
    gems?: number;
  };
  
  result: CraftResult;
  unique?: boolean;
  maxCrafts?: number;
  cooldown?: number;
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface CraftedItem {
  id: string;
  recipeId: string;
  craftedAt: number;
  expiresAt?: number;
  active: boolean;
  usesRemaining?: number;
}
```

## Implementation Requirements

### Recipe Categories
1. **Consumables** (10+ recipes)
   - Lucky Charm: +10% luck for 5 rolls
   - Golden Horseshoe: Guarantee rare+ next roll
   - Rainbow Crystal: Reduce pity counters by 5
   - Midas Touch: 2x gold rewards for 10 battles

2. **Permanent Upgrades** (5+ recipes)
   - Deck Expansion: +1 deck slot permanently
   - Master Collector: +5% luck permanently

3. **Special Cards** (3+ recipes)
   - Legendary Forge: 5 epics → 1 legendary
   - Cosmic Fusion: 3 mythics + 1 cosmic → guaranteed cosmic

4. **Resource Conversion** (5+ recipes)
   - Alchemist's Dream: 10 commons → 500 gold
   - Gem Synthesis: 3 rares → 10 gems

### Validation Rules
- Resource requirements must be met exactly
- Player level requirements must be satisfied
- Unique constraints must be enforced
- Cooldowns must be respected
- Maximum craft limits must be tracked

### Performance Requirements
- Recipe lookup: O(1) constant time
- Crafting validation: < 10ms for complex recipes
- Item lifecycle management: Automatic cleanup
- Statistics tracking: Real-time updates

### Error Handling
- Graceful failure for insufficient resources
- Clear error messages for validation failures
- Rollback support for failed craft attempts
- Logging for debugging and analytics

## Integration Points

### With Card System
- Validates card ownership for crafting costs
- Integrates with card rarity classification
- Supports card-specific requirements

### With Economy System
- Deducts gold and gems for crafting costs
- Validates currency balances before crafting
- Integrates with reward distribution

### With Player Progress
- Tracks crafting statistics and history
- Integrates with achievement system
- Persists crafted item state

### With RollService
- Applies luck boosts from crafted items
- Integrates pity reduction effects
- Supports guaranteed rarity items

## Testing Requirements

### Unit Tests
- Recipe validation logic
- Resource cost calculations
- Cooldown and constraint enforcement
- Item lifecycle management

### Integration Tests
- Full crafting workflow end-to-end
- Resource deduction and validation
- Effect application and expiration
- Statistics accuracy

### Performance Tests
- Large recipe database lookup speed
- Concurrent crafting request handling
- Memory usage with many active items
- Cleanup efficiency for expired items

## Success Metrics
- Recipe validation accuracy: 100%
- Crafting success rate: >99% for valid requests
- Average response time: <50ms
- Memory leak prevention: Zero leaked items after expiration