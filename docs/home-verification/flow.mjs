const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  out = "./docs/home-verification/regression",
  passed = [],
  errors = [];
await fs.mkdir(out, { recursive: true });
let current;
async function record(message) {
  passed.push(message);
  console.log(message);
  await fs.writeFile(
    out + "/flujo.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
}
try {
  for (const width of [1440, 768, 390]) {
    const p = await b.newPage({ viewport: { width, height: 1000 } });
    current = p;
    p.on("pageerror", (e) => errors.push(e.message));
    const go = async (path) => {
      await p.goto((process.env.BASE_URL || "http://127.0.0.1:5173") + path);
      await p.waitForLoadState("networkidle");
      await p.locator("h1").waitFor();
    };
    const shot = async (name) => {
      await p.waitForTimeout(200);
      await p.screenshot({
        path: out + "/" + name + "-" + width + ".png",
        fullPage: true,
      });
    };
    const saved = () =>
      p.evaluate(
        () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
      );
    const login = async (admin) => {
      await go(admin ? "/personal" : "/login");
      await p
        .locator("#auth-email")
        .fill(admin ? "admin@rosita.test" : "cliente@rosita.test");
      await p
        .locator("#auth-password")
        .fill(admin ? "RositaDemo!2026" : "ClienteDemo!");
      await p
        .getByRole("button", { name: "Iniciar sesión", exact: true })
        .click();
      await expect(p).toHaveURL(admin ? /\/admin$/ : /\/cuenta$/);
    };
    await go("/admin/productos");
    await expect(
      p.getByRole("heading", {
        name: "Acceso de personal de demostración.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      p.getByRole("button", { name: "Nuevo producto", exact: true }),
    ).toHaveCount(0);
    await go("/registro");
    await p.locator("#auth-name").fill("Cliente Rosita");
    await p.locator("#auth-email").fill("cliente@rosita.test");
    await p.locator("#auth-password").fill("ClienteDemo!");
    await p.locator("#auth-confirm").fill("ClienteDemo!");
    await p
      .getByRole("button", {
        name: "Crear cuenta de demostración",
        exact: true,
      })
      .click();
    await expect(p).toHaveURL(/cuenta$/);
    assert.equal(
      (await saved()).users.find((u) => u.email === "cliente@rosita.test").role,
      "customer",
    );
    await go("/admin/inventario");
    await expect(
      p.getByRole("heading", {
        name: "Este espacio es para administración.",
        exact: true,
      }),
    ).toBeVisible();
    await go("/producto/ROS-004");
    await p
      .getByRole("button", {
        name: "Aumentar Set de destornilladores",
        exact: true,
      })
      .click();
    await p
      .getByRole("button", { name: "Agregar al carrito", exact: true })
      .click();
    await go("/checkout");
    await p.locator("#delivery-recipient").fill("Cliente Rosita");
    await p.locator("#delivery-phone").fill("999123456");
    await p.locator("#delivery-address").fill("Jr. Prueba 123");
    await p.locator("#delivery-zone").selectOption("demo-a");
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await p.getByRole("radio", { name: /Plin de demostración/ }).check();
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Confirmar pedido de demostración",
        exact: true,
      })
      .evaluate((el) => {
        el.click();
        el.click();
      });
    await expect(p).toHaveURL(/confirmacion$/);
    const id = await p.locator(".order-code").innerText();
    let s = await saved();
    assert.equal(s.orders.length, 1);
    assert.equal(s.movements.length, 1);
    assert.equal(s.inventory["ROS-004"].stock, 7);
    await p.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await login(true);
    await expect(p.locator('[data-metric="received"] > strong')).toHaveText(
      "1",
    );
    await expect(
      p.locator('[data-metric="totalCents"] > strong'),
    ).toContainText("35.00");
    await shot("resumen");
    await p.reload();
    await expect(
      p.getByRole("heading", { name: "Todo bajo control.", exact: true }),
    ).toBeVisible();
    await record(
      width +
        ": cliente y anónimo bloqueados en panel; compra genera un pedido/movimiento; acceso y sesión administrativa persistentes; métricas reales",
    );
    await go("/admin/pedidos");
    await p.locator("#orders-search").fill("Cliente Rosita");
    await expect(p.locator(".admin-table tbody tr")).toHaveCount(1);
    await p.locator("#orders-from").fill("2099-01-02");
    await p.locator("#orders-to").fill("2099-01-01");
    await expect(p.locator("#orders-date-error")).toBeVisible();
    await p
      .getByRole("button", { name: "Limpiar filtros", exact: true })
      .first()
      .click();
    await p.getByRole("link", { name: "Ver pedido", exact: true }).click();
    await expect(p.locator("h1")).toHaveText("Todo el detalle, a mano.");
    await p
      .getByRole("button", { name: "Avanzar a En preparación", exact: true })
      .click();
    const dlg = p.getByRole("dialog");
    await dlg
      .getByRole("button", { name: "Confirmar avance de estado", exact: true })
      .evaluate((el) => {
        el.click();
        el.click();
      });
    await expect(dlg).toBeHidden();
    s = await saved();
    assert.equal(s.orders[0].status, 1);
    assert.equal(s.orders[0].statusHistory.length, 2);
    assert.equal(s.movements.length, 1);
    await shot("pedido");
    await p
      .getByRole("button", {
        name: "Cerrar sesión administrativa",
        exact: true,
      })
      .click();
    await login(false);
    await go("/pedido/" + id + "/seguimiento");
    await expect(p.locator(".order-next h2")).toHaveText("En preparación");
    await expect(p.locator(".status-history")).toContainText(
      "Administración de demostración",
    );
    await p
      .getByRole("button", { name: "Simular siguiente estado", exact: true })
      .click();
    await p
      .getByRole("dialog")
      .getByRole("button", { name: "Confirmar avance de estado", exact: true })
      .click();
    await expect(p.locator(".order-next h2")).toHaveText("En camino");
    assert.equal((await saved()).movements.length, 1);
    await p.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await login(true);
    await record(
      width +
        ": pedidos buscables/filtrables; avance administrativo y cliente comparten reglas, historial y stock sin nuevo descuento",
    );
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-004");
    await p
      .getByRole("button", { name: "Editar ROS-004", exact: true })
      .click();
    await p
      .locator("#product-name")
      .fill("Set de destornilladores actualizado");
    await p.locator("#product-price").fill("16.75");
    await expect(p.locator("#product-stock")).toBeDisabled();
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toBeHidden();
    await expect(p.locator(".admin-table")).toContainText("16.75");
    s = await saved();
    assert.equal(s.orders[0].lines[0].name, "Set de destornilladores");
    assert.equal(s.orders[0].lines[0].unitPriceCents, 1550);
    await go("/producto/ROS-004");
    await expect(p.locator("h1")).toHaveText(
      "Set de destornilladores actualizado",
    );
    await expect(p.locator(".detail-info .product-price")).toContainText(
      "16.75",
    );
    await go("/admin/inventario?q=ROS-004");
    await p
      .getByRole("button", { name: "Ajustar ROS-004", exact: true })
      .click();
    await p.locator("#stock-quantity").fill("5");
    await p.locator("#stock-reason").fill("Reposición de demostración");
    await p
      .getByRole("button", { name: "Registrar ajuste", exact: true })
      .evaluate((el) => {
        el.click();
        el.click();
      });
    await expect(p.getByRole("dialog")).toBeHidden();
    assert.equal((await saved()).inventory["ROS-004"].stock, 12);
    assert.equal((await saved()).movements.length, 2);
    await p
      .getByRole("button", { name: "Ajustar ROS-004", exact: true })
      .click();
    await p.locator("#stock-kind").selectOption("manual-out");
    await p.locator("#stock-quantity").fill("13");
    await p.locator("#stock-reason").fill("Salida manual de prueba");
    await p
      .getByRole("button", { name: "Registrar ajuste", exact: true })
      .click();
    await expect(p.getByRole("dialog").getByRole("alert")).toContainText(
      "rango",
    );
    assert.equal((await saved()).inventory["ROS-004"].stock, 12);
    await p
      .getByRole("button", { name: "Cancelar ajuste", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Ajustar ROS-004", exact: true })
      .click();
    await p.locator("#stock-kind").selectOption("count");
    await p.locator("#stock-quantity").fill("4");
    await p.locator("#stock-reason").fill("Conteo físico de prueba");
    await p
      .getByRole("button", { name: "Registrar ajuste", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toBeHidden();
    s = await saved();
    assert.equal(s.inventory["ROS-004"].stock, 4);
    assert.equal(s.movements[0].delta, -8);
    await shot("inventario");
    await p.reload();
    await expect(p.locator(".admin-stock-number")).toHaveText("4");
    await record(
      width +
        ": edición compartida de nombre/precio conserva snapshot; stock solo en inventario; entrada, salida inválida y conteo persistentes e idempotentes",
    );
    await go("/admin/productos");
    await p
      .getByRole("button", { name: "Nuevo producto", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await expect(p.locator("#product-name-error")).toBeVisible();
    await p.locator("#product-id").fill("ROS-004");
    await p.locator("#product-name").fill("Cuaderno de prueba");
    await p.locator("#product-brand").fill("Rosita");
    await p.locator("#product-category").selectOption("educacion-oficina");
    await p.locator("#product-presentation").fill("Unidad · 80 hojas");
    await p.locator("#product-price").fill("8.90");
    await p.locator("#product-stock").fill("6");
    await p.locator("#product-threshold").fill("2");
    await p
      .locator("#product-description")
      .fill("Cuaderno ficticio para probar el catálogo compartido.");
    await p.locator("#product-imageKey").selectOption("illustration-notebook");
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await expect(p.locator("#product-id-error")).toContainText("ya existe");
    await p.locator("#product-id").fill("ROS-NUEVO");
    await shot("producto-formulario");
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toBeHidden();
    s = await saved();
    assert.equal(s.products.length, 25);
    assert.equal(s.inventory["ROS-NUEVO"].stock, 6);
    await p.locator("#admin-products-search").fill("ROS-NUEVO");
    await p
      .getByRole("button", { name: "Editar ROS-NUEVO", exact: true })
      .click();
    await p.locator("#product-name").fill("Cambio sin guardar");
    await p.keyboard.press("Escape");
    await expect(p.getByRole("alert")).toContainText("sin guardar");
    await p
      .getByRole("button", { name: "Seguir editando", exact: true })
      .click();
    await expect(p.locator("#product-name")).toHaveValue("Cambio sin guardar");
    await p
      .getByRole("button", { name: "Cancelar edición", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Descartar cambios", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toBeHidden();
    await expect(
      p.getByRole("button", { name: "Editar ROS-NUEVO", exact: true }),
    ).toBeFocused();
    assert.equal(
      (await saved()).products.find((p) => p.id === "ROS-NUEVO").name,
      "Cuaderno de prueba",
    );
    await go("/producto/ROS-NUEVO");
    await expect(p.locator("h1")).toHaveText("Cuaderno de prueba");
    await p
      .getByRole("button", { name: "Agregar al carrito", exact: true })
      .click();
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-NUEVO");
    await p
      .getByRole("button", { name: "Desactivar ROS-NUEVO", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar desactivación", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toBeHidden();
    await go("/catalogo?q=Cuaderno%20de%20prueba");
    await expect(
      p.getByRole("heading", {
        name: "No encontramos coincidencias",
        exact: true,
      }),
    ).toBeVisible();
    await go("/carrito");
    await expect(p.locator(".cart-warning")).toContainText("desactivados");
    await expect(
      p.getByRole("button", {
        name: "Corrige el carrito para continuar",
        exact: true,
      }),
    ).toBeDisabled();
    await shot("carrito-inactivo");
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-NUEVO");
    await p
      .getByRole("button", { name: "Activar ROS-NUEVO", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar activación", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toBeHidden();
    await record(
      width +
        ": crear/validar/duplicado; imagen local; cambios sin guardar; desactivar conserva carrito e historia y retira nueva compra; activar restaura oferta",
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await go("/admin");
    if (width < 1024) {
      const trigger = p.getByRole("button", {
        name: "Abrir navegación administrativa",
        exact: true,
      });
      await trigger.click();
      await expect(p.getByRole("dialog")).toBeVisible();
      await p.keyboard.press("Tab");
      assert(
        await p
          .getByRole("dialog")
          .evaluate((el) => el.contains(document.activeElement)),
      );
      await p.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await trigger.click();
      await p
        .getByRole("dialog")
        .getByRole("link", { name: "Productos", exact: true })
        .click();
      await expect(p).toHaveURL(/admin\/productos$/);
    }
    await go("/admin/pedidos/ROS-inexistente");
    await expect(p.locator("h1")).toHaveText("No encontramos este pedido.");
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await record(
      width +
        ": navegación directa, menú por teclado/Escape, foco, movimiento reducido y rutas inválidas",
    );
    await p.close();
  }
  assert.deepEqual(errors, []);
} catch (e) {
  console.error(e);
  if (current && !current.isClosed())
    await current.screenshot({
      path: out + "/fallo-flujo.png",
      fullPage: true,
    });
  process.exitCode = 1;
} finally {
  await b.close();
}
