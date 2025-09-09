import { test, expect } from '@playwright/test';

test.describe('Final Card Display Debug', () => {
  test('debug why cards exist but dont render', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection');
    await page.waitForTimeout(2000);
    
    // Add test cards
    await page.click('[data-testid="add-test-cards"]');
    await page.waitForTimeout(2000);
    
    // Take screenshot after adding
    await page.screenshot({ 
      path: 'tests/screenshots/final-debug.png',
      fullPage: true 
    });
    
    // Debug the collection page component state
    const collectionDebug = await page.evaluate(() => {
      const cardsStore = (window as any).useCardsStore;
      if (!cardsStore) return { error: 'Store not found' };
      
      const state = cardsStore.getState();
      
      // Check specific filtering functions
      const filteredCards = state.getFilteredCards();
      const stackedCards = state.getStackedCards();
      
      return {
        // Basic collection data
        collectionLength: state.collection?.length || 0,
        filteredCardsLength: filteredCards?.length || 0,
        stackedCardsLength: stackedCards?.length || 0,
        
        // Current filters and view settings
        currentFilters: state.filters,
        viewMode: state.viewMode,
        showStacks: state.showStacks,
        
        // Check if the filtering is working correctly
        firstFilteredCard: filteredCards?.[0] ? {
          id: filteredCards[0].id,
          name: filteredCards[0].name,
          rarity: filteredCards[0].rarity
        } : null,
        
        firstStackedCard: stackedCards?.[0] ? {
          cardData: stackedCards[0].cardData ? {
            id: stackedCards[0].cardData.id,
            name: stackedCards[0].cardData.name
          } : null,
          count: stackedCards[0].count
        } : null
      };
    });
    
    console.log('Collection component debug:', JSON.stringify(collectionDebug, null, 2));
    
    // Check the DOM for collection page elements
    const domDebug = await page.evaluate(() => {
      return {
        // Collection page element
        hasCollectionPage: !!document.querySelector('[data-testid="collection-page"]'),
        
        // Check for displayData elements
        hasDisplayContent: !!document.querySelector('.collection-page__content'),
        hasNoResults: !!document.querySelector('.collection-page__no-results'),
        hasCardsContainer: !!document.querySelector('.collection-page__cards'),
        
        // Check for CollectionCard components
        collectionCardElements: document.querySelectorAll('[class*="collection-card"]').length,
        motionDivs: document.querySelectorAll('.collection-page__card-wrapper').length,
        
        // Check the content text
        pageText: document.querySelector('[data-testid="collection-page"]')?.textContent?.substring(0, 500) || 'not found'
      };
    });
    
    console.log('DOM debug:', domDebug);
    
    // Try to force re-render by changing filters
    await page.evaluate(() => {
      const cardsStore = (window as any).useCardsStore;
      if (cardsStore) {
        const state = cardsStore.getState();
        // Try different view modes
        state.setViewMode('grid');
        state.setFilters({ search: '', rarity: 'all', sortBy: 'name', sortOrder: 'asc' });
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check DOM again after filter changes
    const domAfterFilter = await page.evaluate(() => {
      return {
        collectionCardElements: document.querySelectorAll('[class*="collection-card"]').length,
        tcgCardElements: document.querySelectorAll('[class*="tcgCard"], [class*="TCGCard"]').length,
        hasNoResults: !!document.querySelector('.collection-page__no-results'),
        pageContentHTML: document.querySelector('.collection-page__content')?.innerHTML?.substring(0, 300) || 'not found'
      };
    });
    
    console.log('DOM after filter changes:', domAfterFilter);
    
    // Check if there are React errors in console
    const consoleErrors = await page.evaluate(() => {
      return {
        reactErrors: (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot ? 'React DevTools available' : 'No React DevTools',
        anyErrors: (window as any).errors || 'No stored errors'
      };
    });
    
    console.log('Console debug:', consoleErrors);
    
    await page.screenshot({ 
      path: 'tests/screenshots/after-filter-debug.png',
      fullPage: true 
    });
  });
});