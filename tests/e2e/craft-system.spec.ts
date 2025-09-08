// E2E Tests for Crafting System - Following CLAUDE.md specifications
import { test, expect } from '@playwright/test';

test.describe('Crafting System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3002');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="main-app"]');
  });

  test('Should navigate to crafting page successfully', async ({ page }) => {
    // Click on crafting navigation
    await page.click('text=Crafting');
    
    // Verify we're on the craft page
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="craft-page"] h1').filter({ hasText: '🛠️ Crafting Workshop' })).toBeVisible();
  });

  test('Should display craft categories and recipes', async ({ page }) => {
    // Navigate to crafting
    await page.click('text=Crafting');
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible();
    
    // Check that categories are visible (use specific button selectors scoped to craft page)
    const craftPage = page.locator('[data-testid="craft-page"]');
    await expect(craftPage.getByRole('button', { name: 'Consumable' })).toBeVisible();
    await expect(craftPage.getByRole('button', { name: 'Permanent' })).toBeVisible();
    await expect(craftPage.getByRole('button', { name: 'Card' })).toBeVisible();
    
    // Check that recipes are loaded (should see at least Lucky Charm)
    await expect(page.locator('text=Lucky Charm')).toBeVisible();
  });

  test('Should show recipe details when selected', async ({ page }) => {
    // Navigate to crafting
    await page.click('text=Crafting');
    
    // Wait for recipes to load
    await page.waitForSelector('text=Lucky Charm');
    
    // Click on a recipe
    await page.click('text=Lucky Charm');
    
    // Check that recipe details are shown
    await expect(page.locator('text=Recipe Details')).toBeVisible();
    await expect(page.locator('text=Increases luck by 10% for next 5 rolls')).toBeVisible();
    
    // Check that cost is displayed
    await expect(page.locator('text=Required:')).toBeVisible();
    // Use case-insensitive matching for "Common"
    await expect(page.locator('text=5 common cards').or(page.locator('text=5 Common cards'))).toBeVisible();
  });

  test('Should filter recipes by category', async ({ page }) => {
    // Navigate to crafting
    await page.click('text=Crafting');
    
    // Wait for initial recipes to load
    await page.waitForSelector('text=Lucky Charm');
    
    // Click on Permanent category
    const craftPage = page.locator('[data-testid="craft-page"]');
    await craftPage.getByRole('button', { name: 'Permanent' }).click();
    
    // Should see permanent upgrades
    await expect(page.locator('text=Deck Expansion')).toBeVisible();
    await expect(page.locator('text=Master Collector')).toBeVisible();
    
    // Should not see consumables
    await expect(page.locator('text=Lucky Charm')).not.toBeVisible();
  });

  test('Should toggle craftable filter', async ({ page }) => {
    // Navigate to crafting
    await page.click('text=Crafting');
    
    // Wait for recipes to load
    await page.waitForSelector('text=Lucky Charm');
    
    // Count initial recipes
    const initialCount = await page.locator('.craft-panel__recipe-card').count();
    
    // Toggle "Show only craftable"
    await page.check('text=Show only craftable');
    
    // Should potentially show fewer recipes (depending on player resources)
    const filteredCount = await page.locator('.craft-panel__recipe-card').count();
    
    // The count should be less than or equal (some recipes might not be craftable)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('Should show craft button and requirements', async ({ page }) => {
    // Navigate to crafting
    await page.click('text=Crafting');
    
    // Select a recipe
    await page.click('text=Lucky Charm');
    
    // Should see craft button (might be disabled due to lack of resources)
    await expect(page.locator('text=Craft Item')).toBeVisible();
    
    // Should show requirements - use case-insensitive matching
    await expect(page.locator('text=5 common cards').or(page.locator('text=5 Common cards'))).toBeVisible();
  });

  test('Should display help section', async ({ page }) => {
    // Navigate to crafting
    await page.click('text=Crafting');
    
    // Click to expand help
    await page.click('text=📖 Crafting Guide');
    
    // Check help content is visible
    await expect(page.locator('text=🧪 Consumables')).toBeVisible();
    await expect(page.locator('text=⚡ Permanent Upgrades')).toBeVisible();
    await expect(page.locator('text=🎴 Special Cards')).toBeVisible();
    await expect(page.locator('text=💡 Tips')).toBeVisible();
  });

  test('Should navigate back to other pages', async ({ page }) => {
    // Start on crafting
    await page.click('text=Crafting');
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible();
    
    // Navigate to roll page
    await page.click('text=Card Rolls');
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();
    
    // Navigate to collection
    await page.click('text=Collection');
    await expect(page.locator('[data-testid="collection-page"]')).toBeVisible();
    
    // Back to crafting
    await page.click('text=Crafting');
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible();
  });

  test('Should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to crafting
    await page.click('text=Crafting');
    
    // Should still be functional on mobile
    await expect(page.locator('[data-testid="craft-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="craft-page"] h1').filter({ hasText: '🛠️ Crafting Workshop' })).toBeVisible();
    
    // Categories should be stacked on mobile
    const craftPage = page.locator('[data-testid="craft-page"]');
    await expect(craftPage.getByRole('button', { name: 'Consumable' })).toBeVisible();
    await expect(craftPage.getByRole('button', { name: 'Permanent' })).toBeVisible();
  });
});