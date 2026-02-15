import { chromium } from 'playwright';

async function testVIPMemberPricing() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to /box-office page...');
    await page.goto('http://localhost:5173/box-office');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('✓ Page loaded');

    console.log('\nStep 2: Click the circular address-card button (member identification)...');
    // The member button is in the top bar actions area, not the header
    // It has aria-label="Identify member"
    const memberButton = page.locator('button[aria-label="Identify member"]');
    await memberButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Clicked member button');
    await page.screenshot({ path: '/tmp/vip-step2-modal-opened.png', fullPage: false });

    console.log('\nStep 3: Type "123" in Member ID field and press Enter...');
    const memberIdInput = page.locator('input').first();
    await memberIdInput.fill('123');
    await memberIdInput.press('Enter');
    await page.waitForTimeout(1500);
    console.log('✓ Member identified');
    await page.screenshot({ path: '/tmp/vip-step3-member-identified.png', fullPage: false });

    console.log('\nStep 4: Click "VIP Experience" category filter button...');
    // Look for VIP Experience button/pill
    const vipButton = page.locator('button:has-text("VIP Experience"), button:has-text("VIP"), [role="button"]:has-text("VIP")').first();
    await vipButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Clicked VIP Experience filter');

    console.log('\nStep 5: Take screenshot of VIP tiles with member pricing...');
    await page.screenshot({ path: '/tmp/vip-step5-vip-tiles.png', fullPage: false });
    console.log('✓ Screenshot saved: vip-step5-vip-tiles.png');

    // Get details of visible tiles
    console.log('\nAnalyzing product tiles...');
    const tiles = await page.locator('[class*="tile"], [class*="card"]').all();
    console.log(`Found ${tiles.length} product tiles`);

    // Look for crown badges
    const crownBadges = await page.locator('[class*="crown"], [class*="badge"]').all();
    console.log(`Found ${crownBadges.length} crown badges`);

    // Look for strikethrough prices
    const strikethroughPrices = await page.locator('[style*="line-through"], [class*="strikethrough"], del, s').all();
    console.log(`Found ${strikethroughPrices.length} strikethrough prices`);

    console.log('\nStep 6-7: Check cart panel...');
    const cartPanel = page.locator('[class*="cart"]').first();
    await cartPanel.screenshot({ path: '/tmp/vip-step6-cart-panel.png' });
    console.log('✓ Screenshot saved: vip-step6-cart-panel.png');

    // Take a final full page screenshot
    await page.screenshot({ path: '/tmp/vip-final-full-page.png', fullPage: true });
    console.log('✓ Screenshot saved: vip-final-full-page.png');

    console.log('\n✅ All steps completed successfully!');
    console.log('\nPlease review the screenshots to verify:');
    console.log('- vip-step5-vip-tiles.png: VIP tiles with crown badges and dual pricing');
    console.log('- vip-step6-cart-panel.png: Cart items with member pricing');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/vip-error-screenshot.png', fullPage: true });
    console.log('Error screenshot saved: vip-error-screenshot.png');
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testVIPMemberPricing();
