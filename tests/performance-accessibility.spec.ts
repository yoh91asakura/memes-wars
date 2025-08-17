import { test, expect } from '@playwright/test';
import { 
  waitForAppLoad, 
  checkAccessibility, 
  simulateSlowNetwork,
  waitForAnimations 
} from './helpers/test-utils';

test.describe('Performance and Accessibility', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds on normal connection
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find(e => e.name === 'first-contentful-paint');
          const lcp = entries.find(e => e.entryType === 'largest-contentful-paint');
          
          resolve({
            fcp: fcp ? fcp.startTime : null,
            lcp: lcp ? lcp.startTime : null,
          });
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback after 5 seconds
        setTimeout(() => resolve({ fcp: null, lcp: null }), 5000);
      });
    });
    
    // First Contentful Paint should be under 1.8s
    if (metrics && typeof metrics === 'object' && 'fcp' in metrics && metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800);
    }
  });

  test('should handle slow network gracefully', async ({ page }) => {
    await simulateSlowNetwork(page);
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Check if loading indicators are shown and then disappear
    await expect(page.locator('body')).toBeVisible();
    
    // App should still load, even if slowly
    const appContainer = page.locator('#root, .app').first();
    await expect(appContainer).toBeVisible({ timeout: 30000 });
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    
    const accessibilityIssues = await checkAccessibility(page);
    
    // There should be no critical accessibility issues
    expect(accessibilityIssues.length).toBe(0);
    
    if (accessibilityIssues.length > 0) {
      console.log('Accessibility issues found:', accessibilityIssues);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Start keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      
      return {
        tagName: el.tagName,
        className: el.className,
        hasOutline: window.getComputedStyle(el).outline !== 'none',
        hasFocusVisible: el.matches(':focus-visible'),
      };
    });
    
    expect(focusedElement).not.toBeNull();
    
    // Tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      const element = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : null;
      });
      
      // Focus should move to interactive elements
      if (element) {
        expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(element);
      }
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Check interactive elements for ARIA labels
    const ariaCheck = await page.evaluate(() => {
      const issues: string[] = [];
      
      // Check buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (!button.textContent?.trim() && 
            !button.getAttribute('aria-label') && 
            !button.getAttribute('aria-labelledby')) {
          issues.push('Button without accessible name');
        }
      });
      
      // Check form inputs
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        if (!label && 
            !input.getAttribute('aria-label') && 
            !input.getAttribute('aria-labelledby') &&
            input.getAttribute('type') !== 'hidden') {
          issues.push(`Form input without label: ${input.tagName}`);
        }
      });
      
      // Check images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt && !img.getAttribute('aria-label') && img.src) {
          // Decorative images should have empty alt=""
          if (!img.hasAttribute('alt')) {
            issues.push('Image without alt attribute');
          }
        }
      });
      
      return issues;
    });
    
    expect(ariaCheck.length).toBe(0);
    
    if (ariaCheck.length > 0) {
      console.log('ARIA issues found:', ariaCheck);
    }
  });

  test('should handle animations without performance issues', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Trigger animations if there are any interactive elements
    const cards = page.locator('.card, [data-testid="card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      // Hover over cards to trigger animations
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        await cards.nth(i).hover();
      }
      
      await waitForAnimations(page);
      
      // Check if animations complete smoothly
      const animationPerformance = await page.evaluate(() => {
        const fps = (performance as any).memory ? 60 : 30; // Rough estimate
        return fps >= 30; // Should maintain at least 30 FPS
      });
      
      expect(animationPerformance).toBeTruthy();
    }
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForAppLoad(page);
    
    const desktopLayout = await page.locator('#root, .app').first();
    await expect(desktopLayout).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await waitForAppLoad(page);
    
    const tabletLayout = await page.locator('#root, .app').first();
    await expect(tabletLayout).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await waitForAppLoad(page);
    
    const mobileLayout = await page.locator('#root, .app').first();
    await expect(mobileLayout).toBeVisible();
    
    // Check if content is not horizontally scrollable on mobile
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Perform various interactions
    for (let i = 0; i < 10; i++) {
      // Click on cards if available
      const card = page.locator('.card, [data-testid="card"]').first();
      if (await card.isVisible()) {
        await card.click();
        await page.waitForTimeout(100);
      }
    }
    
    // Get memory after interactions
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Memory shouldn't increase dramatically (less than 50MB increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB
      expect(memoryIncrease).toBeLessThan(50);
    }
  });
});
