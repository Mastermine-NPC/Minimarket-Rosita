const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch(),
  p = await b.newPage(),
  results = [],
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
async function scan(width, route) {
  const check = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    broken: [...document.images]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.src),
    controls: [
      ...document.querySelectorAll("button,a[data-slot],input,select,textarea"),
    ]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width > 1 &&
          r.height > 1 &&
          (r.left < -1 || r.right > innerWidth + 1) &&
          getComputedStyle(e).visibility !== "hidden" &&
          !e.closest('[aria-hidden="true"]')
        );
      })
      .map((e) => ({
        text:
          e.getAttribute("aria-label") || e.textContent?.trim().slice(0, 90),
        x: e.getBoundingClientRect().x,
        right: e.getBoundingClientRect().right,
      })),
  }));
  results.push({ width, route, ...check });
}
for (const width of [450, 390]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.evaluate(
    (s) =>
      localStorage.setItem(
        "minimarket-rosita:app",
        JSON.stringify({ version: 4, data: s }),
      ),
    fixture,
  );
  for (const route of [
    "/admin",
    "/admin/productos",
    "/admin/inventario",
    "/admin/pedidos",
    "/admin/pedidos/ROS-layout-001",
    "/admin/pedidos/ROS-inexistente",
    "/admin/inexistente",
  ]) {
    await p.goto("http://127.0.0.1:5173" + route);
    await p.waitForLoadState("networkidle");
    await p.locator("#admin-contenido h1").waitFor();
    await p.evaluate(() => document.fonts.ready);
    await scan(width, route);
    if ([1440, 768, 390].includes(width) && !route.includes("inexistente"))
      await p.screenshot({
        path:
          out +
          "/vista-" +
          route.slice(1).replaceAll("/", "-") +
          "-" +
          width +
          ".png",
        fullPage: true,
      });
  }
  if ([1440, 768, 390].includes(width)) {
    await p.goto("http://127.0.0.1:5173/admin/productos");
    await p
      .getByRole("button", { name: "Nuevo producto", exact: true })
      .click();
    await p.getByRole("dialog").waitFor();
    await scan(width, "/admin/productos#formulario");
    await p.screenshot({
      path: out + "/vista-formulario-" + width + ".png",
      fullPage: true,
    });
    await p.keyboard.press("Escape");
    await p.getByRole("dialog").waitFor({ state: "hidden" });
  }
  console.log(
    width,
    results.filter(
      (r) =>
        r.width === width &&
        (r.overflow || r.broken.length || r.controls.length),
    ),
  );
}
await fs.writeFile(
  out + "/layout-mobile-final.json",
  JSON.stringify({ results, errors }, null, 2),
);
console.log("cases", results.length, "errors", errors);
await b.close();
