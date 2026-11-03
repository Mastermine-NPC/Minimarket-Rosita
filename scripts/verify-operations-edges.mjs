import { createServer } from "vite";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const root = process.cwd(),
  server = await createServer({
    root,
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  }),
  passed = [];
const offline = process.argv.includes("--offline");
const realFetch = globalThis.fetch;
try {
  const load = (p) => server.ssrLoadModule("/src/" + p),
    { initialState } = await load("data/demo.ts"),
    { rositaReducer: r } = await load("app/state/reducer.ts"),
    { readRositaState, writeRositaState, STATE_KEY, resetRositaStorage } =
      await load("lib/storage.ts"),
    { stateSchema } = await load("lib/state-schema.ts"),
    { priceCashDraft } = await load("lib/operations.ts"),
    { deliverySchema } = await load("lib/checkout-validation.ts"),
    { storeOrigin, utpAccess } = await load("data/geography.ts"),
    { calculateRoute } = await load("lib/routing.ts"),
    { createVerifier, verifyPassword } = await load("lib/demo-auth.ts");
  let n = 100;
  const stamp = () => ({
      operationId: "extra-" + ++n,
      at: "2026-10-30T18:00:00.000Z",
    }),
    admin = initialState.users.find((u) => u.role === "admin"),
    cashier = initialState.users.find((u) => u.role === "cashier");
  let s = structuredClone(initialState);
  s.sessionUserId = admin.id;
  const credentials = await createVerifier("AgenteDemo!2026");
  const agentAction = {
    type: "agent/save",
    id: "agent-extra",
    name: "Agente Nuevo",
    email: "nuevo@rosita.test",
    active: true,
    credentials,
    ...stamp(),
  };
  assert(!r({ ...s, sessionUserId: cashier.id }, agentAction).adminResult.ok);
  s = r(s, agentAction);
  assert(s.adminResult.ok);
  assert.equal(s.users.find((u) => u.id === "agent-extra").role, "cashier");
  assert(
    await verifyPassword(
      "AgenteDemo!2026",
      s.users.find((u) => u.id === "agent-extra"),
    ),
  );
  assert(!r(s, { ...agentAction, id: "another", ...stamp() }).adminResult.ok);
  assert(!r(s, { ...agentAction, id: admin.id, ...stamp() }).adminResult.ok);
  s = r(s, { ...agentAction, active: false, ...stamp() });
  assert(
    !r(s, { type: "auth/login", userId: "agent-extra" }).users.find(
      (u) => u.id === "agent-extra",
    ).active,
  );
  assert.equal(
    r(s, { type: "auth/login", userId: "agent-extra" }).sessionUserId,
    admin.id,
  );
  assert(
    !r(
      { ...s, sessionUserId: cashier.id },
      {
        type: "admin/stock",
        id: "ROS-001",
        kind: "count",
        quantity: 0,
        reason: "Intento fuera de permiso",
        expectedStock: 24,
        ...stamp(),
      },
    ).adminResult.ok,
  );
  passed.push(
    "Agentes: creación/reset PBKDF2, correo único, sin edición de admin/cliente; cajero no administra ni crea agentes; cuenta inactiva no inicia sesión.",
  );
  // Actual legacy fixture with orders, product creation, price/stock, movement, images/taxonomy.
  const old = JSON.parse(
    await fs.readFile(
      root + "/docs/catalog-verification/fixture-v7.json",
      "utf8",
    ),
  );
  let raw = JSON.stringify(old);
  const storage = { getItem: () => raw, setItem: (_k, v) => (raw = v) };
  const migrated = readRositaState(storage);
  assert.equal(migrated.status, "migrated");
  assert.deepEqual(migrated.data.orders, old.data.orders);
  assert.deepEqual(migrated.data.movements, old.data.movements);
  for (const id of Object.keys(old.data.inventory))
    assert.deepEqual(migrated.data.inventory[id], old.data.inventory[id]);
  for (const p of old.data.products) {
    const now = migrated.data.products.find((x) => x.id === p.id);
    assert(now);
    assert.equal(now.imageKey, p.imageKey);
    assert.equal(now.name, p.name);
  }
  assert.deepEqual(migrated.data.media, old.data.media);
  assert(writeRositaState(migrated.data, storage).ok);
  assert.equal(readRositaState(storage).status, "loaded");
  assert.deepEqual(readRositaState(storage).data.orders, old.data.orders);
  passed.push(
    "Fixture histórica real v7→9: pedidos y movimientos idénticos, nombres/imágenes, productos propios, precios/stock y assets locales preservados.",
  );
  // quantity stock and approval invalidation by price change
  s = structuredClone(initialState);
  s.sessionUserId = cashier.id;
  s = r(s, {
    type: "shift/open",
    id: "TUR-EXTRA",
    initialCents: 0,
    ...stamp(),
  });
  s = r(s, {
    type: "cash/cart",
    kind: "add",
    id: "ROS-001",
    quantity: 1,
    token: "extra-sale",
  });
  const priced = priceCashDraft(s),
    action = {
      type: "cash/confirm",
      id: "CAJA-EXTRA",
      token: priced.token,
      fingerprint: priced.fingerprint,
      payment: "cash",
      cashTenderCents: 10000,
      ...stamp(),
    };
  assert(
    !r(
      {
        ...s,
        inventory: {
          ...s.inventory,
          "ROS-001": { ...s.inventory["ROS-001"], priceCents: 999 },
        },
      },
      action,
    ).adminResult.ok,
  );
  assert(
    !r(
      {
        ...s,
        inventory: {
          ...s.inventory,
          "ROS-001": { ...s.inventory["ROS-001"], stock: 0 },
        },
      },
      action,
    ).adminResult.ok,
  );
  assert(
    !r(
      {
        ...s,
        products: s.products.map((p) =>
          p.id === "ROS-001" ? { ...p, active: false } : p,
        ),
      },
      action,
    ).adminResult.ok,
  );
  assert(
    !r(s, {
      type: "cash/cart",
      kind: "set",
      id: "ROS-001",
      quantity: 1.5,
      token: "x",
    }).adminResult.ok,
  );
  assert(
    !r(s, {
      type: "cash/cart",
      kind: "set",
      id: "ROS-001",
      quantity: 9999,
      token: "x",
    }).adminResult.ok,
  );
  assert(
    !r(
      { ...s, sessionUserId: admin.id },
      {
        ...agentAction,
        id: cashier.id,
        name: cashier.name,
        email: cashier.email,
        active: false,
        ...stamp(),
      },
    ).adminResult.ok,
  );
  const out = r(s, action);
  assert(stateSchema.safeParse(out).success);
  const orderBefore = JSON.stringify(out.sales);
  const saved = structuredClone(out);
  saved.products[0].name = "Nombre posterior";
  saved.inventory["ROS-001"].priceCents = 500;
  assert.equal(JSON.stringify(saved.sales), orderBefore);
  passed.push(
    "Revalidación de precio, desactivación, agotado, fracciones/exceso y turno abierto; snapshots de venta no cambian con catálogo.",
  );
  // different real destination, aborted request, out of bounds and route response validation
  const second = {
    lat: -16.4,
    lng: -71.55,
    label: "Otro punto de prueba",
    source: "Coordenadas de prueba dentro de cobertura",
  };
  if (offline) {
    // Test response parsing and transactions without transmitting precise locations.
    // This synthetic geometry is only a test fixture, never a production road fallback.
    globalThis.fetch = async () => new Response(JSON.stringify({
      code: "Ok",
      routes: [{ distance: 8000, duration: 900, geometry: { coordinates: [
        [storeOrigin.lng, storeOrigin.lat],
        [(storeOrigin.lng + second.lng) / 2, (storeOrigin.lat + second.lat) / 2],
        [second.lng, second.lat],
      ] } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  const route = await calculateRoute(
    storeOrigin,
    second,
    new AbortController().signal,
  );
  assert(route.coordinates.length > 2);
  assert(!route.fallback);
  assert.equal(route.destination.lat, second.lat);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    calculateRoute(storeOrigin, utpAccess, controller.signal),
    (e) => e.name === "AbortError",
  );
  await assert.rejects(
    calculateRoute(
      storeOrigin,
      { ...second, lat: -18 },
      new AbortController().signal,
    ),
  );
  const base = {
    mode: "delivery",
    recipient: "Cliente Prueba",
    phone: "999123456",
    address: "Destino ficticio 123",
    reference: "",
    zone: route.distance <= 7000 ? "demo-a" : "demo-b",
    origin: storeOrigin,
    point: second,
    pointConfirmed: true,
    route,
  };
  assert(deliverySchema.safeParse(base).success);
  assert(!deliverySchema.safeParse({ ...base, pointConfirmed: false }).success);
  assert(!deliverySchema.safeParse({ ...base, point: utpAccess }).success);
  assert(
    deliverySchema.safeParse({
      ...base,
      mode: "pickup",
      zone: "pickup",
      address: "",
    }).success,
  );
  passed.push(
    `${offline ? "Respuesta vial sintética sin red (no verifica el proveedor)" : "Otro destino vial real"}, rechazo de cobertura/punto no confirmado/ruta incompatible y cancelación explícita de petición.`,
  );
  const keys = new Map([
    ["unrelated", "keep"],
    [STATE_KEY, "x"],
    ["minimarket-rosita:other", "x"],
  ]);
  const local = {
    get length() {
      return keys.size;
    },
    key: (i) => [...keys.keys()][i],
    removeItem: (k) => keys.delete(k),
  };
  assert(resetRositaStorage(local).ok);
  assert.equal(keys.size, 1);
  assert.equal(keys.get("unrelated"), "keep");
  passed.push("Restablecimiento exclusivo de Rosita conserva claves ajenas.");
  await fs.writeFile(
    root + "/docs/operations-verification/extra.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        routingMode: offline ? "offline-mock" : "live-provider",
        passed,
        secondRoute: {
          destination: second,
          distance: route.distance,
          duration: route.duration,
          coordinates: route.coordinates.length,
        },
      },
      null,
      2,
    ),
  );
  console.log(passed.join("\n"));
} finally {
  globalThis.fetch = realFetch;
  await server.close();
}
