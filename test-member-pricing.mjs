import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testMemberPricing() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to POS page...');
    await page.goto('http://localhost:5173/box-office');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/step1-initial-state.png', fullPage: false });
    console.log('✓ Screenshot saved: step1-initial-state.png');
    await page.waitForTimeout(2000);

    console.log('\nStep 2: Looking for member identification button...');
    // Look for the circular address card button in the header
    const memberButton = page.locator('button[aria-label*="member"], button:has-text("Member"), .member-button, button:has(svg.fa-address-card)').first();
    
    // Try alternative selectors if not found
    const buttonExists = await memberButton.count() > 0;
    if (!buttonExists) {
      console.log('Trying alternative selectors...');
      const allButtons = await page.locator('header button').all();
      console.log(`Found ${allButtons.length} buttons in header`);
      
      // Take screenshot to see what's available
      await page.screenshot({ path: '/tmp/step2-looking-for-button.png' });
      console.log('✓ Screenshot saved: step2-looking-for-button.png');
    }

    console.log('\nStep 3: Click member identification button...');
    await memberButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step3-modal-opened.png' });
    console.log('✓ Screenshot saved: step3-modal-opened.png');

    console.log('\nStep 4: Enter member ID and submit...');
    const memberIdInput = page.locator('input[type="text"], input[placeholder*="Member"], input[name*="member"]').first();
    await memberIdInput.fill('TEST123');
    await memberIdInput.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step4-member-identified.png', fullPage: false });
    console.log('✓ Screenshot saved: step4-member-identified.png');

    console.log('\nStep 5: Verify member pricing display...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step5-member-pricing.png', fullPage: false });
    console.log('✓ Screenshot saved: step5-member-pricing.png');

    console.log('\nStep 6: Check cart panel...');
    const cartPanel = page.locator('.cart, [class*="cart"]').first();
    await cartPanel.screenshot({ path: '/tmp/step6-cart-panel.png' });
    console.log('✓ Screenshot saved: step6-cart-panel.png');

    console.log('\nStep 7: Clear member...');
    const clearButton = page.locator('button:has-text("×"), button[aria-label*="clear"], button[aria-label*="remove"]').first();
    await clearButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step7-member-cleared.png', fullPage: false });
    console.log('✓ Screenshot saved: step7-member-cleared.png');

    console.log('\n✅ All steps completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png' });
    console.log('Error screenshot saved: error-screenshot.png');
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testMemberPricing();
