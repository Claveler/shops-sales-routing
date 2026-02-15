import { chromium } from 'playwright';

async function captureCartDetail() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:5173/box-office');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Quick setup: identify member and add VIP ticket
    await page.locator('button[aria-label="Identify member"]').click();
    await page.waitForTimeout(500);
    await page.locator('input').first().fill('123');
    await page.locator('input').first().press('Enter');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("VIP Experience")').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("VIP Front Row Ticket")').first().click();
    await page.waitForTimeout(1000);

    console.log('Taking detailed cart screenshot...');
    
    // Capture just the cart panel
    const cartPanel = page.locator('[class*="cart"]').first();
    await cartPanel.screenshot({ path: '/tmp/cart-panel-detail.png' });
    console.log('✓ Cart panel screenshot saved');

    // Get the HTML of the VIP cart item
    const vipCartItemHTML = await page.evaluate(() => {
      const cartItems = document.querySelectorAll('[class*="cartItem"]');
      const vipItem = Array.from(cartItems).find(item => {
        const name = item.querySelector('[class*="itemName"]');
        return name?.textContent?.includes('VIP Front Row');
      });
      return vipItem ? vipItem.outerHTML : 'VIP item not found';
    });

    console.log('\nVIP Cart Item HTML:');
    console.log('='.repeat(80));
    console.log(vipCartItemHTML);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

captureCartDetail();
