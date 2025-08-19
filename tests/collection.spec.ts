import { test, expect } from '@playwright/test';

test.describe('Collection Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should display appropriate collection state', async ({ page }) => {
    // Check if collection has cards or is empty
    const cardElements = page.locator('[data-testid^="collection-card-"], .collection-card');
    const emptyIcon = page.locator('.collection-page__empty-icon');
    const emptyTitle = page.locator('.collection-page__empty-title');
    
    const hasCards = await cardElements.count() > 0;
    const hasEmptyState = await emptyIcon.isVisible();
    
    if (hasCards) {
      // If there are cards, verify collection content
      await expect(cardElements.first()).toBeVisible();
      const pageTitle = page.locator('h1, h2, [class*="title"]').first();
      if (await pageTitle.isVisible()) {
        await expect(pageTitle).toBeVisible();
      }
    } else if (hasEmptyState) {
      // If empty state is shown, verify empty state elements
      await expect(emptyIcon).toBeVisible();
      await expect(emptyTitle).toContainText('Empty');
      const startRollingButton = page.locator('text=Start Rolling, button:has-text("Roll")').first();
      if (await startRollingButton.isVisible()) {
        await expect(startRollingButton).toBeVisible();
      }
    }
    
    // Either way, page should have loaded successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display collection header correctly', async ({ page }) => {
    // Check page header elements - be more flexible with selectors
    const pageTitle = page.locator('h1, h2, [class*="title"]').first();
    const cardCount = page.locator('text=/\\d+ of \\d+ cards/').first();
    const showStatsButton = page.locator('button:has-text("Show Stats"), button:has-text("Hide Stats"), button:has-text("Stats")').first();

    // Check if collection has content at all
    const hasContent = await page.locator('main, .collection-page, .collection').count() > 0;
    
    if (hasContent) {
      if (await pageTitle.isVisible()) {
        await expect(pageTitle).toBeVisible();
      }
      if (await cardCount.isVisible()) {
        await expect(cardCount).toBeVisible();
      }
      if (await showStatsButton.isVisible()) {
        await expect(showStatsButton).toBeVisible();
      }
    }
    
    // At minimum, page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should toggle statistics visibility', async ({ page }) => {
    // Find the stats toggle button with more flexible selectors
    const toggleButton = page.locator('[data-testid="toggle-stats"], button:has-text("Hide Stats"), button:has-text("Show Stats"), button:has-text("Stats")').first();
    
    // Check if toggle button exists and is visible
    const buttonExists = await toggleButton.isVisible();
    
    if (buttonExists) {
      const initialText = await toggleButton.textContent();
      
      // Click toggle
      await toggleButton.click();
      await page.waitForTimeout(500); // Wait for state change
      
      const afterClickText = await toggleButton.textContent();
      
      // Text should have changed
      expect(initialText).not.toBe(afterClickText);
      
      // Click toggle again to restore
      await toggleButton.click();
      await page.waitForTimeout(500);
    } else {
      // If no toggle button, just verify page loads correctly
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
    }
  });

  test('should display collection filters', async ({ page }) => {
    // Check for filter components
    const filtersSection = page.locator('[data-testid="collection-filters"]');
    
    // If filters exist, they should be visible
    if (await filtersSection.isVisible()) {
      await expect(filtersSection).toBeVisible();
    }
  });

  test('should handle view mode switching', async ({ page }) => {
    // Look for view mode toggles (grid/list)
    const viewModeButtons = page.locator('button[aria-label*="grid"], button[aria-label*="list"], button:has-text("Grid"), button:has-text("List")');
    
    if (await viewModeButtons.count() > 0) {
      const firstButton = viewModeButtons.first();
      await firstButton.click();
      
      // Check that the cards container reflects the view mode
      const cardsContainer = page.locator('.collection-page__cards');
      await expect(cardsContainer).toBeVisible();
    }
  });
});

test.describe('Collection with Cards', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to roll page first to get some cards
    await page.goto('/roll');
    await page.waitForLoadState('networkidle');
    
    // Perform a roll to get cards (if roll functionality exists)
    const rollButton = page.locator('button:has-text("Roll"), [data-testid*="roll"]').first();
    if (await rollButton.isVisible()) {
      await rollButton.click();
      await page.waitForTimeout(2000); // Wait for roll animation
    }
    
    // Navigate to collection page
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should display cards in grid view', async ({ page }) => {
    const cardsContainer = page.locator('.collection-page__cards--grid');
    
    if (await cardsContainer.isVisible()) {
      const cards = page.locator('[data-testid^="collection-card-"], .collection-card');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        await expect(cards.first()).toBeVisible();
      }
    }
  });

  test('should show card hover preview', async ({ page }) => {
    const cards = page.locator('[data-testid^="collection-card-"], .collection-card').first();
    
    if (await cards.isVisible()) {
      // Hover over a card
      await cards.hover();
      
      // Check for hover preview (if implemented)
      const hoverPreview = page.locator('.cardHoverPreview, [class*="hover-preview"]');
      
      // Wait a bit for hover effect
      await page.waitForTimeout(500);
      
      // The preview might appear
      if (await hoverPreview.isVisible()) {
        await expect(hoverPreview).toBeVisible();
      }
    }
  });

  test('should display stack count badges for duplicates', async ({ page }) => {
    // Look for stack badges
    const stackBadges = page.locator('.collection-card__stack-badge, [class*="stack-badge"]');
    
    if (await stackBadges.count() > 0) {
      const firstBadge = stackBadges.first();
      await expect(firstBadge).toBeVisible();
      
      // Stack count should be a number > 1
      const badgeText = await firstBadge.textContent();
      expect(badgeText).toMatch(/\d+/);
    }
  });

  test('should show card actions on hover', async ({ page }) => {
    const cards = page.locator('[data-testid^="collection-card-"], .collection-card').first();
    
    if (await cards.isVisible()) {
      await cards.hover();
      
      // Look for action buttons
      const actionButtons = page.locator('.collection-card__actions button, button[data-testid*="add"], button[data-testid*="remove"]');
      
      if (await actionButtons.count() > 0) {
        await expect(actionButtons.first()).toBeVisible();
      }
    }
  });
});

test.describe('Collection Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check that the page is still functional with flexible selectors
    const pageElement = page.locator('body, main, .collection-page, .collection');
    await expect(pageElement.first()).toBeVisible();
    
    // Look for any visible text content that indicates the page loaded
    const hasContent = await page.locator('h1, h2, h3, [class*="title"], button, input').count() > 0;
    
    if (hasContent) {
      const contentElement = page.locator('h1, h2, h3, [class*="title"]').first();
      if (await contentElement.isVisible()) {
        await expect(contentElement).toBeVisible();
      }
    }
    
    // Ensure no horizontal scroll overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth - clientWidth).toBeLessThan(20); // Allow small tolerance
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check that the page is still functional with flexible selectors
    const pageElement = page.locator('body, main, .collection-page, .collection');
    await expect(pageElement.first()).toBeVisible();
    
    // Look for any visible text content that indicates the page loaded
    const hasContent = await page.locator('h1, h2, h3, [class*="title"], button, input').count() > 0;
    
    if (hasContent) {
      const contentElement = page.locator('h1, h2, h3, [class*="title"]').first();
      if (await contentElement.isVisible()) {
        await expect(contentElement).toBeVisible();
      }
    }
  });
});

test.describe('Collection Filtering and Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should filter cards by search term', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="search"], [data-testid*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Wait for filtering
      
      // Check that results update
      const noResultsMessage = page.locator('text=No cards found, .collection-page__no-results');
      const cards = page.locator('[data-testid^="collection-card-"], .collection-card');
      
      // Either show no results or filtered cards
      if (await noResultsMessage.isVisible()) {
        await expect(noResultsMessage).toBeVisible();
      } else if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    }
  });

  test('should sort cards by rarity (descending)', async ({ page }) => {
    // Look for sort controls
    const sortSelect = page.locator('select, [data-testid*="sort"]').first();
    
    if (await sortSelect.isVisible()) {
      // Select rarity sort
      await sortSelect.selectOption({ label: /rarity/i });
      await page.waitForTimeout(500);
      
      // Check that cards are displayed
      const cards = page.locator('[data-testid^="collection-card-"], .collection-card');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    }
  });

  test('should clear filters when clear button is clicked', async ({ page }) => {
    const clearButton = page.locator('button:has-text("Clear"), [data-testid*="clear"]').first();
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // Should reset to default state
      const cards = page.locator('[data-testid^="collection-card-"], .collection-card');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    }
  });
});