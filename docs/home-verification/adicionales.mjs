const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = process.cwd() + "/docs/home-verification",
  b = await chromium.launch(),
  base = process.env.BASE_URL || "http://127.0.0.1:4173",
  passed = [],
  metrics = {},
  errors = [];
const ctx = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: { dir: out + "/video", size: { width: 1440, height: 1000 } },
});
const p = await ctx.newPage();
p.on("pageerror", (e) => errors.push(e.message));
await p.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries())
      if (!e.hadRecentInput) window.__shifts.push(e.value);
  }).observe({ type: "layout-shift", buffered: true });
});
try {
  await p.goto(base);
  await p.locator(".home-hero").waitFor();
  await p.waitForTimeout(1300);
  const y0 = await p
    .locator(".home-photo-move")
    .evaluate((e) => getComputedStyle(e).transform);
  await p.mouse.wheel(0, 240);
  await p.waitForTimeout(500);
  const y1 = await p
    .locator(".home-photo-move")
    .evaluate((e) => getComputedStyle(e).transform);
  assert.notEqual(y0, y1);
  metrics.parallax = [y0, y1];
  passed.push(
    "Parallax comprobado por transformación en scroll; flor ligada a desplazamiento.",
  );
  await p.locator(".home-carousel-viewport").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const card = p.locator(".home-product-slide").first();
  await card.locator("a").first().hover();
  await p.waitForTimeout(250);
  assert.equal(
    await p.locator(".presentation-cursor").getAttribute("data-theme"),
    "light",
  );
  assert.equal(await p.locator(".presentation-cursor span").innerText(), "Ver");
  assert.notEqual(
    await card
      .locator("a")
      .first()
      .evaluate((e) => getComputedStyle(e).cursor),
    "none",
  );
  const before = await p
    .getByRole("button", { name: /Abrir carrito/ })
    .getAttribute("aria-label");
  const add = card.locator('button[aria-label^="Agregar al carrito"]'),
    box = await add.boundingBox();
  await p.mouse.move(box.x + box.width - 15, box.y + 20);
  await p.mouse.down();
  await p.mouse.move(box.x - 180, box.y + 20, { steps: 20 });
  await p.mouse.up();
  await p.waitForTimeout(500);
  assert.equal(
    await p
      .getByRole("button", { name: /Abrir carrito/ })
      .getAttribute("aria-label"),
    before,
  );
  passed.push(
    "Cursor claro contextual y cursor nativo conservado; arrastrar desde Agregar no modifica carrito.",
  );
  await p.getByRole("button", { name: /Abrir carrito/ }).click();
  await p.getByRole("dialog").waitFor();
  await p.waitForTimeout(250);
  assert.equal(
    await p.locator(".presentation-cursor").getAttribute("data-visible"),
    "false",
  );
  await p.keyboard.press("Escape");
  for (let i = 0; i < 3; i++) {
    await p
      .getByRole("link", { name: "Catálogo", exact: true })
      .first()
      .click();
    await p.locator(".catalog-products").waitFor();
    assert.equal(await p.locator(".presentation-cursor").count(), 0);
    await p.getByRole("link", { name: "Inicio", exact: true }).first().click();
    await p.locator(".home-experience").waitFor();
    assert.equal(await p.locator(".home-brand-loader").count(), 0);
    assert.equal(await p.locator(".presentation-cursor").count(), 1);
  }
  passed.push(
    "Tres salidas/regresos: un cursor, sin cargador repetido; cursor se oculta en panel y al desmontar.",
  );
  await p.locator(".home-category-section").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  assert.equal(
    await p
      .locator(".home-marquee-track")
      .evaluate((e) => getComputedStyle(e).animationPlayState),
    "paused",
  );
  passed.push("Marquesina pausada fuera de pantalla.");
  await p.locator(".home-color-bridge").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  metrics.bridge = await p
    .locator(".home-color-bridge>div")
    .evaluate((e) => getComputedStyle(e).transform);
  metrics.layoutShiftSample = await p.evaluate(() => ({
    values: window.__shifts,
    sum: window.__shifts.reduce((a, b) => a + b, 0),
  }));
  await p.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 768, 390]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base);
    await p.locator(".home-hero").waitFor();
    await p.evaluate(async () => {
      document
        .querySelectorAll(".home-category-media img")
        .forEach((e) => (e.loading = "eager"));
      await document.fonts.ready;
    });
    await p.waitForTimeout(600);
    await p.screenshot({ path: out + `/arriba-${width}.png` });
    await p
      .locator(".home-category-ferreteria")
      .screenshot({ path: out + `/categoria-${width}.png` });
    await p
      .locator(".home-featured-section")
      .screenshot({ path: out + `/destacados-${width}.png` });
  }
  const c = await b.newContext(),
    q = await c.newPage();
  await q.route("**/images/home/tools-*.webp", (r) => r.abort());
  await q.goto(base);
  await q.locator(".home-category-ferreteria").scrollIntoViewIfNeeded();
  await q.waitForFunction(
    () =>
      !!document.querySelector(
        ".home-category-ferreteria .home-image-unavailable",
      ),
  );
  assert(await q.locator(".home-category-ferreteria").isVisible());
  await q.locator(".home-category-ferreteria").click();
  await q.locator(".catalog-products").waitFor();
  await c.close();
  passed.push(
    "Imagen ambiental fallida muestra alternativa y conserva enlace de categoría.",
  );
  assert.equal(errors.length, 0);
  console.log(passed);
} finally {
  await fs.writeFile(
    out + "/adicionales.json",
    JSON.stringify(
      { passed, metrics, errors, browser: await b.version(), base },
      null,
      2,
    ),
  );
  await ctx.close();
  await b.close();
}
