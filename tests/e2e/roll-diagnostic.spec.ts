// Diagnostic test for roll functionality
import { test, expect } from '@playwright/test';

test.describe('Roll Diagnostic', () => {
  test('Should diagnose roll functionality step by step', async ({ page }) => {
    console.log('🎲 Diagnosing roll functionality...');
    
    // Capture console logs and errors
    const logs = [];
    const errors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      // Capture more comprehensive console output
      if (text.includes('🎲') || text.includes('💰') || text.includes('❌') || text.includes('✅') ||
          text.includes('🔍') || text.includes('🎯') || text.includes('ROLL') || 
          text.includes('Roll') || text.includes('error') || text.includes('failed')) {
        logs.push(`${msg.type()}: ${text}`);
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
      console.log('Page Error:', error.message);
    });
    
    page.on('requestfailed', request => {
      errors.push(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Reset game to ensure we have currency
    const resetButton = page.locator('[data-testid="reset-game-button"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      page.on('dialog', async dialog => await dialog.accept());
      await page.waitForTimeout(2000);
    }

    // Check currency
    const goldValue = await page.locator('.main-layout__stat:has([aria-label="🪙"]) span:not(.icon)').textContent();
    console.log(`Gold available: ${goldValue}`);

    // Should be on roll page
    await expect(page.locator('[data-testid="roll-page"]')).toBeVisible();

    // Check for roll button (actual selector is roll-button-btn due to RollButton component logic)
    const rollButton = page.locator('[data-testid="roll-button-btn"]');
    const rollButtonExists = await rollButton.count();
    console.log(`Roll button count: ${rollButtonExists}`);

    if (rollButtonExists > 0) {
      const isVisible = await rollButton.isVisible();
      const isEnabled = await rollButton.isEnabled();
      const buttonText = await rollButton.textContent();
      
      console.log(`Roll button visible: ${isVisible}`);
      console.log(`Roll button enabled: ${isEnabled}`);
      console.log(`Roll button text: ${buttonText}`);

      if (isVisible && isEnabled) {
        console.log('🎯 Attempting roll...');
        
        // Debug button element properties
        const boundingBox = await rollButton.boundingBox();
        const isVisible = await rollButton.isVisible();
        const isEnabled = await rollButton.isEnabled();
        const computedStyle = await rollButton.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            pointerEvents: style.pointerEvents,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            zIndex: style.zIndex
          };
        });
        
        console.log('Button properties:', { boundingBox, isVisible, isEnabled, computedStyle });
        
        // Take screenshot before roll
        await page.screenshot({ path: 'roll-before.png' });

        // Try multiple click strategies
        console.log('Trying force click...');
        await rollButton.click({ force: true });
        
        await page.waitForTimeout(500);
        
        console.log('Trying dispatchEvent click...');
        await rollButton.evaluate(element => element.click());
        
        await page.waitForTimeout(500);
        
        console.log('Trying mouse click at position...');
        if (boundingBox) {
          await page.mouse.click(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2
          );
        }
        
        console.log('✅ Roll button clicked');

        // Wait a moment and take screenshot
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'roll-after-1s.png' });

        // Check for various possible elements that might appear
        const possibleElements = [
          '.roll-panel__card-reveal',
          '.roll-panel__revealed-card', 
          '.roll-panel__card--revealed',
          '.card-display',
          '.roll-result',
          '.new-card',
          '.card-animation',
          '[data-testid="card-reveal"]',
          '[data-testid="roll-result"]',
          '.roll-panel__result'
        ];

        for (const selector of possibleElements) {
          const count = await page.locator(selector).count();
          const visible = count > 0 ? await page.locator(selector).first().isVisible() : false;
          console.log(`${selector}: count=${count}, visible=${visible}`);
        }

        // Wait longer and check again
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'roll-after-3s.png' });

        // Check if currency changed (indicating roll worked)
        const newGoldValue = await page.locator('.main-layout__stat:has([aria-label="🪙"]) span:not(.icon)').textContent();
        console.log(`Gold after roll: ${newGoldValue}`);

        const goldChanged = goldValue !== newGoldValue;
        console.log(`Gold changed: ${goldChanged}`);

        // Check roll page for any changes
        const rollPageHTML = await page.locator('[data-testid="roll-page"]').innerHTML();
        console.log('Roll page HTML after roll:', rollPageHTML.substring(0, 500) + '...');

      } else {
        console.log('❌ Roll button not clickable');
      }
    } else {
      console.log('❌ No roll button found');
      
      // Look for alternative selectors
      const alternativeSelectors = [
        'button:has-text("Roll")',
        '[class*="roll"]',
        '[data-testid*="roll"]',
        '.roll-panel button'
      ];

      for (const selector of alternativeSelectors) {
        const count = await page.locator(selector).count();
        console.log(`${selector}: ${count} elements found`);
      }
    }

    // Show all captured logs and errors
    console.log('\n📋 Captured browser console logs:');
    if (logs.length > 0) {
      logs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('  No relevant logs captured');
    }
    
    console.log('\n🚨 Captured errors:');
    if (errors.length > 0) {
      errors.forEach(error => console.log(`  ${error}`));
    } else {
      console.log('  No errors captured');
    }

    console.log('✅ Roll diagnostic completed');
  });
});