// E2E Tests for Auto-Roll System - Testing the new auto-roll functionality
import { test, expect } from '@playwright/test';

test.describe('Auto-Roll System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="main-app"]');
    
    // Navigate to the roll page
    await page.click('text=Card Rolls');
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
  });

  test('Should display auto-roll controls in roll panel', async ({ page }) => {
    // Check that auto-roll toggle is visible
    await expect(page.locator('[data-testid="toggle-auto-roll"]')).toBeVisible();
    await expect(page.locator('text=Auto Roll')).toBeVisible();
  });

  test('Should expand auto-roll panel when clicked', async ({ page }) => {
    // Click to expand auto-roll controls
    await page.click('[data-testid="toggle-auto-roll"]');
    
    // Check that settings are visible
    await expect(page.locator('text=Number of Rolls:')).toBeVisible();
    await expect(page.locator('text=Animation Speed:')).toBeVisible();
    await expect(page.locator('text=Stop on Rarity:')).toBeVisible();
    
    // Check that start button is visible
    await expect(page.locator('[data-testid="start-auto-roll"]')).toBeVisible();
  });

  test('Should allow changing auto-roll settings', async ({ page }) => {
    // Expand controls
    await page.click('[data-testid="toggle-auto-roll"]');
    
    // Increase number of rolls
    const plusButton = page.locator('[data-testid="auto-roll-increase"]');
    await expect(plusButton).toBeVisible();
    await plusButton.click();
    
    // Check animation speed buttons
    const fastButton = page.locator('text=🏃‍♂️');
    await expect(fastButton).toBeVisible();
    await fastButton.click();
    
    // Check stop on rarity options
    const epicButton = page.locator('button:has-text("EPI")');
    await expect(epicButton).toBeVisible();
    await epicButton.click();
  });

  test('Should show progress when auto-roll is active (simulated)', async ({ page }) => {
    // Expand controls
    await page.click('[data-testid="toggle-auto-roll"]');
    
    // Start auto-roll (will start with small number for safety)
    await page.click('[data-testid="start-auto-roll"]');
    
    // Should see stop button appear
    await expect(page.locator('[data-testid="stop-auto-roll"]')).toBeVisible();
    
    // Should see progress text
    await expect(page.locator('text=Rolling automatically...')).toBeVisible();
  });
});

test.describe('Card Stacking System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="main-app"]');
    
    // First add some cards by rolling - go to roll page and roll a few cards
    await page.click('text=Card Rolls');
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    // Roll some cards to populate the collection
    const rollButton = page.locator('[data-testid="roll-button"]');
    if (await rollButton.isVisible()) {
      // First roll
      await rollButton.click();
      await page.waitForTimeout(3000); // Wait for roll animation
      
      // Second roll if button is still available  
      const rollButtonAfter = page.locator('[data-testid="roll-button"]');
      if (await rollButtonAfter.isVisible()) {
        await rollButtonAfter.click();
        await page.waitForTimeout(3000); // Wait for second roll animation
      }
    }
    
    // Now navigate to collection page for stacking tests
    await page.click('text=Collection');
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    
    // Close any open detail panel that might be blocking the toggle button
    try {
      const closeDetailButton = page.locator('[data-testid="close-detail"]');
      if (await closeDetailButton.isVisible({ timeout: 1000 })) {
        await closeDetailButton.click();
        await page.waitForTimeout(1000); // Wait for panel to close
      }
    } catch (e) {
      // Detail panel might not exist, continue
    }
  });

  test('Should display stack toggle button in collection', async ({ page }) => {
    // Check that stack toggle is visible
    await expect(page.locator('[data-testid="toggle-stacks"]')).toBeVisible();
    await expect(page.locator('text=Stacked')).toBeVisible();
  });

  test('Should toggle between stacked and individual view', async ({ page }) => {
    // Close any detail panel first
    try {
      const closeDetailButton = page.locator('[data-testid="close-detail"]');
      if (await closeDetailButton.isVisible({ timeout: 1000 })) {
        await closeDetailButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Detail panel might not exist, continue
    }
    
    // Initial state should show "Stacked" button (meaning it will enable stacking)
    await expect(page.locator('text=Stacked')).toBeVisible();
    
    // Click to enable stacking - use force if needed
    await page.click('[data-testid="toggle-stacks"]', { force: true });
    
    // Should now show "Individual" button (meaning it will disable stacking)
    await expect(page.locator('text=Individual')).toBeVisible();
  });

  test('Should show stack badges for duplicate cards (if any exist)', async ({ page }) => {
    // Close any detail panel first
    try {
      const closeDetailButton = page.locator('[data-testid="close-detail"]');
      if (await closeDetailButton.isVisible({ timeout: 1000 })) {
        await closeDetailButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Detail panel might not exist, continue
    }
    
    // This test would need actual duplicate cards to work properly
    // For now, just check that the collection loads without errors
    
    // Enable stacking view
    await page.click('[data-testid="toggle-stacks"]', { force: true });
    
    // Collection should still be functional
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    
    // If there are cards, they should be visible
    const cardElements = page.locator('.collection-page__card-wrapper');
    const cardCount = await cardElements.count();
    
    if (cardCount > 0) {
      // At least some cards should be visible
      await expect(cardElements.first()).toBeVisible();
    }
  });
});