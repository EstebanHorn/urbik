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

// Close any alerts
page.on('dialog', async dialog => {
  console.log('Dialog:', dialog.message());
  await dialog.dismiss();
});

// Log console messages
page.on('console', msg => console.log('PAGE:', msg.text()));

// Screenshot Río Negro con zoom alto - coordenadas correctas
console.log('Loading Río Negro with zoom 16 (correct coordinates)...');
await page.goto('http://localhost:3000/map?lat=-39.031&lon=-67.839&zoom=13', {
  waitUntil: 'networkidle',
  timeout: 30000
});
await page.waitForTimeout(4000);
await page.screenshot({ path: 'screenshot-rionegro-zoom.png' });
console.log('✓ Río Negro zoomed screenshot saved');

await browser.close();
console.log('Done!');
