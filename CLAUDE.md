# 🎮 CLAUDE.md - Memes Wars Development Guide

## 📋 Table des Matières
1. [🎯 PROJECT OVERVIEW](#1-project-overview)
2. [🏗️ ARCHITECTURE & CODE BASE](#2-architecture--code-base)
3. [🧪 TDD WORKFLOW WITH VITEST](#3-tdd-workflow-with-vitest)
4. [🎭 E2E TESTING WITH PLAYWRIGHT](#4-e2e-testing-with-playwright)
5. [🤖 CLAUDE FLOW INTEGRATION](#5-claude-flow-integration)
6. [🎯 GAME MECHANICS IMPLEMENTATION](#6-game-mechanics-implementation)
7. [📋 DEVELOPMENT PHASES](#7-development-phases)
8. [🔄 WORKFLOWS & PATTERNS](#8-workflows--patterns)
9. [🛠️ TOOLS & COMMANDS](#9-tools--commands)

---

# 1. 🎯 PROJECT OVERVIEW

## 🎮 Game Concept
**Memes Wars** - Auto-battler RNG Card Game avec système d'émojis

### Core Game Loop (30s - 2min)
```
ROLL → Obtenir nouvelles cartes
  ↓
EQUIP → Optimiser deck (limite évolutive)  
  ↓
BATTLE → Combat automatique vs IA/PvP
  ↓
REWARD → Tickets de roll ou instant rolls
  ↓
REPEAT → Addiction maximale
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand (cardsStore, rollStore, combatStore, etc.)
- **Styling**: Styled Components + CSS Modules
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Build**: Vite + TypeScript

---

# 2. 🏗️ ARCHITECTURE & CODE BASE

## 📁 Structure Existante
```
src/
├── components/          # Atomic Design Pattern
│   ├── atoms/          # Button, Input, Badge, etc.
│   ├── molecules/      # Card, CardHeader, PlayerHealth
│   ├── organisms/      # CombatArena, DeckBuilder, RollPanel
│   ├── pages/         # CollectionPage, CombatPage, RollPage
│   └── templates/     # MainLayout
├── services/           # Business Logic
│   ├── RollService.ts     # Gacha/Roll mechanics
│   ├── CombatEngine.ts    # Combat simulation
│   ├── CardService.ts     # Card operations
│   ├── DeckService.ts     # Deck management
│   └── GameState.ts       # Global game state
├── stores/             # Zustand Stores
│   ├── rollStore.ts       # Roll history, pity system
│   ├── cardsStore.ts      # Card collection
│   ├── combatStore.ts     # Combat state
│   └── collectionStore.ts # Filtering, sorting
├── models/             # TypeScript Types
│   ├── Card.ts           # Core card interface
│   ├── Combat.ts         # Combat types
│   ├── Player.ts         # Player model
│   └── unified/Card.ts   # Unified card system
└── data/cards/         # Card Definitions
    ├── common.ts, rare.ts, epic.ts
    └── legendary.ts, mythic.ts, cosmic.ts
```

## 🎯 Key Systems Implemented

### 1. **RollService** - Gacha System
```typescript
// Pity system avec drop rates configurables
const rollConfig = {
  dropRates: {
    common: 0.65, uncommon: 0.25, rare: 0.07,
    epic: 0.025, legendary: 0.004, mythic: 0.0009, cosmic: 0.0001
  },
  pitySystem: {
    guaranteedRareAt: 10, guaranteedEpicAt: 30,
    guaranteedLegendaryAt: 90, guaranteedMythicAt: 200
  }
};
```

### 2. **CombatEngine** - Auto-Battle System
```typescript
// Frame-based combat avec projectiles d'emojis
class CombatEngine {
  processFrame(deltaTime: number): void
  checkCollisions(): Collision[]
  applyEffects(effects: Effect[]): void
  determineWinner(): CombatPlayer | null
}
```

### 3. **Card Model** - Type System
```typescript
// Meme families et effect types
enum MemeFamily {
  CLASSIC_INTERNET, MEME_FORMATS, MYTHOLOGY, 
  ANIMALS, GAMING_ARCHETYPES, LIFE_SITUATIONS
}

enum EffectType {
  FREEZE, BURN, HEAL, BOOST, SHIELD, POISON,
  LUCKY, BURST, REFLECT, MULTIPLY
}
```

---

# 3. 🧪 TDD WORKFLOW WITH VITEST

## 🎯 Test Strategy pour Game Mechanics

### Priority Testing Areas
1. **RNG Systems** - Roll probabilities, pity system
2. **Combat Logic** - Damage calculation, effects
3. **Economy** - Currency, costs, rewards
4. **Progression** - Leveling, unlocks, achievements

### Test Structure Template
```typescript
// tests/services/RollService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollService } from '../../src/services/RollService';

describe('RollService', () => {
  let rollService: RollService;
  
  beforeEach(() => {
    // Mock RNG for deterministic tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    rollService = new RollService();
  });

  describe('Pity System', () => {
    it('should guarantee rare at 10 rolls', () => {
      // Simulate 10 commons
      for (let i = 0; i < 9; i++) {
        rollService.rollSingle();
      }
      const result = rollService.rollSingle();
      expect(result.card.rarity).not.toBe('common');
      expect(result.pityTriggered).toBe(true);
    });
  });

  describe('Drop Rates', () => {
    it('should respect configured drop rates over large samples', () => {
      const results = [];
      for (let i = 0; i < 10000; i++) {
        results.push(rollService.rollSingle());
      }
      
      const commons = results.filter(r => r.card.rarity === 'common').length;
      expect(commons / 10000).toBeCloseTo(0.65, 1); // Within 10%
    });
  });
});
```

### Mock Patterns for Game Systems
```typescript
// Mock RNG pour tests déterministes
const mockRandom = (values: number[]) => {
  let index = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    return values[index++ % values.length];
  });
};

// Mock Time pour combat tests
vi.spyOn(Date, 'now').mockReturnValue(1000);
```

### Test Commands
```bash
# TDD cycle complet
npm run test:watch           # Auto-rerun on change
npm run test:coverage        # Coverage reports
npm run test:unit           # Single run all tests

# Test specific systems
npx vitest run --grep "RollService"
npx vitest run --grep "Combat"
npx vitest run --grep "Pity"
```

---

# 4. 🎭 E2E TESTING WITH PLAYWRIGHT

## 🎮 Game Flow Testing

### Core Game Loop E2E Test
```typescript
// tests/e2e/core-game-loop.spec.ts
import { test, expect } from '@playwright/test';

test('Complete game cycle: Roll → Equip → Battle → Reward', async ({ page }) => {
  await page.goto('/');
  
  // 1. ROLL - Get new cards
  await page.click('[data-testid="roll-button"]');
  await expect(page.locator('[data-testid="new-card"]')).toBeVisible();
  
  // 2. EQUIP - Add to deck
  await page.click('[data-testid="equip-card"]');
  await expect(page.locator('[data-testid="deck-slot-0"]')).toContainText('equipped');
  
  // 3. BATTLE - Auto-combat
  await page.click('[data-testid="start-combat"]');
  await expect(page.locator('[data-testid="combat-arena"]')).toBeVisible();
  
  // Wait for combat result
  await page.waitForSelector('[data-testid="battle-result"]', { timeout: 10000 });
  
  // 4. REWARD - Collect rewards
  const reward = await page.textContent('[data-testid="reward-amount"]');
  expect(parseInt(reward!)).toBeGreaterThan(0);
});
```

### Performance Testing for Animations
```typescript
// tests/e2e/performance.spec.ts
test('Roll animation performance', async ({ page }) => {
  // Measure frame rate during roll animation
  await page.evaluate(() => {
    window.performance.mark('roll-start');
  });
  
  await page.click('[data-testid="roll-x10"]');
  
  await page.evaluate(() => {
    window.performance.mark('roll-end');
    window.performance.measure('roll-duration', 'roll-start', 'roll-end');
  });
  
  const measure = await page.evaluate(() => 
    window.performance.getEntriesByName('roll-duration')[0].duration
  );
  
  expect(measure).toBeLessThan(2000); // Under 2s for 10x roll
});
```

### Device Testing Configuration
```typescript
// playwright.config.ts additions
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
    { name: 'tablet', use: { ...devices['iPad Pro'] } }
  ],
  
  // Game-specific settings
  timeout: 30000, // Longer for combat animations
  retries: 2,     // RNG can be flaky
  
  use: {
    // Game state persistence
    storageState: 'tests/game-state.json'
  }
});
```

---

# 5. 🤖 CLAUDE FLOW INTEGRATION

## 🎯 Game Development Patterns

### Feature Development Template
```bash
# Claude Flow pour nouvelles mécaniques
npx claude-flow init game-feature
npx claude-flow sparc run game-design "New card rarity system"
npx claude-flow sparc tdd "Implement divine rarity cards"
npx claude-flow sparc run balance "Tune drop rates for divine cards"
```

### Prompts Spécialisés Gaming

#### 1. **Balance & Tuning Prompt**
```
CONTEXT: Auto-battler card game with RNG mechanics
TASK: Analyze current drop rates and suggest balance changes
DATA: [Include current stats, player feedback, retention metrics]

FOCUS ON:
- Player retention vs frustration
- Economic balance (too generous vs too stingy) 
- Power creep prevention
- Addiction mechanics without exploitation

OUTPUT: Specific number changes with rationale
```

#### 2. **New Card Design Prompt**
```
CONTEXT: Memes Wars card system with emoji combat
TASK: Design new cards for [RARITY] tier
REQUIREMENTS:
- Follow existing MemeFamily taxonomy
- Balance with current meta
- Include emoji combat effects
- Maintain game's humor tone

OUTPUT: Complete card definitions with stats, effects, and flavor
```

#### 3. **Combat Balancing Prompt**
```
CONTEXT: Frame-based auto-battle system
CURRENT ISSUE: [Combat too long/short, specific meta problems]
CONSTRAINTS: 
- Maintain 30s-2min combat duration
- Preserve tactical depth
- Keep visual clarity

OUTPUT: Specific parameter adjustments with impact analysis
```

### Workflow Integration
```bash
# Development cycle avec Claude Flow
git checkout -b feature/new-rarity-system

# 1. Design phase
npx claude-flow sparc run spec-pseudocode "Divine rarity tier implementation"

# 2. Implementation avec TDD
npx claude-flow sparc tdd "Divine card roll mechanics"

# 3. Balance testing
npx claude-flow sparc run balance "Test divine cards impact on economy"

# 4. Integration
npm run test && npm run test:e2e
git commit -m "feat: add divine rarity tier with balanced drop rates"
```

---

# 6. 🎯 GAME MECHANICS IMPLEMENTATION

## 🎴 Card System Implementation Map

### Current State → Design.md Goals

#### ✅ **Already Implemented**
- Basic card model avec rarity system
- Roll service avec pity system
- Combat engine avec projectiles
- Zustand stores pour state management

#### 🚧 **In Progress / Needs Completion** 
- Emoji effect system (partiellement implémenté)
- Deck size limits évolutifs
- Craft system (architecture ready)
- Stage progression system

#### ❌ **Missing from Design.md**
- Passifs de cartes (legendary abilities)
- Synergy system (Force build, Luck build)
- Daily rewards & achievements
- PvP matchmaking

### Implementation Priorities par Phase

#### **Phase 1: MVP Completion (1 semaine)**
```typescript
// 1. Complete emoji effects system
const emojiEffects: Record<string, EmojiEffect> = {
  '🗿': { damage: 8, type: 'direct' },
  '🔥': { damage: 5, effect: { type: 'BURN', duration: 3, tickDamage: 2 } },
  '⚡': { damage: 6, effect: { type: 'STUN', chance: 0.1 } },
  // ... implement all 20+ emoji effects from design.md
};

// 2. Implement deck size limits
const getDeckSizeLimit = (stage: number): number => {
  if (stage <= 10) return 3;
  if (stage <= 25) return 4;
  if (stage <= 50) return 5;
  // ... follow design.md progression
};

// 3. Add stage system
interface Stage {
  id: number;
  enemyHp: number;
  enemyEmojis: string[];
  reward: number;
  boss: boolean;
  special?: string;
}
```

#### **Phase 2: Core Loop Polish (1 semaine)**
```typescript
// 1. Implement card passifs
enum PassifType {
  ATTACK_SPEED_BONUS = 'attack_speed_bonus',
  DOUBLE_EMOJI_CHANCE = 'double_emoji_chance',
  START_WITH_SHIELD = 'start_with_shield',
  IMMORTAL_ONCE = 'immortal_once',
  // ... from design.md passifs list
}

// 2. Add synergy detection
const detectSynergies = (deck: Card[]): SynergyBonus[] => {
  const forceCards = deck.filter(card => card.emojis.includes('💪'));
  const weaponCards = deck.filter(card => card.emojis.includes('⚔️'));
  
  if (forceCards.length >= 2 && weaponCards.length >= 1) {
    return [{ type: 'FORCE_BUILD', multiplier: 2.0 }];
  }
  // ... implement all synergy types
};

// 3. Complete crafting system
const craftRecipes: CraftRecipe[] = [
  {
    id: 'lucky_charm',
    cost: { common: 5 },
    effect: { type: 'LUCK_BONUS', value: 0.1 },
    unique: true
  },
  // ... implement all recipes from design.md
];
```

---

# 7. 📋 DEVELOPMENT PHASES

## 🚀 Roadmap Technique

### **Phase 1: MVP (1 semaine) - Completer l'existant**

#### Backend/Services
- [ ] Complete emoji effects dans CombatEngine
- [ ] Implement stage progression dans GameState
- [ ] Add deck size limits dans DeckService
- [ ] Polish RollService pity system

#### Frontend/UI
- [ ] Polish RollPage animations
- [ ] Complete CombatArena visual effects
- [ ] Add stage selector interface
- [ ] Implement deck limit UI feedback

#### Tests
- [ ] TDD pour tous les emoji effects
- [ ] E2E pour complete game cycle
- [ ] Performance tests pour combat animations

### **Phase 2: Core Loop (1 semaine) - Nouvelles features**

#### Game Mechanics
- [ ] Implement card passifs system
- [ ] Add synergy detection & bonuses  
- [ ] Create achievement system
- [ ] Build crafting interface

#### Polish & UX
- [ ] Add satisfying roll animations
- [ ] Implement combat juice (screen shake, etc.)
- [ ] Sound effects for major actions
- [ ] Tutorial/onboarding flow

### **Phase 3: Advanced Features (1 semaine)**

#### Multiplayer Foundation
- [ ] Async PvP infrastructure
- [ ] Leaderboard system
- [ ] Player profiles & stats

#### Retention Systems
- [ ] Daily rewards system
- [ ] Event/season framework
- [ ] Advanced achievements

---

# 8. 🔄 WORKFLOWS & PATTERNS

## 🎯 Game Development Patterns

### **Feature Development Cycle**
```bash
# 1. Design specification
echo "## New Feature: [NAME]" >> FEATURE_SPEC.md
# Document mechanics, balance, UI/UX requirements

# 2. TDD Implementation  
npm run test:watch
# Write failing tests first, then implement

# 3. Integration Testing
npm run test:e2e
# Test feature in full game context

# 4. Balance Testing
npm run dev
# Manual testing for game feel, balance

# 5. Performance Validation
npm run test:e2e:performance
# Ensure feature doesn't break game performance
```

### **Balance Tuning Workflow**
```typescript
// 1. Collect data
const balanceMetrics = {
  averageCombatDuration: collectCombatTimes(),
  rollToRareRatio: calculatePityTriggerRate(), 
  playerRetentionByStage: getStageCompletionRates(),
  mostUsedCards: getCardUsageStats()
};

// 2. Identify issues
const issues = analyzeBalance(balanceMetrics);

// 3. Propose changes
const balanceChanges = {
  combatSpeedMultiplier: 1.2, // Speed up slow combats
  rareDrowRateIncrease: 0.02,  // Slightly more generous
  nerfOverpoweredCards: ['card_id_1', 'card_id_2']
};

// 4. A/B test changes
deployBalanceTest(balanceChanges, { playerPercent: 10 });
```

### **Claude Flow Game Development Commands**
```bash
# Specialized game development workflows
npx claude-flow sparc run game-balance "Analyze current meta and suggest changes"
npx claude-flow sparc run card-design "Create new mythic rarity cards"  
npx claude-flow sparc run combat-tuning "Fix combat pacing issues"
npx claude-flow sparc tdd "Implement new synergy system"

# Performance optimization
npx claude-flow sparc run performance "Optimize combat animation system"

# Player experience analysis  
npx claude-flow sparc run ux-analysis "Review player feedback and suggest UX improvements"
```

---

# 9. 🛠️ TOOLS & COMMANDS

## 🎮 Game Development Commands

### **Core Development**
```bash
# Development
npm run dev                  # Start dev server (http://localhost:3000)
npm run dev:fast            # Fast dev mode (skip type checking)

# Testing
npm run test                # Unit tests (Vitest) 
npm run test:watch          # TDD mode
npm run test:coverage       # Coverage report
npm run test:e2e            # Full Playwright suite
npm run test:e2e:ui         # Interactive Playwright UI
npm run test:e2e:headed     # See tests run in browser

# Game Testing Specific
npm run test:e2e:performance # Performance tests
npm run test:e2e:mobile     # Mobile device testing
```

### **Code Quality**
```bash
# Type checking & linting
npm run typecheck           # TypeScript validation
npm run lint                # ESLint check
npm run lint:fix            # Auto-fix linting issues
npm run format              # Prettier formatting
npm run validate            # Full validation suite
```

### **Build & Deploy**
```bash
npm run build              # Production build
npm run preview            # Preview build locally
```

### **Game-Specific Debugging**
```bash
# Debug RNG systems
npm run dev -- --debug-rng

# Test specific card rarities
npm run test -- --grep "legendary cards"

# Combat engine debugging
npm run test:e2e:debug -- --grep "combat"
```

## 📊 Game Metrics & Analytics

### **In-Game Debug Commands** (Dev Console)
```javascript
// Access game stores in dev console
window.gameDebug = {
  rollStats: useRollStore.getState(),
  combatState: useCombatStore.getState(),
  playerCards: useCardsStore.getState().cards,
  
  // Debug functions
  giveCards: (rarity, count) => useCardsStore.getState().addCards(/*...*/),
  simulateRolls: (count) => /* simulate rolls for testing */,
  triggerPity: () => useRollStore.getState().triggerPity(),
  
  // Balance testing
  testCombat: (deck1, deck2) => /* run combat simulation */
};
```

---

## 🎯 Key Success Metrics

### **Technical Metrics**
- ✅ Test coverage > 80% pour game mechanics
- ✅ E2E tests cover complete game flow
- ✅ Combat animations < 60fps drops
- ✅ Roll system passes statistical validation

### **Game Design Metrics**  
- 🎮 Average session time: 30s - 2min (target from design.md)
- 🎰 Pity system triggers at expected rates
- ⚔️ Combat duration stays within 30s-2min range
- 🃏 Card balance: no single card >50% usage rate

### **Development Velocity**
- 🚀 Feature development cycle: 2-3 days max
- 🧪 TDD cycle: Red → Green → Refactor < 5 minutes
- 🎭 E2E test suite execution < 10 minutes
- 🔄 CI/CD pipeline < 15 minutes total

---

**Remember**: Focus sur l'addiction loop tout en gardant l'équilibre et le fun. Utilisez les données pour valider chaque décision de game design !

🎮 **Happy Game Development!**