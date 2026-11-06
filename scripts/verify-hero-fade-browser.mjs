/* global document, window, getComputedStyle, innerWidth, Image */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE || 'playwright/test');
const out = process.env.VERIFICATION_OUT || '/tmp/hero-fade-verification';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [], measurements = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.BASE_URL || 'http://localhost:4190';
async function pixels(buffer, points) {
  return page.evaluate(async ({ url, points }) => {
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
    return points.map(([x, y]) => [...ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data]);
  }, { url: 'data:image/png;base64,' + buffer.toString('base64'), points });
}
try {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 1000 });
    for (const route of ['/catalogo', '/categoria/consumibles', '/categoria/ferreteria', '/categoria/cuidado-personal']) {
      await page.goto(base + route); await page.locator('.catalog-page h1').waitFor(); await page.waitForTimeout(250);
      const visual = page.locator('.public-scene-visual'); await expect(visual).toHaveCount(1);
      const data = await visual.evaluate(el => {
        const css = getComputedStyle(el), copy = el.parentElement.querySelector('.public-scene-copy'), scene = el.parentElement;
        return { mask: css.maskImage, prefixMask: css.webkitMaskImage, repeat: css.maskRepeat, mode: css.maskMode, background: getComputedStyle(scene).backgroundColor, copyOpacity: getComputedStyle(copy).opacity, copyMask: getComputedStyle(copy).maskImage, buttonOpacity: getComputedStyle(copy.querySelector('button')).opacity, buttonMask: getComputedStyle(copy.querySelector('button')).maskImage, height: scene.getBoundingClientRect().height, top: scene.getBoundingClientRect().top, htmlWidth: document.documentElement.scrollWidth, viewport: innerWidth };
      });
      assert(data.mask.includes('linear-gradient')); assert(data.prefixMask.includes('linear-gradient')); assert.equal(data.mode, 'alpha'); assert.equal(data.copyMask, 'none'); assert.equal(data.buttonMask, 'none'); assert.equal(data.copyOpacity, '1'); assert.equal(data.buttonOpacity, '1'); assert.equal(data.background, 'rgba(0, 0, 0, 0)'); assert(data.htmlWidth <= width);
      const bounds = await page.locator('.public-scene').boundingBox(); const viewport = page.viewportSize();
      if (bounds.y + bounds.height + 2 <= viewport.height) {
        const shot = await page.screenshot(); const [edge, next] = await pixels(shot, [[width - 8, bounds.y + bounds.height - 1], [width - 8, bounds.y + bounds.height + 1]]);
        assert(edge.slice(0, 3).every((v, i) => Math.abs(v - next[i]) <= 4), `seam ${route} ${width}: ${edge} vs ${next}`);
      }
      const name = route.split('/').at(-1); await page.screenshot({ path: `${out}/${name}-${width}.png` });
      await page.locator('.public-scene-copy button').click(); await page.waitForTimeout(150); assert(await page.evaluate(() => window.scrollY > 0));
      if (route === '/catalogo') { const cards = page.locator('.product-card'); assert(await cards.count() > 0); await page.locator('.product-add:not(:disabled)').first().click(); await expect(page.locator('.in-cart').first()).toBeVisible(); }
      measurements.push({ route, width, ...data });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto(base + '/catalogo'); await page.locator('.catalog-page h1').waitFor();
  // Temporary test-only flat layers isolate actual compositing, not just CSS strings.
  const testStyle = await page.addStyleTag({ content: '.public-scene{background:#fff!important}.public-scene-visual{background:#000!important}.public-scene-visual>*{visibility:hidden!important}' });
  const box = await page.locator('.public-scene').boundingBox(); const positions = [.1, .4, .6, .8, .9, .99];
  const alphaPixels = await pixels(await page.screenshot(), positions.map(p => [1400, box.y + box.height * p]));
  assert(alphaPixels[0][0] <= 2 && alphaPixels[1][0] <= 2); assert(alphaPixels.at(-1)[0] >= 245); for (let i = 1; i < alphaPixels.length; i++) assert(alphaPixels[i][0] >= alphaPixels[i - 1][0]);
  await testStyle.evaluate(el => el.remove());
  for (const route of ['/categoria/educacion-oficina', '/categoria/tecnologia', '/categoria/jugueteria', '/nosotros', '/contacto', '/ayuda']) { await page.goto(base + route); await page.locator('.public-scene-visual').waitFor(); assert((await page.locator('.public-scene-visual').evaluate(el => getComputedStyle(el).maskImage)).includes('linear-gradient')); }
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto(base + '/catalogo'); await page.locator('.public-scene-visual video').waitFor(); await page.waitForFunction(() => document.querySelector('.public-scene-visual video')?.readyState >= 2); const time = await page.locator('.public-scene-visual video').evaluate(el => el.currentTime); await page.waitForTimeout(350); assert((await page.locator('.public-scene-visual video').evaluate(el => el.currentTime)) > time); await page.screenshot({ path: out + '/catalog-live-video.png' });
  await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' })); await page.waitForTimeout(500); await page.screenshot({ path: out + '/catalog-scrolled.png' }); assert.equal(await page.locator('.public-scene-visual').evaluate(el => getComputedStyle(el).transform), 'none');
  await page.goto(base); await page.locator('.home-opening h1').waitFor(); assert.equal(await page.locator('.public-scene-visual').count(), 0); assert.equal(await page.locator('.home-opening .cinema-scene-shade').first().evaluate(el => getComputedStyle(el).maskImage), 'none');
  await page.goto(base + '/login'); await page.locator('.auth-screen').waitFor(); assert.equal(await page.locator('.public-scene-visual').count(), 0);
  assert.deepEqual(errors, []); await fs.writeFile(out + '/results.json', JSON.stringify({ measurements, alphaProbe: { positions, pixels: alphaPixels, note: 'Technical temporary black source over white backdrop, removed before visual captures.' }, liveVideo: true, originalMedia: true, copyAndButtonUnmasked: true, homeAndAuthUnchanged: true, errors }, null, 2)); console.log('PASS vertical alpha fade: shared heroes, 3 viewports, real pixel alpha ramp, seamless catalog boundary, unmasked copy/controls, button/cart, live video, stationary mask during parallax, untouched Home/auth.');
} catch (error) { await page.screenshot({ path: out + '/failure.png' }).catch(() => {}); throw error; } finally { await browser.close(); }
