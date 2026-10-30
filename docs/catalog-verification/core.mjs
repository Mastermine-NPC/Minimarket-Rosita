import { createServer } from "vite";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  }),
  passed = [];
try {
  const { initialState } = await server.ssrLoadModule("/src/data/demo.ts"),
    { stateSchema } = await server.ssrLoadModule("/src/lib/state-schema.ts"),
    { catalogAdditions } = await server.ssrLoadModule(
      "/src/data/catalog-additions.ts",
    ),
    { integrateCatalog, articleIdentity } = await server.ssrLoadModule(
      "/src/lib/catalog-update.ts",
    ),
    { products: legacy } = await server.ssrLoadModule("/src/data/catalog.ts"),
    { readRositaState, writeRositaState } = await server.ssrLoadModule(
      "/src/lib/storage.ts",
    ),
    { adminOperation } = await server.ssrLoadModule(
      "/src/lib/admin-operations.ts",
    ),
    { currentProducts } = await server.ssrLoadModule(
      "/src/lib/catalog-state.ts",
    ),
    { filterProducts } = await server.ssrLoadModule(
      "/src/features/catalogo/catalog-logic.ts",
    );
  assert(stateSchema.safeParse(initialState).success);
  assert.equal(initialState.products.length, 63);
  assert.equal(initialState.categories.length, 6);
  assert.equal(
    new Set(initialState.products.map((p) => p.code || p.id)).size,
    63,
  );
  assert.equal(
    new Set(
      initialState.products.filter((p) => !p.archived).map(articleIdentity),
    ).size,
    63,
  );
  for (const item of catalogAdditions) {
    const p = initialState.products.find((p) => p.code === item.code);
    assert(p);
    assert.equal(p.name, item.name);
    assert.equal(p.brand, item.brand);
    assert.equal(p.category, item.category);
    assert.equal(initialState.inventory[p.id].priceCents, item.priceCents);
    assert.equal(initialState.inventory[p.id].stock, item.stock);
    assert(item.stock >= 10);
    assert(p.imageKey === "catalog-" + item.code);
    assert.equal(
      filterProducts(
        currentProducts(initialState),
        new URLSearchParams({ q: item.code }),
      ).length,
      1,
    );
    assert.equal(
      filterProducts(
        currentProducts(initialState),
        new URLSearchParams({ q: item.code }),
        item.category,
      ).length,
      1,
    );
  }
  for (const old of legacy) {
    const p = initialState.products.find((p) => p.id === old.id);
    assert.equal(p.name, old.name);
    assert.equal(initialState.inventory[p.id].stock, old.stock);
    assert.equal(
      initialState.inventory[p.id].priceCents,
      Math.round(old.price * 100),
    );
  }
  assert.equal(
    initialState.products.find((p) => p.id === "ROS-024").code,
    "ROS-063",
  );
  assert.equal(
    initialState.products.find((p) => p.code === "ROS-024").id,
    "ROS-024-IMPORT",
  );
  passed.push(
    "39 artículos exactos en nombres/marcas/códigos/precios/stock≥10; 24 conservados sin cambiar precio/stock; 63 códigos e identidades únicos, seis categorías y búsqueda/filtro combinados.",
  );
  const fixture = JSON.parse(
    await fs.readFile(
      "docs/subcategory-verification/migration-fixture-v4.json",
      "utf8",
    ),
  );
  let raw = JSON.stringify(fixture);
  const memory = { getItem: () => raw, setItem: (k, v) => (raw = v) };
  const v4 = readRositaState(memory);
  assert.equal(v4.status, "migrated");
  for (const key of ["users", "sessionUserId", "orders", "movements", "cart"]) {
    if (key !== "users") assert.deepEqual(v4.data[key], fixture.data[key]);
  }
  for (const [id, item] of Object.entries(fixture.data.inventory))
    assert.deepEqual(v4.data.inventory[id], item);
  assert(writeRositaState(v4.data, memory).ok);
  assert.equal(JSON.parse(raw).version, 8);
  assert.equal(
    readRositaState(memory).data.products.length,
    v4.data.products.length,
  );
  const v7 = structuredClone(initialState);
  v7.products = v7.products
    .filter((p) => legacy.some((l) => l.id === p.id))
    .map((p) => {
      delete p.code;
      delete p.archived;
      return p;
    });
  v7.inventory = Object.fromEntries(
    Object.entries(v7.inventory).filter(([id]) =>
      legacy.some((l) => l.id === id),
    ),
  );
  delete v7.catalogRevision;
  v7.inventory["ROS-001"] = { priceCents: 987, stock: 17 };
  v7.cart = { "ROS-024": 2 };
  v7.media = {};
  v7.products.push({
    ...v7.products[0],
    id: "ROS-CUSTOM",
    name: "Artículo propio de usuario",
    imageKey: "none",
  });
  v7.inventory["ROS-CUSTOM"] = { priceCents: 12345, stock: 4 };
  const assetId = crypto.randomUUID();
  v7.media[assetId] = {
    id: assetId,
    width: 100,
    height: 100,
    bytes: 150,
    mime: "image/webp",
    createdAt: new Date().toISOString(),
  };
  v7.products.find((p) => p.id === "ROS-CUSTOM").imageKey = "upload:" + assetId;
  const paste = v7.products.find((p) => p.id === "ROS-024"),
    c = v7.users.find((u) => u.role === "customer"),
    price = v7.inventory[paste.id].priceCents;
  v7.orders = [
    {
      id: "ROS-HISTORICO-PASTA",
      requestId: "historia-pasta",
      userId: c.id,
      createdAt: new Date().toISOString(),
      lines: [
        {
          productId: paste.id,
          name: paste.name,
          presentation: paste.presentation,
          quantity: 1,
          unitPriceCents: price,
          lineTotalCents: price,
        },
      ],
      subtotalCents: price,
      shippingCents: 400,
      totalCents: price + 400,
      zoneLabel: "Zona de prueba",
      estimate: "Demostración",
      cashTenderCents: null,
      delivery: {
        recipient: "Cliente previo",
        phone: "999123456",
        address: "Dirección anterior 123",
        zone: "demo-a",
        reference: "",
      },
      payment: "yape-demo",
      status: 0,
      statusHistory: [],
      legacyHistory: true,
      customerName: null,
      customerEmail: null,
    },
  ];
  v7.sessionUserId = c.id;
  await fs.writeFile(
    "docs/catalog-verification/fixture-v7.json",
    JSON.stringify({ version: 7, data: v7 }, null, 2),
  );
  raw = JSON.stringify({ version: 7, data: v7 });
  const migrated = readRositaState(memory);
  assert.equal(migrated.status, "migrated");
  for (const k of [
    "orders",
    "users",
    "movements",
    "cart",
    "sessionUserId",
    "categories",
    "media",
  ])
    assert.deepEqual(migrated.data[k], v7[k]);
  for (const [id, inv] of Object.entries(v7.inventory))
    assert.deepEqual(migrated.data.inventory[id], inv);
  assert.equal(
    migrated.data.products.find((p) => p.id === "ROS-CUSTOM").name,
    "Artículo propio de usuario",
  );
  assert.equal(migrated.data.products.length, 64);
  assert(writeRositaState(migrated.data, memory).ok);
  assert.equal(readRositaState(memory).data.products.length, 64);
  passed.push(
    "Migraciones v4 y v7→v8 preservan catálogo propio, stock/precios editados, carrito con ID heredado, cuentas/sesión y copias históricas; recargar no repite importación.",
  );
  const v3 = {
    demoQuantity: 2,
    cart: { "ROS-024": 2 },
    users: [
      structuredClone(initialState.users.find((u) => u.role === "customer")),
    ],
    sessionUserId: initialState.users.find((u) => u.role === "customer").id,
    inventory: Object.fromEntries(
      legacy.map((p) => [
        p.id,
        { stock: p.stock, priceCents: Math.round(p.price * 100) },
      ]),
    ),
    orders: [],
    checkout: structuredClone(initialState.checkout),
    authError: "",
  };
  raw = JSON.stringify({ version: 3, data: v3 });
  const m3 = readRositaState(memory);
  assert.equal(m3.status, "migrated");
  assert.equal(m3.data.products.length, 63);
  for (const [id, inv] of Object.entries(v3.inventory))
    assert.deepEqual(m3.data.inventory[id], inv);
  assert.deepEqual(m3.data.cart, v3.cart);
  assert.equal(m3.data.sessionUserId, v3.sessionUserId);
  for (const [version, data] of [
    [1, { demoQuantity: 2 }],
    [2, { demoQuantity: 2, cart: { "ROS-001": 1 } }],
  ]) {
    raw = JSON.stringify({ version, data });
    const m = readRositaState(memory);
    assert.equal(m.status, "migrated");
    assert.equal(m.data.products.length, 63);
    assert.equal(m.data.demoQuantity, 2);
  }
  passed.push(
    "Ruta heredada v1/v2/v3 preserva cantidades y registros válidos y añade las39 referencias con inventario completo; metadata de subida se conserva al migrar v7.",
  );
  const duplicate = {
    ...v7,
    products: [...v7.products, { ...v7.products[0], id: "ROS-DUP" }],
    inventory: { ...v7.inventory, "ROS-DUP": { ...v7.inventory["ROS-001"] } },
    catalogRevision: undefined,
  };
  const merged = integrateCatalog(duplicate);
  assert(merged.products.find((p) => p.id === "ROS-DUP").archived);
  assert.equal(merged.inventory["ROS-DUP"].stock, 17);
  assert.equal(integrateCatalog(merged), merged);
  const same = {
    ...v7,
    products: [
      ...v7.products,
      {
        ...initialState.products.find((p) => p.code === "ROS-052"),
        id: "ROS-OWN-COLOR",
        code: undefined,
      },
    ],
    inventory: {
      ...v7.inventory,
      "ROS-OWN-COLOR": { stock: 7, priceCents: 999 },
    },
    catalogRevision: undefined,
  };
  const matched = integrateCatalog(same);
  assert.equal(
    matched.products.filter((p) => p.name === "Caja de colores").length,
    1,
  );
  assert.equal(
    matched.products.find((p) => p.id === "ROS-OWN-COLOR").code,
    "ROS-052",
  );
  assert.deepEqual(matched.inventory["ROS-OWN-COLOR"], {
    stock: 7,
    priceCents: 999,
  });
  passed.push(
    "Coincidencia exacta con otro ID conserva un único artículo y su stock/precio válido; duplicado verificable queda retirado recuperablemente sin sumar existencias ni borrar referencias.",
  );
  let state = {
    ...structuredClone(initialState),
    sessionUserId: initialState.users.find((u) => u.role === "admin").id,
  };
  state = adminOperation(state, {
    type: "admin/product-archive",
    id: "ROS-052",
    archived: true,
    operationId: "archive-test",
    at: new Date().toISOString(),
  });
  assert(state.adminResult.ok);
  assert(!currentProducts(state).find((p) => p.id === "ROS-052").active);
  assert(writeRositaState(state, memory).ok);
  const restored = readRositaState(memory);
  assert.equal(restored.data.products.length, 63);
  assert(restored.data.products.find((p) => p.id === "ROS-052").archived);
  assert.equal(restored.data.inventory["ROS-052"].stock, 20);
  const denied = adminOperation(
    {
      ...state,
      sessionUserId: initialState.users.find((u) => u.role === "customer").id,
    },
    {
      type: "admin/product-archive",
      id: "ROS-053",
      archived: true,
      operationId: "deny",
      at: new Date().toISOString(),
    },
  );
  assert(!denied.adminResult.ok);
  passed.push(
    "Eliminación recuperable persiste, conserva inventario y no reaparece por importación; cliente no puede ejecutarla.",
  );
  await fs.writeFile(
    "docs/catalog-verification/core.json",
    JSON.stringify(
      {
        passed,
        errors: [],
        initialProducts: 63,
        added: 39,
        preserved: 24,
        duplicateInitial: 0,
        categories: 6,
      },
      null,
      2,
    ),
  );
  console.log(passed);
} finally {
  await server.close();
}
