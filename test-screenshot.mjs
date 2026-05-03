import { chromium } from 'playwright';
import { Buffer } from 'buffer';

const browser = await chromium.launch();
const context = await browser.newContext({
  httpCredentials: {
    username: 'urbik',
    password: 'Urb1k_D3v_Acc3ss!'
  }
});
const page = await context.newPage();

page.setViewportSize({ width: 1920, height: 1080 });

// Screenshot 1: BSAS default
console.log('Loading BSAS map...');
await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'screenshot-bsas.png' });
console.log('✓ BSAS screenshot saved');

// Screenshot 2: Río Negro
console.log('Loading Río Negro...');
await page.goto('http://localhost:3000/map?lat=-41.1335&lon=-63.2889&zoom=13', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'screenshot-rionegro.png' });
console.log('✓ Río Negro screenshot saved');

await browser.close();
console.log('Done!');
