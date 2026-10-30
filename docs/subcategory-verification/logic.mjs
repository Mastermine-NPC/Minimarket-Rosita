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
    { stateSchema } = await server.ssrLoadModule("/src/lib/state-schema.ts"),
    { readRositaState, writeRositaState, STATE_KEY } =
      await server.ssrLoadModule("/src/lib/storage.ts"),
    { validSubcategory, inferSubcategory } = await server.ssrLoadModule(
      "/src/data/subcategories.ts",
    ),
    { currentProducts } = await server.ssrLoadModule(
      "/src/lib/catalog-state.ts",
    ),
    { filterProducts } = await server.ssrLoadModule(
      "/src/features/catalogo/catalog-logic.ts",
    ),
    { prepareQuote, confirmOrder } = await server.ssrLoadModule(
      "/src/lib/order-transaction.ts",
    ),
    { adminOperation } = await server.ssrLoadModule(
      "/src/lib/admin-operations.ts",
    );
  assert(stateSchema.safeParse(initialState).success);
  assert(
    initialState.products.every((p) =>
      validSubcategory(p.category, p.subcategory),
    ),
  );
  assert(initialState.products.every(p=>inferSubcategory(p)===p.subcategory));
  const counts = Object.fromEntries(
    [...new Set(initialState.products.map((p) => p.subcategory))].map((id) => [
      id,
      initialState.products.filter((p) => p.subcategory === id).length,
    ]),
  );
  assert.equal(Object.keys(counts).length, 17);
  passed.push(
    "24 productos iniciales: 17 subcategorías reales, válidas y con identificadores estables.",
  );
  const all = currentProducts(initialState);
  assert.deepEqual(
    filterProducts(
      all,
      new URLSearchParams("subcategoria=snacks"),
      "consumibles",
    ).map((p) => p.id),
    ["ROS-002", "ROS-003"],
  );
  assert.equal(
    filterProducts(
      all,
      new URLSearchParams(
        "subcategoria=snacks&q=doritos&max=4&marca=Doritos&disponibles=1&orden=precio-desc",
      ),
      "consumibles",
    )[0].id,
    "ROS-003",
  );
  assert.equal(
    filterProducts(
      all,
      new URLSearchParams("subcategoria=almacenamiento&disponibles=1"),
      "tecnologia",
    ).length,
    0,
  );
  assert.equal(
    filterProducts(
      all,
      new URLSearchParams("subcategoria=snacks"),
      "tecnologia",
    ).length,
    4,
  );
  passed.push(
    "Intersección real de búsqueda, marca, precio, stock y subcategoría; inválida incompatible no elimina productos ajenos.",
  );
  const at = "2026-10-29T18:00:00.000Z",
    client = {
      id: "client-migration",
      role: "customer",
      name: "Cliente migración",
      email: "migration@rosita.test",
      salt: "ab".repeat(16),
      verifier: "cd".repeat(32),
      iterations: 210000,
      createdAt: at,
    };
  let s = structuredClone(initialState);
  s.users.push(client);
  s.sessionUserId = client.id;
  s.inventory["ROS-001"] = { stock: 19, priceCents: 567 };
  s.cart = { "ROS-001": 2 };
  s.checkout = {
    ...emptyCheckout(),
    token: "migration-order",
    step: 2,
    delivery: {
      recipient: "Cliente Prueba",
      phone: "987654321",
      address: "Calle de prueba 123",
      zone: "demo-a",
      reference: "",
    },
    payment: { method: "yape-demo", cashAmount: "" },
  };
  s.checkout.quote = prepareQuote(s).quote;
  assert(s.checkout.quote);
  s = confirmOrder(s, {
    token: "migration-order",
    id: "ROS-MIGRATION",
    createdAt: at,
  });
  assert.equal(s.orders.length, 1);
  s.cart = { "ROS-002": 2 };
  s.inventory["ROS-001"].priceCents = 999;
  s.products.push({
    ...s.products[0],
    id: "CUSTOM-OLD",
    name: "Mermelada artesanal",
    origin: "demo",
    createdAt: at,
    updatedAt: at,
  });
  s.inventory["CUSTOM-OLD"] = { stock: 13, priceCents: 456 };
  s.products[0].name = "Arroz de demostración";
  s.products = s.products.map((p) => {
    const n = { ...p };
    delete n.subcategory;
    return n;
  });
  const old = JSON.parse(JSON.stringify(s)),
    encoded = JSON.stringify({ version: 4, data: s });
  let raw = encoded;
  const storage = {
    getItem: (key) => (key === STATE_KEY ? raw : null),
    setItem: (key, value) => {
      assert.equal(key, STATE_KEY);
      raw = value;
    },
  };
  const loaded = readRositaState(storage);
  assert.equal(loaded.status, "migrated");
  assert.equal(loaded.data.products.length, 25);
  assert.equal(
    loaded.data.products[0].subcategory,
    "consumibles-por-clasificar",
  );
  assert.equal(
    loaded.data.products.find((p) => p.id === "CUSTOM-OLD").subcategory,
    "consumibles-por-clasificar",
  );
  for (const key of Object.keys(old).filter((k) => k !== "products"))
    assert.deepEqual(loaded.data[key], old[key], key);
  for (let i = 0; i < old.products.length; i++) {
    const { subcategory, ...same } = loaded.data.products[i];
    assert(subcategory);
    assert.deepEqual(same, old.products[i]);
  }
  assert(writeRositaState(loaded.data, storage).ok);
  assert.equal(JSON.parse(raw).version, 5);
  assert.equal(readRositaState(storage).status, "loaded");
  assert.deepEqual(JSON.parse(raw).data.orders, old.orders);
  assert.equal(JSON.parse(raw).data.orders[0].lines[0].unitPriceCents, 567);
  assert.equal(JSON.parse(raw).data.inventory["ROS-001"].priceCents, 999);
  passed.push(
    "Migración v4→v5 y segunda lectura: conserva 25 productos, precios/stock, carrito, clientes/sesión, pedido histórico, movimientos y operaciones; snapshot 567 céntimos no se recalcula a 999.",
  );
  let admin = { ...loaded.data, sessionUserId: initialState.users[0].id };
  const source = admin.products.find((p) => p.id === "CUSTOM-OLD");
  const input = {
    ...source,
    subcategory: "galletas",
    priceCents: 456,
    initialStock: 13,
  };
  const action = {
    type: "admin/product-save",
    editing: true,
    expectedUpdatedAt: source.updatedAt,
    operationId: "valid-edit",
    at,
    input,
  };
  const edited = adminOperation(admin, action);
  assert(edited.adminResult.ok);
  assert.equal(
    edited.products.find((p) => p.id === "CUSTOM-OLD").subcategory,
    "galletas",
  );
  assert.deepEqual(edited.orders, old.orders);
  const rejected = adminOperation(admin, {
    ...action,
    operationId: "invalid-edit",
    input: { ...input, category: "tecnologia", subcategory: "galletas" },
  });
  assert(!rejected.adminResult.ok);
  assert.deepEqual(rejected.products, admin.products);
  assert.deepEqual(rejected.inventory, admin.inventory);
  assert(
    inferSubcategory({
      category: "tecnologia",
      name: "Artículo sin clasificar",
    }) === "tecnologia-por-clasificar",
  );
  passed.push(
    "Validación/reducer impiden pareja categoría/subcategoría incompatible; edición válida conserva pedidos y precio/stock. Desconocidos no se clasifican por ID.",
  );
  assert.deepEqual(
    filterProducts(
      all,
      new URLSearchParams(
        "subcategoria=herramientas-manuales&orden=precio-desc",
      ),
      "ferreteria",
    ).map((p) => p.id),
    ["ROS-005", "ROS-004", "ROS-020"],
  );
  for (const [version, data] of [
    [1, { demoQuantity: 1 }],
    [2, { demoQuantity: 1, cart: { "ROS-001": 1 } }],
    [
      3,
      {
        ...structuredClone(initialState),
        users: [],
        sessionUserId: null,
        orders: [],
        cart: { "ROS-001": 1 },
      },
    ],
  ]) {
    const original = JSON.stringify({ version, data });
    const result = readRositaState({ getItem: () => original });
    assert.equal(result.status, "migrated");
    assert(stateSchema.safeParse(result.data).success);
  }
  for (const name of ["Llaves para puerta", "Taladro manual"])
    assert.equal(
      inferSubcategory({ category: "ferreteria", name }),
      "ferreteria-por-clasificar",
    );
  assert.equal(
    inferSubcategory({ category: "consumibles", name: "Agua micelar" }),
    "consumibles-por-clasificar",
  );
  const invalid = structuredClone(initialState);
  delete invalid.inventory["ROS-001"];
  assert(!stateSchema.safeParse(invalid).success);
  passed.push(
    "Orden descendente dentro de herramientas manuales correcto; migraciones previas v1/v2/v3 siguen generando estado v5 válido y se conserva validación de referencias de inventario.",
  );
  await fs.writeFile(
    "docs/subcategory-verification/migration-fixture-v4.json",
    encoded,
  );
  await fs.writeFile(
    "docs/subcategory-verification/logica.json",
    JSON.stringify({ passed, counts, errors: [] }, null, 2),
  );
  console.log(passed);
} finally {
  await server.close();
}
