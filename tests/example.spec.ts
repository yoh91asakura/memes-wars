import { test, expect } from '@playwright/test';

test.describe('Emoji Mayhem TCG - Basic Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Emoji Mayhem|Meme Wars/i);
  });

  test('main game interface is visible', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main container exists
    const appContainer = page.locator('#root, .app, [data-testid="app-container"]').first();
    await expect(appContainer).toBeVisible();
  });
});
