import { test, expect } from '@playwright/test';

test.describe('SimpleCollectionTest TCGCard Rendering', () => {
  test('verify TCGCard renders in SimpleCollectionTest component', async ({ page }) => {
    // Navigate to any page that shows the SimpleCollectionTest
    await page.goto('/collection');
    await page.waitForTimeout(2000);
    
    // Add test cards
    await page.click('[data-testid="add-test-cards"]');
    await page.waitForTimeout(2000);
    
    // Check if SimpleCollectionTest component is visible
    const simpleTestElement = await page.locator('[data-testid="simple-collection-test"]');
    await expect(simpleTestElement).toBeVisible();
    
    // Check the collection status in the test component
    const collectionSizeText = await simpleTestElement.locator('p:has-text("Collection size:")').textContent();
    const filteredCardsText = await simpleTestElement.locator('p:has-text("Filtered cards:")').textContent();
    
    console.log('Collection status:', { collectionSizeText, filteredCardsText });
    
    // Check if TCGCard components are rendered in the SimpleCollectionTest
    const tcgCards = await simpleTestElement.locator('[data-testid^="simple-card-"]');
    const cardCount = await tcgCards.count();
    
    console.log('TCGCard count in SimpleCollectionTest:', cardCount);
    
    if (cardCount > 0) {
      // If cards are rendered, check their content
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = tcgCards.nth(i);
        const isVisible = await card.isVisible();
        const cardContent = await card.textContent();
        
        console.log(`Card ${i}:`, { isVisible, cardContent: cardContent?.substring(0, 100) });
      }
      
      // Take screenshot of working cards
      await page.screenshot({
        path: 'tests/screenshots/simple-collection-working.png',
        fullPage: true
      });
    } else {
      // Check console logs for any errors
      const logs = await page.evaluate(() => {
        return (window as any).testLogs || 'No test logs available';
      });
      console.log('No cards rendered. Test logs:', logs);
      
      // Take screenshot of the issue
      await page.screenshot({
        path: 'tests/screenshots/simple-collection-no-cards.png',
        fullPage: true
      });
    }
    
    // Verify store state
    const storeDebug = await page.evaluate(() => {
      const cardsStore = (window as any).useCardsStore;
      if (!cardsStore) return { error: 'Store not found' };
      
      const state = cardsStore.getState();
      return {
        collectionLength: state.collection?.length || 0,
        filteredCards: state.getFilteredCards()?.length || 0,
        firstCard: state.collection?.[0] ? {
          name: state.collection[0].name,
          id: state.collection[0].id,
          rarity: state.collection[0].rarity
        } : null
      };
    });
    
    console.log('Store state debug:', storeDebug);
    
    // Check if error message is shown when no cards
    if (cardCount === 0) {
      await expect(simpleTestElement.locator('p:has-text("No filtered cards to display!")')).toBeVisible();
    }
  });
});