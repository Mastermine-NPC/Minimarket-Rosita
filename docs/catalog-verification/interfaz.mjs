const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://127.0.0.1:4174",
  out = "docs/catalog-verification",
  b = await chromium.launch(),
  passed = [],
  errors = [];
let p;
const go = async (path) => {
  await p.goto(base + path);
  await p.locator("h1").waitFor();
};
const saved = () =>
  p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
  );
const login = async (role) => {
  await go("/login");
  await p
    .getByRole("button", { name: "Completar acceso de " + role, exact: true })
    .click();
  await p.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await p.waitForURL(role === "administrador" ? "**/admin" : "**/cuenta");
};
const logout = async () => {
  await go("/cuenta");
  await p
    .locator("main")
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await p.waitForURL("**/login");
};
try {
  for (const width of [1440, 768, 390]) {
    p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    await go("/catalogo");
    await expect(p.locator(".catalog-products article")).toHaveCount(63);
    const photos = p.locator(
      '.catalog-products img[src^="/images/productos/"]',
    );
    await expect(photos).toHaveCount(39);
    await photos.evaluateAll((imgs) =>
      imgs.forEach((i) => (i.loading = "eager")),
    );
    await p.waitForFunction(() =>
      [
        ...document.querySelectorAll(
          '.catalog-products img[src^="/images/productos/"]',
        ),
      ].every((i) => i.complete && i.naturalWidth > 0),
    );
    assert.equal(
      await photos.evaluateAll(
        (imgs) =>
          imgs.filter((i) => getComputedStyle(i).objectFit !== "contain")
            .length,
      ),
      0,
    );
    for (const [q, n] of [
      ["ROS-024", 1],
      ["ROS-063", 1],
      ["ROS-044", 1],
      ["ROS-062", 1],
      ["Kingstone", 1],
      ["Faber Castell", 4],
      ["Mouse inalámbrico", 1],
    ]) {
      await go("/catalogo");
      const search = p.getByRole("searchbox", {
        name: "Buscar productos",
        exact: true,
      });
      await search.fill(q);
      await search.press("Enter");
      await p.waitForURL((u) => u.searchParams.get("q") === q);
      await expect(p.locator(".catalog-products article")).toHaveCount(n);
    }
    for (const [cat, n] of [
      ["consumibles", 13],
      ["ferreteria", 10],
      ["tecnologia", 10],
      ["jugueteria", 10],
      ["educacion-oficina", 10],
      ["cuidado-personal", 10],
    ]) {
      await go("/categoria/" + cat);
      await expect(p.locator(".catalog-products article")).toHaveCount(n);
    }
    await go("/categoria/tecnologia?q=Kingstone");
    await expect(p.locator(".catalog-products article")).toHaveCount(1);
    await go("/categoria/consumibles?q=Kingstone");
    await p
      .getByRole("heading", {
        name: "No encontramos coincidencias",
        exact: true,
      })
      .waitFor();
    await go("/catalogo?q=ROS-024");
    await p
      .getByRole("heading", {
        name: "Powerade Bebida Rehidratante 500 ml",
        exact: true,
      })
      .waitFor();
    await p.locator('.catalog-products a[href^="/producto/"]').first().click();
    await expect(p.locator(".detail-code")).toHaveText("ROS-024");
    await p.locator(".product-zoom-open img").waitFor();
    await p.waitForFunction(
      () => document.querySelector(".product-zoom-open img").naturalWidth > 0,
    );
    await p
      .getByText(
        "La fotografía aportada muestra 600 ml; el registro solicitado corresponde a 500 ml.",
        { exact: true },
      )
      .waitFor();
    await p
      .getByRole("button", { name: "Ampliar imagen", exact: true })
      .click();
    await p.getByRole("dialog").waitFor();
    await p.keyboard.press("Escape");
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p.screenshot({ path: out + "/powerade-" + width + ".png" });
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    passed.push(
      width +
        ":63 artículos/39 fotos nuevas decodificadas y contain; códigos/nombres/marcas, seis categorías y filtros combinados; ROS-024 Powerade, ROS-063 pasta, UNO044 y mouse062 sin confusión; detalle/zoom y nota de presentación.",
    );
    console.log(passed.at(-1));
    await p.close();
  }
  for (const width of [1440, 390]) {
    p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    await login("administrador");
    const original = await saved();
    await go("/admin/productos");
    await expect(p.locator(".admin-pagination")).toContainText("63 resultados");
    await p.locator("#admin-products-search").fill("ROS-024");
    await expect(p.locator(".admin-table tbody tr")).toHaveCount(1);
    await expect(p.locator(".admin-table")).toContainText("Powerade");
    await p
      .getByRole("button", { name: "Editar ROS-024", exact: true })
      .click();
    await expect(p.locator("#product-id")).toHaveValue("ROS-024-IMPORT");
    await p.keyboard.press("Escape");
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p
      .getByRole("button", { name: "Nuevo producto", exact: true })
      .click();
    for (const [id, value] of [
      ["id", "ROS-TEMP"],
      ["name", "Bebida de prueba"],
      ["brand", "Demostración"],
      ["presentation", "Unidad de prueba"],
      ["price", "8.75"],
      ["stock", "11"],
      ["threshold", "5"],
      [
        "description",
        "Producto ficticio temporal para probar la gestión administrativa.",
      ],
    ])
      await p.locator("#product-" + id).fill(value);
    await p.locator("#product-category").selectOption("consumibles");
    await p.locator("#product-subcategory").selectOption("bebidas");
    await p.locator("#image-library").selectOption("catalog-ROS-025");
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p.locator("#admin-products-search").fill("ROS-TEMP");
    await p
      .getByRole("button", { name: "Editar ROS-TEMP", exact: true })
      .click();
    await p.locator("#product-price").fill("9.25");
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await go("/admin/inventario?q=ROS-TEMP");
    await p
      .getByRole("button", { name: "Ajustar ROS-TEMP", exact: true })
      .click();
    await p.locator("#stock-quantity").fill("4");
    await p
      .locator("#stock-reason")
      .fill("Entrada de prueba para verificar persistencia.");
    await p
      .getByRole("button", { name: "Registrar ajuste", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p.reload();
    await expect(p.locator(".admin-stock-number")).toHaveText("15");
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-TEMP");
    await p
      .getByRole("button", { name: "Eliminar ROS-TEMP", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar eliminación", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await expect(p.locator(".admin-table tbody tr")).toHaveCount(0);
    await p.reload();
    await p.locator("#admin-products-status").selectOption("eliminado");
    await p.locator("#admin-products-search").fill("ROS-TEMP");
    await expect(p.locator(".admin-table tbody tr")).toHaveCount(1);
    let d = await saved();
    assert(d.products.find((x) => x.id === "ROS-TEMP").archived);
    assert.equal(d.products.length, 64);
    assert.equal(d.inventory["ROS-TEMP"].stock, 15);
    assert.equal(d.inventory["ROS-TEMP"].priceCents, 925);
    assert.deepEqual(d.users, original.users);
    await p.screenshot({ path: out + "/eliminados-" + width + ".png" });
    await p
      .getByRole("button", { name: "Restaurar ROS-TEMP", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar restauración", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p.locator("#admin-products-status").selectOption("inactivo");
    await p
      .getByRole("button", { name: "Activar ROS-TEMP", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar activación", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await logout();
    await login("cliente");
    await go("/catalogo?q=ROS-024");
    await p.locator('.catalog-products a[href^="/producto/"]').first().click();
    await p
      .getByRole("button", { name: "Agregar al carrito", exact: true })
      .click();
    await go("/checkout");
    for (const [id, value] of [
      ["recipient", "Cliente Prueba"],
      ["phone", "999123456"],
      ["address", "Calle ficticia 123"],
    ])
      await p.locator("#delivery-" + id).fill(value);
    await p.locator("#delivery-zone").selectOption("demo-a");
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await p.locator("input[value=yape-demo]").check();
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Confirmar pedido de demostración",
        exact: true,
      })
      .evaluate((e) => {
        e.click();
        e.click();
      });
    await p.waitForURL(/\/pedido\/ROS-.+\/confirmacion$/);
    d = await saved();
    assert.equal(d.orders.length, 1);
    assert.equal(d.orders[0].lines[0].productId, "ROS-024-IMPORT");
    assert.equal(d.orders[0].lines[0].unitPriceCents, 350);
    assert.equal(d.orders[0].totalCents, 750);
    assert.equal(d.inventory["ROS-024-IMPORT"].stock, 29);
    assert.deepEqual(d.inventory["ROS-024"], original.inventory["ROS-024"]);
    assert.equal(d.movements.filter((m) => m.kind === "order-out").length, 1);
    await p.reload();
    await p.locator(".order-code").waitFor();
    await p.getByRole("link", { name: "Seguir pedido", exact: true }).click();
    await p.locator(".tracking-steps [aria-current=step]").waitFor();
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.screenshot({ path: out + "/pedido-powerade-" + width + ".png" });
    passed.push(
      width +
        ": administración63, SKU comercial/ID estable, crear/editar/precio/stock persistentes, eliminar sin resurrección y restaurar; compra Powerade7.50 y stock30→29 único sin afectar pasta ni cuentas, seguimiento funcional.",
    );
    console.log(passed.at(-1));
    await p.close();
  }
  p = await b.newPage();
  await go("/");
  const fixture = JSON.parse(
    await fs.readFile(out + "/fixture-v7.json", "utf8"),
  );
  await p.evaluate(
    (value) =>
      localStorage.setItem("minimarket-rosita:app", JSON.stringify(value)),
    fixture,
  );
  await p.reload();
  await p.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("minimarket-rosita:app")).version === 8,
  );
  const migrated = await saved();
  assert.equal(migrated.products.length, 64);
  for (const k of [
    "orders",
    "cart",
    "users",
    "movements",
    "media",
    "sessionUserId",
  ])
    assert.deepEqual(migrated[k], fixture.data[k]);
  for (const [id, v] of Object.entries(fixture.data.inventory))
    assert.deepEqual(migrated.inventory[id], v);
  await p.reload();
  assert.equal((await saved()).products.length, 64);
  await go("/producto/ROS-024");
  await expect(p.locator(".detail-code")).toHaveText("ROS-063");
  await expect(
    p.getByRole("heading", { name: "Pasta dental Colgate", exact: true }),
  ).toBeVisible();
  await go("/producto/ROS-024-IMPORT");
  await expect(p.locator(".detail-code")).toHaveText("ROS-024");
  passed.push(
    "Migración real en navegador v7→8 conserva cuenta/sesión, carrito de pasta, pedido histórico, recursos subidos/metadata e inventario propio; recarga idempotente y URLs internas anteriores siguen identificando el artículo correcto.",
  );
  await p.close();
  assert.deepEqual(errors, []);
} catch (e) {
  errors.push(e.message);
  if (p && !p.isClosed()) await p.screenshot({ path: out + "/fallo-ui.png" });
  throw e;
} finally {
  await fs.writeFile(
    out + "/interfaz.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
