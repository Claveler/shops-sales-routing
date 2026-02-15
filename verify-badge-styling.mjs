import { chromium } from 'playwright';

async function verifyCrownBadgeStyling() {
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

    console.log('\nStep 5: Take screenshot of VIP tiles...');
    await page.screenshot({ path: '/tmp/vip-tiles-badge-styling.png', fullPage: false });
    console.log('✓ Screenshot saved: vip-tiles-badge-styling.png');

    console.log('\nStep 6: Inspecting crown badge styling...');
    const badgeInspection = await page.evaluate(() => {
      const output = [];
      
      // Find VIP Front Row tile
      const tiles = document.querySelectorAll('button');
      const vipTile = Array.from(tiles).find(t => t.textContent.includes('VIP Front Row'));
      
      if (vipTile) {
        output.push('=== VIP Front Row Tile Found ===\n');
        
        // Find the member badge
        const badge = vipTile.querySelector('[class*="memberBadge"]');
        if (badge) {
          const badgeStyles = getComputedStyle(badge);
          output.push('Member Badge (triangle background):');
          output.push(`  background-color: ${badgeStyles.backgroundColor}`);
          output.push(`  background: ${badgeStyles.background}`);
          output.push(`  width: ${badgeStyles.width}`);
          output.push(`  height: ${badgeStyles.height}`);
          
          // Find the crown icon
          const crownIcon = badge.querySelector('svg');
          if (crownIcon) {
            const iconStyles = getComputedStyle(crownIcon);
            output.push('\nCrown Icon (inside badge):');
            output.push(`  color: ${iconStyles.color}`);
            output.push(`  fill: ${iconStyles.fill}`);
            output.push(`  fontSize: ${iconStyles.fontSize}`);
            
            // Check the path element color
            const path = crownIcon.querySelector('path');
            if (path) {
              const pathStyles = getComputedStyle(path);
              output.push('\nCrown Icon Path:');
              output.push(`  fill: ${pathStyles.fill}`);
            }
          } else {
            output.push('\n❌ Crown icon NOT found');
          }
        } else {
          output.push('❌ Member badge NOT found');
        }
        
        // Also check the second VIP tile
        output.push('\n\n=== VIP Meet & Greet Pass Tile ===\n');
        const vipTile2 = Array.from(tiles).find(t => t.textContent.includes('VIP Meet & Greet'));
        if (vipTile2) {
          const badge2 = vipTile2.querySelector('[class*="memberBadge"]');
          if (badge2) {
            const badge2Styles = getComputedStyle(badge2);
            output.push('Member Badge:');
            output.push(`  background-color: ${badge2Styles.backgroundColor}`);
            
            const crownIcon2 = badge2.querySelector('svg');
            if (crownIcon2) {
              const icon2Styles = getComputedStyle(crownIcon2);
              output.push('\nCrown Icon:');
              output.push(`  color: ${icon2Styles.color}`);
            }
          }
        }
        
      } else {
        output.push('❌ VIP Front Row tile NOT found');
      }
      
      return output.join('\n');
    });

    console.log('\n' + '='.repeat(80));
    console.log('CROWN BADGE STYLING:');
    console.log('='.repeat(80));
    console.log(badgeInspection);
    console.log('='.repeat(80));

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/badge-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

verifyCrownBadgeStyling();
