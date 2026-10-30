const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = process.cwd() + "/docs/home-verification",
  base = process.env.BASE_URL || "http://127.0.0.1:5173";
await fs.mkdir(out, { recursive: true });
const b = await chromium.launch(),
  passed = [],
  errors = [],
  metrics = {};
const record = (s) => {
  passed.push(s);
  console.log(s);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
p.on("pageerror", (e) => errors.push(e.message));
try {
  await p.goto(base);
  await p.locator(".home-hero").waitFor();
  const frames = [];
  for (const delay of [0, 100, 180, 400, 350]) {
    await wait(delay);
    frames.push(
      await p
        .locator(".home-title-line>span")
        .first()
        .evaluate((e) => ({
          at: performance.now(),
          transform: getComputedStyle(e).transform,
          clip: getComputedStyle(
            document.querySelector(".home-critical-ready") || e,
          ).clipPath,
        })),
    );
  }
  metrics.entrance = frames;
  assert(new Set(frames.map((x) => x.transform)).size > 1);
  await p.waitForTimeout(1000);
  assert.equal(
    await p.locator(".home-hero-visual").getAttribute("data-photo-state"),
    "ready",
  );
  record(
    "Entrada de título y máscara medidas en frames; foto sigue lista después del límite de carga.",
  );
  await p.locator(".home-magnetic-primary").hover();
  await wait(220);
  assert.equal(
    await p.locator(".presentation-cursor").getAttribute("data-theme"),
    "dark",
  );
  assert.equal(
    await p.locator(".presentation-cursor").getAttribute("data-visible"),
    "true",
  );
  assert.equal(
    await p
      .locator(".presentation-cursor")
      .evaluate((e) => getComputedStyle(e).pointerEvents),
    "none",
  );
  const box = await p.locator(".home-magnetic-primary").boundingBox();
  await p.mouse.move(box.x + 12, box.y + 12);
  await wait(250);
  metrics.magnet = await p
    .locator(".home-magnetic-primary")
    .evaluate((e) => ({
      box: e.getBoundingClientRect().toJSON(),
      ink: getComputedStyle(e.firstElementChild).transform,
    }));
  assert(Math.abs(metrics.magnet.box.x - box.x) < 1);
  assert.notEqual(metrics.magnet.ink, "none");
  await p.getByRole("searchbox", { name: "Buscar productos" }).hover();
  assert.equal(
    await p.locator(".presentation-cursor").getAttribute("data-visible"),
    "false",
  );
  record(
    "Cursor sobre CTA oscuro, campo y tarjeta: no intercepta; magnetismo mueve solo el contenido del CTA.",
  );
  await p.getByRole("link", { name: "Ver categorías", exact: true }).click();
  await wait(1200);
  assert.equal(
    await p
      .locator("#categorias")
      .evaluate((e) => e === document.activeElement),
    true,
  );
  metrics.anchor = await p.locator("#categorias").boundingBox();
  assert(metrics.anchor.y >= 100 && metrics.anchor.y < 400);
  const img = p.locator(".home-category-ferreteria img");
  await img.hover();
  await wait(600);
  metrics.zoom = await img.evaluate((e) => getComputedStyle(e).transform);
  assert.notEqual(metrics.zoom, "none");
  await p.locator(".home-category-ferreteria").click();
  await p.waitForURL("**/categoria/ferreteria");
  await p.locator(".catalog-products").waitFor();
  assert.equal(await p.locator(".presentation-cursor").count(), 0);
  await p.goBack();
  await p.locator(".home-experience").waitFor();
  await wait(400);
  assert((await p.evaluate(() => scrollY)) > 1000);
  record(
    "Ancla enfoca categorías bajo encabezado; categoría navega y Atrás restaura posición; cursor retirado fuera del inicio.",
  );
  await p.evaluate(() => scrollTo(0, 0));
  await wait(200);
  const marquee = p.locator(".home-marquee-track");
  const moving1 = await marquee.evaluate((e) => getComputedStyle(e).transform);
  await wait(160);
  const moving2 = await marquee.evaluate((e) => getComputedStyle(e).transform);
  assert.notEqual(moving1, moving2);
  await p
    .getByRole("button", { name: "Pausar marquesina", exact: true })
    .click();
  await wait(70);
  const paused1 = await marquee.evaluate((e) => getComputedStyle(e).transform);
  await wait(180);
  assert.equal(
    await marquee.evaluate((e) => getComputedStyle(e).transform),
    paused1,
  );
  record("Marquesina se desplaza y su botón detiene la animación.");
  const rail = p.locator(".home-carousel-viewport");
  await rail.scrollIntoViewIfNeeded();
  await p
    .getByRole("button", { name: "Productos siguientes", exact: true })
    .click();
  await wait(650);
  assert((await rail.evaluate((e) => e.scrollLeft)) > 200);
  await rail.focus();
  await p.keyboard.press("End");
  await p.waitForFunction(() => {
    const e = document.querySelector(".home-carousel-viewport");
    return e.scrollLeft + e.clientWidth >= e.scrollWidth - 5;
  });
  await p.keyboard.press("Home");
  await p.waitForFunction(
    () => document.querySelector(".home-carousel-viewport").scrollLeft < 5,
  );
  record(
    "Carrusel: flechas y teclado Inicio/Fin funcionan; ocho artículos canónicos.",
  );
  const rb = await rail.boundingBox();
  await p.mouse.move(rb.x + 340, rb.y + 120);
  await p.mouse.down();
  await p.mouse.move(rb.x + 40, rb.y + 122, { steps: 15 });
  await p.mouse.up();
  await wait(500);
  assert((await rail.evaluate((e) => e.scrollLeft)) > 80);
  assert.equal(new URL(p.url()).pathname, "/");
  record("Arrastre de ratón mueve tarjetas sin abrir el detalle.");
  await rail.focus();
  await p.keyboard.press("Home");
  await wait(600);
  await rail
    .locator('button[aria-label^="Agregar al carrito"]')
    .first()
    .click();
  await p.locator("[data-sonner-toast]").first().waitFor();
  assert((await p.getByRole("button", { name: /carrito/i }).count()) > 0);
  await rail.locator('a[href^="/producto/"]').first().click();
  await p.waitForURL("**/producto/*");
  await p.goBack();
  await p.locator(".home-experience").waitFor();
  record(
    "Agregar desde destacados genera confirmación y detalle abre el producto real.",
  );
  for (const width of [1440, 1100, 900, 768, 600, 480, 390]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base);
    await p.waitForTimeout(1000);
    await p.evaluate(async () => {
      for (const i of document.querySelectorAll(".home-category-media img"))
        i.loading = "eager";
      await document.fonts.ready;
    });
    await wait(700);
    const layout = await p.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      bad: [...document.querySelectorAll(".home-experience img")]
        .filter((e) => e.complete && e.naturalWidth === 0)
        .map((e) => e.src),
    }));
    assert(layout.document <= width + 1, JSON.stringify(layout));
    assert.equal(layout.bad.length, 0);
    assert.equal(await p.locator(".category-card").count(), 6);
    await p.screenshot({ path: out + `/inicio-${width}.png`, fullPage: true });
    metrics["layout" + width] = layout;
  }
  record(
    "1440, 1100, 900, 768, 600, 480 y 390 px: sin desbordamiento horizontal ni imágenes rotas; seis categorías.",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(base);
  await p.waitForTimeout(600);
  assert.equal(await p.locator(".presentation-cursor").count(), 0);
  assert.equal(
    await marquee.evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  assert.equal(await p.locator(".home-brand-loader").count(), 0);
  record(
    "Movimiento reducido: sin cursor, máscara, parallax ni marquesina animada; contenido directo.",
  );
  const touch = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const t = await touch.newPage();
  await t.goto(base);
  await t.locator(".home-carousel-viewport").scrollIntoViewIfNeeded();
  await wait(300);
  assert.equal(await t.locator(".presentation-cursor").count(), 0);
  const tr = t.locator(".home-carousel-viewport"),
    tb = await tr.boundingBox(),
    cdp = await touch.newCDPSession(t);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: tb.x + 300, y: tb.y + 140 }],
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: tb.x + 300 - i * 18, y: tb.y + 140 }],
    });
    await wait(25);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await wait(600);
  metrics.touchScroll = await tr.evaluate((e) => e.scrollLeft);
  assert(metrics.touchScroll > 100);
  assert.equal(new URL(t.url()).pathname, "/");
  await touch.close();
  record(
    "Táctil CDP 390 px: desliza el carrusel sin navegar y no muestra cursor.",
  );
  for (const scenario of ["slow", "failed"]) {
    const context = await b.newContext({
        viewport: { width: 1440, height: 1000 },
      }),
      q = await context.newPage();
    await q.route("**/images/home/rosita-*.webp", async (route) => {
      if (scenario === "failed") await route.abort();
      else {
        await wait(3000);
        await route.continue().catch(() => {});
      }
    });
    await q.goto(base, { waitUntil: "domcontentloaded" });
    await q.locator(".home-hero").waitFor();
    assert(
      await q
        .getByRole("link", { name: "Explorar productos", exact: true })
        .isVisible(),
    );
    await wait(2050);
    assert.equal(await q.locator(".home-brand-loader").count(), 0);
    assert.equal(
      await q.locator(".home-hero-visual").getAttribute("data-photo-state"),
      scenario === "failed" ? "failed" : "timeout",
    );
    if (scenario === "slow") {
      await wait(1400);
      assert.equal(
        await q.locator(".home-hero-visual").getAttribute("data-photo-state"),
        "ready",
      );
    }
    await q.screenshot({ path: out + "/foto-" + scenario + ".png" });
    await context.close();
    record(
      "Foto " +
        scenario +
        ": CTA disponible; cargador termina sin bloqueo" +
        (scenario === "slow"
          ? " y acepta carga tardía."
          : ", alternativa visible."),
    );
  }
  assert.equal(errors.length, 0);
  record("Sin excepciones JavaScript en la sesión principal.");
} catch (e) {
  errors.push(e.stack);
  await p.screenshot({ path: out + "/fallo.png", fullPage: true });
  throw e;
} finally {
  await fs.writeFile(
    out + "/inicio-pruebas.json",
    JSON.stringify(
      { passed, errors, metrics, browser: await b.version() },
      null,
      2,
    ),
  );
  await b.close();
}
