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
const scan = () => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (color) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data].map((v, i) =>
      i === 3 ? v / 255 : v,
    );
  };
  const blend = (top, bottom) =>
    top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3]));
  const lum = (c) => {
    const v = c.map((x) => {
      x /= 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722;
  };
  const walker = document.createTreeWalker(
      document.querySelector("main"),
      NodeFilter.SHOW_TEXT,
    ),
    fails = [],
    seen = new Set();
  let tested = 0,
    node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue.trim(),
      el = node.parentElement;
    if (
      !text ||
      !el ||
      el.closest(
        "svg,[aria-hidden=true],.sr-only,[disabled],[aria-disabled=true]",
      )
    )
      continue;
    const st = getComputedStyle(el),
      box = el.getBoundingClientRect();
    if (
      box.width < 2 ||
      box.height < 2 ||
      st.visibility === "hidden" ||
      st.display === "none"
    )
      continue;
    let parent = el,
      layers = [],
      opacity = 1;
    while (parent) {
      const cs = getComputedStyle(parent);
      layers.push(rgba(cs.backgroundColor));
      opacity *= Number(cs.opacity);
      parent = parent.parentElement;
    }
    if (opacity < 0.99) continue;
    let bg = [255, 255, 255];
    for (const layer of layers.reverse()) bg = blend(layer, bg);
    const color = rgba(st.color),
      fg = blend(color, bg),
      a = lum(fg),
      b = lum(bg),
      ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      size = parseFloat(st.fontSize),
      minimum =
        size >= 24 || (size >= 18.66 && parseInt(st.fontWeight) >= 700)
          ? 3
          : 4.5;
    const key = text + "|" + st.color + "|" + bg;
    if (seen.has(key)) continue;
    seen.add(key);
    tested++;
    if (ratio + 0.02 < minimum)
      fails.push({
        tag: el.tagName,
        text: text.slice(0, 100),
        color: st.color,
        bg: bg.map(Math.round),
        ratio: Math.round(ratio * 100) / 100,
        minimum,
        size,
      });
  }
  return {
    tested,
    fails,
    tokens: {
      error: getComputedStyle(document.documentElement).getPropertyValue(
        "--destructive",
      ),
      primary: getComputedStyle(document.documentElement).getPropertyValue(
        "--primary",
      ),
    },
  };
};
for (const width of [1440, 768, 390]) {
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
    "/checkout",
    "/mis-pedidos",
    "/pedido/ROS-demo-001/seguimiento",
    "/registro",
  ]) {
    if (route === "/registro")
      await p.evaluate(() => {
        const e = JSON.parse(localStorage.getItem("minimarket-rosita:app"));
        e.data.sessionUserId = null;
        localStorage.setItem("minimarket-rosita:app", JSON.stringify(e));
      });
    console.log("route", width, route);
    await p.goto("http://127.0.0.1:5173" + route);
    await p.waitForLoadState("networkidle");
    await p.locator("h1").waitFor();
    await p.locator("main").waitFor();
    if (route === "/registro")
      await p
        .getByRole("button", {
          name: "Crear cuenta de demostración",
          exact: true,
        })
        .click();
    await p.waitForTimeout(300);
    results.push({ width, route, ...(await p.evaluate(scan)) });
  }
}
await fs.writeFile(
  out + "/contraste-renderizado.json",
  JSON.stringify({ results }, null, 2),
);
console.log(
  JSON.stringify(
    results.filter((r) => r.fails.length),
    null,
    2,
  ),
);
await b.close();
