# SynergySystem Contract

## Overview
The SynergySystem provides sophisticated deck synergy detection, bonus calculation, and archetype classification with real-time optimization recommendations and multi-rule validation engine.

## Interface Definition

### Primary Methods

```typescript
interface SynergySystem {
  // Core Detection
  static detectSynergies(deck: Card[]): SynergyDetectionResult;
  
  // Recommendations
  static getSynergyRecommendations(deck: Card[]): SynergyRecommendation[];
  
  // Analysis Tools
  static analyzeSynergy(deck: Card[], synergyType: SynergyType): SynergyAnalysis;
  static calculateDeckStats(deck: Card[], synergies: ActiveSynergy[]): DeckSynergyStats;
}
```

### Key Data Structures

```typescript
interface SynergyDetectionResult {
  activeSynergies: ActiveSynergy[];
  potentialSynergies: PotentialSynergy[];
  deckStats: DeckSynergyStats;
}

interface ActiveSynergy {
  synergyId: string;
  level: number;                // Synergy strength level
  bonuses: SynergyBonus[];      // Applied stat modifications
  triggeringCards: string[];    // Card IDs contributing
  strength: number;             // 0-1 effectiveness rating
}

interface SynergyType {
  id: string;
  name: string;
  description: string;
  detectionRules: SynergyRule[];
  bonuses: SynergyBonus[];
  minThreshold: number;         // Minimum cards needed
  maxThreshold: number;         // Maximum effectiveness point
  stackable: boolean;           // Whether bonuses stack with level
}

interface DeckSynergyStats {
  totalSynergies: number;
  synergyStrength: number;      // Overall optimization (0-1)
  dominantFamily: MemeFamily;   // Most represented family
  deckArchetype: string;        // 'Aggro' | 'Control' | 'RNG' | 'Chaos' | 'Balanced'
  recommendations: string[];    // Optimization suggestions
}
```

## Implementation Requirements

### Supported Synergy Types (8 Core Types)

1. **Force Build**
   - Requires: 2+ 💪 cards + 1+ ⚔️ cards
   - Bonuses: +50% damage, 15% critical hit chance
   - Stackable with additional force cards

2. **Luck Build**
   - Requires: 100+ total luck, 2+ lucky effects
   - Bonuses: +75% luck multiplier, 20% double rewards
   - Scales with total deck luck value

3. **Tank Build**
   - Requires: 2+ 🛡️ cards, 500+ total HP
   - Bonuses: +40% health, +25 battle-start shield
   - Non-stackable defensive focus

4. **Speed Build**
   - Requires: 3+ 💨 cards, 2+ ⚡ cards
   - Bonuses: +60% attack speed, 2x projectile speed
   - Stackable with additional speed cards

5. **Elemental Mastery**
   - Requires: 1+ each of 🔥, ❄️, ⚡ cards
   - Bonuses: 30% random elemental effects, +50% effect duration
   - Non-stackable diversity bonus

6. **Meme Lord**
   - Requires: 4+ Classic Internet family cards
   - Bonuses: 25% chaos effects, +25% damage vs all
   - Family-based synergy detection

7. **Ancient Power**
   - Requires: 2+ Mythology + 2+ Historical Figures
   - Bonuses: Revive once per battle, +30% health
   - Cross-family synergy combination

8. **Rainbow Chaos**
   - Requires: 5+ unique meme families
   - Bonuses: 40% random powerful effects, +100% luck
   - Diversity-based maximum synergy

### Detection Engine Rules

```typescript
interface SynergyRule {
  type: 'family' | 'emoji' | 'effect' | 'rarity' | 'stat' | 'custom';
  condition: string | MemeFamily | EffectType;
  count?: number;
  operator?: '=' | '>=' | '<=' | '>' | '<';
  value?: number | string;
}
```

### Rule Processing Logic
1. **Family Rules**: Count cards matching specific meme families
2. **Emoji Rules**: Detect specific emoji characters in card attacks
3. **Effect Rules**: Check for card effects with specific types
4. **Rarity Rules**: Count cards of specific rarity levels
5. **Stat Rules**: Aggregate statistics (total luck, HP, etc.)
6. **Custom Rules**: Special logic for unique synergies

### Bonus Calculation System

```typescript
interface SynergyBonus {
  type: 'damage' | 'health' | 'speed' | 'luck' | 'special' | 'effect';
  value: number;                // Bonus amount
  isPercentage: boolean;        // Multiplicative vs additive
  target: 'self' | 'team' | 'enemy';
  description: string;          // Human readable effect
}
```

## Performance Requirements

### Real-Time Processing
- Synergy detection: < 10ms for 10-card deck
- Rule evaluation: < 1ms per rule
- Bonus calculation: < 5ms for all active synergies
- Memory usage: < 5MB for detection engine

### Scalability Requirements
- Support up to 20 different synergy types
- Handle decks up to 15 cards efficiently
- Process multiple rule combinations without performance degradation
- Maintain accuracy with complex multi-rule synergies

## Validation Rules

### Synergy Constraints
- Detection rules must be consistently applied
- Synergy bonuses must not create infinite loops
- Stackable synergies must have reasonable caps (max 5x multiplier)
- Rule evaluation must be deterministic across sessions
- Synergy recommendations must be helpful and achievable

### Data Integrity
- Card references must be valid and current
- Synergy strength calculations must be between 0-1
- Bonus applications must respect target constraints
- Archetype classification must be stable and meaningful

## Integration Points

### With Deck System
- Real-time synergy updates on deck changes
- Automatic recalculation when cards added/removed
- Integration with deck size limit considerations

### With Combat Engine
- Seamless bonus application during battles
- Real-time stat modification support
- Performance-optimized calculations

### With UI Components
- SynergyPanel display integration
- Real-time visual feedback for synergy changes
- Recommendation engine for deck optimization

### With Player Progress
- Statistical tracking of synergy usage
- Achievement integration for synergy milestones
- Persistent synergy preference learning

## Testing Requirements

### Unit Tests
- Individual synergy type detection accuracy
- Rule evaluation correctness for edge cases
- Bonus calculation mathematical accuracy
- Performance benchmarks for large decks

### Integration Tests
- Full deck optimization workflow
- Multi-synergy interaction validation
- Recommendation engine effectiveness
- UI integration and responsiveness

### Performance Tests
- Detection speed with maximum deck size
- Memory usage under continuous recalculation
- Concurrent synergy analysis capability
- Real-time update performance during gameplay

## Success Metrics
- Detection accuracy: 100% for valid synergy combinations
- Processing speed: <10ms for complex 10-card decks
- Recommendation relevance: >80% player acceptance rate
- Memory efficiency: Zero memory leaks in continuous operation
- Player engagement: Increased deck experimentation by 25%