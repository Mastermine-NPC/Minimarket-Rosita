const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  p = await b.newPage();
await p.goto("http://127.0.0.1:5173");
await p.locator("h1").waitFor();
const results = await p.evaluate(async () => {
  const { initialState, emptyCheckout } = await import("/src/data/demo.ts");
  const { rositaReducer: r } = await import("/src/app/state/reducer.ts");
  const { prepareQuote } = await import("/src/lib/order-transaction.ts");
  const { readRositaState, writeRositaState, resetRositaStorage } =
    await import("/src/lib/storage.ts");
  const { stateSchema } = await import("/src/lib/state-schema.ts");
  const { safeCustomerReturn } = await import("/src/lib/customer-return.ts");
  const passes = [];
  const check = (c, m) => {
    if (!c) throw Error(m);
    passes.push(m);
  };
  const user = {
    id: "u-test",
    name: "Cliente de prueba",
    email: "test@rosita.test",
    salt: "ab".repeat(16),
    verifier: "cd".repeat(32),
    iterations: 210000,
    createdAt: new Date().toISOString(),
  };
  let state = {
    ...structuredClone(initialState),
    users: [user],
    sessionUserId: user.id,
    cart: { "ROS-004": 2 },
    checkout: {
      ...emptyCheckout(),
      token: "request-test",
      step: 2,
      delivery: {
        recipient: "Cliente de prueba",
        phone: "999123456",
        address: "Calle Prueba 123",
        zone: "demo-a",
        reference: "",
      },
      payment: { method: "cash", cashAmount: "50" },
    },
  };
  state.checkout.quote = prepareQuote(state).quote;
  const action = {
    type: "order/confirm",
    token: "request-test",
    id: "ROS-test-unique",
    createdAt: new Date().toISOString(),
  };
  const committed = r(state, action);
  check(
    committed.orders.length === 1 &&
      committed.inventory["ROS-004"].stock === 7 &&
      Object.keys(committed.cart).length === 0,
    "Pedido, descuento de dos unidades y vaciado del carrito en una transición",
  );
  check(
    state.inventory["ROS-004"].stock === 9 &&
      Object.keys(state.cart).length === 1,
    "Reducer puro: no modifica el estado original",
  );
  check(
    r(committed, action) === committed &&
      r(committed, { ...action, id: "ROS-otro-id" }) === committed,
    "Idempotencia por requestId: doble confirmación/reintento no duplica ni descuenta",
  );
  let price = structuredClone(state);
  price.inventory["ROS-004"].priceCents += 50;
  const priceResult = r(price, action);
  check(
    priceResult.orders.length === 0 &&
      priceResult.checkout.quote === null &&
      priceResult.checkout.error.includes("cambiaron"),
    "Precio alterado: bloquea y exige nueva revisión",
  );
  price = r(priceResult, { type: "checkout/review" });
  check(
    price.checkout.quote.totalCents === 3600,
    "Revisión explícita actualiza el nuevo precio",
  );
  let low = structuredClone(state);
  low.inventory["ROS-004"].stock = 1;
  const lowResult = r(low, action);
  check(
    lowResult.orders.length === 0 &&
      lowResult.inventory["ROS-004"].stock === 1 &&
      lowResult.checkout.error.includes("stock"),
    "Stock insuficiente no crea pedido, vacía carrito ni descuenta",
  );
  let stockChanged = structuredClone(state);
  stockChanged.inventory["ROS-004"].stock = 8;
  check(
    r(stockChanged, action).orders.length === 0,
    "Cambio de stock aun suficiente solicita nueva revisión",
  );
  check(
    r({ ...state, sessionUserId: null }, action).orders.length === 0,
    "Cierre de sesión antes de confirmar impide crear pedido",
  );
  let tracked = committed;
  for (let i = 0; i < 6; i++)
    tracked = r(tracked, { type: "order/advance", id: action.id });
  check(
    tracked.orders[0].status === 3 && tracked.inventory["ROS-004"].stock === 7,
    "Seguimiento llega a Entregado y nunca repite descuento",
  );
  check(
    r(
      { ...committed, sessionUserId: "otro" },
      { type: "order/advance", id: action.id },
    ).orders[0].status === 0,
    "Otro cliente no puede avanzar este pedido desde la lógica",
  );
  let invalid = structuredClone(initialState);
  for (const quantity of [-2, 0, 1.5, NaN])
    invalid = r(invalid, { type: "cart/add", id: "ROS-001", quantity });
  check(
    Object.keys(invalid.cart).length === 0,
    "Cantidades inválidas rechazadas",
  );
  check(
    stateSchema.safeParse(committed).success,
    "Pedido e inventario comprometidos cumplen el esquema persistido",
  );
  const bad = structuredClone(committed);
  bad.orders[0].totalCents++;
  check(
    !stateSchema.safeParse(bad).success,
    "Importes contradictorios persistidos rechazados",
  );
  check(
    ["/checkout", "/mis-pedidos", "/pedido/ROS-abc/seguimiento"].every(
      (x) => safeCustomerReturn(x) === x,
    ) &&
      [
        "//evil.test",
        "https://evil.test",
        "/checkout/../../evil",
        "/\\evil",
        "/admin",
      ].every((x) => safeCustomerReturn(x) === "/cuenta"),
    "Retornos externos, ambiguos y no permitidos rechazados",
  );
  const data = new Map();
  const store = {
    getItem: (k) => data.get(k) || null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
    key: (i) => [...data.keys()][i] || null,
    get length() {
      return data.size;
    },
  };
  data.set(
    "minimarket-rosita:app",
    JSON.stringify({
      version: 2,
      data: { demoQuantity: 7, cart: { "ROS-004": 2 } },
    }),
  );
  let migration = readRositaState(store);
  check(
    migration.status === "migrated" &&
      migration.data.demoQuantity === 7 &&
      migration.data.cart["ROS-004"] === 2 &&
      migration.data.inventory["ROS-004"].stock === 9,
    "Migración v2 conserva carrito, contador, IDs y stock inicial",
  );
  writeRositaState(committed, store);
  const loaded = readRositaState(store);
  check(
    loaded.status === "loaded" &&
      loaded.data.orders[0].id === action.id &&
      loaded.data.inventory["ROS-004"].stock === 7 &&
      loaded.data.sessionUserId === user.id,
    "Recarga v3 conserva pedido, stock y sesión",
  );
  data.set("otra-app:conservar", "intacto");
  data.set("minimarket-rosita:aux", "prueba");
  resetRositaStorage(store);
  check(
    data.get("otra-app:conservar") === "intacto" &&
      !data.has("minimarket-rosita:aux"),
    "Reset exclusivo de Rosita",
  );
  data.set("minimarket-rosita:app", "{roto");
  check(
    readRositaState(store).status === "invalid" &&
      data.get("minimarket-rosita:app") === "{roto",
    "Corrupción recupera estado sin sobrescribir el original al leer",
  );
  check(
    !writeRositaState(committed, {
      setItem() {
        throw Error("QuotaExceeded");
      },
    }).ok,
    "Fallo de escritura devuelve resultado de sesión temporal",
  );
  return passes;
});
assert(results.length >= 18);
await fs.mkdir("./docs/order-verification", { recursive: true });
await fs.writeFile(
  "./docs/order-verification/logica.json",
  JSON.stringify({ passed: results }, null, 2),
);
console.log(results);
await b.close();
