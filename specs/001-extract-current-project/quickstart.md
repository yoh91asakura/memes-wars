# Quickstart Guide: Memes Wars Implementation

## Development Environment Setup

### Prerequisites
```bash
# Ensure you have Node.js 18+ installed
node --version  # Should show v18.x.x or higher

# Clone repository (if not already done)
git clone <repository-url>
cd memes-wars
```

### Installation
```bash
# Install dependencies
npm install

# Verify installation
npm run typecheck  # Should pass without errors
npm run test      # Should show existing test results
```

## Running the Game

### Development Mode
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# You should see the game interface
```

### Testing Setup
```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Interactive E2E testing
npm run test:e2e:ui
```

## Core Game Loop Verification

### 1. Card Rolling System
```bash
# In browser console (F12):
window.gameDebug.simulateRolls(10)
# Should display 10 random cards with rarity distribution

# Verify pity system:
window.gameDebug.rollStats.rollsWithoutRare
# Should show current pity counter
```

### 2. Deck Building
```bash
# Test deck creation:
const deck = deckService.createDeck('Test Deck')
console.log(deck)
# Should show empty deck with correct size limit

# Add cards:
const card = /* get from collection */;
deckService.addCardToDeck(deck.id, card)
# Should add card successfully or show validation error
```

### 3. Combat System
```bash
# Start combat:
const combat = combatEngine.startCombat(deck, stage)
console.log(combat.status) // Should be 'preparing'

# Watch combat in UI - should see:
# - Emoji projectiles flying
# - Health bars decreasing
# - Combat completing within 2 minutes
```

### 4. Advanced Crafting System ✅ NEW
```bash
# Test crafting system:
const recipes = craftService.getAvailableRecipes()
console.log('Available recipes:', recipes.length) // Should show 10+ recipes

# Test crafting validation:
const canCraft = craftService.canCraft('lucky_charm', playerCards, 1000, 100)
console.log('Can craft lucky charm:', canCraft)

# Perform crafting:
const craftResult = await craftService.craft('lucky_charm', playerCards)
console.log('Crafting result:', craftResult.success)

# Monitor active crafted items:
setInterval(() => {
  const activeItems = craftService.getActiveItems()
  console.log('Active crafted items:', activeItems.length)
}, 2000)

# Test different recipe categories:
# - Consumables: Lucky Charm, Golden Horseshoe, Rainbow Crystal
# - Permanent upgrades: Deck Expansion, Master Collector
# - Special cards: Legendary Forge, Cosmic Fusion
# - Resource conversion: Alchemist's Dream, Gem Synthesis
```

### 5. Stage Progression System ✅ NEW
```bash
# Test stage system:
const currentStage = stageStore.getCurrentStage()
console.log('Current stage:', currentStage.id)

# Check unlock requirements:
const nextStage = stageStore.getStage(currentStage.id + 1)
console.log('Next stage requirements:', nextStage.unlockRequirement)

# Test boss encounters:
const bossStages = stageStore.getBossStages()
console.log('Boss stages:', bossStages.map(s => s.id))

# Verify deck size progression:
const deckLimit = stageStore.getDeckSizeLimit(currentStage.id)
console.log('Current deck size limit:', deckLimit)

# Test stage-specific features:
# - Progressive deck size limits (3→4→5→6→8→10)
# - Boss encounters every 10 stages
# - Unlock requirements for advanced stages
# - Reward scaling with difficulty
```

## Advanced Integration Test Scenarios

### Enhanced Game Cycle Test with Advanced Features
```javascript
// Comprehensive test script for all advanced systems
async function testAdvancedGameCycle() {
  console.log('=== Testing Advanced Game Cycle ===');
  
  // 1. AUTO-ROLL - Test batch processing
  console.log('1. Testing advanced auto-roll system...');
  const autoRollResult = await window.gameDebug.testAutoRoll({
    batchSize: 5,
    stopOnRarity: 'rare',
    animationSpeed: 2.0
  });
  console.log('✓ Auto-roll completed:', autoRollResult.totalRolls);
  
  // 2. CRAFTING - Test item creation
  console.log('2. Testing crafting system...');
  const craftResult = await craftService.craft('lucky_charm', autoRollResult.cards);
  if (craftResult.success) {
    console.log('✓ Crafted item:', craftResult.item.id);
  }
  
  // 3. SYNERGY DETECTION - Test deck optimization
  console.log('3. Testing synergy detection...');
  const deck = deckService.createDeck('Advanced Test');
  deckService.addMultipleCards(deck.id, autoRollResult.cards.slice(0, 4));
  const synergies = synergySystem.detectSynergies(deck.cards);
  console.log('✓ Synergies detected:', synergies.activeSynergies.length);
  console.log('✓ Deck archetype:', synergies.deckStats.deckArchetype);
  
  // 4. ENHANCED COMBAT - Test with passive effects
  console.log('4. Testing enhanced combat...');
  const stage = stageStore.getStage(1);
  const combat = combatEngine.startCombat(deck, stage);
  
  // Monitor passive activations
  const passiveMonitor = setInterval(() => {
    const passives = passiveEffectsService.getActivePassives(combat.playerDeck.id);
    if (passives.length > 0) {
      console.log('✓ Passive effects active:', passives.length);
    }
  }, 1000);
  
  // 5. STAGE PROGRESSION - Test unlocks
  console.log('5. Testing stage progression...');
  const nextStage = stageStore.getNextAvailableStage();
  console.log('✓ Next available stage:', nextStage?.id || 'None');
  
  console.log('=== Advanced Game Cycle Test Complete ===');
  
  // Cleanup
  clearInterval(passiveMonitor);
}

// Run the enhanced test
testAdvancedGameCycle();
```

### Crafting System Integration Test
```javascript
async function testCraftingIntegration() {
  console.log('=== Testing Crafting System Integration ===');
  
  // Test all recipe categories
  const recipeCategories = ['consumable', 'permanent', 'upgrade', 'card'];
  
  for (const category of recipeCategories) {
    const recipes = craftService.getRecipesByCategory(category);
    console.log(`${category} recipes available:`, recipes.length);
    
    if (recipes.length > 0) {
      const testRecipe = recipes[0];
      const canCraft = craftService.canCraft(testRecipe.id, playerCards, 10000, 1000);
      console.log(`Can craft ${testRecipe.name}:`, canCraft.canCraft);
    }
  }
  
  console.log('=== Crafting Integration Test Complete ===');
}

testCraftingIntegration();
```

## Performance Verification

### Frame Rate Test
```javascript
// Monitor combat performance
function monitorCombatPerformance() {
  let frameCount = 0;
  let lastTime = performance.now();
  
  function measureFrame() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) { // Every second
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(measureFrame);
  }
  
  measureFrame();
}

// Start monitoring during combat
monitorCombatPerformance();
```

### Memory Usage Test
```javascript
// Check memory usage during gameplay
function checkMemoryUsage() {
  if (performance.memory) {
    const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
    console.log(`Memory: ${used}MB / ${total}MB`);
  }
}

// Check periodically
setInterval(checkMemoryUsage, 5000);
```

## User Acceptance Testing

### New Player Experience
1. **First Launch**
   - Game loads without errors
   - Tutorial or onboarding appears
   - Initial cards are provided

2. **First Roll**
   - Click roll button works
   - Animation plays smoothly
   - New card appears in collection
   - Currency is deducted

3. **First Deck**
   - Can create new deck
   - Can add cards from collection
   - Deck size limit enforced
   - Synergies detected automatically

4. **First Combat**
   - Combat starts within 2 seconds
   - Visual effects appear
   - Combat completes within 2 minutes
   - Results shown clearly

### Progression Testing
1. **Stage Advancement**
   - Complete Stage 1 successfully
   - Stage 2 unlocks automatically
   - Deck size limit increases at Stage 11
   - Enemy difficulty scales appropriately

2. **Pity System**
   - Roll 10 commons without rare
   - 11th roll guarantees rare+ card
   - Pity counter resets after trigger
   - Visual feedback shows pity status

3. **Collection Management**
   - Cards saved between sessions
   - Collection filters work correctly
   - Card details display properly
   - Sorting functions work

## Common Issues & Solutions

### Development Issues
```bash
# TypeScript errors
npm run typecheck
# Fix any type errors before proceeding

# Test failures
npm run test:unit
# Individual test debugging:
npx vitest run --grep "specific test name"

# E2E test failures  
npm run test:e2e:debug
# Run specific test file:
npx playwright test tests/e2e/roll-system.spec.ts
```

### Performance Issues
```bash
# Build and check bundle size
npm run build
# Check dist/ folder size - should be < 5MB total

# Analyze bundle composition
npx vite-bundle-analyzer dist
```

### Save System Issues
```javascript
// Clear save data (browser console)
localStorage.clear();
// Or specific game data:
localStorage.removeItem('memes-wars-save');

// Export save data for debugging
const saveData = localStorage.getItem('memes-wars-save');
console.log('Save data:', JSON.parse(saveData));
```

## Advanced Success Criteria Checklist

### Core Performance (Enhanced)
- [ ] Game loads in under 2 seconds (improved from 3)
- [ ] Frame rate stays above 60fps during combat (upgraded from 30fps)
- [ ] Memory usage stays under 75MB after extended gameplay (improved from 100MB)
- [ ] All 31 enhanced functional requirements work correctly (expanded from 21)
- [ ] Complete game cycle takes 30-120 seconds with auto-roll features
- [ ] Multi-tier pity system triggers at 10/30/90/200 thresholds

### Advanced Features ✅ NEW
- [ ] **Crafting System**: All 10+ recipes work with proper validation
- [ ] **Synergy Detection**: All 8 synergy types detect correctly with real-time calculation
- [ ] **Passive Effects**: All 10 effect types trigger properly with combat integration
- [ ] **Auto-Roll System**: Batch processing works with configurable stop conditions
- [ ] **Stage Progression**: Dynamic deck limits and boss encounters function correctly

### Enhanced User Experience
- [ ] **Synergy Recommendations**: Deck optimization suggestions are helpful and accurate
- [ ] **Crafting Feedback**: Clear success/failure indicators with progress tracking
- [ ] **Passive Indicators**: Visual feedback for ability triggers and cooldowns
- [ ] **Stage Information**: Clear progression requirements and reward previews
- [ ] **Auto-Roll Controls**: Intuitive batch size and stop condition settings

### Technical Excellence
- [ ] Save/load works with all advanced features between sessions
- [ ] No console errors during advanced feature usage
- [ ] Mobile responsive design supports all new UI components
- [ ] All enhanced tests pass (unit + E2E + performance)
- [ ] Statistical validation passes for balance analysis
- [ ] Memory leak prevention verified for extended gameplay

## Next Steps - Phase 4 Optimization Focus

After verifying advanced features work:

1. **Run Enhanced Test Suite**
   ```bash
   npm run validate        # Runs all checks including advanced features
   npm run test:performance # Validates 60fps and memory usage
   npm run test:balance     # Statistical validation of game mechanics
   ```

2. **Performance Optimization**
   ```bash
   # Profile performance bottlenecks
   npm run analyze:performance
   # Optimize bundle size
   npm run analyze:bundle
   ```

3. **Begin Phase 4 Optimization**
   - Focus on performance improvements (60fps → 120fps capability)
   - Statistical balance validation (100k+ roll analysis)
   - User experience enhancements (response time optimization)
   - Advanced analytics integration

4. **Quality Assurance**
   - Stress test all advanced systems under load
   - Validate edge cases and error recovery
   - Ensure cross-browser compatibility
   - Verify statistical accuracy of all RNG systems

5. **Future-Proofing**
   - Document architectural decisions
   - Prepare extensible plugin systems
   - Plan for internationalization
   - Design A/B testing frameworks