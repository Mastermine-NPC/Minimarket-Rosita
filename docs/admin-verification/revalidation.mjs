const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch(),
  p = await b.newPage(),
  errors = [],
  out = "./docs/admin-verification";
p.on("pageerror", (e) => {
  errors.push(e.message);
  console.log(e.message);
});
await p.goto("http://127.0.0.1:5173");
await p.waitForLoadState("networkidle");
const fixture = await p.evaluate(async () => {
  const { initialState, emptyCheckout } = await import("/src/data/demo.ts");
  const { prepareQuote } = await import("/src/lib/order-transaction.ts");
  const { rositaReducer: r } = await import("/src/app/state/reducer.ts");
  let s = structuredClone(initialState),
    admin = s.users[0];
  const at = new Date().toISOString(),
    client = {
      id: "layout-client",
      role: "customer",
      name: "Cliente de prueba",
      email: "prueba@rosita.test",
      salt: "ab".repeat(16),
      verifier: "cd".repeat(32),
      iterations: 210000,
      createdAt: at,
    };
  s.users.push(client);
  s.sessionUserId = client.id;
  s.cart = { "ROS-004": 2 };
  s.checkout = {
    ...emptyCheckout(),
    token: "layout-order",
    step: 2,
    delivery: {
      recipient: "Cliente de prueba",
      phone: "999123456",
      address: "Jr. Prueba 123",
      zone: "demo-a",
      reference: "",
    },
    payment: { method: "plin-demo", cashAmount: "" },
  };
  s.checkout.quote = prepareQuote(s).quote;
  s = r(s, {
    type: "order/confirm",
    token: "layout-order",
    id: "ROS-layout-001",
    createdAt: at,
  });
  s.sessionUserId = admin.id;
  return s;
});

const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
await p.evaluate(async (base) => {
  const { emptyCheckout } = await import("/src/data/demo.ts");
  const { prepareQuote } = await import("/src/lib/order-transaction.ts");
  const { rositaReducer: r } = await import("/src/app/state/reducer.ts");
  let s = structuredClone(base);
  const admin = s.users.find((u) => u.role === "admin"),
    client = s.users.find((u) => u.role === "customer");
  s.sessionUserId = client.id;
  s.cart = { "ROS-004": 1 };
  s.checkout = {
    ...emptyCheckout(),
    token: "stale-price-ui",
    step: 2,
    delivery: {
      recipient: client.name,
      phone: "999123456",
      address: "Jr. Prueba 123",
      zone: "demo-a",
      reference: "",
    },
    payment: { method: "cash", cashAmount: "100" },
  };
  s.checkout.quote = prepareQuote(s).quote;
  const product = s.products.find((p) => p.id === "ROS-004");
  s = r(
    { ...s, sessionUserId: admin.id },
    {
      type: "admin/product-save",
      operationId: "price-fixture",
      at: new Date().toISOString(),
      editing: true,
      expectedUpdatedAt: product.updatedAt,
      input: { ...product, priceCents: 1999, initialStock: 999 },
    },
  );
  s.sessionUserId = client.id;
  localStorage.setItem(
    "minimarket-rosita:app",
    JSON.stringify({ version: 4, data: s }),
  );
}, fixture);
await p.goto("http://127.0.0.1:5173/checkout");
await p
  .getByRole("button", {
    name: "Confirmar pedido de demostración",
    exact: true,
  })
  .click();
await expect(p.locator(".checkout-error")).toContainText("cambiaron");
await expect(p.locator(".checkout-error")).toBeFocused();
await expect(
  p.getByRole("button", {
    name: "Confirmar pedido de demostración",
    exact: true,
  }),
).toBeDisabled();
assert.equal(
  await p.evaluate(
    () =>
      JSON.parse(localStorage.getItem("minimarket-rosita:app")).data.orders
        .length,
  ),
  1,
);
await p
  .getByRole("button", { name: "Actualizar revisión", exact: true })
  .click();
await expect(p.locator(".order-summary .order-total dd")).toContainText(
  "23.99",
);
await p
  .getByRole("button", {
    name: "Confirmar pedido de demostración",
    exact: true,
  })
  .click();
await expect(p).toHaveURL(/confirmacion$/);
const s = await p.evaluate(
  () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
);
assert.equal(s.orders.length, 2);
assert.equal(s.orders[0].totalCents, 2399);
assert.equal(s.inventory["ROS-004"].stock, 6);
assert.equal(s.orders[1].lines[0].unitPriceCents, 1550);
const passed = [
  "Precio editado por una acción administrativa después de preparar revisión bloquea confirmar; error recibe foco, se exige revisión explícita y se compra al precio nuevo conservando el pedido anterior",
];
await fs.writeFile(
  out + "/revalidacion-ui.json",
  JSON.stringify({ passed }, null, 2),
);
console.log(passed);
await b.close();
