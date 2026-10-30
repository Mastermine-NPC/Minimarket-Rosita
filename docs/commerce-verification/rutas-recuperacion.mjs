const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const results = [];
await p.goto("http://127.0.0.1:5173/catalogo");
await p.locator(".catalog-products").waitFor();
const links = await p
  .locator("article h3 a")
  .evaluateAll((es) =>
    es.map((e) => ({ href: e.getAttribute("href"), name: e.textContent })),
  );
for (const item of links) {
  await p.goto("http://127.0.0.1:5173" + item.href);
  await p.getByRole("heading", { name: item.name, exact: true }).waitFor();
  results.push({ href: item.href, result: "verificado" });
}
for (const path of [
  "/producto/inexistente",
  "/categoria/inexistente",
  "/ruta-inexistente",
]) {
  await p.goto("http://127.0.0.1:5173" + path);
  await p.locator("h1").waitFor();
  assert.match(
    await p.locator("h1").innerText(),
    /encontr|existe|no hay nada/i,
  );
  results.push({ href: path, result: "verificado" });
}
await p.close();
const ctx = await b.newContext();
await ctx.addInitScript(() => {
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new DOMException("Blocked", "SecurityError");
    },
  });
});
const q = await ctx.newPage();
q.on("pageerror", (e) => errors.push(e.message));
await q.goto("http://127.0.0.1:5173");
await q.locator("h1").waitFor();
await q
  .locator(".home-products article")
  .first()
  .getByRole("button", { name: /Agregar al carrito:/ })
  .click();
await q
  .getByRole("button", { name: "Abrir carrito, 1 unidad", exact: true })
  .waitFor();
assert(
  (await q.locator('[role="alert"]').count()) > 0 ||
    (await q.locator("[data-sonner-toast]").count()) > 0,
);
results.push({
  case: "localStorage bloqueado: sesión temporal y aviso sin romper compra básica",
  result: "verificado",
});
assert.deepEqual(errors, []);
await fs.writeFile(
  "./docs/commerce-verification/rutas-recuperacion.json",
  JSON.stringify({ results, errors }, null, 2),
);
console.log(results.length, errors);
await b.close();
