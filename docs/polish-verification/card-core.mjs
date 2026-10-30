import { createServer } from "vite";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  }),
  passed = [];
try {
  const { initialState, emptyCheckout } =
      await server.ssrLoadModule("/src/data/demo.ts"),
    { rositaReducer } = await server.ssrLoadModule("/src/app/state/reducer.ts"),
    { prepareQuote, confirmOrder } = await server.ssrLoadModule(
      "/src/lib/order-transaction.ts",
    ),
    { priceCart } = await server.ssrLoadModule("/src/lib/cart-pricing.ts"),
    { stateSchema } = await server.ssrLoadModule("/src/lib/state-schema.ts"),
    { readRositaState, writeRositaState } = await server.ssrLoadModule(
      "/src/lib/storage.ts",
    );
  let state = structuredClone(initialState);
  const client = state.users.find((u) => u.role === "customer");
  state.sessionUserId = client.id;
  for (const n of [0, -1, 1.5, NaN, Infinity])
    assert.deepEqual(
      rositaReducer(state, { type: "cart/add", id: "ROS-004", quantity: n }),
      state,
    );
  assert.deepEqual(
    rositaReducer(state, { type: "cart/add", id: "DESCONOCIDO", quantity: 1 }),
    state,
  );
  state = rositaReducer(state, {
    type: "cart/add",
    id: "ROS-004",
    quantity: 2,
  });
  assert.equal(state.cart["ROS-004"], 2);
  for (const priceCents of [0, -1, NaN, Infinity, 1.5])
    assert(
      priceCart({
        ...state,
        inventory: {
          ...state.inventory,
          "ROS-004": { ...state.inventory["ROS-004"], priceCents },
        },
      }).error,
    );
  const off = {
    ...state,
    categories: state.categories.map((c) => ({ ...c, active: false })),
  };
  assert.equal(
    rositaReducer(off, { type: "cart/add", id: "ROS-004", quantity: 1 }),
    off,
  );
  state.checkout = {
    ...emptyCheckout(),
    token: crypto.randomUUID(),
    step: 2,
    delivery: {
      recipient: "Cliente Prueba",
      phone: "999123456",
      address: "Calle ficticia 123",
      zone: "demo-a",
      reference: "",
    },
    payment: { method: "card-demo", cashAmount: "" },
  };
  state.checkout.quote = prepareQuote(state).quote;
  assert(state.checkout.quote);
  const approval = {
      reference: "DEMO-" + crypto.randomUUID(),
      brand: "Demo",
      last4: "0001",
      fingerprint: state.checkout.quote.fingerprint,
      token: state.checkout.token,
      userId: client.id,
    },
    request = {
      token: state.checkout.token,
      id: "ROS-" + crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
  assert.equal(confirmOrder(state, request).orders.length, 0);
  const invalid = {
    ...state,
    inventory: {
      ...state.inventory,
      "ROS-004": { ...state.inventory["ROS-004"], priceCents: 2000 },
    },
  };
  invalid.checkout = { ...state.checkout, quote: prepareQuote(invalid).quote };
  assert.equal(
    confirmOrder(invalid, { ...request, cardApproval: approval }).orders.length,
    0,
  );
  assert.equal(
    confirmOrder(rositaReducer(state, { type: "auth/logout" }), {
      ...request,
      cardApproval: approval,
    }).orders.length,
    0,
  );
  let changed = rositaReducer(state, { type: "cart/remove", id: "ROS-004" });
  changed = rositaReducer(changed, {
    type: "cart/add",
    id: "ROS-004",
    quantity: 2,
  });
  assert.equal(changed.checkout.quote, null);
  assert.equal(
    confirmOrder(changed, { ...request, cardApproval: approval }).orders.length,
    0,
  );
  const done = confirmOrder(state, { ...request, cardApproval: approval });
  assert.equal(done.orders.length, 1);
  assert.equal(
    done.inventory["ROS-004"].stock,
    state.inventory["ROS-004"].stock - 2,
  );
  assert.equal(done.movements.filter((m) => m.kind === "order-out").length, 1);
  assert.deepEqual(Object.keys(done.orders[0].cardReceipt).sort(), [
    "brand",
    "last4",
    "reference",
  ]);
  assert.equal(
    confirmOrder(done, { ...request, cardApproval: approval }),
    done,
  );
  assert(stateSchema.safeParse(done).success);
  let raw;
  assert(writeRositaState(done, { setItem: (k, v) => (raw = v) }).ok);
  assert.equal(JSON.parse(raw).version, 7);
  assert.equal(readRositaState({ getItem: () => raw }).status, "loaded");
  const original = structuredClone(initialState),
    old = JSON.stringify({ version: 6, data: original });
  const migrated = readRositaState({ getItem: () => old });
  assert.equal(migrated.status, "migrated");
  for (const k of [
    "products",
    "categories",
    "subcategories",
    "inventory",
    "orders",
    "cart",
    "users",
    "media",
  ])
    assert.deepEqual(
      JSON.parse(JSON.stringify(migrated.data[k])),
      JSON.parse(JSON.stringify(original[k])),
    );
  passed.push(
    "Cantidades/identificadores/precios inválidos y categoría desactivada rechazados; cálculo compartido y stock entero.",
    "Tarjeta exige aprobación ligada a cliente/token/huella: cambio de importe o salida impiden confirmar; doble solicitud produce un pedido y un movimiento por línea.",
    "Pedido solo guarda referencia ficticia/marca/últimos cuatro; esquema7 admite recarga; migración6 conserva colecciones existentes.",
  );
  await fs.writeFile(
    "docs/polish-verification/card-core.json",
    JSON.stringify({ passed, errors: [] }, null, 2),
  );
  console.log(passed);
} finally {
  await server.close();
}
