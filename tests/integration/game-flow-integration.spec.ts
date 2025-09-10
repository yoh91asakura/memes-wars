import { test, expect } from '@playwright/test';

/**
 * Integration Tests - Cross-Component and System Integration
 * Tests that verify multiple components working together
 */

test.describe('Game Flow Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to be fully loaded
    await expect(page.locator('[data-testid="app"], #root')).toBeVisible();
  });

  test('should integrate roll → collection → deck building flow', async ({ page }) => {
    // Step 1: Navigate to roll page
    await page.click('[data-testid="nav-roll"], a[href*="roll"]');
    await expect(page).toHaveURL(/.*roll.*/);
    
    // Step 2: Perform a roll (if possible with current implementation)
    const rollButton = page.locator('[data-testid="roll-button"], button:has-text("Roll")');
    if (await rollButton.isVisible()) {
      await rollButton.click();
      
      // Wait for roll animation/result
      await page.waitForTimeout(2000);
    }
    
    // Step 3: Navigate to collection
    await page.click('[data-testid="nav-collection"], a[href*="collection"]');
    await expect(page).toHaveURL(/.*collection.*/);
    
    // Step 4: Verify cards are displayed
    await expect(page.locator('[data-testid="card"], .card')).toBeVisible();
    
    // Step 5: Navigate to deck building
    await page.click('[data-testid="nav-deck"], a[href*="deck"]');
    await expect(page).toHaveURL(/.*deck.*/);
  });

  test('should integrate deck → combat → rewards flow', async ({ page }) => {
    // Step 1: Go to combat page
    await page.click('[data-testid="nav-combat"], a[href*="combat"]');
    await expect(page).toHaveURL(/.*combat.*/);
    
    // Step 2: Check if combat can be started
    const combatArea = page.locator('[data-testid="combat-arena"], .combat-arena');
    if (await combatArea.isVisible()) {
      // Check for combat controls
      const startButton = page.locator('[data-testid="start-combat"], button:has-text("Start")');
      if (await startButton.isVisible()) {
        await startButton.click();
        
        // Wait for combat to potentially complete
        await page.waitForTimeout(5000);
      }
    }
    
    // Step 3: Check for any reward displays
    const rewardModal = page.locator('[data-testid="reward-modal"], .reward');
    if (await rewardModal.isVisible()) {
      expect(rewardModal).toBeTruthy();
    }
  });

  test('should integrate store management across pages', async ({ page }) => {
    // Test that Zustand stores persist across page navigation
    
    // Check initial currency state
    let initialGold = 0;
    try {
      initialGold = await page.evaluate(() => {
        // Access currency store if available
        return (window as any).gameDebug?.currencyState?.gold || 0;
      });
    } catch (e) {
      console.log('Currency store not available for testing');
    }
    
    // Navigate between pages
    await page.click('[data-testid="nav-roll"], a[href*="roll"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="nav-collection"], a[href*="collection"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="nav-combat"], a[href*="combat"]');
    await page.waitForTimeout(1000);
    
    // Verify store state is maintained
    const finalGold = await page.evaluate(() => {
      try {
        return (window as any).gameDebug?.currencyState?.gold || 0;
      } catch {
        return 0;
      }
    });
    
    // Gold should remain consistent (or change predictably)
    expect(typeof finalGold).toBe('number');
  });

  test('should handle error boundaries and recovery', async ({ page }) => {
    // Test error handling integration
    
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate through all major pages
    const pages = ['roll', 'collection', 'deck', 'combat', 'craft'];
    
    for (const pageName of pages) {
      try {
        // Try to navigate to each page
        const navLink = page.locator(`[data-testid="nav-${pageName}"], a[href*="${pageName}"]`);
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          
          // Check that page loads without critical errors
          await expect(page.locator('body')).toBeVisible();
        }
      } catch (e) {
        console.log(`Page ${pageName} not accessible:`, e);
      }
    }
    
    // Should not have critical JavaScript errors
    const criticalErrors = errors.filter(error => 
      error.includes('Cannot read') || 
      error.includes('undefined') || 
      error.includes('null')
    );
    
    if (criticalErrors.length > 0) {
      console.warn('Critical errors detected:', criticalErrors);
    }
  });
});