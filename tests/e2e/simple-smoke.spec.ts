/**
 * Simple smoke test to verify E2E setup
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page.locator('#root')).toBeVisible();
    
    // Check that we can see some basic content
    await expect(page).toHaveTitle(/Card Game/i);
  });
  
  test('should navigate to collection page', async ({ page }) => {
    await page.goto('/collection');
    
    // Basic check that the page loads
    await expect(page.locator('body')).toBeVisible();
  });
});