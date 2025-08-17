import { Page, expect } from '@playwright/test';

/**
 * Wait for the application to be fully loaded
 */
export async function waitForAppLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('#root, .app', { state: 'visible' });
}

/**
 * Get the current game state from the page
 */
export async function getGameState(page: Page) {
  const state = await page.evaluate(() => {
    // Try to access the Zustand store if it's exposed
    const store = (window as any).__gameStore;
    if (store) {
      return store.getState();
    }
    
    // Otherwise, scrape visible values
    const coins = document.querySelector('[data-testid="coins-display"], .coins')?.textContent;
    const gems = document.querySelector('[data-testid="gems-display"], .gems')?.textContent;
    const level = document.querySelector('[data-testid="level-display"], .level')?.textContent;
    
    return {
      coins: coins ? parseInt(coins.match(/\d+/)?.[0] || '0') : 0,
      gems: gems ? parseInt(gems.match(/\d+/)?.[0] || '0') : 0,
      level: level ? parseInt(level.match(/\d+/)?.[0] || '1') : 1,
    };
  });
  
  return state;
}

/**
 * Mock API responses for testing
 */
export async function mockAPIResponses(page: Page) {
  await page.route('**/api/**', route => {
    const url = route.request().url();
    
    // Mock different API endpoints
    if (url.includes('/api/cards')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cards: [
            {
              id: 'test-card-1',
              name: 'Test Card',
              rarity: 'COMMON',
              hp: 100,
              attackSpeed: 1.5,
              emojis: [{ character: '😀', damage: 10, speed: 200, trajectory: 'straight' }],
            }
          ]
        })
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Helper to check if an element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}

/**
 * Helper to wait for animations to complete
 */
export async function waitForAnimations(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const animations = document.getAnimations();
      Promise.all(animations.map(animation => animation.finished)).then(() => resolve());
    });
  });
}

/**
 * Helper to take a screenshot with a specific naming convention
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Helper to check accessibility
 */
export async function checkAccessibility(page: Page) {
  // Check for basic accessibility attributes
  const results = await page.evaluate(() => {
    const issues: string[] = [];
    
    // Check images for alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });
    
    // Check buttons for accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        issues.push('Button missing accessible name');
      }
    });
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level - lastLevel > 1) {
        issues.push(`Heading hierarchy issue: ${heading.tagName} after H${lastLevel}`);
      }
      lastLevel = level;
    });
    
    return issues;
  });
  
  return results;
}

/**
 * Helper to simulate network conditions
 */
export async function simulateSlowNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50 * 1024, // 50kb/s
    uploadThroughput: 20 * 1024,   // 20kb/s
    latency: 500 // 500ms latency
  });
}

/**
 * Helper to reset the game state
 */
export async function resetGameState(page: Page) {
  await page.evaluate(() => {
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Reset Zustand store if available
    const store = (window as any).__gameStore;
    if (store && store.getState().reset) {
      store.getState().reset();
    }
  });
  
  await page.reload();
  await waitForAppLoad(page);
}
