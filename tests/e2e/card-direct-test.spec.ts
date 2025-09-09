import { test, expect } from '@playwright/test';

test.describe('Direct Card Display Test', () => {
  test('check card display on collection page directly', async ({ page }) => {
    // Navigate directly to collection page
    await page.goto('/collection');
    await page.waitForTimeout(3000);
    
    // Take screenshot of collection page
    await page.screenshot({ 
      path: 'tests/screenshots/collection-direct.png',
      fullPage: true 
    });
    
    // Check for various card-related elements
    const cardCounts = await page.evaluate(() => {
      return {
        tcgCards: document.querySelectorAll('[class*="tcgCard"], [class*="TCGCard"]').length,
        collectionCards: document.querySelectorAll('[class*="collectionCard"], [class*="CollectionCard"]').length,
        anyCardClass: document.querySelectorAll('[class*="card" i]').length,
        cardGrids: document.querySelectorAll('[class*="cardGrid"], [class*="CardGrid"]').length,
        cardComponents: document.querySelectorAll('[data-testid*="card"]').length
      };
    });
    
    console.log('Card element counts:', cardCounts);
    
    // Check if there's an empty state message
    const emptyMessage = await page.locator('text=No cards found, text=No results, text=Empty').count();
    console.log('Empty state messages found:', emptyMessage);
    
    // Check the collection stats
    const collectionText = await page.textContent('body').catch(() => '');
    console.log('Collection text contains "Collection (0)":', collectionText.includes('Collection (0)'));
    
    // Try to add cards using the global stores
    await page.evaluate(() => {
      // Try to access Zustand stores from window
      const stores = (window as any);
      console.log('Available stores:', Object.keys(stores).filter(k => k.includes('store') || k.includes('Store')));
      
      // Look for card data
      const cardData = (window as any).cardData || [];
      console.log('Card data available:', cardData.length);
      
      // Try to manually add a card to see if components render
      if (stores.useCardsStore) {
        const store = stores.useCardsStore.getState();
        console.log('Cards store methods:', Object.keys(store));
        
        if (store.addCard) {
          const testCard = {
            id: 'manual-test-001',
            name: 'Test Card 🎮',
            emoji: '🎮',
            rarity: 2,
            luck: 10,
            hp: 100,
            emojis: [{
              character: '🎮',
              damage: 5,
              speed: 3,
              trajectory: 'straight',
              target: 'OPPONENT'
            }],
            family: 'CLASSIC_INTERNET',
            stackLevel: 1,
            reference: 'Manual test',
            goldReward: 15,
            description: 'Manually added test card',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          store.addCard(testCard);
          console.log('Added manual test card');
        }
      }
    });
    
    // Wait for potential re-render
    await page.waitForTimeout(1000);
    
    // Take screenshot after attempting to add card
    await page.screenshot({ 
      path: 'tests/screenshots/collection-after-add.png',
      fullPage: true 
    });
    
    // Check card counts again
    const updatedCounts = await page.evaluate(() => {
      return {
        tcgCards: document.querySelectorAll('[class*="tcgCard"], [class*="TCGCard"]').length,
        collectionCards: document.querySelectorAll('[class*="collectionCard"], [class*="CollectionCard"]').length,
        anyCardClass: document.querySelectorAll('[class*="card" i]').length
      };
    });
    
    console.log('Updated card counts:', updatedCounts);
    
    // If we have cards, examine their structure
    const firstCard = page.locator('[class*="tcgCard"], [class*="TCGCard"], [class*="collectionCard"]').first();
    if (await firstCard.count() > 0) {
      console.log('Found card elements!');
      
      const cardInfo = await firstCard.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        
        return {
          visible: rect.width > 0 && rect.height > 0,
          dimensions: { width: rect.width, height: rect.height },
          styles: {
            display: computed.display,
            position: computed.position,
            visibility: computed.visibility,
            opacity: computed.opacity
          },
          innerHTML: el.innerHTML.substring(0, 200) + '...'
        };
      });
      
      console.log('Card info:', cardInfo);
      
      if (await firstCard.isVisible()) {
        await firstCard.screenshot({ 
          path: 'tests/screenshots/first-card.png' 
        });
        
        // Check for sections within the card
        const sections = await firstCard.evaluate(el => {
          const sections = el.querySelectorAll('[class*="Section"], [class*="section"]');
          return Array.from(sections).map(section => {
            const rect = section.getBoundingClientRect();
            const computed = window.getComputedStyle(section);
            return {
              className: section.className,
              visible: rect.width > 0 && rect.height > 0,
              dimensions: { width: rect.width, height: rect.height },
              styles: {
                display: computed.display,
                position: computed.position,
                height: computed.height,
                flex: computed.flex
              }
            };
          });
        });
        
        console.log('Card sections:', JSON.stringify(sections, null, 2));
      }
    } else {
      console.log('No card elements found in DOM');
      
      // Check what's actually in the page
      const pageStructure = await page.evaluate(() => {
        const main = document.querySelector('main');
        return {
          mainExists: !!main,
          mainClassName: main?.className || 'not found',
          children: main?.children.length || 0,
          firstChildClass: main?.children[0]?.className || 'no children'
        };
      });
      
      console.log('Page structure:', pageStructure);
    }
  });
  
  test('test roll page for card creation', async ({ page }) => {
    // Test the roll page to see if we can create cards there
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/roll-page.png',
      fullPage: true 
    });
    
    // Look for roll button with different selectors
    const rollButtons = await page.evaluate(() => {
      return {
        byTestId: document.querySelectorAll('[data-testid*="roll"]').length,
        byClassName: document.querySelectorAll('[class*="roll" i]').length,
        byButtonText: Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent?.toLowerCase().includes('roll')).length
      };
    });
    
    console.log('Roll buttons found:', rollButtons);
    
    // Try to find and analyze any buttons
    const buttons = await page.locator('button').count();
    console.log('Total buttons on page:', buttons);
    
    if (buttons > 0) {
      const buttonInfo = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).slice(0, 5).map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          testId: btn.getAttribute('data-testid'),
          disabled: btn.disabled
        }));
      });
      
      console.log('Button info:', buttonInfo);
    }
  });
});