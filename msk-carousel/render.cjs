// Renders every .slide in slides.html to out/NN.png at 1080x1350 (Instagram 4:5).
// Usage: node render.cjs [slideNumbers...]
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

(async () => {
  const only = process.argv.slice(2).map(Number);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1160, height: 1430 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'slides.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    if (only.length && !only.includes(i + 1)) continue;
    const file = path.join(__dirname, 'out', `hi-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: file });
    console.log('rendered', file);
  }
  await browser.close();
})();
