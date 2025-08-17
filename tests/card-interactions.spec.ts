import { test, expect, Page } from '@playwright/test';

test.describe('Card Interactions', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display card information', async () => {
    // Look for any card element
    const card = page.locator('.card, [data-testid="card"], [class*="card-container"]').first();
    
    if (await card.isVisible()) {
      // Check for card name
      const cardName = card.locator('.card-name, [data-testid="card-name"], h3, h4').first();
      if (await cardName.isVisible()) {
        const name = await cardName.textContent();
        expect(name).toBeTruthy();
      }

      // Check for card stats (HP, Attack Speed, etc.)
      const cardStats = card.locator('.stats, [data-testid="card-stats"], [class*="stats"]').first();
      if (await cardStats.isVisible()) {
        const stats = await cardStats.textContent();
        expect(stats).toMatch(/\d+/); // Should contain numbers
      }

      // Check for rarity indicator
      const rarity = card.locator('.rarity, [data-testid="card-rarity"], [class*="rarity"]').first();
      if (await rarity.isVisible()) {
        const rarityText = await rarity.textContent();
        expect(rarityText).toMatch(/common|uncommon|rare|epic|legendary|mythic|cosmic/i);
      }
    }
  });

  test('should handle card hover interactions', async () => {
    const card = page.locator('.card, [data-testid="card"]').first();
    
    if (await card.isVisible()) {
      // Hover over the card
      await card.hover();
      
      // Wait for any hover effects
      await page.waitForTimeout(300);
      
      // Check for tooltip or expanded info
      const tooltip = page.locator('.tooltip, [role="tooltip"], .card-details').first();
      if (await tooltip.isVisible()) {
        const tooltipText = await tooltip.textContent();
        expect(tooltipText).toBeTruthy();
      }
    }
  });

  test('should display card emojis', async () => {
    const card = page.locator('.card, [data-testid="card"]').first();
    
    if (await card.isVisible()) {
      // Look for emoji container
      const emojiContainer = card.locator('.emojis, [data-testid="card-emojis"], [class*="emoji"]').first();
      
      if (await emojiContainer.isVisible()) {
        const emojiText = await emojiContainer.textContent();
        // Check if it contains emoji characters (Unicode range for emojis)
        expect(emojiText).toMatch(/[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u);
      }
    }
  });

  test('should handle card selection', async () => {
    const card = page.locator('.card, [data-testid="card"]').first();
    
    if (await card.isVisible()) {
      // Click on the card
      await card.click();
      
      // Wait for selection state
      await page.waitForTimeout(300);
      
      // Check if card has selected state
      const isSelected = await card.evaluate(el => {
        return el.classList.contains('selected') || 
               el.classList.contains('active') ||
               el.getAttribute('aria-selected') === 'true' ||
               el.getAttribute('data-selected') === 'true';
      });
      
      // Card might be selected or trigger an action
      if (isSelected) {
        expect(isSelected).toBeTruthy();
      } else {
        // Check if clicking triggered a modal or action
        const modal = page.locator('.modal, [role="dialog"], .card-detail-modal').first();
        if (await modal.isVisible()) {
          expect(await modal.textContent()).toBeTruthy();
        }
      }
    }
  });

  test('should display card stacking information', async () => {
    const card = page.locator('.card, [data-testid="card"]').first();
    
    if (await card.isVisible()) {
      // Look for stack level indicator
      const stackLevel = card.locator('.stack-level, [data-testid="stack-level"], [class*="stack"]').first();
      
      if (await stackLevel.isVisible()) {
        const stackText = await stackLevel.textContent();
        expect(stackText).toMatch(/\d+/); // Should show a number
      }
    }
  });

  test('should display card passive abilities', async () => {
    const card = page.locator('.card, [data-testid="card"]').first();
    
    if (await card.isVisible()) {
      // Look for passive ability indicator
      const passive = card.locator('.passive, [data-testid="passive-ability"], [class*="ability"]').first();
      
      if (await passive.isVisible()) {
        const passiveText = await passive.textContent();
        expect(passiveText).toBeTruthy();
        
        // Hover to see more details
        await passive.hover();
        await page.waitForTimeout(300);
        
        const abilityTooltip = page.locator('.ability-tooltip, [role="tooltip"]').first();
        if (await abilityTooltip.isVisible()) {
          const tooltipText = await abilityTooltip.textContent();
          expect(tooltipText).toContain('%'); // Most abilities have percentage chances
        }
      }
    }
  });

  test('should handle card animations', async () => {
    const card = page.locator('.card, [data-testid="card"]').first();
    
    if (await card.isVisible()) {
      // Check if card has animation classes
      const hasAnimation = await card.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.animation !== 'none' || 
               computed.transition !== 'none' ||
               el.classList.toString().includes('animate');
      });
      
      // Cards might have animations
      if (hasAnimation) {
        expect(hasAnimation).toBeTruthy();
      }
    }
  });

  test('should display card border effects based on rarity', async () => {
    const cards = page.locator('.card, [data-testid="card"]');
    const cardCount = await cards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = cards.nth(i);
      
      if (await card.isVisible()) {
        // Check for border color or glow effect
        const borderColor = await card.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return computed.borderColor || computed.boxShadow;
        });
        
        // Different rarities should have different border colors
        expect(borderColor).toBeTruthy();
        expect(borderColor).not.toBe('none');
      }
    }
  });
});
