const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const b = await chromium.launch(),
  out = "docs/zoom-verification",
  passed = [],
  metrics = {},
  errors = [];
try {
  const p = await b.newPage({ viewport: { width: 768, height: 900 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("http://127.0.0.1:4173/producto/ROS-019");
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Ampliar imagen", exact: true }).click();
  const d = p.getByRole("dialog"),
    s = p.locator(".product-zoom-canvas");
  await d.getByRole("button", { name: "Acercar", exact: true }).click();
  await d.getByRole("button", { name: "Acercar", exact: true }).click();
  const box = await s.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.down();
  await p.mouse.move(2000, 1800, { steps: 15 });
  await p.mouse.up();
  assert(await d.isVisible());
  metrics.mousePan = await s.getAttribute("data-pan");
  assert.notEqual(metrics.mousePan, "0.0,0.0");
  await p.setViewportSize({ width: 390, height: 700 });
  await p.waitForTimeout(200);
  metrics.resize = await s.evaluate((e) => ({
    pan: e.dataset.pan,
    w: e.clientWidth,
    h: e.clientHeight,
  }));
  assert(
    Math.abs(Number(metrics.resize.pan.split(",")[0])) <=
      metrics.resize.w * 0.25 + 1,
  );
  await p.mouse.click(1, 1);
  assert(await d.isVisible());
  await p.keyboard.press("Escape");
  assert(
    await p
      .getByRole("button", { name: "Ampliar imagen", exact: true })
      .evaluate((e) => e === document.activeElement),
  );
  passed.push(
    "Arrastre de ratón fuera del visor conserva modal; resize vuelve a acotar posición; clic exterior no cierra; Escape restaura foco.",
  );
  const q = await b.newPage();
  await q.route("**/images/productos-rosita-atlas.jpg", (r) => r.abort());
  await q.goto("http://127.0.0.1:4173/producto/ROS-001");
  await q.getByText("La imagen no está disponible.", { exact: true }).waitFor();
  assert(
    await q
      .getByRole("button", { name: "Ampliar imagen", exact: true })
      .isDisabled(),
  );
  assert(
    await q
      .getByRole("button", { name: "Agregar al carrito", exact: true })
      .isEnabled(),
  );
  await q.close();
  passed.push(
    "Imagen fallida: aviso y ampliación deshabilitada; compra disponible.",
  );
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const t = await c.newPage();
  await t.goto("http://127.0.0.1:4173/producto/ROS-001");
  await t.locator(".product-zoom-open").tap();
  await t
    .getByRole("dialog")
    .getByRole("button", { name: "Acercar", exact: true })
    .tap();
  await t
    .getByRole("dialog")
    .getByRole("button", { name: "Acercar", exact: true })
    .tap();
  const cdp = await c.newCDPSession(t);
  const before = await t.evaluate(() => visualViewport.scale);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 150, y: 480, id: 0 },
      { x: 230, y: 480, id: 1 },
    ],
  });
  for (let i = 1; i <= 15; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 150 - i * 5, y: 480, id: 0 },
        { x: 230 + i * 5, y: 480, id: 1 },
      ],
    });
    await t.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await t.waitForTimeout(350);
  const after = await t.evaluate(() => visualViewport.scale);
  metrics.nativePinch = { before, after };
  assert(after > before);
  assert(await t.getByRole("dialog").isVisible());
  await c.close();
  passed.push(
    "Pinza nativa CDP aumenta visualViewport.scale sin cerrar el visor; no se impide el zoom del navegador.",
  );
  assert.equal(errors.length, 0);
  console.log(passed);
} catch (e) {
  errors.push(e.stack);
  throw e;
} finally {
  await fs.writeFile(
    out + "/adicionales.json",
    JSON.stringify(
      { passed, metrics, errors, browser: await b.version() },
      null,
      2,
    ),
  );
  await b.close();
}
