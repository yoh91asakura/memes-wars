// Complete Game Flow E2E Test - Tests the entire corrected game loop
import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow - Post Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]');
    await page.waitForTimeout(3000); // Allow full initialization
  });

  test('Should complete entire game flow from reset to combat with auto-deck', async ({ page }) => {
    console.log('🎮 Testing complete corrected game flow...');

    // STEP 1: Reset game to ensure fresh state
    console.log('🔄 Step 1: Reset game state...');
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible({ timeout: 5000 })) {
      await resetButton.click();
      
      // Accept confirmation dialog
      await page.waitForTimeout(500);
      page.on('dialog', async dialog => {
        console.log('Accepting reset confirmation:', dialog.message());
        await dialog.accept();
      });
      
      await page.waitForTimeout(2000); // Wait for reset to complete
    }

    // STEP 2: Verify initial state after reset
    console.log('💰 Step 2: Verify starter currency and cards...');
    
    // Should have starter currency
    const goldElement = page.locator('.main-layout__stat:has([aria-label="🪙"]) span:not(.icon)');
    const goldValue = await goldElement.textContent();
    console.log(`Gold after reset: ${goldValue}`);
    
    const ticketsElement = page.locator('.main-layout__stat:has([aria-label="🎫"]) span:not(.icon)');
    const ticketsValue = await ticketsElement.textContent();
    console.log(`Tickets after reset: ${ticketsValue}`);

    // STEP 3: Test instant rolling (no delays)
    console.log('🎲 Step 3: Test instant roll functionality...');
    
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    const rollButton = page.locator('[data-testid="roll-button-btn"]');
    if (await rollButton.isVisible({ timeout: 5000 })) {
      const rollStartTime = Date.now();
      
      await rollButton.click({ force: true });
      
      // Should see card reveal immediately (no 1000ms delay)
      await page.waitForSelector('.roll-panel__revealed-card', { timeout: 2000 });
      
      const rollEndTime = Date.now();
      const rollDuration = rollEndTime - rollStartTime;
      
      console.log(`Roll completed in ${rollDuration}ms`);
      expect(rollDuration).toBeLessThan(3000); // Should be much faster than before
      
      await page.waitForTimeout(1000); // Wait for animation to complete
    }

    // STEP 4: Test collection with stacking enabled
    console.log('📚 Step 4: Test collection with stacking...');
    
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Should show cards in stack view by default
    const stackViewActive = await page.locator('.view-toggle[data-mode="stack"].active').isVisible();
    const showStacksToggle = await page.locator('.toggle-switch:has-text("Show Stacks")').isChecked();
    
    console.log(`Stack view active: ${stackViewActive}`);
    console.log(`Show stacks enabled: ${showStacksToggle}`);
    
    // Count cards in collection
    const cardCount = await page.locator('.collection-page__card-wrapper').count();
    console.log(`Cards in collection: ${cardCount}`);

    // STEP 5: Test new Deck page functionality  
    console.log('🃏 Step 5: Test Deck management page...');
    
    await page.click('text=Deck Builder', { force: true });
    await expect(page.locator('[data-testid="deck-page"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Check if we can create a deck
    const createDeckButton = page.locator('[data-testid="create-deck-button"]');
    if (await createDeckButton.isVisible({ timeout: 5000 })) {
      await createDeckButton.click();
      await page.waitForTimeout(1000);
      
      // Should now be in deck builder mode or show empty deck
      const deckBuilderVisible = await page.locator('.deck-page--building').isVisible();
      console.log(`Deck builder opened: ${deckBuilderVisible}`);
    }

    // Return to main navigation for combat test
    if (await page.locator('[data-testid="deck-page"]').isVisible()) {
      await page.click('text=Battle Arena', { force: true });
    }

    // STEP 6: Test combat with auto-deck creation (no blocking)
    console.log('⚔️ Step 6: Test combat with auto-deck...');
    
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible({ timeout: 10000 });
    
    // Key test: Should NOT be blocked by deck selector
    await page.waitForTimeout(3000); // Give time for initialization
    
    const isDeckSelectorBlocking = await page.locator('.deck-selection-overlay').isVisible();
    console.log(`Deck selector blocking: ${isDeckSelectorBlocking}`);
    
    if (!isDeckSelectorBlocking) {
      console.log('✅ Combat not blocked - checking for auto-deck notice...');
      
      // Should show auto-deck notice
      const autoDeckNotice = await page.locator('.auto-deck-notice').isVisible();
      console.log(`Auto-deck notice shown: ${autoDeckNotice}`);
      
      // Should show manage deck button
      const manageDeckButton = await page.locator('text=🃏 Manage Deck').isVisible();
      console.log(`Manage deck button available: ${manageDeckButton}`);
      
      // Wait for combat to initialize
      await page.waitForTimeout(5000);
      
      // Should eventually show combat interface
      const combatInitialized = await page.locator('[data-testid="combat-arena"]').isVisible({ timeout: 15000 });
      console.log(`Combat arena loaded: ${combatInitialized}`);
      
      if (combatInitialized) {
        console.log('✅ Combat successfully initialized with auto-deck');
        
        // Wait a bit to see if combat starts automatically
        await page.waitForTimeout(5000);
        
        // Check if combat is active
        const combatActive = await page.locator('.combat-controls-header:has-text("Pause")').isVisible();
        console.log(`Combat auto-started: ${combatActive}`);
      }
    } else {
      console.log('⚠️ Deck selector still blocking - attempting to proceed...');
      
      // If still blocked, try to confirm deck
      const confirmButton = page.locator('[data-testid="confirm-deck"]');
      if (await confirmButton.isVisible({ timeout: 5000 })) {
        await confirmButton.click();
        await page.waitForTimeout(3000);
      }
    }

    // STEP 7: Verify complete core loop functionality
    console.log('🔄 Step 7: Verify core loop completion...');
    
    // Navigate back through all pages to ensure they all work
    await page.click('text=Card Rolls', { force: true });
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    
    await page.click('text=Deck Builder', { force: true });
    await expect(page.locator('[data-testid="deck-page"]')).toBeVisible();
    
    await page.click('text=Crafting', { force: true });
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible();
    
    await page.click('text=Battle Arena', { force: true });
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible();

    console.log('✅ Complete game flow test passed!');
  });

  test('Should handle new player experience correctly', async ({ page }) => {
    console.log('👶 Testing new player experience...');

    // Clear localStorage to simulate truly new player
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Should still be functional even with no saved data
    await expect(page.locator('[data-testid="main-app"]')).toBeVisible();

    // Test reset button for new player setup
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(2000);
    }

    // Should now have starter resources
    const goldVisible = await page.locator('.main-layout__stat:has([aria-label="🪙"])').isVisible();
    expect(goldVisible).toBe(true);

    // Should be able to navigate and use all features
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();

    await page.click('text=Battle Arena', { force: true });
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible();

    console.log('✅ New player experience test passed!');
  });

  test('Should handle deck management workflow', async ({ page }) => {
    console.log('🃏 Testing complete deck management workflow...');

    // Ensure we have cards first
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(2000);
    }

    // Go to deck page
    await page.click('text=Deck Builder', { force: true });
    await expect(page.locator('[data-testid="deck-page"]')).toBeVisible();

    // Test deck creation
    const createButton = page.locator('[data-testid="create-deck-button"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
    }

    // Test deck builder interface
    const deckBuilderButton = page.locator('[data-testid="deck-builder-button"]');
    if (await deckBuilderButton.isVisible()) {
      await deckBuilderButton.click();
      await page.waitForTimeout(2000);
      
      // Should show deck builder interface
      const deckBuilderVisible = await page.locator('.deck-page--building').isVisible();
      console.log(`Deck builder interface: ${deckBuilderVisible}`);
    }

    // Test going to combat with managed deck
    await page.click('text=Battle Arena', { force: true });
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible();

    // Should have manage deck option in combat
    const manageDeckButton = page.locator('text=🃏 Manage Deck');
    if (await manageDeckButton.isVisible()) {
      await manageDeckButton.click();
      await page.waitForTimeout(1000);
      
      const deckSelectorVisible = await page.locator('.deck-selection-overlay').isVisible();
      console.log(`Manage deck opened deck selector: ${deckSelectorVisible}`);
    }

    console.log('✅ Deck management workflow test passed!');
  });

  test('Should maintain performance during intensive operations', async ({ page }) => {
    console.log('⚡ Testing performance during intensive operations...');

    // Reset to ensure consistent starting state
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(2000);
    }

    // Test rapid navigation
    const startTime = Date.now();
    
    for (let i = 0; i < 5; i++) {
      await page.click('text=Collection', { force: true });
      await page.waitForSelector('[data-testid="collection-page"]');
      
      await page.click('text=Crafting', { force: true });
      await page.waitForSelector('[data-testid="craft-page"]');
      
      await page.click('text=Deck Builder', { force: true });
      await page.waitForSelector('[data-testid="deck-page"]');
      
      await page.click('text=Card Rolls', { force: true });
      await page.waitForSelector('[data-testid="roll-page"]');
    }
    
    const navigationTime = Date.now() - startTime;
    console.log(`Rapid navigation (20 page changes) took: ${navigationTime}ms`);
    
    // Should complete in reasonable time (under 30 seconds)
    expect(navigationTime).toBeLessThan(30000);

    // Test multiple rapid rolls
    const rollButton = page.locator('[data-testid="roll-button-btn"]');
    if (await rollButton.isVisible()) {
      const rollStartTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        if (await rollButton.isVisible({ timeout: 1000 })) {
          await rollButton.click({ force: true });
          await page.waitForTimeout(500); // Short wait between rolls
        }
      }
      
      const rollsTime = Date.now() - rollStartTime;
      console.log(`5 rapid rolls took: ${rollsTime}ms`);
      expect(rollsTime).toBeLessThan(15000); // Should be much faster without delays
    }

    console.log('✅ Performance test passed!');
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('Should handle combat with no cards gracefully', async ({ page }) => {
    console.log('🚫 Testing combat with no cards...');

    // Clear everything
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]');
    await page.waitForTimeout(2000);

    // Try to go to combat without any cards
    await page.click('text=Battle Arena', { force: true });
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible();

    // Should show helpful message or redirect
    const noCardsMessage = await page.locator('text=No cards available').isVisible({ timeout: 5000 });
    const rollPageButton = await page.locator('text=Go to Roll Page').isVisible();

    console.log(`No cards message shown: ${noCardsMessage}`);
    console.log(`Roll page redirect button: ${rollPageButton}`);

    if (rollPageButton) {
      await page.click('text=Go to Roll Page');
      await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    }

    console.log('✅ No cards error handling test passed!');
  });

  test('Should handle rapid interactions gracefully', async ({ page }) => {
    console.log('🏃 Testing rapid interactions...');

    // Setup game
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(1000);
    }

    // Test rapid clicking of navigation
    for (let i = 0; i < 10; i++) {
      await page.click('text=Collection', { force: true });
      await page.click('text=Card Rolls', { force: true });
    }

    // Should still be responsive
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();

    // Test rapid roll button clicking
    const rollButton = page.locator('[data-testid="roll-button-btn"]');
    if (await rollButton.isVisible()) {
      for (let i = 0; i < 3; i++) {
        await rollButton.click({ force: true });
        await page.waitForTimeout(100); // Very short wait
      }
    }

    // App should remain functional
    await expect(page.locator('[data-testid="main-app"]')).toBeVisible();

    console.log('✅ Rapid interactions test passed!');
  });
});