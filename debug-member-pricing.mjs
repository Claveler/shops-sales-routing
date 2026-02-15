import { chromium } from 'playwright';

async function debugMemberPricingDOM() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to /box-office page...');
    await page.goto('http://localhost:5173/box-office');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
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

    console.log('\nStep 5: Take screenshot of VIP tiles...');
    await page.screenshot({ path: '/tmp/debug-vip-tiles.png', fullPage: false });
    console.log('✓ Screenshot saved: debug-vip-tiles.png');

    console.log('\nStep 6: Inspecting VIP tile DOM structure...');
    const domInspection = await page.evaluate(() => {
      const output = [];
      
      // Find all product tile buttons
      const tiles = document.querySelectorAll('button');
      output.push(`Total buttons found: ${tiles.length}`);
      
      const vipTile = Array.from(tiles).find(t => t.textContent.includes('VIP Front Row'));
      
      if (vipTile) {
        output.push('\n=== VIP Front Row Tile Found ===');
        output.push(`\nFull innerHTML:\n${vipTile.innerHTML}`);
        
        output.push('\n=== All SPAN elements in tile ===');
        const priceElements = vipTile.querySelectorAll('span');
        priceElements.forEach((el, i) => {
          const styles = getComputedStyle(el);
          output.push(`span ${i}:`);
          output.push(`  text: "${el.textContent}"`);
          output.push(`  className: "${el.className}"`);
          output.push(`  textDecoration: "${styles.textDecoration}"`);
          output.push(`  fontWeight: "${styles.fontWeight}"`);
          output.push(`  display: "${styles.display}"`);
        });
        
        output.push('\n=== All DIV elements in tile ===');
        const divs = vipTile.querySelectorAll('div');
        divs.forEach((el, i) => {
          output.push(`div ${i}:`);
          output.push(`  className: "${el.className}"`);
          output.push(`  children: ${el.children.length}`);
          output.push(`  textContent: "${el.textContent.substring(0, 50)}..."`);
        });
        
        output.push('\n=== Looking for member pricing elements ===');
        const memberPriceRow = vipTile.querySelector('[class*="memberPrice"]');
        output.push(`memberPriceRow element: ${memberPriceRow ? 'FOUND' : 'NOT FOUND'}`);
        
        const strikethrough = vipTile.querySelector('[style*="line-through"], del, s');
        output.push(`strikethrough element: ${strikethrough ? 'FOUND' : 'NOT FOUND'}`);
        
        const crownBadge = vipTile.querySelector('[class*="crown"], [class*="badge"]');
        output.push(`crown badge element: ${crownBadge ? 'FOUND' : 'NOT FOUND'}`);
        if (crownBadge) {
          output.push(`  crown className: "${crownBadge.className}"`);
        }
        
      } else {
        output.push('❌ VIP Front Row tile NOT FOUND');
      }
      
      return output.join('\n');
    });

    console.log('\n' + '='.repeat(80));
    console.log('DOM INSPECTION OUTPUT:');
    console.log('='.repeat(80));
    console.log(domInspection);
    console.log('='.repeat(80));

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/debug-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

debugMemberPricingDOM();
