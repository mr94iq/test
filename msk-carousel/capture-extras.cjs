// Captures dashboard editor screens (news/service/project editors, add-job dialog, English UI)
// and light-mode website shots. Same demo login as capture-dash.cjs.
const path = require('path');
const { chromium, devices } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const BASE = process.env.MSK_BASE || 'https://mrtechiq.com/1.projects/msk-website/';
const OUT = path.join(__dirname, 'shots');

async function settle(page, ms = 900) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
  });
  await page.waitForTimeout(ms);
}
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name) }).then(() => console.log('captured', name));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto(BASE + '#/ar/dashboard');
  await settle(page, 1500);
  await page.fill('#r-login input[name="username"]', process.env.MSK_USER);
  await page.fill('#r-login input[name="password"]', process.env.MSK_PASS);
  await page.click('#r-login button[type="submit"]');
  await page.waitForSelector('.dash-sidebar', { timeout: 20000 });
  await settle(page, 1200);

  const editor = async (tab, type, idx, name) => {
    await page.evaluate(([t, ty, i]) => { window.switchDashTab(t); openDashEditor('edit', ty, i); }, [tab, type, idx]);
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, name);
    await page.evaluate(() => cancelDashEditor());
    await settle(page, 400);
  };
  await editor('dashNews', 'news', 0, 'dash-news-edit-ar.png');
  await editor('dashServices', 'service', 0, 'dash-service-edit-ar.png');
  await editor('dashProjects', 'project', 0, 'dash-project-edit-ar.png');

  await page.evaluate(() => window.switchDashTab('dashJobs'));
  await settle(page);
  const addJob = page.locator('#dashJobs [data-r-action="edit-job"]:visible, [data-r-action="edit-job"]:visible').first();
  if (await addJob.count()) {
    await addJob.click({ timeout: 5000 });
    await settle(page, 700);
    await shot(page, 'dash-job-add-ar.png');
    await page.keyboard.press('Escape');
    const close = page.locator('[data-r-action="close"]:visible').first();
    if (await close.count()) await close.click({ timeout: 3000 }).catch(() => {});
    await settle(page, 400);
  }

  // Dashboard UI in English
  await page.goto(BASE + '#/en/dashboard');
  await settle(page, 1200);
  await page.evaluate(() => window.switchDashTab('dashNews'));
  await settle(page);
  await shot(page, 'dash-news-en.png');

  // Website in light mode (desktop + mobile)
  const light = async (ctxOpts, prefix) => {
    const c = await browser.newContext(ctxOpts);
    await c.addInitScript(() => localStorage.setItem('msk_theme', 'light'));
    const p = await c.newPage();
    await p.goto(BASE + '#/ar/home');
    await settle(p, 1500);
    await shot(p, `${prefix}-home-ar-light.png`);
    await c.close();
  };
  await light({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 }, 'web');
  await light({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }, 'm');
  await browser.close();
})();
