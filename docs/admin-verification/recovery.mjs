const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  out = "./docs/admin-verification",
  passed = [];
let current;
const go = async (p, path) => {
  await p.goto("http://127.0.0.1:5173" + path);
  await p.waitForLoadState("networkidle");
  await p.locator("h1").waitFor();
};
const login = async (p) => {
  await p.locator("#auth-email").fill("admin@rosita.test");
  await p.locator("#auth-password").fill("RositaDemo!2026");
  await p.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(p).toHaveURL(/admin$/);
  await p.locator("#admin-contenido h1").waitFor();
};
try {
  let p = await b.newPage();
  current = p;
  await go(p, "/");
  await p.evaluate(async () => {
    const { initialState, emptyCheckout } = await import("/src/data/demo.ts");
    const { prepareQuote } = await import("/src/lib/order-transaction.ts");
    const { rositaReducer: r } = await import("/src/app/state/reducer.ts");
    const { createVerifier } = await import("/src/lib/demo-auth.ts");
    let s = structuredClone(initialState),
      client = {
        id: "legacy-client",
        name: "Cliente Anterior",
        role: "customer",
        email: "anterior@rosita.test",
        ...(await createVerifier("AnteriorDemo!")),
        createdAt: new Date().toISOString(),
      };
    s.users.push(client);
    s.sessionUserId = client.id;
    s.cart = { "ROS-001": 1 };
    s.checkout = {
      ...emptyCheckout(),
      token: "old-purchase",
      step: 2,
      delivery: {
        recipient: client.name,
        phone: "999123456",
        address: "Calle Antigua 123",
        zone: "demo-a",
        reference: "",
      },
      payment: { method: "plin-demo", cashAmount: "" },
    };
    s.checkout.quote = prepareQuote(s).quote;
    s = r(s, {
      type: "order/confirm",
      token: "old-purchase",
      id: "ROS-legacy-001",
      createdAt: new Date().toISOString(),
    });
    const old = {
      demoQuantity: 7,
      cart: { "ROS-004": 2 },
      users: [
        Object.fromEntries(
          Object.entries(client).filter(([k]) => k !== "role"),
        ),
      ],
      sessionUserId: client.id,
      inventory: s.inventory,
      orders: s.orders.map((o) =>
        Object.fromEntries(
          Object.entries(o).filter(
            ([k]) =>
              ![
                "legacyHistory",
                "statusHistory",
                "customerName",
                "customerEmail",
              ].includes(k),
          ),
        ),
      ),
      checkout: emptyCheckout(),
      authError: "",
    };
    localStorage.setItem("otra-app:conservar", "intacto");
    localStorage.setItem(
      "minimarket-rosita:app",
      JSON.stringify({ version: 3, data: old }),
    );
  });
  await p.reload();
  await expect(p.getByText(/Actualizamos a v4/)).toBeVisible();
  await expect
    .poll(() =>
      p.evaluate(
        () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
      ),
    )
    .toBe(4);
  let s = await p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
  );
  assert.equal(s.demoQuantity, 7);
  assert.equal(s.cart["ROS-004"], 2);
  assert.equal(s.inventory["ROS-001"].stock, 23);
  assert.equal(s.orders[0].statusHistory.length, 0);
  assert.equal(s.movements.length, 0);
  assert.equal(s.users.filter((u) => u.role === "admin").length, 1);
  await go(p, "/estado");
  await expect(
    p.getByRole("button", { name: "Restablecer datos de Rosita", exact: true }),
  ).toBeDisabled();
  await p.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await go(p, "/personal");
  await login(p);
  await go(p, "/admin/inventario");
  await expect(
    p.getByRole("heading", {
      name: "Sin movimientos registrados.",
      exact: true,
    }),
  ).toBeVisible();
  await go(p, "/admin/pedidos/ROS-legacy-001");
  await expect(p.locator(".status-history")).toContainText(
    "no se registraban transiciones",
  );
  await p
    .getByRole("button", { name: "Avanzar a En preparación", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Confirmar avance de estado", exact: true })
    .click();
  await expect(p.getByRole("dialog")).toBeHidden();
  s = await p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
  );
  assert.equal(s.orders[0].statusHistory.length, 1);
  assert.equal(s.movements.length, 0);
  await p.reload();
  await p.locator("h1").waitFor();
  assert.equal(
    (
      await p.evaluate(
        () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
      )
    ).users.filter((u) => u.role === "admin").length,
    1,
  );
  passed.push(
    "Migración v3 conserva datos y sesión cliente; añade un administrador; no inventa movimientos/fechas; solo registra transiciones nuevas",
  );
  await p.evaluate(() =>
    localStorage.setItem("minimarket-rosita:app", "{roto"),
  );
  await go(p, "/");
  await expect(
    p.getByText(/No se pudo leer el contenido guardado/),
  ).toBeVisible();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("minimarket-rosita:app")),
    "{roto",
  );
  await p.evaluate(() =>
    localStorage.setItem(
      "minimarket-rosita:app",
      JSON.stringify({ version: 99, data: { future: "conservar" } }),
    ),
  );
  await p.reload();
  await expect(
    p.getByText(/Hay datos de una versión más reciente/),
  ).toBeVisible();
  await go(p, "/personal");
  await login(p);
  assert.equal(
    await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
    ),
    99,
  );
  await p
    .getByRole("link", { name: "Restablecer demostración", exact: true })
    .click();
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
    .toBe(4);
  assert.equal(
    await p.evaluate(() => localStorage.getItem("otra-app:conservar")),
    "intacto",
  );
  passed.push(
    "Corrupción conserva original hasta acción; formato futuro protegido incluso al ingresar; reset administrativo exclusivo recupera v4 sin borrar claves ajenas",
  );
  await p.close();
  const ctx = await b.newContext({ viewport: { width: 390, height: 1000 } });
  await ctx.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  p = await ctx.newPage();
  current = p;
  await go(p, "/personal");
  await login(p);
  await p
    .getByRole("button", {
      name: "Abrir navegación administrativa",
      exact: true,
    })
    .waitFor();
  {
    await p
      .getByRole("button", {
        name: "Abrir navegación administrativa",
        exact: true,
      })
      .click();
    await p
      .getByRole("dialog")
      .getByRole("link", { name: "Productos", exact: true })
      .click();
  }
  await p.getByRole("button", { name: "Nuevo producto", exact: true }).click();
  for (const [key, v] of Object.entries({
    id: "ROS-TEMP",
    name: "Producto temporal",
    brand: "Rosita",
    presentation: "Unidad",
    price: "4.25",
    stock: "3",
    threshold: "1",
    description: "Producto ficticio para probar almacenamiento bloqueado.",
  }))
    await p.locator("#product-" + key).fill(v);
  await p.locator("#product-category").selectOption("consumibles");
  await p
    .getByRole("button", { name: "Guardar producto", exact: true })
    .click();
  await expect(p.getByRole("dialog")).toBeHidden();
  await p.locator("#admin-products-search").fill("ROS-TEMP");
  await expect(p.locator(".admin-table")).toContainText("Producto temporal");
  await expect(p.locator(".admin-storage-notice")).toContainText(
    /sesión temporal/,
  );
  await p.getByRole("link", { name: "Ver tienda", exact: true }).click();
  await p
    .getByRole("searchbox", { name: "Buscar productos", exact: true })
    .fill("Producto temporal");
  await p
    .getByRole("searchbox", { name: "Buscar productos", exact: true })
    .press("Enter");
  await expect(p.locator(".catalog-products article")).toHaveCount(1);
  await p.reload();
  await expect(
    p.getByRole("heading", {
      name: "No encontramos coincidencias",
      exact: true,
    }),
  ).toBeVisible();
  passed.push(
    "Almacenamiento bloqueado: CRUD y tienda continúan en memoria, aviso visible y pérdida al recargar explícita",
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
