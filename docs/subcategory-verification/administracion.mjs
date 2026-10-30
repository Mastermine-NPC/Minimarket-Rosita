const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  out = "docs/subcategory-verification",
  passed = [],
  errors = [],
  base = "http://127.0.0.1:4173";
const record = (s) => {
  passed.push(s);
  console.log(s);
};
try {
  for (const width of [1440, 390]) {
    const p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(base + "/personal");
    await p.locator("#auth-email").fill("admin@rosita.test");
    await p.locator("#auth-password").fill("RositaDemo!2026");
    await p
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await p.waitForURL("**/admin");
    await p.goto(base + "/admin/productos");
    await p
      .getByRole("button", { name: "Nuevo producto", exact: true })
      .click();
    const d = p.getByRole("dialog", { name: "Crear producto", exact: true });
    await d.waitFor();
    assert(await p.locator("#product-subcategory").isDisabled());
    await p.locator("#product-category").selectOption("consumibles");
    await p.locator("#product-subcategory").selectOption("galletas");
    await p.locator("#product-category").selectOption("tecnologia");
    assert.equal(await p.locator("#product-subcategory").inputValue(), "");
    const vals = await p
      .locator("#product-subcategory option")
      .evaluateAll((es) => es.map((e) => e.value));
    assert(!vals.includes("galletas"));
    assert(vals.includes("cables-adaptadores"));
    await p.locator("#product-id").fill("ROS-SUB-" + width);
    await p.locator("#product-name").fill("Cable de prueba " + width);
    await p.locator("#product-brand").fill("Genérico");
    await p.locator("#product-presentation").fill("Unidad · demostración");
    await p
      .locator("#product-description")
      .fill("Cable de demostración para comprobar su subcategoría.");
    await p.locator("#product-price").fill("6.50");
    await p.locator("#product-stock").fill("7");
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await p.locator("#product-subcategory-error").waitFor();
    assert(
      await p
        .locator("#product-subcategory")
        .evaluate((e) => e === document.activeElement),
    );
    await p.locator("#product-subcategory").selectOption("cables-adaptadores");
    await p.screenshot({
      path: out + "/crear-" + width + ".png",
      fullPage: true,
    });
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await d.waitFor({ state: "hidden" });
    let state = await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
    );
    let made = state.products.find((v) => v.id === "ROS-SUB-" + width);
    assert.equal(made.subcategory, "cables-adaptadores");
    assert.deepEqual(state.inventory[made.id], { stock: 7, priceCents: 650 });
    await p.locator("#admin-products-search").fill(made.id);
    await p
      .getByRole("button", { name: "Editar " + made.id, exact: true })
      .click();
    await p.locator("#product-subcategory").waitFor();
    assert.equal(
      await p.locator("#product-subcategory").inputValue(),
      "cables-adaptadores",
    );
    await p.locator("#product-category").selectOption("consumibles");
    assert.equal(await p.locator("#product-subcategory").inputValue(), "");
    await p.locator("#product-category").selectOption("tecnologia");
    await p.locator("#product-subcategory").selectOption("pilas");
    await p.locator("#product-name").fill("Pilas de prueba " + width);
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p.reload();
    state = await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
    );
    assert.equal(
      state.products.find((v) => v.id === made.id).subcategory,
      "pilas",
    );
    assert.deepEqual(state.inventory[made.id], { stock: 7, priceCents: 650 });
    await p.goto(base + "/categoria/tecnologia?subcategoria=pilas");
    await p
      .getByRole("heading", { name: "Pilas de prueba " + width, exact: true })
      .waitFor();
    assert.equal(await p.locator(".catalog-products article").count(), 2);
    record(
      width +
        ": creación/edición dependiente, subcategoría obligatoria con foco, cambio limpia incompatible, persistencia y reflejo en tienda sin modificar stock/precio.",
    );
    await p.close();
  }
  const fixture = JSON.parse(
    await fs.readFile(out + "/migration-fixture-v4.json", "utf8"),
  );
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(base + "/estado");
  await p.evaluate((raw) => {
    localStorage.setItem("minimarket-rosita:app", JSON.stringify(raw));
    localStorage.setItem("otra-aplicacion", "conservar");
  }, fixture);
  await p.goto(
    base + "/categoria/consumibles?subcategoria=consumibles-por-clasificar",
  );
  await p.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("minimarket-rosita:app")).version === 5,
  );
  const after = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("minimarket-rosita:app")),
  );
  for (const key of [
    "inventory",
    "cart",
    "orders",
    "movements",
    "users",
    "sessionUserId",
    "processedAdminOperations",
  ])
    assert.deepEqual(after.data[key], fixture.data[key], key);
  assert.equal(after.data.products.length, 25);
  await p.waitForFunction(
    () => document.querySelectorAll(".catalog-products article").length === 2,
  );
  assert.equal(
    await p.evaluate(() => localStorage.getItem("otra-aplicacion")),
    "conservar",
  );
  await p.screenshot({
    path: out + "/migracion-pendientes.png",
    fullPage: true,
  });
  await p.reload();
  await p.locator(".catalog-results").waitFor();
  assert.deepEqual(
    await p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("minimarket-rosita:app")).data.orders,
    ),
    fixture.data.orders,
  );
  record(
    "Migración real en navegador v4→v5 persiste al abrir y recargar; catálogo personalizado, carrito, inventario, pedido, movimientos y clave ajena intactos; dos productos Por clasificar visibles.",
  );
  await p.close();
  assert.equal(errors.length, 0);
} catch (e) {
  errors.push(e.stack);
  throw e;
} finally {
  await fs.writeFile(
    out + "/administracion-migracion.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
