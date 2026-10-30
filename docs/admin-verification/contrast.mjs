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
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT),
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
  ]) {
    await p.goto("http://127.0.0.1:5173" + route);
    await p.waitForLoadState("networkidle");
    await p.locator("h1").waitFor();
    results.push({ width, route, ...(await p.evaluate(scan)) });
  }
  await p.goto("http://127.0.0.1:5173/admin/productos");
  await p.getByRole("button", { name: "Nuevo producto", exact: true }).click();
  await p
    .getByRole("button", { name: "Guardar producto", exact: true })
    .click();
  await p.locator("#product-name-error").waitFor();
  results.push({
    width,
    route: "formulario-invalido",
    ...(await p.evaluate(scan)),
  });
  await p.keyboard.press("Escape");
  await p.getByRole("dialog").waitFor({ state: "hidden" });
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
