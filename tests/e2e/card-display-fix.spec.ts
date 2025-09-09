import { test, expect } from '@playwright/test';

test.describe('Card Display Fix', () => {
  test('force roll cards and check display', async ({ page }) => {
    // Navigate to roll page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'tests/screenshots/initial-state.png',
      fullPage: true 
    });
    
    // Try to force roll some cards using the stores directly
    await page.evaluate(() => {
      // Access the roll store to add some test cards
      const { useCardsStore } = window as any;
      if (useCardsStore) {
        const store = useCardsStore.getState();
        
        // Add some test cards to the collection
        const testCards = [
          {
            id: 'test-001',
            name: 'Fire Ember 🔥',
            rarity: 2,
            luck: 5,
            emojis: [
              {
                character: '🔥',
                damage: 3,
                speed: 3,
                trajectory: 'straight',
                target: 'OPPONENT'
              }
            ],
            family: 'CLASSIC_INTERNET',
            stackLevel: 1,
            reference: 'Test card',
            goldReward: 10,
            hp: 100,
            emoji: '🔥',
            description: 'Test fire emoji card',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'test-002',
            name: 'Water Drop 💧',
            rarity: 2,
            luck: 3,
            emojis: [
              {
                character: '💧',
                damage: 2,
                speed: 4,
                trajectory: 'straight',
                target: 'OPPONENT'
              }
            ],
            family: 'CLASSIC_INTERNET',
            stackLevel: 1,
            reference: 'Test card',
            goldReward: 10,
            hp: 95,
            emoji: '💧',
            description: 'Test water emoji card',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        // Add cards to collection
        testCards.forEach(card => store.addCard(card));
        console.log('Added test cards to collection');
      }
    });
    
    // Navigate to collection to see the cards
    await page.click('[href="/collection"]');
    await page.waitForTimeout(1000);
    
    // Take screenshot after adding cards
    await page.screenshot({ 
      path: 'tests/screenshots/with-test-cards.png',
      fullPage: true 
    });
    
    // Check if cards are now visible
    const cards = await page.locator('[data-testid*="collection-card"]').count();
    console.log(`Found ${cards} cards after adding test data`);
    
    // If still no cards, try checking the actual card components
    const tcgCards = await page.locator('[class*="tcgCard"], [class*="TCGCard"]').count();
    console.log(`Found ${tcgCards} TCG card components`);
    
    // Look for any card-related elements
    const anyCards = await page.locator('div[class*="card" i], div[class*="Card"]').count();
    console.log(`Found ${anyCards} elements with 'card' in className`);
    
    // Check card structure if any cards exist
    const firstCard = page.locator('[class*="tcgCard"], [class*="TCGCard"]').first();
    if (await firstCard.isVisible()) {
      console.log('Found a visible TCG card!');
      
      // Get card dimensions
      const box = await firstCard.boundingBox();
      console.log('Card dimensions:', box);
      
      // Check for card sections
      const sections = {
        header: await firstCard.locator('[class*="headerSection"]').isVisible(),
        image: await firstCard.locator('[class*="imageSection"]').isVisible(),
        emoji: await firstCard.locator('[class*="emojiSection"]').isVisible(),
        footer: await firstCard.locator('[class*="footerSection"]').isVisible()
      };
      
      console.log('Card sections visibility:', sections);
      
      // Take detailed screenshot of first card
      await firstCard.screenshot({ 
        path: 'tests/screenshots/single-card-detail.png' 
      });
      
      // Check computed styles
      const cardStyles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          width: computed.width,
          height: computed.height,
          flexDirection: computed.flexDirection,
          overflow: computed.overflow
        };
      });
      console.log('Card computed styles:', cardStyles);
      
      // Check if sections are properly sized
      const sectionInfo = await firstCard.evaluate(el => {
        const sections = el.querySelectorAll('[class*="Section"]');
        return Array.from(sections).map(section => {
          const computed = window.getComputedStyle(section);
          return {
            className: section.className,
            display: computed.display,
            position: computed.position,
            height: computed.height,
            width: computed.width,
            flex: computed.flex,
            visibility: computed.visibility
          };
        });
      });
      console.log('Section info:', JSON.stringify(sectionInfo, null, 2));
      
    } else {
      console.log('No visible TCG cards found');
      
      // Check if there are any cards at all but hidden
      const hiddenCards = await page.locator('[class*="card" i]').count();
      console.log(`Found ${hiddenCards} hidden card elements`);
      
      // Check the page content
      const pageContent = await page.content();
      const hasCardComponents = pageContent.includes('tcgCard') || pageContent.includes('TCGCard');
      console.log('Page contains card component HTML:', hasCardComponents);
    }
    
    // Also check what's in the DOM
    const domInfo = await page.evaluate(() => {
      return {
        cardElements: document.querySelectorAll('[class*="card" i]').length,
        tcgElements: document.querySelectorAll('[class*="tcg" i]').length,
        collectionElements: document.querySelectorAll('[class*="collection"]').length
      };
    });
    console.log('DOM elements:', domInfo);
  });
});