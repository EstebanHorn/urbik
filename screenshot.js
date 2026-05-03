const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/map', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await page.screenshot({ path: 'screenshot1-default.png' });
  console.log('Screenshot 1 (BSAS default) saved');

  // Navigate to Río Negro - coordinates
  await page.goto('http://localhost:3000/map?lat=-41.1335&lon=-63.2889&zoom=13', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshot2-rionegro.png' });
  console.log('Screenshot 2 (Río Negro) saved');

  await browser.close();
})();
