# MSK website — Instagram carousel (Mr Tech)

20 Arabic carousel posts (1080×1350, 4:5) presenting the website and dashboard that Mr Tech built for MSK (msk-gf.com).

- `out/01.png` … `out/20.png` — final images, in posting order.
- `preview.jpg` — all 20 posts on one sheet (read right to left).
- `slides.html` + `styles.css` + `app.js` — the source; header/footer, section bar and icons are injected by `app.js`.
- `shots/` — real screenshots of the site (desktop 1440×900, mobile 390×844) and dashboard.

## Rebuild

```bash
# 1. screenshots (public pages, then dashboard with the demo account)
node capture.cjs                       # add page@desktopY,mobileY for scrolled shots, LANGS=ar, MOBILE_ONLY=1
MSK_USER=... MSK_PASS=... node capture-dash.cjs ar
MSK_USER=... MSK_PASS=... node capture-extras.cjs
# 2. render slides and export 1080x1350
node render.cjs && python3 tools/export.py
```

Set `MSK_BASE` to point the capture scripts at another copy of the site, and `PLAYWRIGHT_PATH` if Playwright is installed globally.

Fonts: Alexandria (headings), Readex Pro (body), bundled in `assets/fonts`.
