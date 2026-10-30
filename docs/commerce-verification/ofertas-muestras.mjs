const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch();
const results = [];
for (const width of [1440, 768, 390]) {
  const p = await b.newPage({ viewport: { width, height: 1000 } });
  await p.goto("http://127.0.0.1:5173/catalogo");
  await p.locator(".catalog-products").waitFor();
  if (width < 1024)
    await p.getByRole("button", { name: "Filtros", exact: true }).click();
  await p
    .getByRole("checkbox", { name: "Ofertas de prueba", exact: true })
    .click();
  await p.waitForURL((u) => u.searchParams.get("ofertas") === "1");
  if (width < 1024)
    await p
      .getByRole("button", { name: "Ver 4 productos", exact: true })
      .click();
  await p.waitForFunction(
    () => document.querySelectorAll(".catalog-products article").length === 4,
  );
  await p
    .locator(".catalog-products article")
    .first()
    .getByRole("button", { name: /Agregar al carrito:/ })
    .click();
  await p
    .getByRole("button", { name: "Abrir carrito, 1 unidad", exact: true })
    .waitFor();
  await p.goto("http://127.0.0.1:5173/sistema-diseno");
  await p.getByRole("tab", { name: "Componentes", exact: true }).click();
  await p
    .getByRole("button", { name: "Acción principal", exact: true })
    .click();
  await p
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Muestra: acción principal" })
    .waitFor();
  results.push({ width, offers: 4, sampleFeedback: true });
  await p.close();
}
await fs.writeFile(
  "./docs/commerce-verification/ofertas-muestras.json",
  JSON.stringify({ results, browser: await b.version() }, null, 2),
);
console.log(results);
await b.close();
