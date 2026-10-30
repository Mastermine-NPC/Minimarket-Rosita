const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = process.cwd() + "/docs/module-verification/zoom-regresion";
await fs.mkdir(out, { recursive: true });
const b = await chromium.launch(),
  passed = [],
  errors = [],
  metrics = {};
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
p.on("pageerror", (e) => errors.push(e.message));
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const record = (s) => {
  passed.push(s);
  console.log(s);
};
try {
  await p.goto(base + "/producto/ROS-001");
  await p.locator(".product-zoom-open svg image").waitFor();
  await p.waitForTimeout(500);
  const main = p.locator(".product-zoom-open"),
    art = p.locator(".product-zoom-open .product-zoom-artwork"),
    r = await main.boundingBox(),
    fit = Math.min(r.width, r.height, 375),
    side = (r.width - fit) / 2,
    top = (r.height - fit) / 2;
  assert(side > 0);
  await p.mouse.move(r.x + 3, r.y + r.height / 2);
  assert.notEqual(await art.getAttribute("data-zoomed"), "true");
  await p.mouse.move(r.x + side + fit * 0.25, r.y + top + fit * 0.75);
  assert.equal(await art.getAttribute("data-zoomed"), "true");
  assert.equal(await art.getAttribute("data-point"), "0.250,0.750");
  metrics.hover = await art.evaluate((e) => ({
    transform: getComputedStyle(e).transform,
    origin: getComputedStyle(e).transformOrigin,
    point: e.dataset.point,
  }));
  await p.mouse.move(10, 10);
  assert.equal(await art.getAttribute("data-zoomed"), "false");
  record(
    "1440: hover interno sigue coordenadas 0.25/0.75, excluye márgenes contain y restaura al salir.",
  );
  const trigger = p.getByRole("button", {
    name: "Ampliar imagen",
    exact: true,
  });
  await trigger.focus();
  await p.keyboard.press("Enter");
  const modal = p.getByRole("dialog");
  await modal.waitFor();
  const close = modal.getByRole("button", { name: "Cerrar", exact: true });
  await p.waitForTimeout(100);
  assert(await close.evaluate((e) => e === document.activeElement));
  await modal.getByRole("button", { name: "Acercar", exact: true }).click();
  await modal.getByRole("button", { name: "Acercar", exact: true }).click();
  const stage = p.locator(".product-zoom-canvas");
  assert.equal(await stage.getAttribute("data-scale"), "1.5");
  assert(
    await modal
      .getByRole("button", { name: "Acercar", exact: true })
      .isDisabled(),
  );
  await stage.focus();
  for (let i = 0; i < 40; i++) await p.keyboard.press("ArrowRight");
  const pos = await stage.getAttribute("data-pan");
  metrics.keyboardPan = pos;
  assert(pos.startsWith("0.0,"));
  for (let i = 0; i < 40; i++) await p.keyboard.press("ArrowDown");
  const dimensions = await stage.evaluate((e) => ({
    w: e.clientWidth,
    h: e.clientHeight,
    p: e.dataset.pan,
  }));
  metrics.bounds = dimensions;
  const panY = Number(dimensions.p.split(",")[1]);
  assert(Math.abs(panY) <= dimensions.h * 0.25 + 0.1);
  await modal.getByRole("button", { name: "Restablecer", exact: true }).click();
  assert.equal(await stage.getAttribute("data-scale"), "1");
  assert.equal(await stage.getAttribute("data-pan"), "0.0,0.0");
  await stage.focus();
  await p.keyboard.press("Tab");
  assert(await modal.evaluate((e) => e.contains(document.activeElement)));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
  assert(await trigger.evaluate((e) => e === document.activeElement));
  record(
    "Teclado: Enter abre, foco inicial Cerrar, ciclo contenido, límite 150 %, flechas acotadas, restablecer, Escape y foco devuelto.",
  );
  await main.click();
  await modal.waitFor();
  assert.equal(await stage.getAttribute("data-scale"), "1");
  await close.click();
  await p.waitForTimeout(150);
  assert(await main.evaluate((e) => e === document.activeElement));
  const before = await p
    .getByRole("button", { name: /Abrir carrito/ })
    .getAttribute("aria-label");
  await p
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  assert.notEqual(
    await p
      .getByRole("button", { name: /Abrir carrito/ })
      .getAttribute("aria-label"),
    before,
  );
  record(
    "Clic en fotografía abre; cierre visible restaura a fotografía; compra mantiene acción de agregar.",
  );
  await p.goto(base + "/producto/ROS-002");
  assert.equal(
    await p.locator(".product-artwork").getAttribute("viewBox"),
    "300 0 300 300",
  );
  await p.goto(base + "/producto/ROS-019");
  await p.locator('.product-artwork[src$="cookies.svg"]').waitFor();
  await p.waitForTimeout(250);
  await p.getByRole("button", { name: "Ampliar imagen", exact: true }).click();
  for (let i = 0; i < 8; i++)
    await modal.getByRole("button", { name: "Acercar", exact: true }).click();
  assert.equal(await stage.getAttribute("data-scale"), "3");
  await modal.getByRole("button", { name: "Alejar", exact: true }).click();
  assert.equal(await stage.getAttribute("data-scale"), "2.75");
  await close.click();
  record(
    "Cambio de producto selecciona otro recorte; ilustración correcta admite 300 % y Alejar. Sin miniaturas en catálogo actual.",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(base + "/producto/ROS-001");
  await p.locator(".product-zoom-open").hover();
  assert.notEqual(await art.getAttribute("data-zoomed"), "true");
  await trigger.click();
  assert.equal(
    await modal.evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  await p.keyboard.press("Escape");
  record(
    "Movimiento reducido: sin hover automático ni animación modal; controles siguen funcionando.",
  );
  for (const width of [1440, 768, 390]) {
    await p.setViewportSize({ width, height: 900 });
    await p.goto(base + "/producto/ROS-001");
    await trigger.click();
    await p.waitForTimeout(150);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const controls = await modal
      .locator("button")
      .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().toJSON()));
    assert(
      controls.every((r) => r.x >= 0 && r.right <= width && r.height >= 44),
    );
    await p.screenshot({ path: out + `/visor-${width}.png` });
    await p.keyboard.press("Escape");
  }
  record(
    "1440/768/390: visor y controles visibles de al menos 44 px, sin desbordamiento horizontal.",
  );
  const mobile = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const t = await mobile.newPage();
  t.on("pageerror", (e) => errors.push(e.message));
  await t.goto(base + "/producto/ROS-001");
  await t.locator(".product-zoom-open").tap();
  const tm = t.getByRole("dialog"),
    ts = t.locator(".product-zoom-canvas");
  await tm.waitFor();
  await tm.getByRole("button", { name: "Acercar", exact: true }).tap();
  await tm.getByRole("button", { name: "Acercar", exact: true }).tap();
  const tb = await ts.boundingBox(),
    cdp = await mobile.newCDPSession(t);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 }],
  });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: tb.x + tb.width / 2 + i * 12, y: tb.y + tb.height / 2 + i * 9 },
      ],
    });
    await t.waitForTimeout(20);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  const touchPan = await ts.getAttribute("data-pan");
  assert.notEqual(touchPan, "0.0,0.0");
  metrics.touchPan = touchPan;
  assert.equal(
    await ts.evaluate((e) => getComputedStyle(e).touchAction),
    "pinch-zoom",
  );
  const meta = await t.locator('meta[name="viewport"]').getAttribute("content");
  assert(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\D|$)/.test(meta));
  await tm.getByRole("button", { name: "Restablecer", exact: true }).tap();
  assert.equal(await ts.getAttribute("data-pan"), "0.0,0.0");
  await tm.getByRole("button", { name: "Cerrar", exact: true }).tap();
  await mobile.close();
  record(
    "Móvil CDP: toque abre, controles amplían, arrastre táctil mueve imagen sin cerrar, límites/restablecer y Cerrar. Pinch-zoom y meta nativa permitidos.",
  );
  assert.equal(errors.length, 0);
  record("Sin excepciones JavaScript.");
} catch (e) {
  errors.push(e.stack);
  await p.screenshot({ path: out + "/fallo.png", fullPage: true });
  throw e;
} finally {
  await fs.writeFile(
    out + "/resultados.json",
    JSON.stringify(
      { passed, errors, metrics, base, browser: await b.version() },
      null,
      2,
    ),
  );
  await b.close();
}
