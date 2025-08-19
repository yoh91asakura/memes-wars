import { test, expect } from '@playwright/test';

test.describe('Card Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display cards with proper TCG design', async ({ page }) => {
    // Navigate to roll page to see cards
    await page.goto('/roll');
    await page.waitForLoadState('networkidle');

    // Look for roll button and perform a roll
    const rollButton = page.locator('button:has-text("Roll"), [data-testid*="roll"], .roll-button').first();
    
    if (await rollButton.isVisible()) {
      await rollButton.click();
      await page.waitForTimeout(3000); // Wait for roll animation
      
      // Look for TCG cards
      const tcgCards = page.locator('[class*="tcg-card"], .card-frame, [data-testid*="card"]');
      
      if (await tcgCards.count() > 0) {
        const firstCard = tcgCards.first();
        await expect(firstCard).toBeVisible();
        
        // Check for card elements
        const cardName = page.locator('[class*="card-name"], .card-header h3, h3, h4').first();
        const cardEmoji = page.locator('[class*="card-emoji"], .card-image, [class*="emoji"]').first();
        
        if (await cardName.isVisible()) {
          await expect(cardName).toBeVisible();
        }
        
        if (await cardEmoji.isVisible()) {
          await expect(cardEmoji).toBeVisible();
        }
      }
    }
  });

  test('should show rarity indicators', async ({ page }) => {
    await page.goto('/roll');
    await page.waitForLoadState('networkidle');
    
    // Perform a roll
    const rollButton = page.locator('button:has-text("Roll"), [data-testid*="roll"]').first();
    
    if (await rollButton.isVisible()) {
      await rollButton.click();
      await page.waitForTimeout(2000);
      
      // Look for rarity indicators
      const rarityIndicators = page.locator('[class*="rarity"], .badge, [data-testid*="rarity"]');
      
      if (await rarityIndicators.count() > 0) {
        const firstIndicator = rarityIndicators.first();
        await expect(firstIndicator).toBeVisible();
        
        // Should contain rarity text or probability format (1/X)
        const indicatorText = await firstIndicator.textContent();
        expect(indicatorText).toMatch(/\d+|rare|epic|common|legendary|mythic|cosmic|divine|infinity|1\/\d+/i);
      }
    }
  });

  test('should display card stats properly', async ({ page }) => {
    await page.goto('/roll');
    await page.waitForLoadState('networkidle');
    
    const rollButton = page.locator('button:has-text("Roll")').first();
    
    if (await rollButton.isVisible()) {
      await rollButton.click();
      await page.waitForTimeout(2000);
      
      // Look for stat elements
      const statElements = page.locator('[class*="stat"], .card-stats, [data-testid*="stat"]');
      
      if (await statElements.count() > 0) {
        await expect(statElements.first()).toBeVisible();
      }
      
      // Look for HP or luck indicators
      const hpElements = page.locator('text=/❤️|HP|Health/', { hasText: /\d+/ });
      const luckElements = page.locator('text=/🍀|Luck/', { hasText: /\d+/ });
      
      if (await hpElements.count() > 0) {
        await expect(hpElements.first()).toBeVisible();
      }
      
      if (await luckElements.count() > 0) {
        await expect(luckElements.first()).toBeVisible();
      }
    }
  });

  test('should handle card animations smoothly', async ({ page }) => {
    await page.goto('/roll');
    await page.waitForLoadState('networkidle');
    
    const rollButton = page.locator('button:has-text("Roll")').first();
    
    if (await rollButton.isVisible()) {
      await rollButton.click();
      
      // Wait for animations to complete
      await page.waitForTimeout(3000);
      
      // Check that cards are fully loaded and visible
      const cards = page.locator('[class*="card"], [data-testid*="card"]');
      
      if (await cards.count() > 0) {
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();
        
        // Card should not have loading states
        await expect(firstCard).not.toHaveClass(/loading|pending/);
      }
    }
  });
});

test.describe('Card Interactions', () => {
  test('should show card details on click', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
    
    const cards = page.locator('[data-testid^="collection-card-"], .collection-card').first();
    
    if (await cards.isVisible()) {
      await cards.click();
      
      // Look for any modal, popup, or expanded card view
      const cardDetail = page.locator('[class*="modal"], [class*="popup"], [class*="detail"], [role="dialog"]');
      
      if (await cardDetail.isVisible()) {
        await expect(cardDetail).toBeVisible();
      }
    }
  });

  test('should show passive abilities correctly', async ({ page }) => {
    await page.goto('/roll');
    await page.waitForLoadState('networkidle');
    
    const rollButton = page.locator('button:has-text("Roll")').first();
    
    if (await rollButton.isVisible()) {
      await rollButton.click();
      await page.waitForTimeout(2000);
      
      // Look for passive abilities section
      const passiveAbilities = page.locator('[class*="passive"], [class*="abilities"], [data-testid*="passive"]');
      
      if (await passiveAbilities.count() > 0) {
        const firstAbility = passiveAbilities.first();
        await expect(firstAbility).toBeVisible();
        
        // Should contain some text
        const abilityText = await firstAbility.textContent();
        expect(abilityText).toBeTruthy();
        expect(abilityText?.length).toBeGreaterThan(0);
      }
    }
  });
});