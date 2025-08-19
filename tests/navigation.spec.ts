import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should load without errors
    await expect(page).toHaveTitle(/Card Game|Meme War|Game/i);
    
    // Should not show any error messages
    const errorMessages = page.locator('text=/error|404|not found/i');
    if (await errorMessages.count() > 0) {
      await expect(errorMessages).not.toBeVisible();
    }
  });

  test('should navigate to roll page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for roll navigation link
    const rollLink = page.locator('a[href="/roll"], a:has-text("Roll"), nav a:has-text("Roll")').first();
    
    if (await rollLink.isVisible()) {
      await rollLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on roll page
      expect(page.url()).toContain('/roll');
      
      // Should show roll interface
      const rollButton = page.locator('button:has-text("Roll"), [data-testid*="roll"]');
      if (await rollButton.count() > 0) {
        await expect(rollButton.first()).toBeVisible();
      }
    } else {
      // If no navigation, go directly to roll page
      await page.goto('/roll');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/roll');
    }
  });

  test('should navigate to collection page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for collection navigation link
    const collectionLink = page.locator('a[href="/collection"], a:has-text("Collection"), nav a:has-text("Collection")').first();
    
    if (await collectionLink.isVisible()) {
      await collectionLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on collection page
      expect(page.url()).toContain('/collection');
      
      // Should show collection interface
      const collectionTitle = page.locator('text=Collection, h1, h2');
      if (await collectionTitle.count() > 0) {
        await expect(collectionTitle.first()).toBeVisible();
      }
    } else {
      // If no navigation, go directly to collection page
      await page.goto('/collection');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/collection');
    }
  });

  test('should navigate to combat page if it exists', async ({ page }) => {
    await page.goto('/combat');
    await page.waitForLoadState('networkidle');
    
    // Combat page might not be fully implemented, so just check it doesn't crash
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Should not show JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Wait a moment to catch any errors
    await page.waitForTimeout(1000);
    
    // If there are critical errors, they should not be about missing components
    const criticalErrors = errors.filter(error => 
      !error.includes('ResizeObserver') && 
      !error.includes('favicon') &&
      !error.includes('Extension')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');
    
    // Should either show a 404 page or redirect to homepage
    const is404 = page.url().includes('nonexistent-page');
    const isRedirected = page.url() === new URL('/', page.url()).href;
    
    if (is404) {
      // If showing 404, should have some indication
      const notFoundText = page.locator('text=/404|not found|page not found/i');
      if (await notFoundText.count() > 0) {
        await expect(notFoundText.first()).toBeVisible();
      }
    } else {
      // If redirected, should be on a valid page
      expect(isRedirected).toBe(true);
    }
  });
});

test.describe('App Functionality', () => {
  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable warnings
    const criticalErrors = errors.filter(error => 
      !error.includes('ResizeObserver') && 
      !error.includes('favicon.ico') &&
      !error.includes('Lockdown failed') && // MetaMask extension error
      !error.includes('Symbol') &&
      !error.includes('Extension') &&
      !error.includes('chrome-extension')
    );
    
    // Should have no critical errors
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle viewport changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Page should still be functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should not have horizontal scroll (unless expected)
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Allow some tolerance for scrollbars
      expect(scrollWidth - clientWidth).toBeLessThan(20);
    }
  });

  test('should load CSS styles correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that styles are loaded by testing some basic styling
    const body = page.locator('body');
    
    // Body should have some basic styles
    const bodyStyles = await body.evaluate((el) => {
      const computedStyle = getComputedStyle(el);
      return {
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        fontFamily: computedStyle.fontFamily,
      };
    });
    
    // Should have some styling applied (not all default values)
    expect(bodyStyles.fontFamily).not.toBe('');
    expect(bodyStyles.fontFamily).not.toBe('initial');
  });
});