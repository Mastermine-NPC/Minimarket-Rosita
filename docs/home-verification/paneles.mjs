const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  out = process.cwd() + "/docs/home-verification",
  results = [];
try {
  const p = await b.newPage({ viewport: { width: 1440, height: 700 } });
  await p.goto("http://127.0.0.1:4173/catalogo");
  const adds = p.locator(
    '.catalog-products button[aria-label^="Agregar al carrito"]:enabled',
  );
  for (let i = 0; i < 8; i++) await adds.nth(i).click();
  await p.getByRole("button", { name: /Abrir carrito/ }).click();
  const content = p.locator(".cart-sheet-scroll");
  await content.waitFor();
  await p.waitForTimeout(400);
  const before = await p.evaluate(() => scrollY);
  await content.hover();
  await p.mouse.wheel(0, 450);
  await p.waitForTimeout(300);
  assert((await content.evaluate((e) => e.scrollTop)) > 100);
  assert.equal(await p.evaluate(() => scrollY), before);
  await p.keyboard.press("Escape");
  results.push(
    "Carrito con ocho artículos: rueda desplaza panel y mantiene scroll de página; Escape cierra.",
  );
  await p.setViewportSize({ width: 390, height: 600 });
  await p.getByRole("button", { name: "Filtros", exact: true }).click();
  const filters = p.locator(".filter-sheet-scroll");
  await filters.waitFor();
  await p.waitForTimeout(300);
  await filters.hover();
  const pos = await p.evaluate(() => scrollY);
  await p.mouse.wheel(0, 350);
  await p.waitForTimeout(300);
  assert((await filters.evaluate((e) => e.scrollTop)) > 30);
  assert.equal(await p.evaluate(() => scrollY), pos);
  await p.keyboard.press("Escape");
  results.push(
    "Filtros 390×600: desplazamiento propio y cuerpo inmóvil; Escape cierra.",
  );
  await p.close();
  console.log(results);
  await fs.writeFile(
    out + "/paneles.json",
    JSON.stringify({ passed: results, browser: await b.version() }, null, 2),
  );
} finally {
  await b.close();
}
