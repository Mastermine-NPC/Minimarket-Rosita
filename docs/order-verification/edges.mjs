const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch(),
  p = await b.newPage(),
  results = [],
  errors = [];
p.on("pageerror", (e) => {
  errors.push(e.message);
  console.log("PAGEERROR", p.url(), e.message);
});
await p.goto("http://127.0.0.1:5173");
await p.locator("h1").waitFor();
const fixture = await p.evaluate(async () => {
  const { initialState, emptyCheckout } = await import("/src/data/demo.ts");
  const { rositaReducer } = await import("/src/app/state/reducer.ts");
  const { prepareQuote } = await import("/src/lib/order-transaction.ts");
  let state = structuredClone(initialState);
  state.users = [
    {
      id: "layout",
      name: "Ana Rosita",
      email: "layout@rosita.test",
      salt: "ab".repeat(16),
      verifier: "cd".repeat(32),
      iterations: 210000,
      createdAt: new Date().toISOString(),
    },
  ];
  state.sessionUserId = "layout";
  state.cart = { "ROS-004": 2 };
  state.checkout = {
    ...emptyCheckout(),
    token: "layout-order",
    step: 2,
    delivery: {
      recipient: "Ana Rosita",
      phone: "999123456",
      address: "Jr. Prueba 123",
      zone: "demo-a",
      reference: "Portón de prueba",
    },
    payment: { method: "cash", cashAmount: "50" },
  };
  state.checkout.quote = prepareQuote(state).quote;
  state = rositaReducer(state, {
    type: "order/confirm",
    token: "layout-order",
    id: "ROS-demo-001",
    createdAt: new Date().toISOString(),
  });
  state.cart = { "ROS-001": 2 };
  state.checkout = {
    ...emptyCheckout(),
    token: "layout-review",
    step: 2,
    delivery: {
      recipient: "Ana Rosita",
      phone: "999123456",
      address: "Jr. Prueba 123",
      zone: "demo-b",
      reference: "Portón de prueba",
    },
    payment: { method: "plin-demo", cashAmount: "" },
  };
  state.checkout.quote = prepareQuote(state).quote;
  return state;
});
const out = "./docs/order-verification";

const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
await p.setViewportSize({ width: 390, height: 1000 });
const seed = async (state) => {
  await p.evaluate(
    (s) =>
      localStorage.setItem(
        "minimarket-rosita:app",
        JSON.stringify({ version: 3, data: s }),
      ),
    state,
  );
};
await seed(fixture);
await p.goto("http://127.0.0.1:5173/checkout");
await p
  .getByRole("button", {
    name: "Confirmar pedido de demostración",
    exact: true,
  })
  .waitFor();
await p.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent.trim() === "Confirmar pedido de demostración")
    .click();
  document.querySelector('button[aria-label="Cerrar sesión"]').click();
});
await expect(p).toHaveURL(/login$/);
await p.waitForTimeout(500);
let saved = await p.evaluate(
  () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
);
assert.equal(saved.orders.length, 1);
assert.equal(saved.inventory["ROS-001"].stock, 24);
assert.equal(saved.cart["ROS-001"], 2);
assert.equal(saved.checkout.delivery.recipient, "");
results.push(
  "Cerrar sesión durante procesamiento cancela confirmación, limpia borrador y conserva carrito/stock",
);
const long = structuredClone(fixture);
long.users[0].name = "A".repeat(80);
await seed(long);
await p.goto("http://127.0.0.1:5173/cuenta");
await p.locator("h1").waitFor();
assert.equal(
  await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
results.push(
  "Nombre de 80 caracteres sin espacios no desborda la cuenta móvil",
);
await seed(fixture);
await p.goto("http://127.0.0.1:5173/checkout");
await p
  .getByRole("button", {
    name: "Confirmar pedido de demostración",
    exact: true,
  })
  .click();
await expect(p).toHaveURL(/confirmacion$/);
await expect(p.locator(".order-summary")).toContainText("Plin de demostración");
await p.reload();
await p.locator(".order-summary").waitFor();
saved = await p.evaluate(
  () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
);
assert.equal(saved.orders.length, 2);
assert.equal(saved.inventory["ROS-001"].stock, 22);
results.push(
  "Plin simulado confirma con snapshot y descuento persistente sin datos financieros",
);
const low = structuredClone(fixture);
low.inventory["ROS-001"].stock = 1;
await seed(low);
await p.goto("http://127.0.0.1:5173/checkout");
await expect(
  p.getByText(
    "Ajustamos el carrito al stock disponible. Revisa las cantidades.",
    { exact: true },
  ),
).toBeVisible();
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
  "10.00",
);
results.push(
  "Stock reducido al recargar avisa, ajusta carrito e impide confirmar sin actualizar revisión",
);
await p.evaluate(async () => {
  const { initialState } = await import("/src/data/demo.ts");
  localStorage.setItem(
    "minimarket-rosita:app",
    JSON.stringify({ version: 3, data: initialState }),
  );
});
await p.goto("http://127.0.0.1:5173/checkout");
await expect(
  p.getByRole("heading", {
    name: "Primero, algo para tu carrito.",
    exact: true,
  }),
).toBeVisible();
await p.goto("http://127.0.0.1:5173/pedido/ROS-inexistente/seguimiento");
await expect(
  p.getByRole("heading", { name: "Tu cuenta de demostración.", exact: true }),
).toBeVisible();
results.push(
  "Checkout vacío y seguimiento directo sin sesión muestran alternativas útiles",
);
await fs.writeFile(
  out + "/casos-limite.json",
  JSON.stringify({ passed: results, errors }, null, 2),
);
console.log(results);
await b.close();
