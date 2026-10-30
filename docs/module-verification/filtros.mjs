const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = "docs/module-verification",
  base = process.env.BASE_URL || "http://127.0.0.1:4173",
  b = await chromium.launch(),
  passed = [],
  errors = [];
const record = (s) => {
  passed.push(s);
  console.log(s);
};
try {
  for (const width of [1440, 768, 390]) {
    const p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    const go = async (path) => {
      await p.goto(base + path);
      await p.locator(".catalog-results").waitFor();
    };
    const open = async () => {
      if (width < 1024) {
        await p.getByRole("button", { name: /^Filtros/ }).click();
        await p
          .getByRole("dialog", { name: "Filtrar productos", exact: true })
          .waitFor();
      }
    };
    const close = async () => {
      if (width < 1024) {
        await p
          .getByRole("dialog")
          .getByRole("button", { name: /^Ver \d+ productos?$/ })
          .click();
        await p
          .locator("[data-slot=sheet-content]")
          .waitFor({ state: "detached" });
      }
    };
    await go("/catalogo");
    await open();
    assert.equal(
      await p
        .locator(".catalog-filters")
        .getByRole("heading", { name: "Categorías", exact: true })
        .count(),
      0,
    );
    assert(
      await p
        .getByRole("heading", {
          name: "Explora por subcategorías",
          exact: true,
        })
        .isVisible(),
    );
    await close();
    await go("/categoria/consumibles");
    await open();
    const nav = p.getByRole("navigation", {
      name: "Subcategorías de Consumibles",
      exact: true,
    });
    assert.equal(await nav.getByRole("button").count(), 4);
    assert.equal(
      await nav.getByRole("button", { name: /abarrotes/i }).count(),
      0,
    );
    await nav.getByRole("button", { name: /^Snacks/ }).click();
    await p.waitForURL((u) => u.searchParams.get("subcategoria") === "snacks");
    await p.waitForFunction(() =>
      document
        .querySelector(".subcategory-option[aria-pressed=true]")
        ?.textContent.includes("Snacks"),
    );
    assert.equal(
      await nav
        .getByRole("button", { name: /^Snacks/ })
        .getAttribute("aria-pressed"),
      "true",
    );
    await close();
    assert.equal(await p.locator(".catalog-products article").count(), 2);
    assert(
      await p
        .getByRole("button", {
          name: "Quitar subcategoría Snacks",
          exact: true,
        })
        .isVisible(),
    );
    await p
      .getByRole("searchbox", { name: "Buscar productos" })
      .fill("Doritos");
    await p.getByRole("searchbox", { name: "Buscar productos" }).press("Enter");
    await p.waitForURL((u) => u.searchParams.get("q") === "Doritos");
    await p.waitForFunction(() => document.querySelectorAll(".catalog-products article").length === 1);
    assert.equal(new URL(p.url()).searchParams.get("subcategoria"), "snacks");
    await open();
    await p.locator("#filter-brand").selectOption("Doritos");
    await p.locator("#filter-price").fill("3");
    await p.waitForURL((u) => u.searchParams.get("max") === "3");
    await close();
    await p
      .getByRole("heading", {
        name: "No encontramos coincidencias",
        exact: true,
      })
      .waitFor();
    await p
      .getByRole("button", { name: "Quitar subcategoría Snacks", exact: true })
      .click();
    assert.equal(new URL(p.url()).searchParams.has("subcategoria"), false);
    assert.equal(new URL(p.url()).searchParams.get("q"), "Doritos");
    assert.equal(new URL(p.url()).searchParams.get("marca"), "Doritos");
    await p
      .getByRole("button", { name: "Limpiar búsqueda y filtros", exact: true })
      .last()
      .click();
    await p.waitForFunction(
      () => document.querySelectorAll(".catalog-products article").length === 4,
    );
    record(
      width +
        ": general sin lista duplicada; categoría muestra tres subcategorías reales; URL, búsqueda/marca/precio combinados, activo, quitar solo selección y vacío/limpiar.",
    );
    await open();
    await nav.getByRole("button", { name: /^Snacks/ }).click();
    await close();
    await p.waitForFunction(
      () => document.querySelectorAll(".catalog-products article").length === 2,
    );
    await p.locator("#catalog-sort").selectOption("precio-desc");
    await p.waitForFunction(() =>
      [...document.querySelectorAll(".catalog-products a")].some((a) =>
        new URL(a.href).searchParams
          .get("volver")
          ?.includes("orden=precio-desc"),
      ),
    );
    const listUrl = new URL(p.url()).pathname + new URL(p.url()).search;
    await p.locator('.catalog-products a[href^="/producto/"]').first().click();
    await p.locator(".product-detail").waitFor();
    assert.equal(new URL(p.url()).searchParams.get("volver"), listUrl);
    await p.locator(".back-link").click();
    await p.locator(".catalog-results").waitFor();
    assert.equal(new URL(p.url()).searchParams.get("subcategoria"), "snacks");
    assert.equal(await p.locator("#catalog-sort").inputValue(), "precio-desc");
    assert.equal(await p.locator(".catalog-products article").count(), 2);
    await p.getByRole("button", { name: "Categorías", exact: true }).click();
    await p
      .getByRole("dialog")
      .getByRole("link", { name: "Tecnología", exact: true })
      .click();
    await p.waitForURL("**/categoria/tecnologia");
    await p.locator(".catalog-results").waitFor();
    assert(!new URL(p.url()).searchParams.has("subcategoria"));
    await open();
    const tn = p.getByRole("navigation", {
      name: "Subcategorías de Tecnología",
    });
    await tn.getByRole("button", { name: /^Almacenamiento/ }).click();
    await p
      .getByRole("checkbox", { name: "Solo disponibles", exact: true })
      .click();
    await close();
    await p
      .getByRole("heading", {
        name: "No encontramos coincidencias",
        exact: true,
      })
      .waitFor();
    await open();
    await p
      .getByRole("checkbox", { name: "Solo disponibles", exact: true })
      .click();
    await close();
    await p.waitForFunction(
      () => document.querySelectorAll(".catalog-products article").length === 1,
    );
    assert(
      await p
        .getByRole("heading", { name: "Memoria USB HP 32 GB", exact: true })
        .isVisible(),
    );
    await open();
    await p.screenshot({
      path: out + "/filtros-" + width + ".png",
      fullPage: true,
    });
    await close();
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    record(
      width +
        ": orden y selección vuelven desde detalle; cambio de categoría limpia incompatible; agotado real y disponibilidad combinados; panel y layout correctos.",
    );
    await go(
      "/categoria/consumibles?subcategoria=almacenamiento&q=coca&orden=nombre",
    );
    await p.waitForURL((u) => !u.searchParams.has("subcategoria"));
    assert.equal(new URL(p.url()).searchParams.get("q"), "coca");
    await p.waitForFunction(() => document.querySelectorAll(".catalog-products article").length === 1);
    await go("/catalogo?subcategoria=snacks");
    await p.waitForURL((u) => !u.searchParams.has("subcategoria"));
    assert.equal(await p.locator(".catalog-products article").count(), 24);
    record(
      width +
        ": URL incompatible/general se normaliza sin borrar búsqueda u orden válidos.",
    );
    await p.close();
  }
  assert.equal(errors.length, 0);
} catch (e) {
  errors.push(e.stack);
  throw e;
} finally {
  await fs.writeFile(
    out + "/interfaz.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
