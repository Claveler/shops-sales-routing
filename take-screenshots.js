import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Navigate to the page
  await page.goto('http://localhost:3000/products/guide');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of the top
  await page.screenshot({ path: 'screenshots/verify-guide-redesign-top.png' });
  console.log('✓ Top screenshot saved');
  
  // Scroll to middle (approximately 1000px down)
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/verify-guide-redesign-middle.png' });
  console.log('✓ Middle screenshot saved');
  
  // Scroll to bottom area (Key Concepts, FAQ - 2000px down)
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/verify-guide-redesign-bottom.png' });
  console.log('✓ Bottom screenshot saved');
  
  await browser.close();
})();
