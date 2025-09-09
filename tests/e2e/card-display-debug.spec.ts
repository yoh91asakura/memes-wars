import { test, expect } from '@playwright/test';

test.describe('Card Display Debug', () => {
  test('capture card display issues', async ({ page }) => {
    // Navigate to collection page to see cards
    await page.goto('/collection');
    
    // Wait for cards to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the current state
    await page.screenshot({ 
      path: 'tests/screenshots/card-display-broken.png',
      fullPage: true 
    });
    
    // Check if cards are visible
    const cards = await page.locator('[data-testid*="collection-card"]').count();
    console.log(`Found ${cards} cards on the page`);
    
    // If no cards, try the roll page
    if (cards === 0) {
      await page.goto('/roll');
      await page.waitForTimeout(2000);
      
      // Try to roll some cards
      const rollButton = page.locator('[data-testid="roll-button"]');
      if (await rollButton.isVisible()) {
        await rollButton.click();
        await page.waitForTimeout(2000);
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/roll-page-cards.png',
        fullPage: true 
      });
    }
    
    // Check card structure
    const firstCard = page.locator('[class*="TCGCard"]').first();
    if (await firstCard.isVisible()) {
      // Get card dimensions
      const box = await firstCard.boundingBox();
      console.log('Card dimensions:', box);
      
      // Check for card sections
      const headerSection = firstCard.locator('[class*="headerSection"]');
      const imageSection = firstCard.locator('[class*="imageSection"]');
      const emojiSection = firstCard.locator('[class*="emojiSection"]');
      const footerSection = firstCard.locator('[class*="footerSection"]');
      
      console.log('Header visible:', await headerSection.isVisible());
      console.log('Image visible:', await imageSection.isVisible());
      console.log('Emoji inventory visible:', await emojiSection.isVisible());
      console.log('Footer (stats) visible:', await footerSection.isVisible());
      
      // Check if sections are overlapping
      if (await imageSection.isVisible()) {
        const imageBox = await imageSection.boundingBox();
        console.log('Image section dimensions:', imageBox);
      }
      
      // Take detailed screenshot of first card
      await firstCard.screenshot({ 
        path: 'tests/screenshots/single-card-detail.png' 
      });
      
      // Check computed styles
      const styles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          width: computed.width,
          height: computed.height,
          flexDirection: computed.flexDirection
        };
      });
      console.log('Card computed styles:', styles);
      
      // Check each section's styles
      const sectionStyles = await firstCard.evaluate(() => {
        const sections = {
          header: document.querySelector('[class*="headerSection"]'),
          image: document.querySelector('[class*="imageSection"]'),
          emoji: document.querySelector('[class*="emojiSection"]'),
          footer: document.querySelector('[class*="footerSection"]')
        };
        
        const results: any = {};
        for (const [name, element] of Object.entries(sections)) {
          if (element) {
            const computed = window.getComputedStyle(element);
            results[name] = {
              display: computed.display,
              position: computed.position,
              height: computed.height,
              flex: computed.flex,
              flexGrow: computed.flexGrow,
              flexShrink: computed.flexShrink
            };
          }
        }
        return results;
      });
      console.log('Section styles:', JSON.stringify(sectionStyles, null, 2));
    }
  });
});