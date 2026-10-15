// Logs into the MSK admin dashboard and captures each section into shots/dash-*.png.
// Credentials come from the MSK_USER / MSK_PASS environment variables.
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const BASE = process.env.MSK_BASE || 'https://mrtechiq.com/1.projects/msk-website/';
const OUT = path.join(__dirname, 'shots');
const TABS = ['dashOverview', 'dashJobs', 'dashApplications', 'dashStaff', 'dashWhatsapp', 'dashGlobal', 'dashHome', 'dashAbout',
  'dashClients', 'dashServices', 'dashProjects', 'dashGallery', 'dashCert', 'dashNews', 'dashHSE', 'dashInbox', 'dashUserMgmt'];

async function settle(page, ms = 900) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
  });
  await page.waitForTimeout(ms);
}

(async () => {
  const lang = process.argv[2] || 'ar';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 160)); });

  await page.goto(BASE + `#/${lang}/dashboard`);
  await settle(page, 1500);
  await page.screenshot({ path: path.join(OUT, `dash-login-${lang}.png`) });

  await page.fill('#r-login input[name="username"]', process.env.MSK_USER);
  await page.fill('#r-login input[name="password"]', process.env.MSK_PASS);
  await page.click('#r-login button[type="submit"]');
  await page.waitForSelector('.dash-sidebar', { timeout: 20000 });
  await settle(page, 1500);

  for (const tab of TABS) {
    const ok = await page.evaluate((t) => { if (!document.querySelector(`[onclick="switchDashTab('${t}')"]`)) return false; window.switchDashTab(t); return true; }, tab);
    if (!ok) { console.log('no access to', tab); continue; }
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, `dash-${tab.replace('dash', '').toLowerCase()}-${lang}.png`) });
    console.log('captured', tab);
  }
  await browser.close();
})();
