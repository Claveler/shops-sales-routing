import { chromium } from 'playwright';

async function verifyCartMemberPricing() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to /box-office page...');
    await page.goto('http://localhost:5173/box-office');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('✓ Page loaded');

    console.log('\nStep 2: Take screenshot of initial cart...');
    await page.screenshot({ path: '/tmp/cart-before-member.png', fullPage: false });
    console.log('✓ Screenshot saved: cart-before-member.png');

    console.log('\nStep 3: Click member identification button...');
    const memberButton = page.locator('button[aria-label="Identify member"]');
    await memberButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Member modal opened');

    console.log('\nStep 4: Type "123" and submit...');
    const memberIdInput = page.locator('input').first();
    await memberIdInput.fill('123');
    await memberIdInput.press('Enter');
    await page.waitForTimeout(2000);
    console.log('✓ Member identified');

    console.log('\nStep 5: Take screenshot of cart after member identified...');
    await page.screenshot({ path: '/tmp/cart-after-member.png', fullPage: false });
    console.log('✓ Screenshot saved: cart-after-member.png');

    console.log('\nStep 6: Inspecting cart items DOM structure...');
    const cartInspection = await page.evaluate(() => {
      const output = [];
      
      // Look for cart item elements - try multiple selectors
      let cartItems = document.querySelectorAll('[class*="cartItem"]');
      output.push(`Cart items found with [class*="cartItem"]: ${cartItems.length}`);
      
      if (cartItems.length === 0) {
        // Try alternative selectors
        cartItems = document.querySelectorAll('.cart [class*="item"]');
        output.push(`Trying .cart [class*="item"]: ${cartItems.length}`);
      }
      
      if (cartItems.length === 0) {
        // Try finding all elements with item in class name within cart
        const cartPanel = document.querySelector('[class*="cart"]');
        if (cartPanel) {
          output.push(`\nCart panel found. Looking for items within...`);
          const allDivs = cartPanel.querySelectorAll('div');
          output.push(`Total divs in cart: ${allDivs.length}`);
          
          // Look for specific patterns
          const itemNames = cartPanel.querySelectorAll('[class*="itemName"], [class*="productName"], [class*="name"]');
          output.push(`Elements with "name" in class: ${itemNames.length}`);
          
          itemNames.forEach((name, i) => {
            output.push(`\nItem ${i}: "${name.textContent.trim().substring(0, 40)}"`);
            // Find nearest parent that might be the item container
            let parent = name.closest('div[class*="item"]') || name.parentElement;
            if (parent) {
              output.push(`  Parent className: "${parent.className}"`);
              // Look for price elements in this parent
              const priceSpans = parent.querySelectorAll('span');
              output.push(`  Spans in parent: ${priceSpans.length}`);
              priceSpans.forEach((span, j) => {
                const styles = getComputedStyle(span);
                if (span.textContent.includes('€') || span.textContent.includes('£')) {
                  output.push(`    Price span ${j}: "${span.textContent}", textDecoration="${styles.textDecoration}", fontWeight="${styles.fontWeight}"`);
                }
              });
              
              // Look for crown/member icons
              const svgs = parent.querySelectorAll('svg');
              const crownIcons = Array.from(svgs).filter(svg => 
                svg.getAttribute('data-icon') === 'crown' || 
                svg.querySelector('path[d*="crown"]')
              );
              output.push(`  Crown icons: ${crownIcons.length}`);
            }
          });
        } else {
          output.push('Cart panel NOT found');
        }
      } else {
        // Original inspection code
        cartItems.forEach((item, i) => {
          const name = item.querySelector('[class*="itemName"], [class*="name"]');
          const priceRow = item.querySelector('[class*="priceRow"], [class*="price"]');
          const spans = priceRow ? priceRow.querySelectorAll('span') : [];
          const svgs = priceRow ? priceRow.querySelectorAll('svg') : [];
          
          output.push(`\nCart item ${i}: name="${name?.textContent.trim()}", spans=${spans.length}, svgs=${svgs.length}`);
          spans.forEach((s, j) => {
            const styles = getComputedStyle(s);
            output.push(`  span ${j}: text="${s.textContent}", className="${s.className}", textDecoration="${styles.textDecoration}"`);
          });
        });
      }
      
      return output.join('\n');
    });

    console.log('\n' + '='.repeat(80));
    console.log('CART INSPECTION OUTPUT:');
    console.log('='.repeat(80));
    console.log(cartInspection);
    console.log('='.repeat(80));

    console.log('\n✅ Cart verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/cart-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

verifyCartMemberPricing();
