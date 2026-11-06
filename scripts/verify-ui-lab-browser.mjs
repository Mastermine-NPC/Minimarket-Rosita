/* global document, window, innerWidth */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE || 'playwright/test');
const out = process.env.VERIFICATION_OUT || '/tmp/ui-lab-verification';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage(); page.setDefaultTimeout(10000); const errors = []; const requests = [];
page.on('pageerror', e => errors.push(e.message)); page.on('request', r => requests.push(r.url()));
const base = process.env.BASE_URL || 'http://localhost:4190';
const nav = name => page.getByRole('navigation', { name: 'Secciones del laboratorio' }).getByRole('button', { name, exact: true });
const select = async name => { if (await page.getByRole('button', { name: 'Abrir navegación' }).isVisible()) await page.getByRole('button', { name: 'Abrir navegación' }).click(); await nav(name).click(); };
try {
  await page.goto(base + '/laboratorio-ui'); await expect(page.getByRole('heading', { name: 'Design Tokens', exact: true })).toBeVisible();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  assert(!requests.some(url => /store-entry|rosita-provider|home-page|order-notifications/.test(url)));
  assert.equal(await page.locator('.store-header').count(), 0);
  await page.screenshot({ path: out + '/tokens-1440.png' });
  await page.getByLabel('Buscar componentes').fill('Botones'); await expect(nav('Botones')).toBeVisible(); await expect(nav('Tarjetas')).toHaveCount(0); await page.getByLabel('Buscar componentes').fill('');
  await select('Botones'); await page.getByLabel('Texto', { exact: true }).fill('Acción de prueba'); await page.locator('.preview-frame').getByRole('button', { name: 'Acción de prueba' }).click(); await expect(page.getByRole('status')).toContainText('ejecutada');
  for (const state of ['hover', 'active', 'focus', 'disabled', 'loading', 'error', 'success', 'default']) { await page.getByLabel('Estado', { exact: true }).selectOption(state); await expect(page.locator('.demo-button').first()).toHaveAttribute('data-state', state); }
  for (const variant of ['outline', 'soft', 'solid']) { await page.getByLabel('Variante', { exact: true }).selectOption(variant); await expect(page.locator('.demo-button')).toHaveAttribute('data-look', variant); }
  await page.getByLabel('Tamaño', { exact: true }).selectOption('large'); await page.getByLabel('Radio', { exact: true }).selectOption('24'); await page.getByLabel('Icono', { exact: true }).uncheck(); await page.screenshot({ path: out + '/explorer-1440.png' });
  await select('Campos de entrada'); await page.getByLabel('Estado', { exact: true }).selectOption('error'); await expect(page.locator('.preview-frame input')).toHaveAttribute('aria-invalid', 'true'); await page.getByLabel('Mensaje de error').fill('Error de prueba'); await expect(page.locator('.demo-field small')).toHaveText('Error de prueba');
  await select('Tarjetas'); await page.getByLabel('Título', { exact: true }).fill('Tarjeta de prueba'); await expect(page.locator('.demo-card h3')).toHaveText('Tarjeta de prueba'); await page.getByLabel('Ilustración', { exact: true }).uncheck(); await expect(page.locator('.demo-card .demo-product-art')).toHaveCount(0); await page.locator('.demo-card').getByRole('button', { name: 'Agregar', exact: true }).click();
  await select('Menús de navegación'); await page.getByLabel('Distribución').selectOption('vertical'); await page.getByRole('navigation', { name: 'Menú de demostración' }).getByRole('button', { name: 'Catálogo', exact: true }).click(); await expect(page.locator('.demo-navigation [aria-current=page]')).toHaveText('Catálogo'); await page.locator('.demo-navigation summary').click(); await page.locator('.demo-navigation').getByRole('button', { name: 'Ayuda', exact: true }).click(); await expect(page.locator('.demo-navigation [role=status]')).toContainText('Ayuda');
  await select('Modales y ventanas'); const trigger = page.getByRole('button', { name: 'Abrir modal', exact: true }); await trigger.click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(trigger).toBeFocused(); await trigger.click(); await page.getByRole('button', { name: 'Confirmar', exact: true }).click(); await expect(page.getByRole('dialog')).not.toBeVisible();
  for (const name of ['Componentes promocionales', 'Componentes de interacción', 'Animaciones y transiciones', 'Documentación']) { await select(name); await expect(page.getByRole('heading', { level: 1 })).toBeVisible(); }
  await select('Comparador A/B');
  for (const variant of ['A', 'B']) {
    const catalog = page.getByRole('region', { name: `Catálogo variante ${variant}` });
    await catalog.getByLabel('Buscar productos').fill('Arroz Rosita'); await expect(catalog.locator('.lab-product')).toHaveCount(1);
    await catalog.getByRole('button', { name: 'Limpiar filtros' }).click(); await catalog.getByLabel('Categoría', { exact: true }).selectOption('Despensa'); await expect(catalog.locator('.lab-product')).toHaveCount(2);
    await catalog.getByRole('button', { name: 'Arroz Rosita', exact: true }).click(); await expect(catalog.getByRole('dialog', { name: 'Arroz Rosita' })).toBeVisible(); await expect(catalog.getByRole('dialog', { name: 'Arroz Rosita' })).toContainText('grano largo'); await catalog.getByRole('button', { name: 'Agregar al carrito', exact: true }).click(); await page.keyboard.press('Escape');
    await catalog.getByRole('button', { name: 'Carrito (1)', exact: true }).click(); await expect(catalog.getByRole('dialog', { name: 'Compra simulada' })).toContainText('S/ 4.50'); await catalog.getByRole('button', { name: 'Completar simulación', exact: true }).click(); await expect(catalog.getByRole('status')).toContainText('Compra simulada completada');
    await catalog.getByLabel('Buscar productos').fill('sin-coincidencias'); await expect(catalog.getByText('No se encontraron productos.', { exact: false })).toBeVisible(); await catalog.getByRole('button', { name: 'Limpiar filtros' }).click();
  }
  await page.screenshot({ path: out + '/comparison-1440.png', fullPage: true });
  await select('Pruebas de usabilidad'); await expect(page.getByText('Sin registros.', { exact: false })).toBeVisible(); await page.screenshot({path:out+'/evaluation-empty-1440.png',fullPage:true});
  await page.getByLabel('Identificador anónimo').fill('TEST_ONLY');
  await page.getByRole('button', { name: 'Iniciar cronómetro', exact: true }).click(); await page.waitForTimeout(250); await page.getByRole('button', { name: 'Pausar', exact: true }).click(); assert(Number(await page.getByLabel('Tiempo (segundos)').inputValue()) > 0); await page.getByRole('button', { name: 'Reiniciar tiempo', exact: true }).click();
  for (const variant of ['A', 'B']) for (let task = 0; task < 4; task++) {
    await page.getByLabel('Variante', { exact: true }).selectOption(variant); await page.getByLabel('Tarea', { exact: true }).selectOption(String(task)); await page.getByLabel('Tiempo (segundos)').fill(String((task + 1) * (variant === 'A' ? 10 : 8))); await page.getByLabel('Errores observados').fill(variant === 'A' ? '1' : '0'); await page.getByLabel('Resultado', { exact: true }).selectOption(task === 3 && variant === 'A' ? 'failure' : 'success'); await page.getByLabel('Comentarios', { exact: true }).fill('AUTOMATED TECHNICAL FIXTURE — not a human participant'); await page.getByRole('button', { name: 'Guardar registro', exact: true }).click();
  }
  assert.equal(await page.locator('.trial-list article').count(), 8); const table = page.locator('table'); await expect(table).toContainText('100.0%'); await expect(table).toContainText('0.0%'); await expect(table).toContainText('-8.0'); await expect(page.locator('.metric-chart')).toBeVisible();
  await page.getByLabel('Participante', { exact: true }).selectOption('TEST_ONLY');
  for (const name of ['Exportar registros CSV', 'Exportar resultados CSV']) { const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name, exact: true }).click(); const file = await downloaded; await file.saveAs(out + '/' + file.suggestedFilename()); const exported = await fs.readFile(out + '/' + file.suggestedFilename(), 'utf8'); assert(exported.startsWith('\uFEFF')); assert.equal(exported.split('\r\n').length, 9); }
  const keys = await page.evaluate(() => Object.keys(localStorage)); assert.deepEqual(keys, ['rosita-ui-lab:evaluations:v1']);
  await page.reload(); await select('Pruebas de usabilidad'); await expect(page.locator('.trial-list article')).toHaveCount(8);
  await page.evaluate(() => localStorage.removeItem('rosita-ui-lab:evaluations:v1')); await page.reload(); await select('Pruebas de usabilidad'); await expect(page.locator('.trial-list article')).toHaveCount(0);
  await select('Componentes 3D'); await page.getByRole('button', { name: 'Cargar modelo 3D', exact: true }).click(); await expect(page.locator('canvas')).toBeVisible(); await page.waitForTimeout(5000); await page.screenshot({ path: out + '/model-1440.png' }); await page.getByRole('button', { name: 'Descargar visor', exact: true }).click(); await expect(page.locator('canvas')).toHaveCount(0);
  for (const width of [768, 390, 320]) { await page.setViewportSize({ width, height: 900 }); await select('Botones'); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await page.screenshot({ path: `${out}/explorer-${width}.png`, fullPage: true }); await page.getByLabel('Vista previa').selectOption('mobile'); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
  await page.emulateMedia({ reducedMotion: 'reduce' }); await select('Animaciones y transiciones'); await page.getByRole('button', { name: 'Alternar transición' }).click(); assert.equal(await page.locator('.motion-sample').evaluate(el => window.getComputedStyle(el).transitionDuration), '0s');
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of ['/catalogo', '/categoria/halloween', '/carrito', '/login', '/checkout', '/nosotros', '/']) {
    await page.goto(base + path); await page.locator('h1').first().waitFor(); await page.waitForTimeout(300); assert.equal(await page.locator('#rosita-ui-lab-host').count(), 0); assert.equal(await page.locator('a[href*="laboratorio-ui"]').count(), 0); if (path === '/catalogo') { await expect(page.locator('.product-card').first()).toBeVisible(); await page.screenshot({ path: out + '/store-catalog.png' }); }
  }
  const before = await page.evaluate(() => ({ storage: localStorage.getItem('minimarket-rosita:app'), font: window.getComputedStyle(document.body).fontFamily, background: window.getComputedStyle(document.body).backgroundColor }));
  await page.goto(base + '/laboratorio-ui'); await expect(page.getByRole('heading', { name: 'Design Tokens', exact: true })).toBeVisible(); assert.equal(await page.evaluate(() => localStorage.getItem('minimarket-rosita:app')), before.storage); await page.goto(base + '/catalogo'); await page.locator('.product-card').first().waitFor(); assert.equal(await page.evaluate(() => window.getComputedStyle(document.body).fontFamily), before.font); assert.equal(await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor), before.background);
  assert.deepEqual(errors, []); await fs.writeFile(out + '/results.json', JSON.stringify({ technicalTestsOnly: true, participantDataSeededInApplication: false, tasksCompletedPerVariant: 4, componentFamilies: 5, viewports: [1440, 768, 390, 320], errors, isolatedStorage: true, storeRoutesVerified: 7 }, null, 2)); console.log('PASS UI LAB browser: five components, A/B four tasks each, timer/manual entry/persistence/CSV, 3D, responsive, reduced motion, store state/style isolation and seven commercial routes. Technical fixtures only.');
} catch (error) { console.log(await page.locator('select').evaluateAll(nodes => nodes.map(n => ({html:n.outerHTML, labels:[...n.labels].map(l => l.textContent)})))); await page.screenshot({path:out+'/failure.png'}); throw error; } finally { await browser.close(); }
