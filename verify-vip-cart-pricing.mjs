import { chromium } from 'playwright';

async function verifyVIPCartMemberPricing() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to /box-office page...');
    await page.goto('http://localhost:5173/box-office');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('✓ Page loaded');

    console.log('\nStep 2: Click member identification button...');
    const memberButton = page.locator('button[aria-label="Identify member"]');
    await memberButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Member modal opened');

    console.log('\nStep 3: Type "123" and submit...');
    const memberIdInput = page.locator('input').first();
    await memberIdInput.fill('123');
    await memberIdInput.press('Enter');
    await page.waitForTimeout(1500);
    console.log('✓ Member identified');

    console.log('\nStep 4: Click "VIP Experience" category filter...');
    const vipButton = page.locator('button:has-text("VIP Experience")').first();
    await vipButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ VIP Experience filter active');

    console.log('\nStep 5: Click "VIP Front Row Ticket" tile to add to cart...');
    const vipTile = page.locator('button:has-text("VIP Front Row Ticket")').first();
    await vipTile.click();
    await page.waitForTimeout(1500);
    console.log('✓ VIP Front Row Ticket added to cart');

    console.log('\nStep 6: Take screenshot of full page...');
    await page.screenshot({ path: '/tmp/vip-in-cart-full.png', fullPage: true });
    console.log('✓ Screenshot saved: vip-in-cart-full.png');

    console.log('\nStep 7: Inspecting cart for VIP item...');
    const cartInspection = await page.evaluate(() => {
      const output = [];
      
      const cartItems = document.querySelectorAll('[class*="cartItem"]');
      output.push(`Total cart items: ${cartItems.length}\n`);
      
      cartItems.forEach((item, i) => {
        const name = item.querySelector('[class*="itemName"]');
        const priceRow = item.querySelector('[class*="priceRow"]');
        
        if (priceRow) {
          const spans = priceRow.querySelectorAll('span');
          const svgs = priceRow.querySelectorAll('svg');
          const crownIcon = Array.from(svgs).find(svg => 
            svg.getAttribute('data-icon') === 'crown'
          );
          
          output.push(`Cart item ${i}: "${name?.textContent}"`);
          output.push(`  spans: ${spans.length}, hasCrown: ${crownIcon ? 'YES' : 'NO'}`);
          
          spans.forEach((s, j) => {
            const styles = getComputedStyle(s);
            output.push(`  span ${j}: "${s.textContent}"`);
            output.push(`    className: "${s.className}"`);
            output.push(`    textDecoration: "${styles.textDecoration}"`);
            output.push(`    fontWeight: "${styles.fontWeight}"`);
            output.push(`    fontSize: "${styles.fontSize}"`);
            output.push(`    color: "${styles.color}"`);
          });
          
          if (crownIcon) {
            output.push(`  Crown icon class: "${crownIcon.className}"`);
          }
          output.push(''); // blank line
        }
      });
      
      return output.join('\n');
    });

    console.log('\n' + '='.repeat(80));
    console.log('CART ITEM INSPECTION:');
    console.log('='.repeat(80));
    console.log(cartInspection);
    console.log('='.repeat(80));

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/vip-cart-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

verifyVIPCartMemberPricing();
