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
const ctx = await b.newContext({ viewport: { width: 390, height: 1000 } });
await ctx.addInitScript((s) => {
  const original = Storage.prototype.setItem;
  original.call(
    localStorage,
    "minimarket-rosita:app",
    JSON.stringify({ version: 4, data: s }),
  );
  Storage.prototype.setItem = function (key, value) {
    if (key.startsWith("minimarket-rosita:"))
      throw new DOMException("Quota", "QuotaExceededError");
    return original.call(this, key, value);
  };
}, fixture);
const q = await ctx.newPage();
await q.goto("http://127.0.0.1:5173/admin/productos");
await q.getByRole("button", { name: "Nuevo producto", exact: true }).waitFor();
const before = await q.evaluate(() =>
  localStorage.getItem("minimarket-rosita:app"),
);
await q.getByRole("button", { name: "Nuevo producto", exact: true }).click();
for (const [key, v] of Object.entries({
  id: "ROS-QUOTA",
  name: "Producto cuota",
  brand: "Rosita",
  presentation: "Unidad",
  price: "4.50",
  stock: "2",
  threshold: "1",
  description: "Producto ficticio de prueba de cuota.",
}))
  await q.locator("#product-" + key).fill(v);
await q.locator("#product-category").selectOption("consumibles");
await q.getByRole("button", { name: "Guardar producto", exact: true }).click();
await expect(q.getByRole("dialog")).toBeHidden();
await q.locator("#admin-products-search").fill("ROS-QUOTA");
await expect(q.locator(".admin-table")).toContainText("Producto cuota");
await expect(q.locator(".admin-storage-notice")).toContainText(
  "sesión temporal",
);
assert.equal(
  await q.evaluate(() => localStorage.getItem("minimarket-rosita:app")),
  before,
);
await q.reload();
await q.locator("#admin-products-search").fill("ROS-QUOTA");
await expect(
  q.getByRole("heading", { name: "No encontramos productos.", exact: true }),
).toBeVisible();
const passed = [
  "Cuota de escritura agotada permite sesión temporal con aviso; el registro previo permanece íntegro y reaparece al recargar",
];
await fs.writeFile(out + "/cuota.json", JSON.stringify({ passed }, null, 2));
console.log(passed);
await b.close();
