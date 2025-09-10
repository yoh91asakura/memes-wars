# AIMatchmakingService Contract

## Overview
The AIMatchmakingService generates dynamic AI opponents with appropriate difficulty scaling, behavior patterns, and deck composition based on the current stage and player progression.

## Interface Definition

### Core Methods

#### generateOpponent(stage, playerLevel, playerDeck?)
**Purpose**: Create a stage-appropriate AI opponent with balanced deck and behavior
**Parameters**:
- `stage: Stage` - Current stage data with difficulty and constraints
- `playerLevel: number` - Player level for scaling adjustments
- `playerDeck?: Card[]` - Optional player deck for counter-play analysis

**Returns**: `AIOpponent`
```typescript
interface AIOpponent {
  id: string;
  name: string;
  level: number;
  deck: Card[];
  behavior: AIBehavior;
  stats: AIStats;
  difficulty: DifficultyRating;
  backstory?: string;
}
```

#### getBehaviorProfile(stage, difficulty)
**Purpose**: Determine AI behavior patterns based on stage and difficulty
**Parameters**:
- `stage: Stage` - Current stage configuration
- `difficulty: DifficultyRating` - Target difficulty level

**Returns**: `AIBehavior`
```typescript
interface AIBehavior {
  aggressiveness: number; // 0-1, higher = more aggressive targeting
  accuracy: number; // 0-1, higher = better aim/timing
  adaptability: number; // 0-1, higher = learns from player patterns
  riskTaking: number; // 0-1, higher = more risky plays
  specialAbilities: AISpecialAbility[];
}
```

#### generateDeck(stage, deckSize, playerCounter?)
**Purpose**: Create balanced AI deck with appropriate power level
**Parameters**:
- `stage: Stage` - Stage constraints and difficulty
- `deckSize: number` - Required deck size for this stage
- `playerCounter?: Card[]` - Optional player deck for counter-strategy

**Returns**: `Card[]`

#### calculateDifficulty(stage, playerLevel, playerWinRate?)
**Purpose**: Determine appropriate AI difficulty for engaging gameplay
**Parameters**:
- `stage: Stage` - Base stage difficulty
- `playerLevel: number` - Player progression level
- `playerWinRate?: number` - Recent player win rate (0-1)

**Returns**: `DifficultyRating`

## Data Models

### AIOpponent
```typescript
interface AIOpponent {
  id: string;
  name: string; // Generated from pool of AI names
  level: number; // Scaled to player level +/- variance
  deck: Card[]; // Stage-appropriate cards with synergies
  behavior: AIBehavior; // Combat AI configuration
  stats: AIStats; // Health, damage modifiers, special stats
  difficulty: DifficultyRating; // Overall difficulty assessment
  backstory?: string; // Flavor text for immersion
  avatar?: string; // Visual representation emoji/icon
}
```

### AIBehavior
```typescript
interface AIBehavior {
  aggressiveness: number; // How quickly AI commits to attacks
  accuracy: number; // Projectile accuracy and timing precision
  adaptability: number; // Learning rate against player patterns
  riskTaking: number; // Willingness to use high-risk strategies
  specialAbilities: AISpecialAbility[];
  cardPlayPattern: 'balanced' | 'rush' | 'control' | 'combo';
  targetPriority: 'random' | 'weakest' | 'strongest' | 'strategic';
}
```

### AIStats
```typescript
interface AIStats {
  health: number; // Base HP for this opponent
  damageMultiplier: number; // Damage scaling factor
  speedMultiplier: number; // Animation/cooldown speed
  criticalChance: number; // Chance for critical hits
  resistances: DamageType[]; // Damage types this AI resists
  weaknesses: DamageType[]; // Damage types this AI is weak to
}
```

### AISpecialAbility
```typescript
interface AISpecialAbility {
  id: string;
  name: string;
  description: string;
  trigger: TriggerCondition;
  effect: SpecialEffect;
  cooldown: number; // Milliseconds
  usageCount: number; // Times per battle
}
```

### DifficultyRating
```typescript
interface DifficultyRating {
  overall: number; // 1-10 difficulty scale
  factors: {
    deckPower: number; // Card quality and synergies
    aiSkill: number; // Behavior sophistication
    statAdvantage: number; // Health/damage bonuses
    specialAbilities: number; // Unique ability power
  };
  description: 'trivial' | 'easy' | 'moderate' | 'hard' | 'extreme';
}
```

## AI Generation Algorithms

### Deck Generation Strategy
```typescript
const generateAIDeck = (stage: Stage, deckSize: number): Card[] => {
  // 1. Determine power level budget based on stage
  const powerBudget = calculatePowerBudget(stage);
  
  // 2. Select archetype based on stage theme
  const archetype = selectArchetype(stage, ['aggro', 'control', 'midrange', 'combo']);
  
  // 3. Fill deck with appropriate cards
  // - 60% core cards for archetype
  // - 30% support cards for synergies
  // - 10% tech cards for adaptation
  
  // 4. Balance rarity distribution
  // - Stage 1-10: Commons + few Uncommons
  // - Stage 11-25: Add Rares
  // - Stage 26-50: Add Epics and Legendaries
  
  return balancedDeck;
};
```

### Behavior Scaling
```typescript
const scaleBehavior = (baseStage: number, playerLevel: number): AIBehavior => {
  // Linear scaling for early stages
  if (baseStage <= 10) {
    return {
      aggressiveness: 0.3 + (baseStage * 0.05),
      accuracy: 0.5 + (baseStage * 0.03),
      adaptability: 0.1,
      riskTaking: 0.2
    };
  }
  
  // Exponential scaling for advanced stages
  return {
    aggressiveness: Math.min(0.9, 0.5 + (baseStage * 0.02)),
    accuracy: Math.min(0.95, 0.6 + (baseStage * 0.015)),
    adaptability: Math.min(0.8, baseStage * 0.01),
    riskTaking: Math.min(0.7, 0.2 + (baseStage * 0.01))
  };
};
```

## Special AI Abilities

### Early Stage Abilities (Stages 1-15)
- **Quick Strike**: 20% faster attack speed
- **Lucky Draw**: 10% chance for extra card effects
- **Steady Aim**: +15% projectile accuracy

### Mid Stage Abilities (Stages 16-35)
- **Adaptive Learning**: Increases accuracy against repeated player patterns
- **Power Surge**: 25% damage boost when below 30% health
- **Shield Wall**: 20% damage reduction from direct attacks

### Late Stage Abilities (Stages 36-50)
- **Perfect Counter**: Automatically counters player's strongest synergy
- **Time Warp**: Can slow down player projectiles by 30%
- **Legendary Mastery**: Can activate legendary card effects twice

### Boss Abilities (Every 10th Stage)
- **Phase Transition**: Changes deck composition mid-battle
- **Environmental Control**: Modifies battlefield conditions
- **Ultimate Technique**: One-time devastating ability

## Integration Points

### CombatEngine Integration
```typescript
// AI decision making during combat
const aiOpponent = aiMatchmaking.generateOpponent(stage, playerLevel, playerDeck);
const combatEngine = new CombatEngine(playerDeck, aiOpponent);

// AI behavior affects combat decisions
combatEngine.setAIBehavior(aiOpponent.behavior);
combatEngine.setAIStats(aiOpponent.stats);
```

### StageService Integration
```typescript
// Generate appropriate opponent for stage progression
const currentStage = stageService.getCurrentStage();
const opponent = aiMatchmaking.generateOpponent(
  currentStage, 
  playerLevel,
  playerDeck
);

// Difficulty affects stage completion requirements
if (opponent.difficulty.overall > 7) {
  stageService.setHighDifficultyRewards(currentStage.id);
}
```

## Performance Requirements

### Generation Speed
- `generateOpponent()`: < 100ms for complex deck generation
- `getBehaviorProfile()`: < 10ms for real-time behavior queries
- `calculateDifficulty()`: < 50ms with player history analysis

### Memory Usage
- AI opponent cache: < 10MB for recent opponents
- Behavior patterns: < 5MB for learning algorithms
- Deck generation templates: < 2MB cached data

## Balancing Considerations

### Difficulty Progression
- Stage 1-10: Learning curve, forgiving AI
- Stage 11-25: Competent AI with clear strategies
- Stage 26-40: Advanced AI with counter-play
- Stage 41-50: Expert AI with perfect execution
- Boss stages: Unique mechanics requiring adaptation

### Player Engagement
- Win rate target: 60-70% for optimal addiction loop
- Difficulty spikes at stages 10, 25, 40 for challenge
- AI variety prevents pattern memorization
- Comeback mechanics when player is struggling

## Testing Strategies

### AI Quality Tests
- Verify deck power levels are appropriate for stages
- Test AI behavior consistency across difficulties
- Validate special ability balance and cooldowns
- Check counter-play effectiveness against meta decks

### Performance Tests
- Benchmark AI generation speed under load
- Memory usage during extended AI opponent creation
- Combat performance with complex AI behaviors
- Concurrent AI generation for multiple players

### Balance Validation
- Statistical analysis of player vs AI win rates
- Difficulty curve smoothness across all stages
- Player retention correlation with AI quality
- Engagement metrics for different AI archetypes