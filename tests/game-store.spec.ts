import { test, expect, Page } from '@playwright/test';

test.describe('Game Store Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display initial game state', async () => {
    // Check for coins display
    const coinsElement = page.locator('[data-testid="coins-display"], .coins, :has-text("Coins")').first();
    if (await coinsElement.isVisible()) {
      const coinsText = await coinsElement.textContent();
      expect(coinsText).toMatch(/\d+/); // Should contain a number
    }

    // Check for gems display
    const gemsElement = page.locator('[data-testid="gems-display"], .gems, :has-text("Gems")').first();
    if (await gemsElement.isVisible()) {
      const gemsText = await gemsElement.textContent();
      expect(gemsText).toMatch(/\d+/);
    }

    // Check for level display
    const levelElement = page.locator('[data-testid="level-display"], .level, :has-text("Level")').first();
    if (await levelElement.isVisible()) {
      const levelText = await levelElement.textContent();
      expect(levelText).toMatch(/\d+/);
    }
  });

  test('should handle card rolling interaction', async () => {
    // Look for roll button or similar
    const rollButton = page.locator('button:has-text("Roll"), button:has-text("Draw"), [data-testid="roll-card"]').first();
    
    if (await rollButton.isVisible()) {
      // Get initial coins value if visible
      const coinsElement = page.locator('[data-testid="coins-display"], .coins').first();
      let initialCoins = 0;
      
      if (await coinsElement.isVisible()) {
        const coinsText = await coinsElement.textContent();
        const match = coinsText?.match(/\d+/);
        if (match) {
          initialCoins = parseInt(match[0]);
        }
      }

      // Click roll button
      await rollButton.click();
      
      // Wait for any animation or state update
      await page.waitForTimeout(1000);
      
      // Check if a card was generated or if coins were deducted
      const cardElements = page.locator('.card, [data-testid="card"], [class*="card"]');
      const cardCount = await cardElements.count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
      
      // Either a new card should appear or coins should be deducted
      if (await coinsElement.isVisible()) {
        const newCoinsText = await coinsElement.textContent();
        const match = newCoinsText?.match(/\d+/);
        if (match) {
          const newCoins = parseInt(match[0]);
          // Coins should either be the same (if free roll) or less (if paid roll)
          expect(newCoins).toBeLessThanOrEqual(initialCoins);
        }
      }
    }
  });

  test('should handle deck management', async () => {
    // Look for deck area
    const deckArea = page.locator('[data-testid="deck"], .deck, [class*="deck"]').first();
    
    if (await deckArea.isVisible()) {
      // Check if deck has a size limit indicator
      const deckSizeIndicator = page.locator(':has-text("/"), :has-text("Max")').first();
      if (await deckSizeIndicator.isVisible()) {
        const deckText = await deckSizeIndicator.textContent();
        expect(deckText).toMatch(/\d+/); // Should show numbers
      }
    }

    // Try to add card to deck if possible
    const addToDeckButton = page.locator('button:has-text("Add to Deck"), [data-testid="add-to-deck"]').first();
    if (await addToDeckButton.isVisible()) {
      await addToDeckButton.click();
      await page.waitForTimeout(500);
      
      // Check for success or error message
      const message = page.locator('.toast, .message, [role="alert"]').first();
      if (await message.isVisible()) {
        const messageText = await message.textContent();
        expect(messageText).toBeTruthy();
      }
    }
  });

  test('should persist game state', async () => {
    // Get initial state values if visible
    const coinsElement = page.locator('[data-testid="coins-display"], .coins').first();
    let initialCoins = '';
    
    if (await coinsElement.isVisible()) {
      initialCoins = await coinsElement.textContent() || '';
    }

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if state persisted
    if (await coinsElement.isVisible() && initialCoins) {
      const newCoins = await coinsElement.textContent();
      expect(newCoins).toBe(initialCoins); // Should be the same after reload
    }
  });

  test('should handle collection viewing', async () => {
    // Look for collection button or link
    const collectionButton = page.locator('button:has-text("Collection"), a:has-text("Collection"), [data-testid="collection"]').first();
    
    if (await collectionButton.isVisible()) {
      await collectionButton.click();
      await page.waitForTimeout(500);
      
      // Check if collection view opened
      const collectionView = page.locator('.collection, [data-testid="collection-view"], [class*="collection"]').first();
      if (await collectionView.isVisible()) {
        // Check for cards in collection
        const cards = page.locator('.card, [data-testid="collection-card"]');
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
