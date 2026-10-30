const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch(),
  p = await b.newPage();
await p.goto("http://127.0.0.1:5173");
await p.waitForLoadState("networkidle");
const result = await p.evaluate(async () => {
  const { initialState, emptyCheckout } = await import("/src/data/demo.ts");
  const { rositaReducer: r } = await import("/src/app/state/reducer.ts");
  const { stateSchema } = await import("/src/lib/state-schema.ts");
  const { prepareQuote } = await import("/src/lib/order-transaction.ts");
  const { readRositaState, writeRositaState } =
    await import("/src/lib/storage.ts");
  const { dashboardMetrics } = await import("/src/lib/admin-selectors.ts");
  const passes = [];
  const check = (c, m) => {
      if (!c) throw Error(m);
      passes.push(m);
    },
    at = new Date().toISOString();
  check(
    stateSchema.safeParse(initialState).success,
    "Estado inicial v4 válido con un administrador y 24 productos",
  );
  let s = structuredClone(initialState);
  const admin = s.users[0];
  const client = {
    id: "client-test",
    role: "customer",
    name: "Cliente Prueba",
    email: "cliente@prueba.test",
    salt: "ab".repeat(16),
    verifier: "cd".repeat(32),
    iterations: 210000,
    createdAt: at,
  };
  s = r(s, { type: "auth/register", user: { ...client, role: "admin" } });
  check(
    s.users.find((u) => u.id === client.id).role === "customer" &&
      s.users.filter((u) => u.role === "admin").length === 1,
    "Registro público ignora un perfil administrador inyectado",
  );
  const input = {
    id: "ROS-TEST",
    name: "Producto de prueba",
    brand: "Genérico",
    category: "consumibles",
    description: "Descripción ficticia de producto nuevo.",
    presentation: "Unidad de prueba",
    imageKey: "illustration-cookies",
    active: true,
    lowStockThreshold: 3,
    priceCents: 3333,
    initialStock: 5,
  };
  const create = {
    type: "admin/product-save",
    operationId: "create-test",
    at,
    input,
    editing: false,
    expectedUpdatedAt: null,
  };
  let denied = r(s, create);
  check(
    denied.products.length === 24 && !denied.adminResult.ok,
    "Cliente no crea productos desde la lógica",
  );
  check(
    !r(
      { ...s, sessionUserId: null },
      {
        type: "admin/stock",
        id: "ROS-001",
        kind: "entry",
        quantity: 5,
        reason: "Reposición de prueba",
        expectedStock: 24,
        operationId: "denied",
        at,
      },
    ).adminResult.ok,
    "Sin sesión no se ajusta inventario",
  );
  check(
    !r(s, {
      type: "admin/stock",
      id: "ROS-001",
      kind: "entry",
      quantity: 1,
      reason: "Prueba de permiso",
      expectedStock: 24,
      operationId: "customer-stock",
      at,
    }).adminResult.ok,
    "Cliente no ajusta stock aunque invoque directamente la acción",
  );
  check(
    !r(s, {
      type: "admin/product-active",
      operationId: "customer-active",
      at,
      id: "ROS-001",
      active: false,
      expectedUpdatedAt: null,
    }).adminResult.ok,
    "Cliente no desactiva productos desde la lógica",
  );
  check(
    r(s, { type: "app/reset", at }).adminResult.error.includes(
      "administrador",
    ) &&
      r(
        { ...s, sessionUserId: null },
        { type: "app/reset", at },
      ).adminResult.error.includes("administrador"),
    "Reset global denegado a cliente y anónimo",
  );
  s = { ...s, sessionUserId: admin.id };
  s = r(s, create);
  check(
    s.products.length === 25 &&
      s.inventory["ROS-TEST"].stock === 5 &&
      s.movements.length === 1,
    "Crear producto comparte datos y registra stock inicial actual",
  );
  check(
    r(s, create) === s,
    "Reintento con el mismo ID de operación no duplica producto ni movimiento",
  );
  check(
    !r(s, { ...create, operationId: "duplicate-code" }).adminResult.ok,
    "Identificador duplicado rechazado",
  );
  check(
    !r(s, {
      ...create,
      operationId: "invalid-price",
      input: { ...input, id: "ROS-INVALID", priceCents: -1 },
    }).adminResult.ok,
    "Precio negativo rechazado por la lógica",
  );
  s = r(s, {
    type: "admin/product-save",
    operationId: "edit-test",
    at,
    input: {
      ...input,
      name: "Producto corregido",
      priceCents: 3500,
      initialStock: 999,
    },
    editing: true,
    expectedUpdatedAt: at,
  });
  check(
    s.inventory["ROS-TEST"].priceCents === 3500 &&
      s.inventory["ROS-TEST"].stock === 5,
    "Editar precio no cambia stock aunque se inyecte stock inicial",
  );
  s = r(s, {
    type: "admin/stock",
    id: "ROS-TEST",
    kind: "entry",
    quantity: 3,
    reason: "Reposición de prueba",
    expectedStock: 5,
    operationId: "entry",
    at,
  });
  check(
    s.inventory["ROS-TEST"].stock === 8 && s.movements[0].delta === 3,
    "Entrada registra antes/después y diferencia",
  );
  check(
    !r(s, {
      type: "admin/stock",
      id: "ROS-TEST",
      kind: "manual-out",
      quantity: 20,
      reason: "Salida de prueba",
      expectedStock: 8,
      operationId: "invalid-out",
      at,
    }).adminResult.ok,
    "Salida superior al stock rechazada",
  );
  s = r(s, {
    type: "admin/stock",
    id: "ROS-TEST",
    kind: "manual-out",
    quantity: 2,
    reason: "Salida de prueba",
    expectedStock: 8,
    operationId: "out",
    at,
  });
  s = r(s, {
    type: "admin/stock",
    id: "ROS-TEST",
    kind: "count",
    quantity: 1,
    reason: "Conteo de prueba",
    expectedStock: 6,
    operationId: "count",
    at,
  });
  check(
    s.inventory["ROS-TEST"].stock === 1 &&
      s.movements[0].delta === -5 &&
      s.movements[0].before === 6,
    "Conteo expresa stock final y calcula diferencia",
  );
  check(
    !r(s, {
      type: "admin/stock",
      id: "ROS-TEST",
      kind: "entry",
      quantity: 1.2,
      reason: "Conteo",
      expectedStock: 1,
      operationId: "fraction",
      at,
    }).adminResult.ok &&
      !r(s, {
        type: "admin/stock",
        id: "ROS-TEST",
        kind: "entry",
        quantity: 1,
        reason: "",
        expectedStock: 1,
        operationId: "reason",
        at,
      }).adminResult.ok,
    "Cantidad fraccionaria y motivo vacío rechazados",
  );
  check(
    r(s, {
      type: "admin/stock",
      id: "ROS-TEST",
      kind: "count",
      quantity: 1,
      reason: "Conteo de prueba",
      expectedStock: 6,
      operationId: "count",
      at,
    }) === s,
    "Ajuste duplicado no vuelve a ejecutarse",
  );
  let purchase = {
    ...s,
    sessionUserId: client.id,
    cart: { "ROS-001": 2 },
    checkout: {
      ...emptyCheckout(),
      token: "purchase-test",
      step: 2,
      delivery: {
        recipient: "Cliente Prueba",
        phone: "999123456",
        address: "Calle Ficticia 123",
        zone: "demo-a",
        reference: "",
      },
      payment: { method: "cash", cashAmount: "50" },
    },
  };
  purchase.checkout.quote = prepareQuote(purchase).quote;
  let deactivated = r(
    { ...purchase, sessionUserId: admin.id },
    {
      type: "admin/product-active",
      operationId: "deactivate",
      at,
      id: "ROS-001",
      active: false,
      expectedUpdatedAt: null,
    },
  );
  deactivated = { ...deactivated, sessionUserId: client.id };
  check(
    prepareQuote(deactivated).error.includes("desactivados") &&
      deactivated.cart["ROS-001"] === 2,
    "Producto desactivado permanece en carrito y bloquea la compra",
  );
  const priceChanged = r(
    { ...purchase, sessionUserId: admin.id },
    {
      type: "admin/product-save",
      operationId: "price-test",
      at,
      input: {
        ...input,
        ...purchase.products[0],
        priceCents: 555,
        initialStock: 999,
      },
      editing: true,
      expectedUpdatedAt: null,
    },
  );
  const confirm = {
    type: "order/confirm",
    token: "purchase-test",
    id: "ROS-order-test",
    createdAt: at,
  };
  check(
    r({ ...priceChanged, sessionUserId: client.id }, confirm).orders.length ===
      0,
    "Precio editado después de revisión impide confirmación obsoleta",
  );
  let ordered = r(purchase, confirm);
  check(
    ordered.orders.length === 1 &&
      ordered.inventory["ROS-001"].stock === 22 &&
      ordered.movements[0].kind === "order-out" &&
      ordered.movements[0].orderId === confirm.id &&
      ordered.movements[0].delta === -2,
    "Pedido genera una sola salida con actor, origen y relación al pedido",
  );
  check(
    r(ordered, confirm) === ordered,
    "Doble confirmación no duplica pedido ni movimiento",
  );
  const snapshot = JSON.stringify(ordered.orders[0]);
  let edited = r(
    { ...ordered, sessionUserId: admin.id },
    {
      type: "admin/product-save",
      operationId: "historic-edit",
      at,
      input: {
        ...input,
        ...ordered.products[0],
        name: "Nombre actual nuevo",
        priceCents: 999,
        initialStock: 999,
      },
      editing: true,
      expectedUpdatedAt: null,
    },
  );
  check(
    JSON.stringify(edited.orders[0]) === snapshot,
    "Editar producto no altera nombres, precios ni dirección histórica",
  );
  edited = r(edited, {
    type: "order/advance",
    id: confirm.id,
    operationId: "advance-admin",
    at,
    expectedStatus: 0,
  });
  check(
    edited.orders[0].status === 1 &&
      edited.orders[0].statusHistory.at(-1).origin === "admin-demo",
    "Administrador avanza exactamente una etapa con fecha/origen",
  );
  const twice = r(edited, {
    type: "order/advance",
    id: confirm.id,
    operationId: "advance-different",
    at,
    expectedStatus: 0,
  });
  check(
    twice.orders[0].status === 1 && !twice.adminResult.ok,
    "Segundo envío con estado anterior no duplica transición",
  );
  edited = r(
    { ...edited, sessionUserId: client.id },
    {
      type: "order/advance",
      id: confirm.id,
      operationId: "advance-client",
      at,
      expectedStatus: 1,
    },
  );
  check(
    edited.orders[0].status === 2 &&
      edited.orders[0].statusHistory.at(-1).origin === "client-demo" &&
      edited.inventory["ROS-001"].stock === 22,
    "Cliente y administrador usan la misma transición sin nuevo descuento",
  );
  check(
    stateSchema.safeParse(edited).success,
    "Estado con productos editados, pedidos y movimientos cumple esquema v4",
  );
  const clean = r(
    { ...ordered, sessionUserId: admin.id },
    { type: "app/reset", at },
  );
  check(
    clean.products.length === 24 &&
      clean.users.length === 1 &&
      clean.users[0].role === "admin" &&
      clean.orders.length === 0 &&
      clean.movements.length === 0 &&
      clean.inventory["ROS-001"].stock === 24,
    "Reset administrativo restaura catálogo y solo perfil inicial sin historial inventado",
  );
  const m = dashboardMetrics(ordered);
  check(
    m.active === 25 &&
      m.received === 1 &&
      m.pending === 1 &&
      m.totalCents === 1100,
    "Indicadores calculados a partir de operaciones reales de prueba",
  );
  const legacy = {
    demoQuantity: 7,
    cart: { "ROS-004": 2 },
    users: [
      Object.fromEntries(Object.entries(client).filter(([k]) => k !== "role")),
    ],
    sessionUserId: client.id,
    inventory: structuredClone(initialState.inventory),
    orders: [
      Object.fromEntries(
        Object.entries(ordered.orders[0]).filter(
          ([k]) =>
            ![
              "legacyHistory",
              "statusHistory",
              "customerName",
              "customerEmail",
            ].includes(k),
        ),
      ),
    ],
    checkout: emptyCheckout(),
    authError: "",
  };
  legacy.inventory["ROS-001"].stock = 22;
  const map = new Map([
      ["minimarket-rosita:app", JSON.stringify({ version: 3, data: legacy })],
    ]),
    storage = {
      getItem: (k) => map.get(k) || null,
      setItem: (k, v) => map.set(k, v),
    };
  const migrated = readRositaState(storage);
  check(
    migrated.status === "migrated" &&
      migrated.data.demoQuantity === 7 &&
      migrated.data.cart["ROS-004"] === 2 &&
      migrated.data.sessionUserId === client.id &&
      migrated.data.inventory["ROS-001"].stock === 22,
    "Migración v3 conserva contador, carrito, sesión cliente e inventario",
  );
  check(
    migrated.data.orders[0].status === 0 &&
      migrated.data.orders[0].legacyHistory &&
      migrated.data.orders[0].statusHistory.length === 0 &&
      migrated.data.movements.length === 0,
    "Migración no inventa movimientos ni transiciones históricas",
  );
  check(
    writeRositaState(migrated.data, storage).ok &&
      readRositaState(storage).data.users.filter((u) => u.role === "admin")
        .length === 1,
    "Persistencia v4 recarga sin duplicar administrador",
  );
  map.set("minimarket-rosita:app", "{roto");
  check(
    readRositaState(storage).status === "invalid",
    "Corrupción recupera datos iniciales",
  );
  map.set(
    "minimarket-rosita:app",
    JSON.stringify({ version: 99, data: { future: true } }),
  );
  check(
    readRositaState(storage).status === "future",
    "Formato futuro se identifica sin sobrescritura",
  );
  return passes;
});
await fs.mkdir("./docs/admin-verification", { recursive: true });
await fs.writeFile(
  "./docs/admin-verification/logica.json",
  JSON.stringify({ passed: result }, null, 2),
);
console.log(result);
await b.close();
