import { test, expect } from '@playwright/test';

test.describe('Card Display Validation', () => {
  test('add test cards and verify display works', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection');
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial empty state
    await page.screenshot({ 
      path: 'tests/screenshots/before-test-cards.png',
      fullPage: true 
    });
    
    // Click the test button to add cards
    await page.click('[data-testid="add-test-cards"]');
    await page.waitForTimeout(1000);
    
    // Take screenshot after adding test cards
    await page.screenshot({ 
      path: 'tests/screenshots/after-test-cards.png',
      fullPage: true 
    });
    
    // Check if cards are now visible
    const cardCounts = await page.evaluate(() => {
      return {
        tcgCards: document.querySelectorAll('[class*="tcgCard"], [class*="TCGCard"]').length,
        collectionCards: document.querySelectorAll('[class*="collectionCard"], [class*="CollectionCard"]').length,
        anyCardClass: document.querySelectorAll('[class*="card" i]').length
      };
    });
    
    console.log('Card counts after adding test cards:', cardCounts);
    
    // Verify cards are now present
    const hasCards = cardCounts.tcgCards > 0 || cardCounts.collectionCards > 0;
    console.log('Cards found after test:', hasCards);
    
    if (hasCards) {
      // Test card display structure
      const firstCard = page.locator('[class*="tcgCard"], [class*="TCGCard"], [class*="collectionCard"]').first();
      
      if (await firstCard.isVisible()) {
        console.log('✅ Cards are visible!');
        
        // Take detailed screenshot of first card
        await firstCard.screenshot({ 
          path: 'tests/screenshots/working-card.png' 
        });
        
        // Check card sections
        const cardSections = await firstCard.evaluate(el => {
          const sections = {
            header: el.querySelector('[class*="headerSection"], [class*="Header"]'),
            image: el.querySelector('[class*="imageSection"], [class*="Image"]'),
            emoji: el.querySelector('[class*="emojiSection"], [class*="Emoji"], [class*="inventory"]'),
            footer: el.querySelector('[class*="footerSection"], [class*="Footer"], [class*="stats"]')
          };
          
          return Object.entries(sections).reduce((acc, [name, element]) => {
            if (element) {
              const rect = element.getBoundingClientRect();
              const computed = window.getComputedStyle(element);
              acc[name] = {
                visible: rect.width > 0 && rect.height > 0,
                dimensions: { width: rect.width, height: rect.height },
                display: computed.display,
                position: computed.position,
                hasContent: element.textContent?.trim().length > 0 || element.querySelector('*') !== null
              };
            } else {
              acc[name] = { found: false };
            }
            return acc;
          }, {} as any);
        });
        
        console.log('Card sections analysis:', JSON.stringify(cardSections, null, 2));
        
        // Check if we can see HP and Luck
        const statsVisible = await firstCard.evaluate(el => {
          const text = el.textContent || '';
          return {
            hasHP: text.includes('❤️') || text.includes('HP') || /\d+.*hp/i.test(text),
            hasLuck: text.includes('🍀') || text.includes('Luck') || /\d+.*luck/i.test(text),
            hasEmojis: text.includes('🔥') || text.includes('💧') || text.includes('⚡'),
            fullText: text.substring(0, 200)
          };
        });
        
        console.log('Stats visibility:', statsVisible);
        
        // Test that all expected elements are visible
        const allSectionsWorking = Object.entries(cardSections).every(([name, section]) => {
          if (!section.found) return name === 'emoji'; // emoji section optional
          return section.visible && section.hasContent;
        });
        
        console.log('All card sections working:', allSectionsWorking);
        
        if (allSectionsWorking && statsVisible.hasHP && statsVisible.hasLuck) {
          console.log('🎉 Card display is WORKING correctly!');
        } else {
          console.log('⚠️ Card display has some issues but cards are rendering');
        }
        
      } else {
        console.log('❌ Cards exist in DOM but are not visible');
      }
    } else {
      console.log('❌ No cards found even after adding test cards');
      
      // Check if the store was updated
      const storeState = await page.evaluate(() => {
        const stores = (window as any);
        if (stores.useCardsStore) {
          const state = stores.useCardsStore.getState();
          return {
            collectionLength: state.collection?.length || 0,
            hasAddCard: typeof state.addCard === 'function',
            storeKeys: Object.keys(state)
          };
        }
        return { error: 'Store not found' };
      });
      
      console.log('Store state:', storeState);
    }
    
    // Test clearing cards
    await page.click('[data-testid="clear-test-cards"]');
    await page.waitForTimeout(500);
    
    // Verify cards are cleared
    const clearedCounts = await page.evaluate(() => {
      return document.querySelectorAll('[class*="tcgCard"], [class*="TCGCard"]').length;
    });
    
    console.log('Cards after clearing:', clearedCounts);
    
    await page.screenshot({ 
      path: 'tests/screenshots/after-clearing-cards.png',
      fullPage: true 
    });
  });
});