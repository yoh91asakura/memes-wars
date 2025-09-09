import { test, expect } from '@playwright/test';

test.describe('Store Debug', () => {
  test('debug store state and filtering', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection');
    await page.waitForTimeout(2000);
    
    // Add test cards
    await page.click('[data-testid="add-test-cards"]');
    await page.waitForTimeout(1000);
    
    // Debug store state
    const storeDebug = await page.evaluate(() => {
      const cardsStore = (window as any).useCardsStore;
      if (!cardsStore) return { error: 'Store not accessible' };
      
      const state = cardsStore.getState();
      
      return {
        // Basic state
        collectionLength: state.collection?.length || 0,
        collection: state.collection?.map((card: any) => ({
          id: card.id,
          name: card.name,
          rarity: card.rarity
        })) || [],
        
        // Filters
        filters: state.filters,
        viewMode: state.viewMode,
        showStacks: state.showStacks,
        
        // Functions availability
        hasGetFilteredCards: typeof state.getFilteredCards === 'function',
        hasGetStackedCards: typeof state.getStackedCards === 'function',
        
        // Try to call filtering functions
        filteredCards: state.getFilteredCards ? state.getFilteredCards().length : 'function not found',
        stackedCards: state.getStackedCards ? state.getStackedCards().length : 'function not found',
        
        // All available functions
        storeMethods: Object.keys(state).filter(key => typeof state[key] === 'function')
      };
    });
    
    console.log('Store debug info:', JSON.stringify(storeDebug, null, 2));
    
    // Check React component state
    const componentState = await page.evaluate(() => {
      // Look for the CollectionPage component in React DevTools data if available
      const collectionPageElement = document.querySelector('[data-testid="collection-page"]');
      if (!collectionPageElement) return { error: 'Collection page element not found' };
      
      // Try to access React fiber or any debug data
      const keys = Object.keys(collectionPageElement);
      const reactFiberKey = keys.find(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance'));
      
      return {
        hasCollectionElement: !!collectionPageElement,
        elementClassName: collectionPageElement.className,
        reactFiberKey: reactFiberKey || 'not found',
        dataAttributes: Array.from(collectionPageElement.attributes).map(attr => `${attr.name}="${attr.value}"`),
        childrenCount: collectionPageElement.children.length
      };
    });
    
    console.log('Component state:', componentState);
    
    // Check for no-results elements
    const noResultsInfo = await page.evaluate(() => {
      const noResults = document.querySelector('.collection-page__no-results');
      const hasNoResults = !!noResults;
      
      return {
        hasNoResults,
        noResultsText: noResults?.textContent || 'not found',
        displayDataLength: hasNoResults ? 0 : 'not in no-results state'
      };
    });
    
    console.log('No results state:', noResultsInfo);
    
    // Try to manually trigger filtering
    const manualFilter = await page.evaluate(() => {
      const cardsStore = (window as any).useCardsStore;
      if (!cardsStore) return { error: 'Store not accessible' };
      
      const state = cardsStore.getState();
      
      // Reset filters to defaults
      if (state.setFilters) {
        state.setFilters({
          search: '',
          rarity: 'all',
          sortBy: 'dateAdded',
          sortOrder: 'desc'
        });
      }
      
      // Try different view modes
      if (state.setViewMode) {
        state.setViewMode('grid');
      }
      
      if (state.toggleShowStacks) {
        // Make sure we're not in stacks mode
        if (state.showStacks) {
          state.toggleShowStacks();
        }
      }
      
      // Get updated state
      const newState = cardsStore.getState();
      return {
        newFilters: newState.filters,
        newViewMode: newState.viewMode,
        newShowStacks: newState.showStacks,
        filteredAfterReset: newState.getFilteredCards ? newState.getFilteredCards().length : 'function not found'
      };
    });
    
    console.log('After manual filter reset:', manualFilter);
    
    // Wait for potential re-render and check again
    await page.waitForTimeout(1000);
    
    const finalCardCount = await page.evaluate(() => {
      return {
        tcgCards: document.querySelectorAll('[class*="tcgCard"], [class*="TCGCard"]').length,
        collectionCards: document.querySelectorAll('[class*="collectionCard"], [class*="CollectionCard"]').length,
        hasNoResults: !!document.querySelector('.collection-page__no-results')
      };
    });
    
    console.log('Final card count after filter reset:', finalCardCount);
    
    await page.screenshot({ 
      path: 'tests/screenshots/after-debug.png',
      fullPage: true 
    });
  });
});