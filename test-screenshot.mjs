import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/box-office');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'screenshots/verify-timeslot-pill-before.png', fullPage: false });
  console.log('Screenshot 1 taken');
  
  // Click calendar button
  const calendarBtn = page.locator('button[aria-label="Select date and time"], button:has-text("Select date and time")').first();
  await calendarBtn.click();
  await page.waitForTimeout(1000);
  
  // Click Sat 14
  await page.locator('button:has-text("Sat"):has-text("14")').click();
  await page.waitForTimeout(500);
  
  // Click 9:30 PM timeslot
  await page.locator('button:has-text("9:30 PM")').click();
  await page.waitForTimeout(500);
  
  // Click Confirm
  await page.locator('button:has-text("Confirm selection")').click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshots/verify-timeslot-pill-active.png', fullPage: false });
  console.log('Screenshot 2 taken');
  
  // Click X button on pill
  const clearBtn = page.locator('button[aria-label="Clear timeslot"]').first();
  await clearBtn.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshots/verify-timeslot-pill-cleared.png', fullPage: false });
  console.log('Screenshot 3 taken');
  
  await browser.close();
})();
