import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Navigate to the sales routing page
  await page.goto('http://localhost:3001/products/sales-routing');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more for any animations
  await page.waitForTimeout(500);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/sales-routing-empty-state.png', fullPage: true });
  console.log('✓ Sales routing empty state screenshot saved');
  
  await browser.close();
})();
