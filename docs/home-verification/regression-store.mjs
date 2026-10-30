const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = "./docs/home-verification/regression";
const base = process.env.BASE_URL || "http://127.0.0.1:5173";
const b = await chromium.launch();
let passed = [],
  errors = [];
await fs.mkdir(out, { recursive: true });
for (const width of [1440, 768, 390]) {
  const p = await b.newPage({ viewport: { width, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  const go = async (url) => {
    await p.goto(base + url);
    await p.locator("h1").waitFor();
  };
  await go("/");
  await p.evaluate(() => document.fonts.ready);
  assert.equal(await p.locator(".home-products article").count(), 8);
  assert.equal(await p.locator(".category-card").count(), 6);
  assert(
    await p.evaluate(
      () =>
        document.fonts.check("700 20px Manrope") &&
        document.fonts.check('400 16px "DM Sans"'),
    ),
  );
  const cats = await p.locator(".category-card").evaluateAll((es) =>
    es.map((e) => ({
      href: e.getAttribute("href"),
      name: e.querySelector("h3").textContent.trim(),
    })),
  );
  for (const cat of cats) {
    await go("/");
    await p.locator('.category-card[href="' + cat.href + '"]').click();
    await p.locator(".catalog-products").waitFor();
    assert.equal(await p.locator(".catalog-products article").count(), 4);
    assert.match(
      await p.locator("h1").innerText(),
      new RegExp(cat.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
    await p.reload();
    await p.locator(".catalog-products").waitFor();
    assert.equal(await p.locator(".catalog-products article").count(), 4);
  }
  passed.push(
    width +
      ": inicio, fuentes locales y seis categorías con cuatro productos, enlaces y recarga",
  );
  await go("/catalogo");
  const search = p.getByRole("searchbox", { name: "Buscar productos" });
  for (const [query, count] of [
    ["coca", 1],
    ["Duracell", 1],
    ["ajedrez magnetico", 1],
    ["zzsinproducto", 0],
  ]) {
    await search.fill(query);
    await search.press("Enter");
    await p.waitForURL((url) => url.searchParams.get("q") === query);
    await p.waitForTimeout(80);
    assert.equal(await p.locator(".catalog-products article").count(), count);
  }
  await p
    .getByRole("button", { name: "Limpiar búsqueda y filtros", exact: true })
    .last()
    .click();
  await p.waitForFunction(
    () => document.querySelectorAll(".catalog-products article").length === 24,
  );
  passed.push(
    width + ": buscar por nombre/marca sin depender de tildes, vacío y limpiar",
  );
  if (width < 1024)
    await p.getByRole("button", { name: "Filtros", exact: true }).click();
  await p.locator("#filter-brand").selectOption("Stanley");
  await p.waitForTimeout(100);
  await p.locator("#filter-price").fill("10");
  await p.waitForTimeout(100);
  await p
    .getByRole("checkbox", { name: "Solo disponibles", exact: true })
    .click();
  await p.waitForURL((url) => url.searchParams.get("disponibles") === "1");
  if (width < 1024)
    await p
      .getByRole("button", { name: "Ver 0 productos", exact: true })
      .click();
  await p
    .getByRole("heading", { name: "No encontramos coincidencias", exact: true })
    .waitFor();
  await p.reload();
  await p
    .getByRole("heading", { name: "No encontramos coincidencias", exact: true })
    .waitFor();
  await p
    .getByRole("button", { name: "Limpiar búsqueda y filtros", exact: true })
    .last()
    .click();
  await p.waitForFunction(
    () => document.querySelectorAll(".catalog-products article").length === 24,
  );
  for (const sort of ["precio-asc", "precio-desc", "nombre"]) {
    await p.locator("#catalog-sort").selectOption(sort);
    await p.waitForTimeout(100);
    const items = await p
      .locator(".catalog-products article")
      .evaluateAll((es) =>
        es.map((e) => ({
          name: e.querySelector("h3").textContent,
          price: Number(
            e
              .querySelector(".product-price strong")
              .textContent.replace(/[^\d.]/g, ""),
          ),
        })),
      );
    if (sort === "nombre")
      assert.deepEqual(
        items.map((i) => i.name),
        items.map((i) => i.name).sort((a, b) => a.localeCompare(b, "es")),
      );
    else
      assert.deepEqual(
        items.map((i) => i.price),
        items
          .map((i) => i.price)
          .sort((a, b) => (sort === "precio-asc" ? a - b : b - a)),
      );
  }
  passed.push(
    width +
      ": filtros combinados persistidos en URL, limpiar y tres ordenamientos",
  );
  if (width < 1024)
    await p.getByRole("button", { name: "Filtros", exact: true }).click();
  await p.locator("#filter-brand").selectOption("Stanley");
  await p.waitForTimeout(100);
  if (width < 1024)
    await p
      .getByRole("button", { name: "Ver 1 producto", exact: true })
      .click();
  const filteredUrl = p.url();
  await p.locator("article h3 a").click();
  await p
    .getByRole("heading", { name: "Set de destornilladores", exact: true })
    .waitFor();
  await p
    .getByRole("button", {
      name: "Aumentar Set de destornilladores",
      exact: true,
    })
    .click();
  await p
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Abrir carrito, 2 unidades", exact: true })
    .waitFor();
  await p
    .getByRole("link", { name: "Volver al catálogo", exact: true })
    .click();
  await p.waitForURL(filteredUrl);
  assert.equal(p.url(), filteredUrl);
  assert.equal(await p.locator("#catalog-sort").inputValue(), "nombre");
  assert.equal(await p.locator(".catalog-products article").count(), 1);
  await p
    .getByRole("button", { name: "Abrir carrito, 2 unidades", exact: true })
    .click();
  const cart = p.getByRole("dialog", { name: "Tu carrito", exact: true });
  await cart.waitFor();
  await cart
    .getByRole("button", {
      name: "Aumentar Set de destornilladores",
      exact: true,
    })
    .click();
  assert.match(
    await cart.getByRole("region", { name: "Resumen del carrito" }).innerText(),
    /46[.,]50/,
  );
  await cart
    .getByRole("button", {
      name: "Disminuir Set de destornilladores",
      exact: true,
    })
    .click();
  assert.match(
    await cart.getByRole("region", { name: "Resumen del carrito" }).innerText(),
    /31[.,]00/,
  );
  assert(
    await cart
      .getByRole("link", { name: "Continuar con mi pedido", exact: true })
      .isVisible(),
  );
  await cart
    .getByRole("link", { name: "Ver carrito completo", exact: true })
    .click();
  await p.getByRole("heading", { name: "Tu carrito.", exact: true }).waitFor();
  await p.reload();
  await p
    .getByRole("button", {
      name: "Eliminar Set de destornilladores",
      exact: true,
    })
    .click();
  await p
    .getByRole("heading", {
      name: "Tu carrito espera algo bueno.",
      exact: true,
    })
    .waitFor();
  await p.reload();
  await p
    .getByRole("heading", {
      name: "Tu carrito espera algo bueno.",
      exact: true,
    })
    .waitFor();
  passed.push(
    width +
      ": detalle, filtro conservado al volver, agregar/modificar/eliminar, subtotal y persistencia; enlace real al checkout",
  );
  await go("/producto/ROS-006");
  await p
    .getByRole("button", { name: "Aumentar Taladro inalámbrico", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Aumentar Taladro inalámbrico", exact: true })
    .click();
  assert(
    await p
      .getByRole("button", {
        name: "Aumentar Taladro inalámbrico",
        exact: true,
      })
      .isDisabled(),
  );
  await p
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  assert(
    await p
      .getByRole("button", { name: "Todo el stock en tu carrito", exact: true })
      .isDisabled(),
  );
  assert.equal(
    await p.evaluate(async () => {
      const { productById } = await import("/src/data/catalog.ts");
      return productById("ROS-006").stock;
    }),
    3,
  );
  await go("/producto/ROS-009");
  assert(
    await p
      .getByRole("button", { name: "Producto agotado", exact: true })
      .isDisabled(),
  );
  await go("/carrito");
  await p.getByRole("button", { name: "Vaciar carrito", exact: true }).click();
  await p
    .getByRole("button", { name: "Conservar productos", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Eliminar Taladro inalámbrico", exact: true })
    .waitFor();
  await p.getByRole("button", { name: "Vaciar carrito", exact: true }).click();
  await p
    .getByRole("button", { name: "Sí, vaciar carrito", exact: true })
    .click();
  await p
    .getByRole("heading", {
      name: "Tu carrito espera algo bueno.",
      exact: true,
    })
    .waitFor();
  passed.push(
    width +
      ": stock máximo, agotado, vaciar/cancelar y agregar sin descontar inventario",
  );
  await p.waitForFunction(
    () => document.querySelectorAll("[role=dialog]").length === 0,
  );
  const trigger = p.getByRole("button", {
    name: "Abrir carrito, 0 unidades",
    exact: true,
  });
  await trigger.click();
  const dlg = p.getByRole("dialog", { name: "Tu carrito", exact: true });
  await dlg.waitFor();
  const tabbable = dlg.locator("button,a[href]");
  await tabbable.last().focus();
  await p.keyboard.press("Tab");
  assert(await dlg.evaluate((el) => el.contains(document.activeElement)));
  await p.keyboard.press("Shift+Tab");
  assert(await dlg.evaluate((el) => el.contains(document.activeElement)));
  await p.keyboard.press("Escape");
  await p.waitForFunction(
    () =>
      document.activeElement?.getAttribute("aria-label") ===
      "Abrir carrito, 0 unidades",
  );
  assert(await trigger.evaluate((el) => el === document.activeElement));
  await p.keyboard.press("Tab");
  assert(
    await p.evaluate(
      () => getComputedStyle(document.activeElement).outlineStyle !== "none",
    ),
  );
  await go("/");
  await p.getByRole("button", { name: "Categorías", exact: true }).click();
  await p
    .getByRole("dialog")
    .getByRole("link", { name: "Cuidado personal", exact: true })
    .click();
  await p
    .getByRole("heading", { name: "Cuidado personal", exact: true })
    .waitFor();
  await p.waitForFunction(
    () => document.querySelectorAll("[role=dialog]").length === 0,
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await go("/");
  assert.equal(
    await p
      .locator(".home-hero-copy h1")
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  await p.locator(".home-promo").scrollIntoViewIfNeeded();
  assert(
    await p
      .getByRole("link", { name: "Ver precios especiales", exact: true })
      .isVisible(),
  );
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await p.screenshot({
    path: out + "/inicio-" + width + ".png",
    fullPage: true,
  });
  await go("/sistema-diseno");
  for (const tab of ["Fundamentos", "Componentes", "Reglas de uso"]) {
    await p.getByRole("tab", { name: tab, exact: true }).click();
    assert(await p.getByRole("tabpanel").isVisible());
  }
  await p
    .getByRole("link", { name: "Iniciar sesión de demostración", exact: true })
    .click();
  await p
    .getByRole("heading", { name: "Qué bueno verte.", exact: true })
    .waitFor();
  passed.push(
    width +
      ": paneles por teclado, foco/Escape/restauración, menú, movimiento reducido, promoción visible y sistema de diseño",
  );
  await p.close();
}
assert.deepEqual(errors, []);
await fs.writeFile(
  out + "/regresion.json",
  JSON.stringify({ passed, errors }, null, 2),
);
console.log(passed);
await b.close();
