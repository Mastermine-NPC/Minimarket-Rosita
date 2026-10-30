const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  passed = [],
  out = "./docs/order-verification";
let current;
const go = async (p, url) => {
  await p.goto("http://127.0.0.1:5173" + url);
  await p.locator("h1").waitFor();
};
try {
  let p = await b.newPage();
  current = p;
  await go(p, "/");
  await p.evaluate(() => {
    localStorage.setItem("otra-app:conservar", "intacto");
    localStorage.setItem(
      "minimarket-rosita:app",
      JSON.stringify({
        version: 2,
        data: { demoQuantity: 7, cart: { "ROS-004": 2 } },
      }),
    );
  });
  await p.reload();
  await expect(
    p.getByText(
      "Actualizamos los datos a v3 conservando tu carrito y el contador técnico.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    p.getByRole("button", { name: "Abrir carrito, 2 unidades", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      p.evaluate(
        () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
      ),
    )
    .toBe(3);
  assert.equal(
    await p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("minimarket-rosita:app")).data
          .demoQuantity,
    ),
    7,
  );
  passed.push(
    "UI: migración v2→v3 conserva carrito de dos unidades y contador 7",
  );
  await p.evaluate(() =>
    localStorage.setItem("minimarket-rosita:app", "{roto"),
  );
  await p.reload();
  await expect(
    p.getByText(/No se pudo leer el contenido guardado de Rosita/),
  ).toBeVisible();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("minimarket-rosita:app")),
    "{roto",
  );
  passed.push("UI: corrupción avisa sin sobrescribir al abrir");
  await p.evaluate(() =>
    localStorage.setItem(
      "minimarket-rosita:app",
      JSON.stringify({ version: 99, data: { conservar: "futuro" } }),
    ),
  );
  await p.reload();
  await expect(
    p.getByText(/Hay datos de una versión más reciente/),
  ).toBeVisible();
  await p
    .locator(".home-products article")
    .first()
    .getByRole("button", { name: /Agregar al carrito:/ })
    .click();
  assert.equal(
    await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
    ),
    99,
  );
  await go(p, "/estado");
  await p
    .getByRole("button", { name: "Restablecer datos de Rosita", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Sí, restablecer Rosita", exact: true })
    .click();
  await expect
    .poll(() =>
      p.evaluate(
        () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
      ),
    )
    .toBe(3);
  assert.equal(
    await p.evaluate(() => localStorage.getItem("otra-app:conservar")),
    "intacto",
  );
  passed.push("UI: formato futuro protegido; reset exclusivo recupera v3");
  await p.close();
  p = await b.newPage();
  current = p;
  await go(p, "/");
  await p.evaluate(async () => {
    const { initialState, emptyCheckout } = await import("/src/data/demo.ts");
    const { prepareQuote } = await import("/src/lib/order-transaction.ts");
    const state = structuredClone(initialState);
    state.users = [
      {
        id: "test",
        name: "Cliente Precio",
        email: "precio@rosita.test",
        salt: "ab".repeat(16),
        verifier: "cd".repeat(32),
        iterations: 210000,
        createdAt: new Date().toISOString(),
      },
    ];
    state.sessionUserId = "test";
    state.cart = { "ROS-004": 2 };
    state.checkout = {
      ...emptyCheckout(),
      token: "price-case",
      step: 2,
      delivery: {
        recipient: "Cliente Precio",
        phone: "999123456",
        address: "Calle Prueba 123",
        zone: "demo-a",
        reference: "",
      },
      payment: { method: "cash", cashAmount: "50" },
    };
    state.checkout.quote = prepareQuote(state).quote;
    state.inventory["ROS-004"].priceCents = 1600;
    localStorage.setItem(
      "minimarket-rosita:app",
      JSON.stringify({ version: 3, data: state }),
    );
  });
  await go(p, "/checkout");
  await p
    .getByRole("button", {
      name: "Confirmar pedido de demostración",
      exact: true,
    })
    .click();
  await expect(
    p.getByText(/Los productos, precios, stock o datos de entrega cambiaron/),
  ).toBeVisible();
  assert.equal(
    await p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("minimarket-rosita:app")).data.orders
          .length,
    ),
    0,
  );
  await expect(
    p.getByRole("button", {
      name: "Confirmar pedido de demostración",
      exact: true,
    }),
  ).toBeDisabled();
  await p
    .getByRole("button", { name: "Actualizar revisión", exact: true })
    .click();
  await expect(p.locator(".order-summary .order-total dd")).toContainText(
    "36.00",
  );
  await p
    .getByRole("button", {
      name: "Confirmar pedido de demostración",
      exact: true,
    })
    .click();
  await expect(p).toHaveURL(/confirmacion$/);
  assert.equal(
    await p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("minimarket-rosita:app")).data.orders[0]
          .totalCents,
    ),
    3600,
  );
  passed.push(
    "UI: precio cambiado bloquea confirmación, exige actualización explícita y compra con importe nuevo",
  );
  await p.close();
  const context = await b.newContext({
    viewport: { width: 390, height: 1000 },
  });
  await context.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  p = await context.newPage();
  current = p;
  await go(p, "/catalogo");
  await p
    .locator('article[data-product-id="ROS-001"]')
    .getByRole("button", { name: /Agregar al carrito:/ })
    .click();
  await p
    .getByRole("button", { name: "Abrir carrito, 1 unidad", exact: true })
    .click();
  await p
    .getByRole("link", { name: "Ver carrito completo", exact: true })
    .click();
  await p
    .getByRole("link", { name: "Continuar con mi pedido", exact: true })
    .click();
  await p
    .getByRole("link", { name: "Crear cuenta de demostración", exact: true })
    .click();
  await p.locator("#auth-name").fill("Cliente Temporal");
  await p.locator("#auth-email").fill("temporal@rosita.test");
  await p.locator("#auth-password").fill("SoloDemo!");
  await p.locator("#auth-confirm").fill("SoloDemo!");
  await p
    .getByRole("button", { name: "Crear cuenta de demostración", exact: true })
    .click();
  await expect(p).toHaveURL(/checkout$/);
  await p.locator("#delivery-recipient").fill("Cliente Temporal");
  await p.locator("#delivery-phone").fill("999123456");
  await p.locator("#delivery-address").fill("Calle Prueba 123");
  await p.locator("#delivery-zone").selectOption("demo-b");
  await p
    .getByRole("button", { name: "Continuar al pago simulado", exact: true })
    .click();
  await p.getByRole("radio", { name: /Yape de demostración/ }).check();
  await expect(p.locator("#cash-amount")).toHaveCount(0);
  await p.getByRole("button", { name: "Revisar pedido", exact: true }).click();
  await expect(p.locator(".order-summary .order-total dd")).toContainText(
    "10.00",
  );
  await p
    .getByRole("button", {
      name: "Confirmar pedido de demostración",
      exact: true,
    })
    .click();
  await expect(p).toHaveURL(/confirmacion$/);
  await expect(p.locator(".storage-notice")).toContainText(
    /sesión temporal.*perderse al recargar/,
  );
  await p
    .getByRole("link", { name: "Continuar comprando", exact: true })
    .click();
  await p.locator('article[data-product-id="ROS-001"] h3 a').click();
  await expect(p.locator(".detail-info .stock-label")).toContainText(
    "23 unidades",
  );
  await p.reload();
  await expect(
    p.getByRole("link", {
      name: "Iniciar sesión de demostración",
      exact: true,
    }),
  ).toBeVisible();
  await expect(p.locator(".detail-info .stock-label")).toContainText(
    "24 unidades",
  );
  passed.push(
    "UI: compra completa con localStorage bloqueado y Yape simulado; advertencia persistente y pérdida al recargar explícita",
  );
  await p.close();
  await fs.writeFile(
    out + "/recuperacion.json",
    JSON.stringify({ passed }, null, 2),
  );
  console.log(passed);
} catch (e) {
  console.error(e);
  if (current && !current.isClosed())
    await current.screenshot({
      path: out + "/fallo-recuperacion.png",
      fullPage: true,
    });
  process.exitCode = 1;
} finally {
  await b.close();
}
