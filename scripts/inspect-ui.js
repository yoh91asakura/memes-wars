import { chromium } from 'playwright';

(async () => {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:3000');
  
  // Wait for the app to load
  await page.waitForTimeout(2000);
  
  // Navigate to roll screen
  const rollButton = await page.locator('text=Roll').first();
  if (await rollButton.isVisible()) {
    await rollButton.click();
    await page.waitForTimeout(1000);
  }

  // Inspect the main roll button
  console.log('\n🔍 Inspecting Roll Button Position...\n');
  
  // Find the main roll button
  const mainRollButton = await page.locator('.main-roll-button').first();
  
  if (await mainRollButton.isVisible()) {
    // Get computed styles and position
    const boundingBox = await mainRollButton.boundingBox();
    const computedStyles = await mainRollButton.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        position: styles.position,
        bottom: styles.bottom,
        left: styles.left,
        transform: styles.transform,
        width: styles.width,
        height: styles.height,
        display: styles.display,
        margin: styles.margin,
        padding: styles.padding
      };
    });

    console.log('📐 Button Bounding Box:', boundingBox);
    console.log('🎨 Computed Styles:', computedStyles);
    
    // Check viewport dimensions
    const viewport = page.viewportSize();
    console.log('📱 Viewport:', viewport);
    
    // Calculate center position
    const expectedCenterX = viewport.width / 2;
    const actualCenterX = boundingBox.x + (boundingBox.width / 2);
    
    console.log(`\n📊 Centering Analysis:`);
    console.log(`Expected center X: ${expectedCenterX}px`);
    console.log(`Actual center X: ${actualCenterX}px`);
    console.log(`Offset: ${Math.abs(expectedCenterX - actualCenterX)}px`);
    
    if (Math.abs(expectedCenterX - actualCenterX) > 5) {
      console.log('\n⚠️ Button is NOT horizontally centered!');
      
      // Check for CSS conflicts
      const parentStyles = await mainRollButton.evaluate((element) => {
        const parent = element.parentElement;
        const parentStyles = window.getComputedStyle(parent);
        return {
          display: parentStyles.display,
          position: parentStyles.position,
          width: parentStyles.width,
          padding: parentStyles.padding,
          margin: parentStyles.margin,
          flexDirection: parentStyles.flexDirection,
          alignItems: parentStyles.alignItems,
          justifyContent: parentStyles.justifyContent
        };
      });
      
      console.log('\n🔍 Parent Container Styles:', parentStyles);
      
      // Check for any conflicting CSS classes
      const classList = await mainRollButton.evaluate(el => el.className);
      console.log('\n🏷️ Button Classes:', classList);
      
      // Look for any other elements that might be interfering
      const allFixedElements = await page.locator('[style*="position: fixed"]').all();
      console.log(`\n📌 Found ${allFixedElements.length} fixed position elements`);
      
      for (let i = 0; i < Math.min(allFixedElements.length, 5); i++) {
        const el = allFixedElements[i];
        const elBox = await el.boundingBox();
        const elText = await el.textContent().catch(() => 'No text');
        console.log(`  Element ${i + 1}: ${elText.substring(0, 30)}... at`, elBox);
      }
    } else {
      console.log('\n✅ Button appears to be horizontally centered');
    }
    
    // Take a screenshot for visual inspection
    await page.screenshot({ 
      path: 'roll-button-position.png',
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved as roll-button-position.png');
    
  } else {
    console.log('❌ Main roll button not found!');
  }

  // Check for any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Console Error:', msg.text());
    }
  });

  // Wait for user to inspect
  console.log('\n👀 Browser will stay open for inspection. Press Ctrl+C to close.');
  
  // Keep browser open
  await page.waitForTimeout(60000);
  
  await browser.close();
})();
