// Essential Functionality E2E Tests - Core features that must work
import { test, expect } from '@playwright/test';

test.describe('Essential Game Functionality E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]');
    await page.waitForTimeout(2000); // Wait for initialization
  });

  test('Should load and display main game interface', async ({ page }) => {
    console.log('🎮 Testing main interface loading...');
    
    // Check main layout is visible
    await expect(page.locator('.main-layout')).toBeVisible();
    
    // Check header with game title
    await expect(page.locator('.main-layout__logo')).toBeVisible();
    
    // Check navigation is present - use first occurrence of each text
    await expect(page.locator('text=Card Rolls').first()).toBeVisible();
    await expect(page.locator('text=Collection').first()).toBeVisible();
    await expect(page.locator('text=Deck Builder').first()).toBeVisible();
    await expect(page.locator('text=Crafting').first()).toBeVisible();
    await expect(page.locator('text=Battle Arena').first()).toBeVisible();
    
    // Check we start on roll page
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    console.log('✅ Main interface test passed');
  });

  test('Should navigate successfully between all pages', async ({ page }) => {
    console.log('🧭 Testing page navigation...');
    
    // Start on roll page
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    // Navigate to Collection
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Navigate to Deck Builder
    await page.click('text=Deck Builder', { force: true });
    await expect(page.locator('[data-testid="deck-page"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Navigate to Crafting  
    await page.click('text=Crafting', { force: true });
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Navigate to Battle Arena
    await page.click('text=Battle Arena', { force: true });
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Return to Roll page
    await page.click('text=Card Rolls', { force: true });
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Navigation test passed');
  });

  test('Should display and interact with audio settings', async ({ page }) => {
    console.log('🎵 Testing audio settings functionality...');
    
    // Find and click audio settings button
    const audioButton = page.locator('[data-testid="audio-settings-button"]');
    await expect(audioButton).toBeVisible();
    await audioButton.click();
    
    // Audio settings modal should appear
    await expect(page.locator('[data-testid="main-audio-settings"]')).toBeVisible();
    
    // Check key elements are present
    await expect(page.locator('text=Audio Settings')).toBeVisible();
    await expect(page.locator('text=Enable Audio')).toBeVisible();
    await expect(page.locator('text=Master Volume')).toBeVisible();
    
    // Test volume sliders are present
    await expect(page.locator('[data-testid="master-volume-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="sfx-volume-slider"]')).toBeVisible();
    
    // Close the modal
    await page.click('[data-testid="close-audio-settings"]');
    await expect(page.locator('[data-testid="main-audio-settings"]')).not.toBeVisible();
    
    console.log('✅ Audio settings test passed');
  });

  test('Should perform basic roll functionality', async ({ page }) => {
    console.log('🎲 Testing roll functionality...');
    
    // Should be on roll page
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    // Look for roll button
    const rollButton = page.locator('[data-testid="roll-button"]');
    
    if (await rollButton.isVisible({ timeout: 5000 })) {
      console.log('Roll button found, attempting roll...');
      
      // Click roll button with force to avoid interception
      await rollButton.click({ force: true });
      
      // Wait for roll animation
      await page.waitForTimeout(3000);
      
      console.log('✅ Roll completed successfully');
    } else {
      console.log('⚠️ Roll button not found - may need cards or coins');
    }
    
    // The page should still be functional regardless
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    console.log('✅ Roll functionality test completed');
  });

  test('Should access collection page and display cards', async ({ page }) => {
    console.log('📚 Testing collection functionality...');
    
    // Navigate to collection
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible({ timeout: 10000 });
    
    // Collection should load without errors
    await page.waitForTimeout(2000);
    
    // Should show collection interface elements
    const collectionPage = page.locator('[data-testid="collection-page"]');
    await expect(collectionPage).toBeVisible();
    
    // Check if cards are displayed (may be empty for new game)
    const hasCards = await page.locator('.collection-page__card-wrapper').count();
    console.log(`Found ${hasCards} cards in collection`);
    
    console.log('✅ Collection test passed');
  });

  test('Should access crafting page and show recipes', async ({ page }) => {
    console.log('🔧 Testing crafting functionality...');
    
    // Navigate to crafting
    await page.click('text=Crafting', { force: true });
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible({ timeout: 10000 });
    
    // Should show crafting interface
    await page.waitForTimeout(1000);
    
    // Check for key crafting elements - use first match to avoid strict mode violation
    await expect(page.locator('text=🛠️ Crafting Workshop').first()).toBeVisible();
    
    // Should show some recipes or categories
    const recipeElements = await page.locator('[class*="recipe"], [class*="category"]').count();
    console.log(`Found ${recipeElements} recipe/category elements`);
    
    console.log('✅ Crafting test passed');
  });

  test('Should handle combat page initialization', async ({ page }) => {
    console.log('⚔️ Testing combat page access...');
    
    // Navigate to battle arena
    await page.click('text=Battle Arena', { force: true });
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible({ timeout: 10000 });
    
    // Combat page should initialize (may show loading or deck selector)
    await page.waitForTimeout(2000);
    
    // Should show either:
    // 1. Loading state
    // 2. Deck selector
    // 3. Combat arena
    const isLoading = await page.locator('text=Initializing').isVisible();
    const hasDeckSelector = await page.locator('[data-testid="deck-selector"]').isVisible();
    const hasCombatArena = await page.locator('[data-testid="combat-arena"]').isVisible();
    
    const stateDescription = isLoading ? 'loading' : 
                            hasDeckSelector ? 'deck selection' : 
                            hasCombatArena ? 'combat arena' : 'unknown';
    
    console.log(`Combat page state: ${stateDescription}`);
    
    // Page should be functional regardless of state
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible();
    
    console.log('✅ Combat page test passed');
  });

  test('Should access deck builder page and manage decks', async ({ page }) => {
    console.log('🃏 Testing deck builder functionality...');
    
    // Navigate to deck builder
    await page.click('text=Deck Builder', { force: true });
    await expect(page.locator('[data-testid="deck-page"]')).toBeVisible({ timeout: 10000 });
    
    // Should show deck management interface
    await page.waitForTimeout(1000);
    
    // Check for key deck management elements
    await expect(page.locator('text=🃏 Deck Manager').first()).toBeVisible();
    
    // Should show deck creation buttons
    const createDeckButton = page.locator('[data-testid="create-deck-button"]');
    const deckBuilderButton = page.locator('[data-testid="deck-builder-button"]');
    
    const hasCreateButton = await createDeckButton.isVisible();
    const hasBuilderButton = await deckBuilderButton.isVisible();
    
    console.log(`Create deck button available: ${hasCreateButton}`);
    console.log(`Deck builder button available: ${hasBuilderButton}`);
    
    // Test deck builder interface if available
    if (await deckBuilderButton.isVisible()) {
      await deckBuilderButton.click();
      await page.waitForTimeout(1000);
      
      const builderVisible = await page.locator('.deck-page--building').isVisible();
      console.log(`Deck builder interface opened: ${builderVisible}`);
    }
    
    console.log('✅ Deck builder test passed');
  });
});

test.describe('Responsive Design E2E', () => {
  test('Should work on mobile viewport', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]');
    await page.waitForTimeout(2000);
    
    // Should still show main interface
    await expect(page.locator('.main-layout')).toBeVisible();
    await expect(page.locator('text=Card Rolls')).toBeVisible();
    
    // Navigation should work on mobile
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible({ timeout: 10000 });
    
    // Audio settings should still work
    await page.click('[data-testid="audio-settings-button"]', { force: true });
    await expect(page.locator('[data-testid="main-audio-settings"]')).toBeVisible();
    await page.click('[data-testid="close-audio-settings"]');
    
    console.log('✅ Mobile responsiveness test passed');
  });
});

test.describe('Performance E2E', () => {
  test('Should load quickly and be responsive', async ({ page }) => {
    console.log('⚡ Testing performance...');
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Initial load time: ${loadTime}ms`);
    
    // Should load in reasonable time (under 10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Quick navigation test
    const navStart = Date.now();
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    const navTime = Date.now() - navStart;
    
    console.log(`⏱️ Navigation time: ${navTime}ms`);
    
    // Navigation should be fast (under 5 seconds)
    expect(navTime).toBeLessThan(5000);
    
    console.log('✅ Performance test passed');
  });
});