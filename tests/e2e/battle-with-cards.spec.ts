// Battle Tab with Cards Test - Check if battle initializes properly when cards are available
import { test, expect } from '@playwright/test';

test.describe('Battle Tab with Cards', () => {
  test('Should initialize combat when cards are available', async ({ page }) => {
    console.log('⚔️ Testing battle tab with cards available...');
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Ensure we have cards by doing multiple rolls
    console.log('📋 Getting cards for combat...');
    
    // Reset to get starter cards
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible({ timeout: 5000 })) {
      await resetButton.click();
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(2000);
    }
    
    // Do multiple rolls to ensure we have cards
    const rollButton = page.locator('[data-testid="roll-button-btn"]');
    for (let i = 0; i < 3; i++) {
      if (await rollButton.isVisible({ timeout: 2000 })) {
        await rollButton.click({ force: true });
        await page.waitForTimeout(800); // Wait for roll
      }
    }
    
    console.log('🔍 Checking collection has cards...');
    await page.click('text=Collection', { force: true });
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    
    // Should have cards in collection
    const cardCount = await page.locator('.collection-page__card-wrapper').count();
    console.log(`Collection has ${cardCount} cards`);
    expect(cardCount).toBeGreaterThan(0);
    
    // Now test battle tab with cards
    console.log('⚔️ Testing battle tab with cards available...');
    await page.click('text=Battle Arena', { force: true });
    
    // Should show the battle page
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible({ timeout: 10000 });
    
    // Should initialize properly - either show combat arena or valid initialization loading
    await page.waitForTimeout(8000); // Give it time to initialize combat
    
    const loadingSpinner = page.locator('.loading-spinner');
    const combatArena = page.locator('[data-testid="combat-arena"]');
    const noCardsMessage = page.locator('text=No cards available for combat');
    const initializingMessage = page.locator('text=Initializing Combat Arena');
    
    const isLoading = await loadingSpinner.isVisible();
    const hasArena = await combatArena.isVisible();
    const hasNoCardsMessage = await noCardsMessage.isVisible();
    const hasInitializingMessage = await initializingMessage.isVisible();
    
    console.log(`Loading spinner visible: ${isLoading}`);
    console.log(`Combat arena visible: ${hasArena}`);
    console.log(`No cards message visible: ${hasNoCardsMessage}`);
    console.log(`Initializing message visible: ${hasInitializingMessage}`);
    
    // Should NOT show "no cards" message since we have cards
    expect(hasNoCardsMessage).toBe(false);
    
    // Should either have combat arena OR be in valid initialization state
    const hasValidState = hasArena || (isLoading && hasInitializingMessage);
    expect(hasValidState).toBe(true);
    
    if (hasArena) {
      console.log('✅ Combat arena loaded successfully with cards');
      
      // Check if combat controls are available
      const startButton = page.locator('text=Start Combat');
      const pauseButton = page.locator('text=Pause');
      const combatControls = await startButton.isVisible() || await pauseButton.isVisible();
      
      console.log(`Combat controls available: ${combatControls}`);
    } else if (isLoading && hasInitializingMessage) {
      console.log('✅ Combat is initializing properly');
      
      // Wait a bit more to see if it completes initialization
      await page.waitForTimeout(5000);
      const finalArenaState = await combatArena.isVisible();
      if (finalArenaState) {
        console.log('✅ Combat arena appeared after initialization');
      }
    }
    
    console.log('✅ Battle tab with cards test passed!');
  });
});