import { test as setup, expect } from '@playwright/test';

/**
 * Global setup for Playwright 1.54.2
 * Runs once before all tests start
 */
setup('global setup', async ({ page }) => {
  console.log('🚀 Starting global test setup...');
  
  // Verify the React app is running
  await page.goto('/');
  
  // Wait for the app to load completely
  await expect(page.locator('[data-testid="app"], #root')).toBeVisible({ timeout: 30000 });
  
  // Check for any critical errors in console
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Wait a bit to collect any immediate errors
  await page.waitForTimeout(2000);
  
  // Log any critical startup errors
  if (errors.length > 0) {
    console.warn('⚠️  Console errors detected during startup:', errors);
  }
  
  console.log('✅ Global setup complete - React app is ready for testing');
});