import { test, expect } from '@playwright/test';

test.describe('Page Navigation Debug', () => {
  test('debug what page is actually rendering when navigating to collection', async ({ page }) => {
    // Go to root first
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Check what page we start on
    const initialPageContent = await page.textContent('body');
    console.log('Initial page content preview:', initialPageContent?.substring(0, 200));
    
    // Navigate to collection page  
    console.log('Navigating to /collection...');
    await page.goto('/collection');
    await page.waitForTimeout(3000);
    
    // Check if PhaseContainer exists
    const phaseContainers = await page.locator('[class*="phase-container"]').count();
    console.log('PhaseContainer elements found:', phaseContainers);
    
    // Check what's actually in the body
    const bodyContent = await page.textContent('body');
    console.log('Body content after navigation:', bodyContent?.substring(0, 300));
    
    // Check all testIds present
    const allTestIds = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[data-testid]'));
      return elements.map(el => el.getAttribute('data-testid'));
    });
    console.log('All testIds found:', allTestIds);
    
    // Look for any page-related elements
    const pageElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[class*="page"], [data-testid*="page"]'));
      return elements.map(el => ({
        className: el.className,
        testId: el.getAttribute('data-testid'),
        tagName: el.tagName,
        visible: el.offsetHeight > 0 && el.offsetWidth > 0
      }));
    });
    console.log('Page-related elements:', pageElements);
    
    // Check React component tree (if possible)
    const reactDebug = await page.evaluate(() => {
      // Check if React DevTools is available
      const reactDevtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (reactDevtools) {
        return { hasReactDevtools: true };
      }
      
      // Check for error boundaries or render errors
      const errors = (window as any).collectedErrors || [];
      return { 
        hasReactDevtools: false,
        errors: errors.length,
        firstError: errors[0] || 'none'
      };
    });
    console.log('React debug info:', reactDebug);
    
    // Take a screenshot to see what's actually rendered
    await page.screenshot({
      path: 'tests/screenshots/navigation-debug.png',
      fullPage: true
    });
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if any error messages are visible
    const errorElements = await page.locator('text=/error|Error|ERROR/i').count();
    console.log('Error elements found:', errorElements);
    
    if (errorElements > 0) {
      const firstError = await page.locator('text=/error|Error|ERROR/i').first().textContent();
      console.log('First error message:', firstError);
    }
  });
});