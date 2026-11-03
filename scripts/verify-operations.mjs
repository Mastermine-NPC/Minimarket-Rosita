import { createServer } from "vite";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const root = process.cwd();
const server = await createServer({
  root,
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
});
let passed = [];
const offline = process.argv.includes("--offline");
const networkFetch = globalThis.fetch;
try {
  const load = (p) => server.ssrLoadModule("/src/" + p);
  const { initialState, emptyCheckout } = await load("data/demo.ts"),
    { stateSchema } = await load("lib/state-schema.ts"),
    { rositaReducer: r } = await load("app/state/reducer.ts"),
    { priceCashDraft, expectedCash } = await load("lib/operations.ts"),
    { prepareQuote } = await load("lib/order-transaction.ts"),
    { readRositaState, writeRositaState } = await load("lib/storage.ts"),
    { v8Schema } = await load("lib/legacy-v8-schema.ts"),
    { stagesFor } = await load("data/delivery.ts"),
    { storeOrigin, utpAccess } = await load("data/geography.ts"),
    { pointOnRoute, distanceBetween } = await load("lib/geography.ts"),
    { calculateRoute } = await load("lib/routing.ts"),
    { buildReport, reportCSV, defaultReportFilters } =
      await load("lib/analytics.ts"),
    { verifyPassword } = await load("lib/demo-auth.ts");
  const valid = (s) => {
    const v = stateSchema.safeParse(s);
    assert(v.success, JSON.stringify(v.error?.issues));
  };
  valid(initialState);
  assert.equal(initialState.products.length, 79);
  assert.equal(new Set(initialState.products.map((p) => p.barcode)).size, initialState.products.length);
  const client = initialState.users.find((u) => u.role === "customer"),
    cashier = initialState.users.find((u) => u.role === "cashier"),
    admin = initialState.users.find((u) => u.role === "admin");
  assert(await verifyPassword("CajaDemo!2026", cashier));
  passed.push(
    "Esquema 9, 79 códigos únicos y credencial ficticia de caja válidos.",
  );
  let n = 0;
  const stamp = () => ({
    operationId: "ops-" + ++n,
    at: "2026-10-30T16:00:00.000Z",
  });
  let s = structuredClone(initialState);
  s.sessionUserId = cashier.id;
  s = r(s, {
    type: "shift/open",
    id: "TUR-TEST",
    initialCents: 10000,
    ...stamp(),
  });
  assert(s.adminResult.ok);
  valid(s);
  s = r(s, {
    type: "cash/cart",
    kind: "add",
    id: "ROS-001",
    quantity: 2,
    token: "sale-token",
  });
  let priced = priceCashDraft(s);
  assert.equal(priced.lines[0].quantity, 2);
  const stock = s.inventory["ROS-001"].stock,
    total = priced.subtotalCents;
  const baseSale = {
    type: "cash/confirm",
    id: "CAJA-TEST",
    token: priced.token,
    fingerprint: priced.fingerprint,
    payment: "cash",
    cashTenderCents: total + 100,
    ...stamp(),
  };
  let fail = r(s, { ...baseSale, cashTenderCents: total - 1 });
  assert(!fail.adminResult.ok);
  assert.equal(fail.sales.length, 0);
  assert.equal(fail.inventory["ROS-001"].stock, stock);
  s = r(s, baseSale);
  assert(s.adminResult.ok);
  assert.equal(s.sales.length, 1);
  assert.equal(s.sales[0].changeCents, 100);
  assert.equal(s.inventory["ROS-001"].stock, stock - 2);
  assert.equal(s.movements.filter((m) => m.saleId === "CAJA-TEST").length, 1);
  valid(s);
  assert.deepEqual(r(s, baseSale), s);
  assert.deepEqual(r(s, { ...baseSale, ...stamp() }), s);
  passed.push(
    "Caja efectivo: insuficiente rechazado, vuelto correcto, una venta y un descuento aun repitiendo la acción.",
  );
  // shared stock + pickup
  s.sessionUserId = client.id;
  s.cart = { "ROS-001": 1 };
  s.checkout = {
    ...emptyCheckout(),
    token: "pickup-token",
    step: 2,
    delivery: {
      mode: "pickup",
      recipient: "Cliente Prueba",
      phone: "999123456",
      address: "Tienda Rosita",
      zone: "pickup",
      reference: "",
      origin: structuredClone(storeOrigin),
    },
    payment: { method: "cash", cashAmount: "1000" },
  };
  let quote = prepareQuote(s);
  assert(quote.quote, quote.error);
  assert.equal(quote.quote.shippingCents, 0);
  s.checkout.quote = quote.quote;
  s = r(s, {
    type: "order/confirm",
    id: "ROS-PICKUP",
    token: "pickup-token",
    createdAt: stamp().at,
  });
  assert.equal(s.orders.length, 1);
  assert.equal(s.inventory["ROS-001"].stock, stock - 3);
  assert.equal(stagesFor(s.orders[0].delivery)[2], "Listo para recoger");
  s.sessionUserId = admin.id;
  for (let i = 0; i < 3; i++)
    s = r(s, {
      type: "order/advance",
      id: "ROS-PICKUP",
      expectedStatus: i,
      ...stamp(),
    });
  assert.equal(s.inventory["ROS-001"].stock, stock - 3);
  assert.equal(s.sales.length, 1);
  valid(s);
  passed.push(
    "Pedido digital de recojo: envío cero, stock compartido, cuatro estados y ninguna segunda venta/salida al recoger.",
  );
  // roles, quantity/price changes, cards
  s.sessionUserId = cashier.id;
  s = r(s, {
    type: "cash/cart",
    kind: "add",
    id: "ROS-002",
    quantity: 1,
    token: "card-token",
  });
  priced = priceCashDraft(s);
  const approval = {
    reference: "DEMO-" + crypto.randomUUID(),
    brand: "Demo",
    last4: "0001",
    fingerprint: priced.fingerprint,
    token: priced.token,
    userId: cashier.id,
  };
  const cardAction = {
    type: "cash/confirm",
    id: "CAJA-CARD",
    token: priced.token,
    fingerprint: priced.fingerprint,
    payment: "card-demo",
    cashTenderCents: null,
    cardApproval: approval,
    ...stamp(),
  };
  const changed = r(s, {
    type: "cash/cart",
    kind: "set",
    id: "ROS-002",
    quantity: 2,
    token: priced.token,
  });
  assert(!r(changed, cardAction).adminResult.ok);
  assert(!r({ ...s, sessionUserId: client.id }, cardAction).adminResult.ok);
  assert(
    !r(
      {
        ...s,
        users: s.users.map((u) =>
          u.id === cashier.id ? { ...u, active: false } : u,
        ),
      },
      cardAction,
    ).adminResult.ok,
  );
  assert.equal(
    r(s, {
      type: "cash/cart",
      kind: "set",
      id: "ROS-002",
      quantity: 0,
      token: "bad",
    }).cashDrafts[cashier.id].cart["ROS-002"],
    1,
  );
  assert(!r(s, { ...cardAction, cardApproval: null }).adminResult.ok);
  s = r(s, cardAction);
  assert(s.adminResult.ok);
  valid(s);
  assert.equal(expectedCash(s, "TUR-TEST"), 10000 + total);
  s = r(s, {
    type: "shift/close",
    id: "TUR-TEST",
    countedCents: 10000 + total - 50,
    ...stamp(),
  });
  assert(s.adminResult.ok);
  assert.equal(s.shifts[0].differenceCents, -50);
  assert.equal(s.shifts[0].expectedCents, 10000 + total);
  valid(s);
  passed.push(
    "Permisos, agente desactivado, cantidades inválidas y tarjeta obsoleta rechazados; tarjeta válida, turno y diferencia sin sumar tarjeta al efectivo.",
  );
  // Reports shared records
  let report = buildReport(
    s,
    { ...defaultReportFilters, type: "cash" },
    stamp().at,
  );
  assert.equal(report.rows.length, 2);
  assert(reportCSV(report).includes("CAJA-CARD"));
  report = buildReport(
    s,
    { ...defaultReportFilters, type: "channels" },
    stamp().at,
  );
  assert.equal(report.rows.length, 3);
  assert.equal(
    buildReport(
      s,
      { ...defaultReportFilters, type: "channels", channel: "pickup" },
      stamp().at,
    ).rows.length,
    1,
  );
  assert.equal(
    buildReport(s, { ...defaultReportFilters, type: "movements" }, stamp().at)
      .rows.length,
    3,
  );
  assert.equal(
    buildReport(
      s,
      { ...defaultReportFilters, type: "top" },
      stamp().at,
    ).rows.reduce((n, r) => n + Number(r[2]), 0),
    4,
  );
  passed.push(
    "Reportes y CSV: caja/pedido/canales, tres salidas y cuatro unidades sin doble conteo; filtro de recojo.",
  );
  // Migration real v8 fixture from backup generated by old schema with edited product/session/cart.
  const old = v8Schema.parse({
    ...initialState,
    users: initialState.users.filter((u) => u.role !== "cashier"),
    sessionUserId: client.id,
    cart: { "ROS-003": 2 },
    inventory: {
      ...initialState.inventory,
      "ROS-003": { stock: 17, priceCents: 543 },
    },
  });
  let raw = JSON.stringify({ version: 8, data: old });
  const storage = {
    getItem: () => raw,
    setItem: (_k, v) => {
      raw = v;
    },
  };
  const migrated = readRositaState(storage);
  assert.equal(migrated.status, "migrated");
  assert.deepEqual(migrated.data.inventory, old.inventory);
  assert.deepEqual(migrated.data.cart, old.cart);
  assert.deepEqual(migrated.data.orders, old.orders);
  assert.equal(
    migrated.data.users.filter((u) => u.role === "cashier").length,
    1,
  );
  assert(writeRositaState(migrated.data, storage).ok);
  assert.equal(readRositaState(storage).status, "loaded");
  assert.equal(
    readRositaState(storage).data.users.filter((u) => u.role === "cashier")
      .length,
    1,
  );
  assert(writeRositaState(s, storage).ok);
  const reloaded = readRositaState(storage);
  assert.equal(reloaded.status, "loaded");
  assert.deepEqual(reloaded.data.sales, s.sales);
  assert.deepEqual(reloaded.data.orders, s.orders);
  raw = "{bad";
  assert.equal(readRositaState(storage).status, "invalid");
  assert.equal(raw, "{bad");
  raw = JSON.stringify({ version: 999, data: {} });
  assert.equal(readRositaState(storage).status, "future");
  assert.equal(
    readRositaState({
      getItem() {
        throw new Error("blocked");
      },
    }).status,
    "unavailable",
  );
  passed.push(
    "Migración v8→v9 conserva precios/stock/carrito/cuentas; no duplica agente. Roundtrip ventas, turnos, pedidos; corrupción/futuro/bloqueo manejados.",
  );
  // Default CI can use the recorded road geometry without sending precise coordinates.
  if (offline) globalThis.fetch = async () => { throw new Error("offline verification"); };
  const route = await calculateRoute(
    storeOrigin,
    utpAccess,
    new AbortController().signal,
  );
  globalThis.fetch = networkFetch;
  assert(route.coordinates.length > 100);
  assert(
    distanceBetween({ lat: route.end[1], lng: route.end[0] }, utpAccess) < 100,
  );
  assert(route.distance > 10000);
  for (const t of [0, 0.1, 0.25, 0.5, 0.9, 1]) {
    const pos = pointOnRoute(route, t);
    assert(Number.isFinite(pos.bearing));
    assert(pos.travelled.length >= 1);
  }
  assert.deepEqual(pointOnRoute(route, 1).point, route.coordinates.at(-1));
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  const fallback = await calculateRoute(
    storeOrigin,
    utpAccess,
    new AbortController().signal,
  );
  assert(fallback.fallback);
  await assert.rejects(
    calculateRoute(
      storeOrigin,
      { ...utpAccess, lat: -16.4, lng: -71.55 },
      new AbortController().signal,
    ),
  );
  globalThis.fetch = realFetch;
  s.sessionUserId = client.id;
  s.cart = { "ROS-003": 1 };
  s.checkout = {
    ...emptyCheckout(),
    token: "delivery-token",
    step: 2,
    delivery: {
      mode: "delivery",
      recipient: "Cliente Prueba",
      phone: "999123456",
      address: "Av. Tacna y Arica 160, Arequipa",
      zone: "demo-b",
      reference: "Campus de prueba",
      origin: { ...storeOrigin },
      point: { ...utpAccess },
      pointConfirmed: true,
      route,
    },
    payment: { method: "yape-demo", cashAmount: "" },
  };
  quote = prepareQuote(s);
  assert(quote.quote, quote.error);
  assert.equal(quote.quote.shippingCents, 650);
  s.checkout.quote = quote.quote;
  s = r(s, {
    type: "order/confirm",
    id: "ROS-DELIVERY",
    token: "delivery-token",
    createdAt: stamp().at,
  });
  assert.equal(s.orders.length, 2);
  const snap = structuredClone(s.orders[0]);
  s = r(s, { type: "tracking/save", id: snap.id, progress: 0.4, speed: 4 });
  assert.equal(s.tracking[snap.id].progress, 0.4);
  s.sessionUserId = admin.id;
  s = r(s, {
    type: "store/location",
    point: { ...storeOrigin, lat: storeOrigin.lat + 0.0001 },
    ...stamp(),
  });
  assert.deepEqual(s.orders[0], snap);
  valid(s);
  assert(writeRositaState(s, storage).ok);
  assert.equal(readRositaState(storage).data.tracking[snap.id].progress, 0.4);
  passed.push(
    `${offline ? "Geometría vial Rosita→UTP de respaldo verificado, sin red" : "Ruta vial real Rosita→UTP"}, interpolación y fallback exclusivo; delivery con tarifa 6.50, snapshot inmutable, progreso persistido.`,
  );
  await fs.mkdir(root + "/docs/operations-verification", { recursive: true });
  await fs.writeFile(
    root + "/docs/operations-verification/logic.json",
    JSON.stringify(
      {
        date: "2026-10-30",
        passed,
        route: {
          coordinates: route.coordinates.length,
          distance: route.distance,
          duration: route.duration,
          fallback: route.fallback || false,
        },
      },
      null,
      2,
    ),
  );
  await fs.writeFile(
    "/tmp/rosita-ops-fixture.json",
    JSON.stringify({ version: 9, data: s }),
  );
  console.log(passed.join("\n"));
} finally {
  globalThis.fetch = networkFetch;
  await server.close();
}
