import { createServer } from "vite";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  }),
  passed = [];
try {
  const { initialState } = await server.ssrLoadModule("/src/data/demo.ts"),
    { stateSchema } = await server.ssrLoadModule("/src/lib/state-schema.ts"),
    { readRositaState, writeRositaState } = await server.ssrLoadModule(
      "/src/lib/storage.ts",
    ),
    { moduleOperation } = await server.ssrLoadModule(
      "/src/lib/module-operations.ts",
    ),
    { adminOperation } = await server.ssrLoadModule(
      "/src/lib/admin-operations.ts",
    ),
    { currentProducts } = await server.ssrLoadModule(
      "/src/lib/catalog-state.ts",
    ),
    { verifyPassword } = await server.ssrLoadModule("/src/lib/demo-auth.ts");
  assert(stateSchema.safeParse(initialState).success);
  const client = initialState.users.find((u) => u.demoAccess);
  assert(await verifyPassword("ClienteDemo!2026", client));
  passed.push(
    "Semilla v6 válida y verificador de acceso ficticio del cliente funcional.",
  );
  let state = {
    ...structuredClone(initialState),
    sessionUserId: initialState.users.find((u) => u.role === "admin").id,
  };
  const at = "2026-10-29T18:00:00.000Z",
    cat = {
      id: "cat-test",
      slug: "grupo-prueba",
      name: "Grupo de prueba",
      description: "Categoría de prueba local.",
      active: true,
      order: 7,
      imageKey: "none",
      category: "",
    };
  state = moduleOperation(state, {
    type: "admin/taxonomy-save",
    kind: "category",
    input: cat,
    editing: false,
    operationId: "c1",
    at,
  });
  assert(state.adminResult.ok);
  const sub = {
    ...cat,
    id: "sub-test",
    slug: "detalle-prueba",
    name: "Detalle de prueba",
    category: cat.id,
  };
  state = moduleOperation(state, {
    type: "admin/taxonomy-save",
    kind: "subcategory",
    input: sub,
    editing: false,
    operationId: "s1",
    at,
  });
  assert(state.adminResult.ok);
  state = adminOperation(state, {
    type: "admin/product-save",
    input: {
      id: "ROS-DYNAMIC",
      name: "Artículo de prueba",
      brand: "Genérico",
      category: cat.id,
      subcategory: sub.id,
      description: "Producto ficticio para comprobar la taxonomía.",
      presentation: "Unidad",
      active: true,
      imageKey: "none",
      priceCents: 35000,
      initialStock: 4,
      lowStockThreshold: 1,
    },
    editing: false,
    expectedUpdatedAt: null,
    operationId: "p1",
    at,
  });
  assert(state.adminResult.ok);
  assert(currentProducts(state).find((p) => p.id === "ROS-DYNAMIC").active);
  state = moduleOperation(state, {
    type: "admin/taxonomy-save",
    kind: "category",
    input: { ...cat, slug: "grupo-renombrado", name: "Grupo renombrado" },
    editing: true,
    operationId: "c2",
    at,
  });
  assert(
    state.categories.find((c) => c.id === cat.id).aliases.includes(cat.slug),
  );
  const noMove = moduleOperation(state, {
    type: "admin/taxonomy-save",
    kind: "subcategory",
    input: { ...sub, category: "consumibles" },
    editing: true,
    operationId: "s2",
    at,
  });
  assert(!noMove.adminResult.ok);
  const off = moduleOperation(state, {
    type: "admin/taxonomy-save",
    kind: "category",
    input: { ...cat, active: false },
    editing: true,
    operationId: "c3",
    at,
  });
  assert(!currentProducts(off).find((p) => p.id === "ROS-DYNAMIC").active);
  assert(stateSchema.safeParse(off).success);
  passed.push(
    "Categoría/subcategoría/producto dinámicos, alias de slug, bloqueo de reasignación con referencias y desactivación comercial coherente.",
  );
  const before = JSON.parse(
    await fs.readFile(
      "docs/subcategory-verification/migration-fixture-v4.json",
      "utf8",
    ),
  );
  let raw = JSON.stringify(before);
  const memory = { getItem: () => raw, setItem: (k, v) => (raw = v) };
  const migrated = readRositaState(memory);
  assert.equal(migrated.status, "migrated");
  for (const key of [
    "orders",
    "movements",
    "cart",
    "inventory",
    "sessionUserId",
  ])
    assert.deepEqual(migrated.data[key], before.data[key]);
  assert(migrated.data.users.some((u) => u.demoAccess));
  assert(writeRositaState(migrated.data, memory).ok);
  assert.equal(JSON.parse(raw).version, 7);
  assert.equal(
    readRositaState(memory).data.users.filter((u) => u.demoAccess).length,
    1,
  );
  passed.push(
    "Migración v4 hasta v6 conserva pedidos, movimientos, carrito, stock y sesión; añade acceso sin duplicarlo al recargar.",
  );
  const denied = moduleOperation(
    { ...state, sessionUserId: client.id },
    {
      type: "admin/taxonomy-save",
      kind: "category",
      input: cat,
      editing: false,
      operationId: "denied",
      at,
    },
  );
  assert(!denied.adminResult.ok);
  const fake = moduleOperation(
    { ...state, sessionUserId: client.id },
    {
      type: "profile/save",
      id: state.users[0].id,
      name: "Intrusión",
      email: "otro@rosita.test",
      operationId: "profile-denied",
      at,
    },
  );
  assert(!fake.adminResult.ok);
  passed.push(
    "Cliente no gestiona taxonomía ni modifica perfiles ajenos desde acciones.",
  );
  const { resetRositaStorage } = await server.ssrLoadModule(
    "/src/lib/storage.ts",
  );
  const { analytics, buildReport, reportCSV, csvCell, defaultReportFilters } =
    await server.ssrLoadModule("/src/lib/analytics.ts");
  const legacy = structuredClone(initialState);
  delete legacy.categories;
  delete legacy.subcategories;
  delete legacy.media;
  legacy.users = legacy.users.filter((u) => !u.demoAccess);
  legacy.users.push({
    ...client,
    demoAccess: undefined,
    id: "cliente-anterior",
    name: "Cliente anterior",
  });
  raw = JSON.stringify({ version: 5, data: legacy });
  const v5 = readRositaState(memory);
  assert.equal(v5.status, "migrated");
  assert.equal(
    v5.data.users.find((u) => u.id === "cliente-anterior").email,
    "cliente@rosita.test",
  );
  assert.equal(
    v5.data.users.find((u) => u.demoAccess).email,
    "cliente+1@rosita.test",
  );
  for (const key of [
    "products",
    "inventory",
    "cart",
    "orders",
    "movements",
    "sessionUserId",
  ])
    assert.deepEqual(v5.data[key], JSON.parse(JSON.stringify(legacy[key])));
  assert(writeRositaState(v5.data, memory).ok);
  assert.equal(
    readRositaState(memory).data.users.filter((u) => u.demoAccess).length,
    1,
  );
  assert.equal(
    readRositaState({ getItem: () => "{malformado" }).status,
    "invalid",
  );
  const future = '{"version":99,"data":{"futuro":true}}';
  raw = future;
  assert.equal(readRositaState(memory).status, "future");
  assert.equal(raw, future);
  assert.equal(
    readRositaState({
      getItem() {
        throw Error("bloqueado");
      },
    }).status,
    "unavailable",
  );
  assert.equal(
    writeRositaState(initialState, {
      setItem() {
        throw Error("cuota");
      },
    }).ok,
    false,
  );
  const keys = new Map([
    ["ajena", "conservar"],
    ["minimarket-rosita:app", "borrar"],
    ["minimarket-rosita:vieja", "borrar"],
  ]);
  assert(
    resetRositaStorage({
      get length() {
        return keys.size;
      },
      key: (i) => [...keys.keys()][i],
      removeItem: (k) => keys.delete(k),
    }).ok,
  );
  assert.deepEqual([...keys], [["ajena", "conservar"]]);
  passed.push(
    "Migración v5→v6 conserva registros y cliente previo con correo coincidente; nuevo acceso usa +1, sin duplicación. Corrupción, formato futuro, lectura bloqueada, cuota y reset exclusivo comprobados en utilidades.",
  );
  const oldOrder = before.data.orders[0];
  assert(oldOrder, "fixture debe contener un pedido");
  const orders = [
    { ...oldOrder, id: "O1", createdAt: "2026-10-28T23:00:00.000Z", status: 0 },
    { ...oldOrder, id: "O2", createdAt: "2026-10-29T23:00:00.000Z", status: 1 },
  ];
  const statsState = { ...initialState, orders };
  const stats = analytics(statsState);
  assert.equal(stats.orders.length, 2);
  assert.equal(stats.days.length, 2);
  assert.equal(stats.totalCents, oldOrder.totalCents * 2);
  assert.equal(
    analytics(statsState, "2026-10-29", "2026-10-29").orders.length,
    1,
  );
  assert.equal(analytics(statsState, "", "", "1").orders.length, 1);
  assert(analytics(statsState, "2026-10-30", "2026-10-01").error);
  assert.equal(
    stats.top.reduce((n, r) => n + r.cents, 0),
    stats.subtotalCents,
  );
  const report = buildReport(
    statsState,
    { ...defaultReportFilters, type: "digital" },
    "2026-10-29T23:00:00Z",
  );
  assert.equal(report.rows.length, 2);
  assert(reportCSV(report).includes("Demostración"));
  assert.equal(csvCell("=SUM(1)"), '"\'=SUM(1)"');
  assert.equal(csvCell('A, "B"'), '"A, ""B"""');
  assert.equal(
    buildReport(statsState, { ...defaultReportFilters, type: "cash" }, "fecha")
      .rows.length,
    0,
  );
  passed.push(
    "Cálculos con fixture explícita de dos fechas: filtros por fecha/estado, top, totales y separación de envío; CSV con comillas, comas y neutralización de fórmula; caja sin registros inventados.",
  );
  await fs.writeFile(
    "docs/polish-verification/legacy-core.json",
    JSON.stringify({ passed, errors: [] }, null, 2),
  );
  console.log(passed);
} finally {
  await server.close();
}
