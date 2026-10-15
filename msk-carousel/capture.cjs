// Captures real screenshots of the MSK website into shots/.
// Usage: node capture.cjs [pages...]   (default: all public pages, AR + EN, desktop + mobile)
const path = require('path');
const { chromium, devices } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const BASE = process.env.MSK_BASE || 'https://mrtechiq.com/1.projects/msk-website/';
const OUT = path.join(__dirname, 'shots');
const PAGES = ['home', 'about', 'services', 'projects', 'gallery', 'hse', 'certifications', 'news', 'careers', 'contact'];

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
  });
  await page.waitForTimeout(900);
}

async function go(page, lang, route, y = 0) {
  await page.goto(BASE + `#/${lang}/${route}`);
  await settle(page);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(y ? 1200 : 300);
}

(async () => {
  // "page@D,M" scrolls desktop by D px and mobile by M px and saves as *-s.png
  const only = process.argv.slice(2);
  const pages = only.length ? only : PAGES;
  const browser = await chromium.launch();
  const failed = new Set();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, locale: 'ar-IQ' });
  // Full iPhone screen (390x844) so shots match the phone mockup exactly.
  const mobile = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'ar-IQ' });
  for (const ctx of [desktop, mobile]) {
    ctx.on('requestfailed', (r) => failed.add(new URL(r.url()).host));
  }
  const d = await desktop.newPage();
  const m = await mobile.newPage();

  for (const lang of (process.env.LANGS || 'ar,en').split(',')) {
    for (const spec of pages) {
      const [p, offs] = spec.split('@');
      const [dy, my] = (offs || '0,0').split(',').map(Number);
      const sfx = offs ? '-s' : '';
      if (!process.env.MOBILE_ONLY) {
        await go(d, lang, p, dy);
        await d.screenshot({ path: path.join(OUT, `web-${p}-${lang}${sfx}.png`) });
      }
      await go(m, lang, p, my);
      await m.screenshot({ path: path.join(OUT, `m-${p}-${lang}${sfx}.png`) });
      console.log('captured', lang, p, sfx);
    }
  }
  console.log('failed hosts:', [...failed].join(', ') || 'none');
  await browser.close();
})();
