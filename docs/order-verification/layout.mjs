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
for (const width of [1440, 1280, 1024, 1023, 900, 801, 800, 768, 600, 390]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.evaluate(
    (s) =>
      localStorage.setItem(
        "minimarket-rosita:app",
        JSON.stringify({ version: 3, data: s }),
      ),
    fixture,
  );
  for (const route of [
    "/cuenta",
    "/checkout",
    "/mis-pedidos",
    "/pedido/ROS-demo-001/confirmacion",
    "/pedido/ROS-demo-001",
    "/pedido/ROS-demo-001/seguimiento",
    "/pedido/ROS-inexistente/seguimiento",
    "/catalogo",
    "/ruta-inexistente",
    "/login",
    "/registro",
  ]) {
    if (route === "/login") {
      await p.evaluate(() => {
        let e = JSON.parse(localStorage.getItem("minimarket-rosita:app"));
        e.data.sessionUserId = null;
        localStorage.setItem("minimarket-rosita:app", JSON.stringify(e));
      });
    }
    console.log("route", width, route);
    await p.goto("http://127.0.0.1:5173" + route);
    await p.waitForLoadState("networkidle");
    await p.locator("h1").waitFor();
    await p.locator("main").waitFor();
    await p.locator(".skip-link").waitFor({ state: "attached" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(220);
    const check = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      broken: [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src),
      controls: [
        ...document.querySelectorAll("button,a[data-slot=button],input,select"),
      ]
        .filter((e) => {
          let r = e.getBoundingClientRect();
          return (
            r.width &&
            r.height &&
            (r.left < -1 || r.right > innerWidth + 1) &&
            getComputedStyle(e).visibility !== "hidden"
          );
        })
        .map((e) => ({
          text: e.getAttribute("aria-label") || e.textContent?.trim(),
          x: e.getBoundingClientRect().x,
          right: e.getBoundingClientRect().right,
        })),
      skipLink: {
        transform: getComputedStyle(document.querySelector(".skip-link"))
          .transform,
        bottom: document.querySelector(".skip-link").getBoundingClientRect()
          .bottom,
        focused:
          document.activeElement === document.querySelector(".skip-link"),
      },
    }));
    results.push({ width, route, ...check });
    if (
      [1440, 768, 390].includes(width) &&
      route !== "/catalogo" &&
      !route.includes("inexistente")
    )
      await p.screenshot({
        path:
          out +
          "/vista-" +
          route.replaceAll("/", "-").slice(1) +
          "-" +
          width +
          ".png",
        fullPage: true,
      });
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
  out + "/layout.json",
  JSON.stringify({ results, errors }, null, 2),
);
console.log("cases", results.length, "errors", errors);
await b.close();
