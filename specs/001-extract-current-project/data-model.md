# Data Model: Memes Wars Game Systems

## Core Entities

### Card
Collectible meme-themed game pieces with 7 rarity tiers, passive abilities, and combat properties.

```typescript
interface Card {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  rarity: CardRarity;           // common | uncommon | rare | epic | legendary | mythic | cosmic
  family: MemeFamily;           // Thematic classification for synergy detection
  emojis: EmojiAttack[];        // Combat projectiles with damage values
  emoji?: string;               // Primary emoji for legacy compatibility
  health: number;               // HP in combat
  hp?: number;                  // Alternative HP property
  attackDamage: number;         // Base damage per attack
  attackSpeed: number;          // Attacks per second
  luck: number;                 // RNG multiplier for effects
  manaCost?: number;            // Deck building cost (higher rarities)
  cardEffects?: CardEffect[];   // Passive abilities with triggers
  passiveAbility?: PassiveAbility; // Legacy passive system
  flavor: string;               // Humorous description
  imageUrl?: string;            // Card artwork
  unlockStage: number;          // When card becomes available
}

interface EmojiAttack {
  character: string;            // Emoji character
  damage: number;               // Base damage
  effects?: EffectType[];       // Status effects applied
}

interface CardEffect {
  trigger: TriggerType;         // When effect activates
  effect: EffectType;           // What happens
  value: number;                // Effect magnitude
  chance: number;               // Activation probability (0-1)
  duration?: number;            // Effect duration in seconds
  cooldown?: number;            // Cooldown between uses
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

enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  COSMIC = 'cosmic'
}

enum MemeFamily {
  CLASSIC_INTERNET = 'classic_internet',
  MEME_FORMATS = 'meme_formats',
  MYTHOLOGY = 'mythology',
  HISTORICAL_FIGURES = 'historical_figures',
  ANIMALS = 'animals',
  GAMING_ARCHETYPES = 'gaming_archetypes',
  LIFE_SITUATIONS = 'life_situations'
}
```

### Deck
Player's active card configuration with dynamic size limits, synergy detection, and archetype classification.

```typescript
interface Deck {
  id: string;
  name: string;
  cards: Card[];               // Active cards (3-10+ based on stage)
  maxSize: number;            // Current deck size limit
  synergyBonuses: ActiveSynergy[]; // Real-time synergy calculations
  deckStats: DeckSynergyStats; // Archetype and optimization data
  totalManaCost: number;      // Sum of all card costs
  createdAt: Date;
  lastUsed: Date;
}

interface ActiveSynergy {
  synergyId: string;          // Synergy type identifier
  level: number;              // Synergy strength level
  bonuses: SynergyBonus[];    // Applied stat modifications
  triggeringCards: string[];  // Card IDs contributing
  strength: number;           // 0-1 effectiveness rating
}

interface SynergyBonus {
  type: 'damage' | 'health' | 'speed' | 'luck' | 'special' | 'effect';
  value: number;              // Bonus amount
  isPercentage: boolean;      // Multiplicative vs additive
  target: 'self' | 'team' | 'enemy';
  description: string;        // Human readable effect
}

interface DeckSynergyStats {
  totalSynergies: number;
  synergyStrength: number;    // Overall optimization (0-1)
  dominantFamily: MemeFamily; // Most represented family
  deckArchetype: string;      // 'Aggro' | 'Control' | 'RNG' | 'Chaos' | 'Balanced'
  recommendations: string[];  // Optimization suggestions
}

enum SynergyType {
  FORCE_BUILD = 'FORCE_BUILD',         // 💪 + ⚔️ high damage
  LUCK_BUILD = 'LUCK_BUILD',           // High luck RNG effects
  TANK_BUILD = 'TANK_BUILD',           // 🛡️ defensive focus
  SPEED_BUILD = 'SPEED_BUILD',         // 💨 + ⚡ fast attacks
  ELEMENTAL_MASTERY = 'ELEMENTAL_MASTERY', // 🔥 + ❄️ + ⚡ mixed elements
  MEME_LORD = 'MEME_LORD',             // Classic internet memes
  ANCIENT_POWER = 'ANCIENT_POWER',     // Mythology + historical
  RAINBOW_CHAOS = 'RAINBOW_CHAOS'      // 5+ different families
}
```

### Stage
Progressive challenge levels with boss encounters, unlock requirements, and reward scaling.

```typescript
interface Stage {
  id: number;                 // Stage number (1, 2, 3...)
  name: string;              // Display name
  enemyHealth: number;       // Base HP of stage enemy
  enemyEmojis: string[];     // Enemy attack patterns
  enemyAttackSpeed: number;  // Enemy attacks per second
  rewardCoins: number;       // Currency reward
  rewardTickets: number;     // Roll ticket reward
  bossStage: boolean;        // Special boss encounter
  unlockRequirement?: StageRequirement; // Unlock conditions
  specialRule?: string;      // Stage-specific mechanics
  backgroundTheme: string;   // Visual theme
  difficulty: number;        // Relative difficulty (1-10)
  completionTime?: number;   // Best completion time
  isCompleted: boolean;      // Player completion status
  deckSizeLimit: number;     // Maximum deck size for stage
  unlocksFeature?: string;   // What feature this stage unlocks
}

interface StageRequirement {
  type: 'stage_completion' | 'card_collection' | 'synergy_achievement';
  description: string;
  requiredStages?: number[];
  requiredCards?: string[];
  requiredSynergies?: string[];
}
```

### Combat
Enhanced automated battle with passive ability processing, synergy integration, and effect management.

```typescript
interface Combat {
  id: string;
  playerDeck: Deck;
  stage: Stage;
  startTime: Date;
  status: CombatStatus;
  playerHealth: number;
  enemyHealth: number;
  maxPlayerHealth: number;   // For passive triggers
  maxEnemyHealth: number;
  projectiles: Projectile[];  // Active emoji projectiles
  effects: ActiveEffect[];   // Status effects (burn, freeze, etc.)
  passiveActivations: PassiveActivation[]; // Active passive effects
  synergyBonuses: ActiveSynergy[]; // Applied deck synergies
  comboCounter: number;      // Current hit combo
  events: CombatEvent[];     // Combat log for replay/analysis
  result?: CombatResult;
  frameCount: number;        // For frame-based processing
  lastFrameTime: number;     // Performance tracking
}

interface PassiveActivation {
  id: string;
  type: string;              // Effect type
  playerId: string;
  value: number;             // Effect strength
  duration: number;          // Remaining duration
  description: string;       // Human readable effect
}

interface Projectile {
  id: string;
  emoji: string;             // Visual representation
  damage: number;
  position: Vector2D;        // Current position
  velocity: Vector2D;        // Movement vector
  target: 'player' | 'enemy';
  effects: EffectType[];     // Status effects on hit
  createdAt: number;         // Timestamp for lifetime tracking
}

interface CombatEvent {
  timestamp: number;
  type: 'attack' | 'hit' | 'effect_applied' | 'card_ability';
  source: string;           // What caused the event
  target: 'player' | 'enemy';
  damage?: number;
  effect?: EffectType;
  details: string;
}

enum CombatStatus {
  PREPARING = 'preparing',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}
```

### Player Progress
Comprehensive progression tracking with crafting history, synergy statistics, and passive ability performance.

```typescript
interface PlayerProgress {
  playerId: string;
  currentStage: number;       // Highest unlocked stage
  completedStages: StageCompletion[]; // Detailed completion data
  cardCollection: Card[];     // Owned cards
  decks: Deck[];             // Saved deck configurations
  activeDeckId?: string;     // Currently selected deck
  
  // Currency and resources
  coins: number;
  gems: number;              // Premium currency
  rollTickets: number;
  instantRolls: number;
  craftingMaterials: Record<string, number>;
  
  // Progression stats
  totalRolls: number;
  rollsWithoutRare: number;  // Pity system tracking
  rollsWithoutEpic: number;
  rollsWithoutLegendary: number;
  rollsWithoutMythic: number;
  rollsWithoutCosmic: number;
  
  // Combat statistics
  totalCombats: number;
  combatsWon: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  fastestWin: number;        // Seconds
  longestWin: number;        // Seconds
  
  // Advanced progression tracking
  craftingStats: CraftingStats;
  synergyUsage: SynergyUsageStats;
  passiveEffectStats: PassiveEffectStats;
  autoRollSettings: AutoRollConfiguration;
  
  // Achievement tracking
  achievements: Achievement[];
  
  // Game settings
  settings: GameSettings;
  
  // Save metadata
  version: string;           // Save format version
  lastSave: Date;
  playtimeSeconds: number;
}

interface StageCompletion {
  stageId: number;
  completedAt: Date;
  bestTime: number;
  attempts: number;
  deckUsed: string;          // Deck ID
  synergyBonuses: string[];  // Active synergies
}

interface CraftingStats {
  totalCrafts: number;
  recipesCrafted: Record<string, number>;
  activeItems: CraftedItem[];
  totalResourcesSpent: Record<string, number>;
}

interface SynergyUsageStats {
  synergyActivations: Record<string, number>;
  favoriteArchetype: string;
  bestSynergyCombo: string;
  averageSynergyStrength: number;
}

interface PassiveEffectStats {
  totalPassiveProcs: number;
  effectUsage: Record<EffectType, number>;
  mostEffectivePassive: string;
  averageProcsPerBattle: number;
}

interface AutoRollConfiguration {
  enabled: boolean;
  batchSize: number;
  stopOnRarity: CardRarity | null;
  animationSpeed: number;
  maxRolls: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;          // 0-1 for partial completion
  maxProgress: number;       // Total required for completion
}
```

### Economy
Multi-currency system with crafting integration and resource conversion.

```typescript
interface Economy {
  currencies: {
    coins: Currency;
    gems: Currency;            // Premium currency for advanced crafting
    rollTickets: Currency;
    instantRolls: Currency;
  };
  craftingMaterials: Record<string, CraftingMaterial>;
  costs: CostConfiguration;
  rewards: RewardConfiguration;
  conversionRates: ConversionRates;
  balanceValidation: BalanceRules;
}

interface ConversionRates {
  cardsToGold: Record<CardRarity, number>;
  cardsToGems: Record<CardRarity, number>;
  goldToGems: number;
  ticketsToRolls: number;
}

interface BalanceRules {
  maxCraftingPerHour: number;
  maxConversionsPerDay: number;
  preventExploitLoops: boolean;
  economyIntegrityChecks: string[];
}

interface Currency {
  name: string;
  amount: number;
  maxAmount: number;         // Storage limit
  icon: string;              // Display icon
  sources: string[];         // How to earn
}

interface CraftingMaterial {
  id: string;
  name: string;
  rarity: string;
  amount: number;
  maxStack: number;
  icon: string;
  sources: string[];         // Drop sources
}
```

### CraftRecipe
Crafting blueprint defining resource costs, constraints, and output results.

```typescript
interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'permanent' | 'upgrade' | 'card';
  
  // Resource requirements
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
  
  // Optional constraints
  requiredCards?: string[];    // Specific card IDs needed
  playerLevelRequired?: number;
  
  // Output
  result: CraftResult;
  
  // Crafting rules
  unique?: boolean;            // Can only craft once
  maxCrafts?: number;          // Maximum times craftable
  cooldown?: number;           // Cooldown between crafts (ms)
  
  // UI properties
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface CraftResult {
  type: 'item' | 'card' | 'currency' | 'permanent_upgrade';
  id: string;
  quantity?: number;
  effect?: CraftEffect;        // For consumable items
  cardData?: Card;             // For card crafting
}

interface CraftEffect {
  type: 'luck_boost' | 'xp_boost' | 'gold_boost' | 'pity_reduction' | 'guaranteed_rarity';
  value: number;
  duration?: number;           // For temporary effects
}
```

### CraftedItem
Active consumable items with expiration and usage tracking.

```typescript
interface CraftedItem {
  id: string;
  recipeId: string;
  craftedAt: number;
  expiresAt?: number;          // For temporary items
  active: boolean;
  usesRemaining?: number;      // For multi-use items
  metadata?: {
    originalDuration?: number;
    appliedBonuses?: string[];
    activationHistory?: number[];
  };
}
```

### AutoRoll
Automated rolling system with batch processing and configuration.

```typescript
interface AutoRollSystem {
  isActive: boolean;
  configuration: {
    batchSize: number;         // Cards per batch (1, 5, 10)
    stopOnRarity: CardRarity | null; // Stop when this rarity drops
    animationSpeed: number;    // 0.5x to 3x speed
    maxRolls: number;          // Safety limit
    showResults: boolean;      // Display individual results
  };
  
  // Runtime state
  currentBatch: number;
  totalProcessed: number;
  stopConditionMet: boolean;
  lastRollTime: number;
  
  // Statistics
  batchStats: {
    rarityDistribution: Record<CardRarity, number>;
    totalCost: number;
    timeElapsed: number;
    pityTriggers: number;
  };
}
```

### Pity System
Enhanced roll probability modification with multi-tier tracking and crafted item integration.

```typescript
interface PitySystem {
  rollsWithoutRare: number;
  rollsWithoutEpic: number;
  rollsWithoutLegendary: number;
  rollsWithoutMythic: number;
  rollsWithoutCosmic: number;
  
  thresholds: {
    guaranteedRare: number;      // 10 rolls
    guaranteedEpic: number;      // 30 rolls  
    guaranteedLegendary: number; // 90 rolls
    guaranteedMythic: number;    // 200 rolls
    guaranteedCosmic: number;    // 500 rolls
  };
  
  probabilityModifiers: Record<CardRarity, number>; // Current modified rates
  lastPityTrigger?: {
    rarity: CardRarity;
    rollsReached: number;
    triggeredAt: Date;
  };
  
  // Pity reduction from crafted items
  temporaryReductions: {
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
    cosmic: number;
  };
}
```

## Data Relationships

### Primary Relationships
- **Player** has many **Decks** and many **CraftedItems**
- **Deck** contains many **Cards** (with dynamic size limits) and has **ActiveSynergies**
- **Combat** uses one **Deck** against one **Stage** with **PassiveActivations**
- **Stage** determines enemy configuration, rewards, and unlocks **CraftRecipes**
- **Card** belongs to one **MemeFamily**, has one **CardRarity**, and may have **CardEffects**
- **CraftRecipe** defines resource **costs** and produces **CraftResults**
- **CraftedItem** created from **CraftRecipe** with lifecycle management
- **AutoRollSystem** manages batch processing with **PitySystem** integration

### Derived Relationships
- **Deck** + **Cards** → **ActiveSynergies** (real-time detection with strength calculation)
- **PlayerProgress** + **Stage** → **DeckSizeLimit** (dynamic based on progression)
- **PitySystem** + **RollHistory** + **CraftedItems** → **ModifiedDropRates** (enhanced calculation)
- **Cards** + **SynergyRules** → **SynergyDetection** (multi-rule validation engine)
- **CraftRecipe** + **PlayerResources** → **CraftingAvailability** (constraint checking)
- **PassiveEffects** + **CombatEvents** → **PassiveActivations** (trigger-based processing)
- **AutoRollSystem** + **Configuration** → **BatchProcessing** (automated rolling with stop conditions)

## Validation Rules

### Card Constraints
- Card ID must be unique within collection
- Health and damage must be positive integers
- Attack speed must be between 0.1 and 5.0
- Emoji array must contain 1-3 valid Unicode emojis with damage values
- Passive abilities (CardEffects) can exist on any rarity with appropriate balancing
- Luck value must be between 0 and 1000
- Card effects must have valid trigger types and effect types
- Effect chances must be between 0 and 1

### Deck Constraints
- Card count cannot exceed dynamic deck size limit (3-10+ based on stage progression)
- Total mana cost cannot exceed player's mana capacity
- No duplicate cards allowed in same deck
- At least 1 card required for combat
- Synergy calculations must be real-time and accurate
- Archetype classification must be deterministic
- Synergy strength must be between 0 and 1

### Combat Constraints
- Combat duration maximum 120 seconds (2 minutes)
- Maximum 50 active projectiles at once
- Health values cannot go below 0
- All effects must have valid durations and cooldowns
- Passive activations must respect chance percentages and cooldown periods
- Synergy bonuses must apply correctly to combat calculations
- Frame-based processing must maintain 60fps minimum
- Combo counters must reset appropriately

### Progression Constraints
- Stage unlocks must be sequential with proper requirement checking
- Currency amounts cannot exceed maximum limits (coins, gems, tickets)
- Save format version must be compatible with migration support
- Achievement progress cannot exceed maximum values
- Crafting statistics must be accurate and persistent
- Synergy usage tracking must be comprehensive
- Passive effect statistics must track performance metrics
- Auto-roll configuration must respect safety limits

### Crafting Constraints
- Recipe costs must be positive integers
- Unique recipes can only be crafted once per player
- Max craft limits must be enforced per recipe
- Cooldowns must be respected between craft attempts
- Resource validation must prevent negative balances
- Crafted items must have proper lifecycle management
- Temporary effects must expire correctly
- Permanent upgrades must be persistent

### Synergy Constraints
- Detection rules must be consistently applied
- Synergy bonuses must not create infinite loops
- Stackable synergies must have reasonable caps
- Rule evaluation must be deterministic
- Synergy recommendations must be helpful and accurate

### Auto-Roll Constraints
- Batch sizes must be within reasonable limits (1-50)
- Stop conditions must be properly evaluated
- Animation speed must be between 0.25x and 5x
- Safety limits must prevent infinite rolling
- Pity integration must be accurate and fair

## State Transitions

### Combat Flow
```
PREPARING → PASSIVE_INIT → SYNERGY_CALC → ACTIVE → COMPLETED
     ↓              ↓             ↓         ↓
   PAUSED ←────── PAUSED ←───── PAUSED ← PAUSED
```

### Card Acquisition Flow
```
AUTO_ROLL → BATCH_PROCESS → DROP → PITY_CHECK → COLLECTION → DECK → SYNERGY_UPDATE
```

### Crafting Flow
```
RECIPE_SELECT → VALIDATION → RESOURCE_CHECK → CRAFT → RESULT → ITEM_ACTIVATION
       ↓              ↓            ↓          ↓       ↓            ↓
   COOLDOWN_CHECK → CONSTRAINT → INSUFFICIENT → FAILURE → SUCCESS → EXPIRY_TRACKING
```

### Progression Flow
```
STAGE_START → DECK_SELECTION → SYNERGY_DETECTION → COMBAT → PASSIVE_PROCESSING → VICTORY → REWARDS → UNLOCK_CHECK → NEXT_STAGE
                                       ↓                          ↓                    ↓
                               SYNERGY_RECOMMENDATIONS ←    DEFEAT_ANALYSIS →    RETRY_OPTION
```

### Synergy Detection Flow
```
DECK_CHANGE → RULE_EVALUATION → SYNERGY_CALCULATION → BONUS_APPLICATION → UI_UPDATE
     ↓               ↓                    ↓                   ↓               ↓
CARD_ADD → FAMILY_CHECK → STRENGTH_CALC → ARCHETYPE_UPDATE → RECOMMENDATIONS
```

## NEW: Core Game Loop Entities (Phase 3.5)

### CurrencyState
Complete economy management with multi-currency support and transaction tracking.

```typescript
interface CurrencyState {
  // Primary currencies
  gold: number;                     // Primary currency for rolls and purchases
  tickets: number;                  // Combat rewards for rolls
  gems?: number;                    // Premium currency
  
  // Transaction history
  transactions: CurrencyTransaction[];
  
  // Daily rewards system
  dailyBonus: {
    lastClaimed: number;            // Timestamp of last claim
    streak: number;                 // Consecutive days
    nextReward: DailyReward;        // Upcoming reward
  };
  
  // Roll economy integration
  canAffordRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => boolean;
  getRollCost: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => number;
  purchaseRoll: (type: 'single' | 'ten' | 'hundred', method: 'gold' | 'tickets') => boolean;
}

interface CurrencyTransaction {
  id: string;
  timestamp: number;
  type: 'gain' | 'spend';
  currency: 'gold' | 'tickets' | 'gems';
  amount: number;
  source: string;                   // "Combat Victory", "Daily Bonus", "Roll Purchase"
  balance: number;                  // Balance after transaction
}

interface DailyReward {
  gold: number;
  tickets: number;
  gems?: number;
  bonus?: string;                   // Special rewards like "Free rare card"
}
```

### RewardDistribution
Post-combat reward calculation and distribution system.

```typescript
interface RewardDistribution {
  gold: number;                     // Gold earned
  tickets: number;                  // Tickets earned
  experience: number;               // XP gained
  bonusCards?: Card[];              // Special card rewards
  achievements?: string[];          // Unlocked achievements
  unlocks?: string[];               // New features unlocked
}

interface CombatResult {
  victory: boolean;
  stageId: number;
  playerDamage: number;
  enemyDamage: number;
  combatDuration: number;
  perfectVictory?: boolean;         // No damage taken (1.5x multiplier)
  speedBonus?: boolean;             // Completed quickly (1.25x multiplier)
}

interface RewardCalculation {
  baseRewards: StageRewards;
  bonusMultipliers: {
    perfect: number;                // 1.5 for perfect victory
    speed: number;                  // 1.25 for speed bonus
    difficulty: number;             // Based on stage
    consecutive: number;            // Win streak bonus
  };
  finalRewards: StageRewards;
  totalExperience: number;
}
```

### AIOpponent
Dynamic AI adversary generation with stage-appropriate difficulty.

```typescript
interface AIOpponent {
  id: string;
  name: string;                     // "Elemental Mage", "Stone Guardian"
  deck: Deck;                       // Generated deck with appropriate cards
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  behavior: AIBehavior;
  health: number;
  maxHealth: number;
}

interface AIBehavior {
  aggressiveness: number;           // 0-1 scale for attack frequency
  accuracyBonus: number;            // -0.2 to +0.3 accuracy modifier
  reactionTime: number;             // Milliseconds between actions
  emojiPreference: string[];        // Preferred emojis to use
  specialTactics?: string[];        // "focus_fire", "evasive_maneuvers"
}

interface AIDeckTemplate {
  name: string;
  emojis: string[];                 // Available emoji pool
  rarityDistribution: {
    common: number;                 // 0.9 for easy, 0.1 for boss
    rare: number;
    epic: number;
    legendary?: number;
  };
  synergies?: string[];             // Preferred synergy types
  theme: string;                    // "elemental", "defensive", "chaos"
}
```

### StageRewards
Enhanced stage completion rewards with performance scaling.

```typescript
interface StageRewards {
  gold: number;                     // Base gold reward
  tickets: number;                  // Base ticket reward
  bonusRewards: string[];           // Special rewards array
}

interface Stage {
  id: number;
  name: string;                     // "First Meme", "Stone Guardian"
  description: string;              // Flavor text
  
  // Enemy configuration
  enemyHp: number;                  // Scaled with stage progression
  enemyEmojis: string[];            // Available emoji attacks
  enemyAttackSpeed: number;         // Attack frequency
  enemyDifficulty: 'easy' | 'medium' | 'hard' | 'boss';
  
  // Rewards
  goldReward: number;
  ticketsReward: number;
  bonusRewards?: string[];          // "rare_card_guarantee", "power_crystal"
  
  // Progression
  unlockRequirement?: {
    previousStage?: number;
    playerLevel?: number;
    cardsCollected?: number;
  };
  
  // Deck constraints
  deckSizeLimit: number;            // 3→4→5→6 progression
  
  // Special properties
  isBoss: boolean;
  isSpecial: boolean;
  specialRules?: string[];          // "enemy_heals_over_time", "reflects_projectiles"
  
  // Visual
  background: string;
  theme: string;
}
```

## Enhanced Data Relationships

### Core Game Loop Flow
- **Player** triggers **Combat** → **AIMatchmaking** generates **AIOpponent** based on **Stage**
- **Combat** completion → **RewardService** calculates **RewardDistribution** based on **CombatResult**
- **RewardDistribution** → **CurrencyStore** updates **gold/tickets** with **CurrencyTransaction**
- **Stage** completion → Auto-advance to next **Stage** if unlocked
- **Currency** enables **Roll** system → **Card** acquisition → **Deck** building → repeat

### Economy Integration
- **CombatResult** + **Stage** → **RewardCalculation** → **CurrencyTransaction**
- **Currency** + **RollCosts** → **RollSystem** → **Card** acquisition
- **DailyBonus** → **CurrencyState** → sustained engagement

### AI Matchmaking Flow
- **Stage** + **AIDeckTemplate** → **AIOpponent** generation
- **AIBehavior** + **difficulty** → appropriate challenge level
- **Player deck power** vs **AI deck power** → balanced encounters

This enhanced data model now includes all the core game loop entities that enable the complete Roll→Equip→Battle→Reward→Repeat cycle with automatic progression, dynamic AI opponents, performance-based rewards, and integrated economy management.