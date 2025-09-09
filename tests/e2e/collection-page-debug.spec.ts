import { test, expect } from '@playwright/test';

test.describe('CollectionPage Component Debug', () => {
  test('debug why CollectionPage shows but has no cards', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForTimeout(2000);
    
    // Add test cards first
    await page.click('[data-testid="add-test-cards"]');
    await page.waitForTimeout(2000);
    
    // Check if collection page is visible
    const collectionPage = await page.locator('[data-testid="collection-page"]');
    await expect(collectionPage).toBeVisible();
    
    // Check page content
    const pageContent = await collectionPage.textContent();
    console.log('CollectionPage content:', pageContent?.substring(0, 300));
    
    // Check if we're seeing empty state or actual cards
    const emptyState = await page.locator('.collection-page--empty').isVisible().catch(() => false);
    const hasContent = await page.locator('.collection-page__content').isVisible().catch(() => false);
    const hasCards = await page.locator('.collection-page__cards').isVisible().catch(() => false);
    
    console.log('Page state:', { emptyState, hasContent, hasCards });
    
    // Check store state
    const storeState = await page.evaluate(() => {
      const cardsStore = (window as any).useCardsStore;
      if (!cardsStore) return { error: 'Store not accessible' };
      
      const state = cardsStore.getState();
      return {
        collectionLength: state.collection?.length || 0,
        filteredLength: state.getFilteredCards()?.length || 0,
        viewMode: state.viewMode,
        showStacks: state.showStacks,
        filters: state.filters
      };
    });
    
    console.log('Store state:', storeState);
    
    // If empty state is showing when cards exist, it's a logic bug
    if (emptyState && storeState.collectionLength > 0) {
      console.log('BUG: Empty state showing despite cards in collection');
      
      // Take screenshot of the bug
      await page.screenshot({
        path: 'tests/screenshots/collection-empty-state-bug.png',
        fullPage: true
      });
    }
    
    // If content area exists but no cards, check displayData
    if (hasContent && !hasCards && storeState.collectionLength > 0) {
      console.log('BUG: Content area exists but no cards displaying');
      
      // Check if displayData is empty in the component
      const displayDataDebug = await page.evaluate(() => {
        // Try to access React component state (this is tricky)
        const collectionElements = Array.from(document.querySelectorAll('[data-testid="collection-page"] *'));
        
        // Look for any CollectionCard elements
        const collectionCards = document.querySelectorAll('.collection-card, [class*="collection-card"]');
        const tcgCards = document.querySelectorAll('.tcgCard, [class*="tcgCard"], [class*="TCGCard"]');
        
        return {
          collectionCards: collectionCards.length,
          tcgCards: tcgCards.length,
          contentHtml: document.querySelector('.collection-page__content')?.innerHTML?.substring(0, 500) || 'No content area'
        };
      });
      
      console.log('Display elements debug:', displayDataDebug);
      
      // Take screenshot for debugging
      await page.screenshot({
        path: 'tests/screenshots/collection-no-cards-bug.png',
        fullPage: true
      });
    }
    
    // If we have cards, check their visibility
    if (hasCards) {
      const cardElements = await page.locator('.collection-page__card-wrapper');
      const cardCount = await cardElements.count();
      console.log('Card wrapper count:', cardCount);
      
      if (cardCount > 0) {
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = cardElements.nth(i);
          const isVisible = await card.isVisible();
          const cardHtml = await card.innerHTML();
          console.log(`Card wrapper ${i}:`, { isVisible, hasContent: cardHtml.length > 0 });
        }
        
        // Check for CollectionCard components
        const collectionCards = await page.locator('.collection-card').count();
        console.log('CollectionCard components found:', collectionCards);
        
        // Take screenshot of working state
        await page.screenshot({
          path: 'tests/screenshots/collection-cards-working.png',
          fullPage: true
        });
      }
    }
    
    // Check for any React errors
    const consoleErrors = await page.evaluate(() => {
      return (window as any).collectedErrors || 'No errors collected';
    });
    console.log('Console errors:', consoleErrors);
  });
});