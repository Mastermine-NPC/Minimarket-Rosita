/* global document, window, innerWidth, innerHeight, scrollY, getComputedStyle */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE || 'playwright/test');
const out = process.env.VERIFICATION_OUT || '/tmp/home-auth-verification';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage(); page.setDefaultTimeout(15000);
const errors = [], requests = [], measurements = [];
page.on('pageerror', error => errors.push(error.message)); page.on('request', req => requests.push(req.url()));
const base = process.env.BASE_URL || 'http://localhost:4190';
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('minimarket-rosita:app')).data);
const waitAuth = async mode => { await page.locator(`.auth-screen.is-${mode}`).waitFor(); await page.waitForTimeout(400); };
try {
  for (const [width, height] of [[1440, 1000], [1024, 768], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base); await page.locator('.home-opening h1').waitFor(); await page.waitForTimeout(1300);
    assert.equal(await page.locator('.cinema-hero-media,.liquid-videos,.cinema-intro,.home-hero').count(), 0);
    assert.equal(await page.locator('.home-experience video').count(), 8);
    const first = page.locator('.home-experience video').first(); await expect(first).toHaveAttribute('src', '/images/video/cinematic/coca-cola-video-cinematografic.mp4'); if (width === 1440) assert(!requests.some(url => /Arequipa-backgraound|video_halloween/.test(url)), 'removed Home films must not load');
    const home = await page.locator('.home-opening .cinema-scene').first().evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height, viewport: innerHeight, scroll: scrollY }));
    assert(Math.abs(home.top) <= 4, `opening gap at ${width}: ${JSON.stringify(home)}`); assert(home.height >= height - 2);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${out}/home-${width}.png` });
    for (const [route, mode] of [['/login', 'login'], ['/registro', 'registering']]) {
      await page.goto(base + route); await waitAuth(mode);
      const dims = await page.locator('.auth-screen').evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, top: el.getBoundingClientRect().top, viewport: innerHeight }));
      assert.equal(Math.round(dims.width), width); assert(dims.height >= height - 2); assert(Math.abs(dims.top) < 4);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await expect(page.locator('#auth-email')).toBeVisible(); await expect(page.locator('.auth-screen .ambient-video')).toHaveCount(1);
      await page.screenshot({ path: `${out}/${mode}-${width}.png`, fullPage: true }); measurements.push({ route, width, height, ...dims });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto(base); await page.locator('.home-opening h1').waitFor();
  await page.waitForFunction(() => document.querySelector('.home-opening video')?.readyState >= 2); const video = page.locator('.home-opening video').first(); const start = await video.evaluate(v => v.currentTime); await page.waitForTimeout(400); assert((await video.evaluate(v => v.currentTime)) > start);
  await page.locator('.cinema-film-picker').first().getByRole('button', { name: 'Inka Kola', exact: true }).click(); await expect(page.locator('#bebidas .cinema-film-picker button[aria-pressed=true]')).toHaveText('Inka Kola');
  await page.locator('.cinema-film-picker').first().getByRole('button', { name: 'Coca-Cola', exact: true }).click();
  for (const name of ['Oreo', 'Nivea', 'Faber-Castell', 'Ferretería', 'Coca-Cola']) { await page.locator('.cinema-scene-navigation').getByRole('button', { name, exact: true }).click(); await page.waitForTimeout(1000); await expect(page.locator('.cinema-scene-navigation button[aria-current=step]')).toHaveText(name); assert(await page.locator('.cinema-scene:not([aria-hidden=true])').evaluate(el => el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0)); await page.screenshot({path: `${out}/scene-${name.replace(/[^a-z0-9]/gi, '-')}.png`}); }
  await page.locator('.navigation-discover').focus(); await page.keyboard.press('Enter'); await page.getByRole('link', { name: 'Iniciar sesión de demostración', exact: true }).focus(); await page.keyboard.press('Enter'); await waitAuth('login');
  assert.equal(await page.locator('.pin-spacer,.home-experience,.liquid-media-plane').count(), 0);
  await page.locator('#auth-email').fill('not-an-email'); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await expect(page.locator('#auth-email-error')).toBeVisible();
  await page.locator('#auth-email').fill('cliente@rosita.test'); await page.locator('#auth-password').fill('WrongTechnicalPassword!'); await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click(); await expect(page.locator('#auth-password')).toHaveAttribute('type', 'text'); await page.getByRole('button', { name: 'Ocultar contraseña', exact: true }).click(); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await expect(page.getByText('El correo o la contraseña de demostración no coinciden.', { exact: true })).toBeVisible();
  await page.evaluate(() => { window.__authVideo = document.querySelector('.auth-visual video'); });
  await page.getByRole('link', { name: 'Regístrate', exact: true }).click(); await waitAuth('registering'); assert(await page.evaluate(() => window.__authVideo === document.querySelector('.auth-visual video')), 'video should survive login/register switching');
  await page.getByRole('button', { name: 'Crear cuenta de demostración', exact: true }).click(); await expect(page.locator('#auth-name-error')).toBeVisible();
  await page.locator('#auth-name').fill('Technical verification'); await page.locator('#auth-email').fill('cliente@rosita.test'); await page.locator('#auth-password').fill('TechnicalOnly!2026'); await page.locator('#auth-confirm').fill('MismatchOnly!'); await page.getByRole('button', { name: 'Crear cuenta de demostración', exact: true }).click(); await expect(page.locator('#auth-confirm-error')).toContainText('no coinciden');
  await page.locator('#auth-confirm').fill('TechnicalOnly!2026'); await page.getByRole('button', { name: 'Crear cuenta de demostración', exact: true }).click(); await expect(page.locator('#auth-email-error')).toContainText('Ya existe');
  await page.goto(base + '/catalogo'); await page.locator('.product-card').first().waitFor(); await page.locator('.product-add:not(:disabled)').first().click(); const before = await state(); assert(Object.keys(before.cart).length > 0);
  await page.goto(base + '/registro?volver=%2Fcarrito'); await waitAuth('registering'); const email = `technical-${Date.now()}@rosita.test`; await page.locator('#auth-name').fill('Technical verification'); await page.locator('#auth-email').fill(email); await page.locator('#auth-password').fill('TechnicalOnly!2026'); await page.locator('#auth-confirm').fill('TechnicalOnly!2026'); await page.getByRole('button', { name: 'Crear cuenta de demostración', exact: true }).click(); await page.waitForURL('**/carrito');
  const after = await state(); assert(after.users.some(u => u.email === email && u.id === after.sessionUserId)); assert.deepEqual(after.cart, before.cart); assert.deepEqual(after.inventory, before.inventory); assert.deepEqual(after.orders, before.orders); assert.deepEqual(after.sales, before.sales);
  await page.reload(); assert.equal((await state()).sessionUserId, after.sessionUserId);
  await page.goto(base + '/cuenta'); await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await waitAuth('login'); assert.equal((await state()).sessionUserId, null);
  await page.locator('#auth-email').fill(email); await page.locator('#auth-password').fill('TechnicalOnly!2026'); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await page.waitForURL('**/cuenta'); assert.equal((await state()).sessionUserId, after.sessionUserId);
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await waitAuth('login'); await page.locator('.auth-demo-access summary').click(); await page.getByRole('button', { name: 'Completar acceso de cliente', exact: true }).click(); await expect(page.locator('#auth-email')).toHaveValue('cliente@rosita.test'); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await page.waitForURL('**/cuenta'); await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await waitAuth('login');
  for (const [button, route] of [['administrador', '/admin'], ['caja', '/caja']]) {
    await page.goto(base + '/personal'); await waitAuth('login'); await page.locator('.auth-demo-access summary').click(); await page.getByRole('button', { name: `Completar acceso de ${button}`, exact: true }).click(); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await page.waitForURL('**' + route); await page.goto(base + '/cuenta'); await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await waitAuth('login');
  }
  for (const route of ['/catalogo', '/categoria/halloween', '/producto/ROS-001', '/carrito', '/checkout', '/nosotros', '/laboratorio-ui']) { await page.goto(base + route); await page.locator('h1').first().waitFor(); await page.waitForTimeout(300); assert.equal(await page.locator('.auth-screen').count(), 0); }
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(base); await page.locator('.home-opening h1').waitFor(); assert.equal(await page.locator('.cinema-story.is-pinned').count(), 0); assert.equal(await page.locator('.cinema-hero-media,.liquid-videos').count(), 0); await expect(page.locator('.home-opening .ambient-video > img').first()).toBeVisible();
  await page.goto(base + '/login'); await waitAuth('login'); assert.equal(await page.locator('.auth-form-view').evaluate(el => getComputedStyle(el).animationName), 'none'); await page.getByRole('link', { name: 'Regístrate', exact: true }).click(); await waitAuth('registering');
  const touch = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const touchPage = await touch.newPage(); touchPage.on('pageerror', e => errors.push(e.message));
  await touchPage.goto(base + '/login'); await touchPage.locator('.auth-screen.is-login').waitFor(); await touchPage.locator('#auth-password').fill('TechnicalOnly!'); await touchPage.getByRole('button',{name:'Mostrar contraseña',exact:true}).tap(); await expect(touchPage.locator('#auth-password')).toHaveAttribute('type','text'); await touchPage.getByRole('link',{name:'Regístrate',exact:true}).tap(); await touchPage.locator('.auth-screen.is-registering').waitFor(); await touchPage.locator('#auth-confirm').scrollIntoViewIfNeeded(); await expect(touchPage.locator('#auth-confirm')).toBeVisible(); assert(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await touchPage.screenshot({path:out+'/touch-register.png',fullPage:true}); await touch.close();
  assert.deepEqual(errors, []); await fs.writeFile(out + '/results.json', JSON.stringify({ technicalTestsOnly: true, measurements, removedSections: true, firstVideo: 'coca-cola-video-cinematografic.mp4', authentication: ['validation', 'password-toggle', 'mismatch', 'duplicate-email', 'register', 'login', 'session-reload', 'logout', 'returnTo', 'customer-demo', 'admin-demo', 'cashier-demo', 'cart-inventory-orders-preserved'], videoContinuity: true, reducedMotion: true, errors }, null, 2)); console.log('PASS Home/Auth: Coca-Cola opening, 8 original scene videos, removed intro sections, full-screen at five viewports, uninterrupted auth video, actual local register/login/logout/roles/validation, preserved commerce, reduced motion and other routes.');
} catch (error) { await page.screenshot({ path: out + '/failure.png', fullPage: true }).catch(() => {}); console.error(await page.locator('h1').allTextContents()); throw error; } finally { await browser.close(); }
