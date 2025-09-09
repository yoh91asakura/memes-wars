// Diagnostic test to understand what's happening
import { test, expect } from '@playwright/test';

test.describe('Diagnostic Tests', () => {
  test('Should diagnose currency display issue', async ({ page }) => {
    console.log('🔍 Starting diagnostic...');
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Take a screenshot to see what we have
    await page.screenshot({ path: 'diagnostic-initial.png' });

    // Check if main app is loaded
    const mainApp = await page.locator('[data-testid="main-app"]').isVisible();
    console.log(`Main app visible: ${mainApp}`);

    // Check if header exists
    const header = await page.locator('.main-layout__header').isVisible();
    console.log(`Header visible: ${header}`);

    // Check if stats area exists
    const stats = await page.locator('.main-layout__stats').isVisible();
    console.log(`Stats area visible: ${stats}`);

    // Count all currency-related elements
    const currencyElements = await page.locator('.currency-item, .main-layout__stat, [class*="currency"]').count();
    console.log(`Currency elements found: ${currencyElements}`);

    // Check for gold specifically
    const goldIcon = await page.locator('text=🪙').count();
    console.log(`Gold icons found: ${goldIcon}`);

    const goldElements = await page.locator('[class*="gold"], .currency-item:has(.currency-icon)').count();
    console.log(`Gold-related elements: ${goldElements}`);

    // Check if reset button exists
    const resetButton = await page.locator('[data-testid="reset-game-button"]').isVisible();
    console.log(`Reset button visible: ${resetButton}`);

    if (resetButton) {
      console.log('🔄 Testing reset...');
      await page.click('[data-testid="reset-game-button"]');
      page.on('dialog', async dialog => {
        console.log('Reset dialog:', dialog.message());
        await dialog.accept();
      });
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'diagnostic-after-reset.png' });

      // Check again after reset
      const goldAfterReset = await page.locator('text=🪙').count();
      console.log(`Gold icons after reset: ${goldAfterReset}`);
    }

    // Check browser console for errors
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    
    await page.waitForTimeout(1000);
    
    console.log('Browser console logs:');
    logs.forEach(log => console.log(log));

    // Get the actual HTML to see what's rendered
    const headerHTML = await page.locator('.main-layout__header').innerHTML().catch(() => 'Not found');
    console.log('Header HTML:', headerHTML);

    const statsHTML = await page.locator('.main-layout__stats').innerHTML().catch(() => 'Not found');
    console.log('Stats HTML:', statsHTML);

    console.log('✅ Diagnostic completed');
  });
});