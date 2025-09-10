import { test as teardown } from '@playwright/test';

/**
 * Global teardown for Playwright 1.54.2
 * Runs once after all tests complete
 */
teardown('global teardown', async ({ page }) => {
  console.log('🧹 Starting global test teardown...');
  
  // Clean up any persistent data if needed
  // Clear localStorage/sessionStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Clear any service workers
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
  });
  
  console.log('✅ Global teardown complete - test environment cleaned');
});