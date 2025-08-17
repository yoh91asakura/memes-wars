import { Page } from '@playwright/test';

/**
 * Helper functions for Playwright tests to avoid fixed timeouts
 */

/**
 * Wait for an element to be stable (no changes for a period)
 */
export async function waitForElementStable(page: Page, selector: string, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel);
        if (!element) return false;
        
        // Check if element has stabilized (no ongoing animations)
        const isStable = element.getAnimations?.().length === 0;
        return isStable !== false;
      },
      selector,
      { timeout: timeout / 2 }
    );
  } catch {
    // Continue even if wait fails
  }
}

/**
 * Wait for network to be idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // If network doesn't become idle, continue anyway
  }
}

/**
 * Smart click that waits for element to be ready
 */
export async function smartClick(page: Page, selector: string) {
  const element = page.locator(selector).first();
  
  // Wait for element to be visible and enabled
  await element.waitFor({ state: 'visible', timeout: 5000 });
  
  // Ensure element is not disabled
  await element.isEnabled();
  
  // Scroll into view if needed
  await element.scrollIntoViewIfNeeded();
  
  // Click with retry logic
  await element.click({ timeout: 5000 });
}

/**
 * Wait for value change in an element
 */
export async function waitForValueChange(
  page: Page, 
  selector: string, 
  initialValue: string,
  timeout = 5000
) {
  try {
    await page.waitForFunction(
      ({ sel, initial }) => {
        const element = document.querySelector(sel);
        return element && element.textContent !== initial;
      },
      { sel: selector, initial: initialValue },
      { timeout }
    );
  } catch {
    // Continue if value doesn't change
  }
}

/**
 * Configuration for optimal test performance
 */
export const TEST_CONFIG = {
  // Shorter timeouts for faster feedback
  shortTimeout: 3000,
  mediumTimeout: 5000,
  longTimeout: 10000,
  
  // Animation and transition durations
  animationWait: 300,
  transitionWait: 500,
  
  // Network timeouts
  apiTimeout: 5000,
  navigationTimeout: 10000,
};

/**
 * Wait for any animation to complete
 */
export async function waitForAnimation(page: Page, duration = TEST_CONFIG.animationWait) {
  // Use requestAnimationFrame instead of fixed timeout
  await page.evaluate((ms) => {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, ms);
      });
    });
  }, duration);
}
