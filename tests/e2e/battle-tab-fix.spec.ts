// Battle Tab Loading Test - Check if battle tab loads without infinite loading
import { test, expect } from '@playwright/test';

test.describe('Battle Tab Loading Fix', () => {
  test('Should load battle tab without infinite loading', async ({ page }) => {
    console.log('🎯 Testing battle tab loading fix...');
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Ensure we have some cards first by doing a roll
    console.log('📋 First, get some cards...');
    
    // Reset to get starter cards
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible({ timeout: 5000 })) {
      await resetButton.click();
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(2000);
    }
    
    // Do a quick roll to get cards
    const rollButton = page.locator('[data-testid="roll-button-btn"]');
    if (await rollButton.isVisible({ timeout: 5000 })) {
      await rollButton.click({ force: true });
      await page.waitForTimeout(1000); // Wait for roll
    }
    
    // Now test battle tab
    console.log('⚔️ Testing battle tab...');
    await page.click('text=Battle Arena', { force: true });
    
    // Should show the battle page within reasonable time
    await expect(page.locator('[data-testid="combat-page"]')).toBeVisible({ timeout: 10000 });
    
    // Should NOT be stuck in infinite loading
    // Check if we see actual combat content or valid loading states
    await page.waitForTimeout(5000); // Give it time to initialize
    
    const loadingSpinner = page.locator('.loading-spinner');
    const combatArena = page.locator('[data-testid="combat-arena"]');
    const noCardsMessage = page.locator('text=No cards available for combat');
    const noCardsContainer = page.locator('.no-cards-container');
    
    const isStillLoading = await loadingSpinner.isVisible();
    const hasArena = await combatArena.isVisible();
    const hasNoCardsMessage = await noCardsMessage.isVisible();
    const hasNoCardsContainer = await noCardsContainer.isVisible();
    
    console.log(`Loading spinner visible: ${isStillLoading}`);
    console.log(`Combat arena visible: ${hasArena}`);
    console.log(`No cards message visible: ${hasNoCardsMessage}`);
    console.log(`No cards container visible: ${hasNoCardsContainer}`);
    
    // Should not be stuck in infinite loading (unless it's the valid "Initializing Combat Arena" state)
    if (isStillLoading && !hasNoCardsContainer) {
      // If still loading without no-cards container, check if it's valid initialization loading
      const loadingText = await page.locator('.loading-container p').textContent();
      console.log(`Still loading with message: ${loadingText}`);
      
      // "Initializing Combat Arena" is acceptable, but "No cards available" with spinner is not
      if (loadingText?.includes('No cards available')) {
        // Take screenshot for debugging
        await page.screenshot({ path: 'battle-tab-stuck-loading.png' });
        throw new Error('Battle tab is stuck in infinite loading state with no-cards message');
      } else {
        console.log('Valid initialization loading state detected');
      }
    }
    
    // Should have either combat arena OR no cards container (both are valid)
    const hasValidState = hasArena || hasNoCardsContainer;
    expect(hasValidState).toBe(true);
    
    if (hasArena) {
      console.log('✅ Combat arena loaded successfully');
    } else if (hasNoCardsMessage) {
      console.log('✅ Showing valid "no cards" message');
    }
    
    console.log('✅ Battle tab loading test passed!');
  });
});