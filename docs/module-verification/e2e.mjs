const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = "docs/module-verification",
  base = "http://127.0.0.1:4173";
await fs.mkdir(out, { recursive: true });
const b = await chromium.launch(),
  passed = [],
  errors = [];
let p;
const record = async (s) => {
  passed.push(s);
  console.log(s);
  await fs.writeFile(
    out + "/e2e.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
};
try {
  for (const width of [1440, 390]) {
    p = await b.newPage({
      viewport: { width, height: 1000 },
      acceptDownloads: true,
    });
    p.on("pageerror", (e) => errors.push(e.message));
    const go = async (path) => {
      await p.goto(base + path);
      await p.locator("h1").waitFor();
    };
    const saved = () =>
      p.evaluate(
        () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
      );
    const login = async (role) => {
      const has = await p.evaluate(
        () =>
          JSON.parse(localStorage.getItem("minimarket-rosita:app") || "null")
            ?.data.sessionUserId,
      );
      if (has) {
        await go("/cuenta");
        await p
          .locator("main")
          .getByRole("button", { name: "Cerrar sesión", exact: true })
          .click();
        await p.waitForURL("**/login");
      } else await go("/login");
      await p
        .getByRole("button", {
          name: "Completar acceso de " + role,
          exact: true,
        })
        .click();
      await p
        .getByRole("button", { name: "Iniciar sesión", exact: true })
        .click();
      await p.waitForURL(role === "administrador" ? "**/admin" : "**/cuenta");
    };
    await go("/");
    await login("administrador");
    await go("/admin/categorias");
    await p
      .getByRole("button", { name: "Crear categoría", exact: true })
      .click();
    const modal = () => p.getByRole("dialog");
    await p.locator("#tax-id").fill("cat-expo");
    await p.locator("#tax-name").fill("Especiales Rosita");
    await p.locator("#tax-slug").fill("especiales-rosita");
    await p
      .locator("#tax-description")
      .fill("Artículos de demostración para la exposición.");
    await p.locator("#tax-order").fill("0");
    await p
      .getByRole("button", { name: "Guardar estructura", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    await p.getByRole("button", { name: "Subcategorías", exact: true }).click();
    await p
      .getByRole("button", { name: "Crear subcategoría", exact: true })
      .click();
    await p.locator("#tax-id").fill("sub-expo");
    await p.locator("#tax-name").fill("Edición de prueba");
    await p.locator("#tax-slug").fill("edicion-prueba");
    await p
      .locator("#tax-description")
      .fill("Grupo ficticio para productos de exposición.");
    await p.locator("#tax-category").selectOption("cat-expo");
    await p
      .getByRole("button", { name: "Guardar estructura", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    assert((await saved()).categories.some((c) => c.id === "cat-expo"));
    await go("/categoria/especiales-rosita");
    await expect(
      p.getByRole("heading", { name: "Especiales Rosita", exact: true }),
    ).toBeVisible();
    if (width < 1024) await p.getByRole("button", { name: /^Filtros/ }).click();
    assert(
      await p
        .getByRole("navigation", { name: "Subcategorías de Especiales Rosita" })
        .getByRole("button", { name: /Edición de prueba/ })
        .count(),
    );
    if (width < 1024) {
      await p.keyboard.press("Escape");
      await p
        .locator("[data-slot=sheet-content]")
        .waitFor({ state: "detached" });
    }
    await record(
      width +
        ": accesos de administrador, categoría/subcategoría nuevas y aparición comercial sin tocar código.",
    );
    await go("/admin/productos");
    await p
      .getByRole("button", { name: "Nuevo producto", exact: true })
      .click();
    await p.locator("#product-id").fill("ROS-EXPO");
    await p.locator("#product-name").fill('Artículo "Rosita", demo');
    await p.locator("#product-brand").fill("Rosita Demo");
    await p.locator("#product-category").selectOption("cat-expo");
    await p.locator("#product-subcategory").selectOption("sub-expo");
    await p.locator("#product-presentation").fill("Unidad de demostración");
    await p.locator("#product-price").fill("12.50");
    await p.locator("#product-stock").fill("5");
    await p.locator("#product-threshold").fill("2");
    await p
      .locator("#product-description")
      .fill("Artículo ficticio para comprobar catálogo, imagen y pedido.");
    const bytes = await p.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 2200;
      canvas.height = 1100;
      const c = canvas.getContext("2d");
      c.fillStyle = "#e8f1e9";
      c.fillRect(0, 0, 2200, 1100);
      c.fillStyle = "#145a46";
      c.fillRect(600, 200, 1000, 700);
      c.fillStyle = "#f4b8c8";
      c.font = "90px sans-serif";
      c.fillText("ROSITA DEMO", 720, 600);
      return Array.from(
        Uint8Array.from(
          atob(canvas.toDataURL("image/png").split(",")[1]),
          (x) => x.charCodeAt(0),
        ),
      );
    });
    await p
      .locator("#image-file")
      .setInputFiles({
        name: "articulo-demo.png",
        mimeType: "image/png",
        buffer: Buffer.from(bytes),
      });
    await p.locator("img.upload-preview").waitFor();
    await p.waitForFunction(
      () => !document.querySelector("button[type=submit]:disabled"),
    );
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    let data = await saved();
    const item = data.products.find((p) => p.id === "ROS-EXPO");
    assert(item.imageKey.startsWith("upload:"));
    assert.equal(data.media[item.imageKey.slice(7)].width, 1600);
    assert.equal(data.media[item.imageKey.slice(7)].height, 800);
    assert(!JSON.stringify(data).includes("blob:"));
    assert(!JSON.stringify(data).includes("data:image"));
    await go("/categoria/especiales-rosita?subcategoria=sub-expo");
    await p.locator('.catalog-products img[src^="blob:"]').waitFor();
    assert.equal(await p.locator(".catalog-products article").count(), 1);
    await p.locator('.catalog-products a[href^="/producto/"]').first().click();
    await p.locator('.product-zoom-open img[src^="blob:"]').waitFor();
    await p.reload();
    await p.locator('.product-zoom-open img[src^="blob:"]').waitFor();
    await p.waitForFunction(
      () =>
        document.querySelector(".product-zoom-open img").naturalWidth === 1600,
    );
    await p
      .getByRole("button", { name: "Ampliar imagen", exact: true })
      .click();
    await modal().waitFor();
    await p.getByRole("button", { name: "Acercar", exact: true }).click();
    await p.keyboard.press("Escape");
    await p.screenshot({ path: out + "/producto-imagen-" + width + ".png" });
    await record(
      width +
        ": subida PNG → compresión 1600×800 → producto guardado → categoría/subcategoría → detalle/zoom → recarga conserva blob de IndexedDB sin URL/base64 persistida.",
    );
    await login("cliente");
    await go("/producto/ROS-EXPO");
    await p
      .getByRole("button", { name: "Agregar al carrito", exact: true })
      .click();
    await go("/checkout");
    await p.locator("#delivery-recipient").fill("Cliente de exposición");
    await p.locator("#delivery-phone").fill("999123456");
    await p.locator("#delivery-address").fill("Dirección ficticia 123");
    await p.locator("#delivery-zone").selectOption("demo-a");
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await p.locator('input[type=radio][value="yape-demo"]').check();
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Confirmar pedido de demostración",
        exact: true,
      })
      .click();
    await p.waitForURL(/\/pedido\/ROS-.+\/confirmacion$/);
    data = await saved();
    assert.equal(data.orders.length, 1);
    const order = structuredClone(data.orders[0]);
    assert.equal(order.totalCents, 1650);
    assert.equal(order.lines[0].unitPriceCents, 1250);
    assert.equal(data.inventory["ROS-EXPO"].stock, 4);
    await go("/admin/categorias");
    assert(
      await p
        .getByRole("heading", {
          name: "Este espacio es para administración.",
          exact: true,
        })
        .isVisible(),
    );
    await login("administrador");
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-EXPO");
    await p
      .getByRole("button", { name: "Editar ROS-EXPO", exact: true })
      .click();
    await p.locator("#product-price").fill("15.75");
    await p.locator("#product-name").fill('Artículo "Rosita", actualizado');
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    await go("/admin/inventario?q=ROS-EXPO");
    await p
      .getByRole("button", { name: "Ajustar ROS-EXPO", exact: true })
      .click();
    await p.locator("#stock-quantity").fill("3");
    await p
      .locator("#stock-reason")
      .fill("Entrada de demostración para exposición.");
    await p
      .getByRole("button", { name: "Registrar ajuste", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    await go("/admin/pedidos/" + order.id);
    await p
      .getByRole("button", { name: "Avanzar a En preparación", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar avance de estado", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    data = await saved();
    assert.deepEqual(data.orders[0].lines, order.lines);
    assert.equal(data.orders[0].totalCents, 1650);
    assert.equal(data.orders[0].status, 1);
    assert.equal(data.inventory["ROS-EXPO"].stock, 7);
    assert.equal(data.inventory["ROS-EXPO"].priceCents, 1575);
    assert.equal(
      data.movements.filter((m) => m.kind === "order-out").length,
      1,
    );
    await go("/producto/ROS-EXPO");
    await expect(p.locator(".detail-info .product-price strong")).toContainText(
      "15.75",
    );
    await record(
      width +
        ": compra de cliente única, permiso de panel denegado al cliente, cambio de precio/nombre y entrada de stock; avance no descuenta otra vez y snapshot histórico permanece.",
    );
    await go("/admin");
    await expect(p.locator("[data-metric=received] strong")).toHaveText("1");
    await expect(p.locator("[data-metric=totalCents] strong")).toContainText(
      "16.50",
    );
    await p.screenshot({
      path: out + "/estadisticas-" + width + ".png",
      fullPage: true,
    });
    await go("/admin/reportes");
    await p.locator("#report-type").selectOption("digital");
    await expect(p.locator(".report-total")).toContainText("S/ 16.50");
    await p.locator("#report-status").selectOption("0");
    await expect(p.locator(".report-print caption")).toContainText(
      "0 registros",
    );
    await p.locator("#report-status").selectOption("1");
    await expect(p.locator(".report-print caption")).toContainText(
      "1 registros",
    );
    await p.locator("#report-type").selectOption("top");
    const downloadEvent = p.waitForEvent("download");
    await p.getByRole("button", { name: "Exportar CSV", exact: true }).click();
    const download = await downloadEvent;
    await download.saveAs(out + "/reporte-top-" + width + ".csv");
    const csv = await fs.readFile(
      out + "/reporte-top-" + width + ".csv",
      "utf8",
    );
    assert(csv.includes('"Artículo ""Rosita"", demo"'));
    assert(csv.includes('"12.50"'));
    assert(csv.includes("Demostración; sin ingresos reales"));
    await p.evaluate(() => {
      window.__printed = 0;
      window.addEventListener("beforeprint", () => window.__printed++);
    });
    await p
      .getByRole("button", { name: "Imprimir / Guardar como PDF", exact: true })
      .click();
    await p.waitForFunction(() => window.__printed > 0);
    await p.pdf({
      path: out + "/reporte-" + width + ".pdf",
      format: "A4",
      printBackground: true,
    });
    await p.screenshot({ path: out + "/reportes-" + width + ".png" });
    await p.locator("#report-type").selectOption("cash");
    await expect(p.locator(".report-total")).toContainText(
      "Caja no implementada",
    );
    await record(
      width +
        ": estadísticas y reportes concuerdan con un pedido real del prototipo; filtro por estado, CSV escapado con comillas/coma y precios históricos, impresión real invocada y PDF de prueba generado. Canal presencial distinguido sin ventas inventadas.",
    );
    await go("/admin/categorias");
    await p
      .getByRole("button", { name: "Editar cat-expo", exact: true })
      .click();
    await p.locator("#tax-slug").fill("especiales-nuevo");
    await p.locator("#tax-order").fill("99");
    await p
      .getByRole("button", { name: "Guardar estructura", exact: true })
      .click();
    await modal().waitFor({ state: "hidden" });
    await go("/categoria/especiales-rosita?subcategoria=sub-expo");
    await p
      .getByRole("heading", {
        name: 'Artículo "Rosita", actualizado',
        exact: true,
      })
      .waitFor();
    await login("cliente");
    await go("/pedido/" + order.id + "/seguimiento");
    await expect(
      p.locator(".tracking-steps [aria-current=step]"),
    ).toContainText("En preparación");
    await p.close();
    await record(
      width +
        ": alias de slug anterior recupera catálogo; cliente consulta el estado actualizado desde administración.",
    );
  }
  assert.equal(errors.length, 0);
} catch (e) {
  errors.push(e.stack);
  if (p && !p.isClosed())
    await p.screenshot({ path: out + "/e2e-fallo.png", fullPage: true });
  throw e;
} finally {
  await fs.writeFile(
    out + "/e2e.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
