import { test, expect } from '@playwright/test';

test.describe('Card Design Visual Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the roll screen
    await page.goto('http://localhost:3002');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display cards with proper TCG design', async ({ page }) => {
    // Click the floating roll button (more reliable)
    await page.click('.floating-roll-button');
    
    // Wait for card reveal animation
    await page.waitForSelector('.card-tcg', { timeout: 10000 });
    
    // Take screenshot of the card
    const cardElement = page.locator('.card-tcg').first();
    await expect(cardElement).toBeVisible();
    
    // Check card structure
    await expect(cardElement.locator('.card-header-tcg')).toBeVisible();
    await expect(cardElement.locator('.rarity-badge-top')).toBeVisible();
    await expect(cardElement.locator('.emojis-rewards-section')).toBeVisible();
    
    // Take a screenshot for visual regression
    await expect(cardElement).toHaveScreenshot('card-design.png');
  });

  test('should test different rarity cards', async ({ page }) => {
    
    for (let i = 0; i < 10; i++) {
      // Roll for cards
      await page.click('.floating-roll-button');
      
      // Wait for card reveal
      await page.waitForSelector('.card-tcg', { timeout: 10000 });
      
      const cardElement = page.locator('.card-tcg').first();
      
      // Check if card has proper rarity styling
      const hasRarityClass = await cardElement.evaluate((el) => {
        return Array.from(el.classList).some(cls => cls.startsWith('rarity-'));
      });
      
      expect(hasRarityClass).toBe(true);
      
      // Close the card
      await page.click('.card-tcg');
      await page.waitForTimeout(500);
    }
  });

  test('should validate card dimensions and borders', async ({ page }) => {
    // Roll for a card
    await page.click('.floating-roll-button');
    await page.waitForSelector('.card-tcg', { timeout: 10000 });
    
    const cardElement = page.locator('.card-tcg').first();
    
    // Check card dimensions (TCG ratio 2.5:3.5)
    const boundingBox = await cardElement.boundingBox();
    if (boundingBox) {
      const ratio = boundingBox.width / boundingBox.height;
      // TCG ratio should be approximately 0.714 (2.5/3.5)
      expect(ratio).toBeCloseTo(0.714, 1);
    }
    
    // Check border properties
    const borderWidth = await cardElement.evaluate((el) => {
      return window.getComputedStyle(el).borderWidth;
    });
    expect(borderWidth).toBe('3px');
    
    // Check border radius
    const borderRadius = await cardElement.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(borderRadius).toBe('12px');
  });

  test('should test emoji rewards visibility', async ({ page }) => {
    // Roll for a card
    await page.click('.floating-roll-button');
    await page.waitForSelector('.card-tcg', { timeout: 10000 });
    
    const cardElement = page.locator('.card-tcg').first();
    const rewardsSection = cardElement.locator('.emojis-rewards-section');
    
    // Check rewards section visibility
    await expect(rewardsSection).toBeVisible();
    
    // Check emoji size and visibility
    const emojiElements = rewardsSection.locator('.emoji-icon-large');
    const count = await emojiElements.count();
    
    if (count > 0) {
      const firstEmoji = emojiElements.first();
      
      // Check emoji size
      const fontSize = await firstEmoji.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      expect(fontSize).toBe('32px'); // 2em should be 32px
      
      // Check emoji is visible
      await expect(firstEmoji).toBeVisible();
    }
  });

  test('should test rarity badge positioning', async ({ page }) => {
    // Roll for a card
    await page.click('.floating-roll-button');
    await page.waitForSelector('.card-tcg', { timeout: 10000 });
    
    const cardElement = page.locator('.card-tcg').first();
    const rarityBadge = cardElement.locator('.rarity-badge-top');
    
    // Check rarity badge is visible
    await expect(rarityBadge).toBeVisible();
    
    // Check positioning (should be top-right)
    const cardBox = await cardElement.boundingBox();
    const badgeBox = await rarityBadge.boundingBox();
    
    if (cardBox && badgeBox) {
      // Badge should be in the top-right area
      expect(badgeBox.x + badgeBox.width).toBeGreaterThan(cardBox.x + cardBox.width * 0.7);
      expect(badgeBox.y).toBeLessThan(cardBox.y + cardBox.height * 0.3);
    }
  });

  test('should test responsive design', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Roll for a card
      await page.click('.floating-roll-button');
      await page.waitForSelector('.card-tcg', { timeout: 10000 });
      
      const cardElement = page.locator('.card-tcg').first();
      
      // Check card is still visible and properly sized
      await expect(cardElement).toBeVisible();
      
      const boundingBox = await cardElement.boundingBox();
      if (boundingBox) {
        // Card should not be too small or too large
        // Adjusted for actual responsive behavior
        if (viewport.width >= 1024) {
          expect(boundingBox.width).toBeGreaterThan(250);
          expect(boundingBox.width).toBeLessThan(350);
        } else if (viewport.width >= 768) {
          expect(boundingBox.width).toBeGreaterThan(200);
          expect(boundingBox.width).toBeLessThan(280);
        } else {
          expect(boundingBox.width).toBeGreaterThan(80);
          expect(boundingBox.width).toBeLessThan(220);
        }
      }
      
      // Close card
      await page.click('.card-tcg');
      await page.waitForTimeout(500);
    }
  });

  test('should test card hover effects', async ({ page }) => {
    // Roll for a card
    await page.click('.floating-roll-button');
    await page.waitForSelector('.card-tcg', { timeout: 10000 });
    
    const cardElement = page.locator('.card-tcg').first();
    
    // Get initial transform
    const initialTransform = await cardElement.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    
    // Hover over the card
    await cardElement.hover();
    
    // Wait for hover effect
    await page.waitForTimeout(300);
    
    // Check if transform changed (hover effect)
    const hoveredTransform = await cardElement.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    
    // Transform should change on hover
    expect(hoveredTransform).not.toBe(initialTransform);
  });

  test('should validate emoji rewards section design', async ({ page }) => {
    // Roll for a card
    await page.click('.floating-roll-button');
    await page.waitForSelector('.card-tcg', { timeout: 10000 });
    
    const cardElement = page.locator('.card-tcg').first();
    const rewardsSection = cardElement.locator('.emojis-rewards-section');
    
    // Check rewards section styling
    const backgroundColor = await rewardsSection.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(backgroundColor).toContain('rgba(0, 0, 0, 0.95)');
    
    // Check border
    const border = await rewardsSection.evaluate((el) => {
      return window.getComputedStyle(el).border;
    });
    expect(border).toContain('3px');
    
    // Check border radius
    const borderRadius = await rewardsSection.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(borderRadius).toBe('12px');
    
    // Take screenshot of rewards section
    await expect(rewardsSection).toHaveScreenshot('rewards-section.png');
  });
});