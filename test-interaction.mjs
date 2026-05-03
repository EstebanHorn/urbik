import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  httpCredentials: {
    username: 'urbik',
    password: 'Urb1k_D3v_Acc3ss!'
  }
});
const page = await context.newPage();

page.setViewportSize({ width: 1920, height: 1080 });

console.log('Loading Río Negro...');
await page.goto('http://localhost:3000/map?lat=-39.031&lon=-67.839&zoom=13', {
  waitUntil: 'networkidle'
});
await page.waitForTimeout(2000);

// Find a parcel and click on it
const parcels = await page.locator('path').first();
console.log('Clicking on parcel...');
await parcels.click();
await page.waitForTimeout(1000);

await page.screenshot({ path: 'screenshot-rionegro-popup.png' });
console.log('✓ Screenshot with popup saved');

// Also test hover
const parcelElements = await page.locator('path').all();
if (parcelElements.length > 5) {
  console.log('Hovering over parcel...');
  await parcelElements[5].hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-rionegro-hover.png' });
  console.log('✓ Screenshot with hover saved');
}

await browser.close();
console.log('Done!');
