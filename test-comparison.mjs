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

// BSAS with zoom 13
console.log('Loading BSAS with zoom 13...');
await page.goto('http://localhost:3000/map?lat=-34.921&lon=-57.955&zoom=13', {
  waitUntil: 'networkidle'
});
await page.waitForTimeout(3000);
await page.screenshot({ path: 'comparison-bsas.png' });
console.log('✓ BSAS comparison saved');

// Río Negro with zoom 13
console.log('Loading Río Negro with zoom 13...');
await page.goto('http://localhost:3000/map?lat=-39.031&lon=-67.839&zoom=13', {
  waitUntil: 'networkidle'
});
await page.waitForTimeout(3000);
await page.screenshot({ path: 'comparison-rionegro.png' });
console.log('✓ Río Negro comparison saved');

await browser.close();
console.log('Done!');
