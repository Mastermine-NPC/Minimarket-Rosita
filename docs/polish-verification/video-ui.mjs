const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://127.0.0.1:4174",
  out = "docs/polish-verification",
  b = await chromium.launch(),
  passed = [],
  errors = [],
  metrics = [];
let p;
const go = async (path) => {
  await p.goto(base + path);
  await p.locator("h1").waitFor();
};
try {
  for (const width of [1440, 1200, 1024, 768, 390]) {
    p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    const requests = [];
    p.on("request", (r) => {
      if (r.url().endsWith(".mp4")) requests.push(r.url());
    });
    await go("/");
    const hero = p.locator('[data-video="ambientación de compra"]');
    await hero.scrollIntoViewIfNeeded();
    await p.waitForFunction(() => {
      const v = document.querySelector(
        '[data-video="ambientación de compra"] video',
      );
      return v && v.currentTime > 0.25 && !v.paused;
    });
    assert(!requests.some((r) => r.includes("Delivery")));
    assert(!requests.some((r) => r.endsWith("/video/video-intro.mp4")));
    await hero
      .getByRole("button", {
        name: "Pausar ambientación de compra",
        exact: true,
      })
      .click();
    await p.waitForFunction(
      () =>
        document.querySelector('[data-video="ambientación de compra"] video')
          .paused,
    );
    const t = await hero.locator("video").evaluate((v) => v.currentTime);
    await p.waitForTimeout(250);
    assert.equal(await hero.locator("video").evaluate((v) => v.currentTime), t);
    await hero
      .getByRole("button", {
        name: "Reproducir ambientación de compra",
        exact: true,
      })
      .click();
    await p.waitForFunction(
      () =>
        !document.querySelector('[data-video="ambientación de compra"] video')
          .paused,
    );
    await p.locator("footer").scrollIntoViewIfNeeded();
    await p.waitForFunction(
      () =>
        document.querySelector('[data-video="ambientación de compra"] video')
          .paused,
    );
    await hero.scrollIntoViewIfNeeded();
    await p.waitForFunction(
      () =>
        !document.querySelector('[data-video="ambientación de compra"] video')
          .paused,
    );
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForFunction(
      () =>
        document.querySelector('[data-video="ambientación de compra"] video')
          .paused,
    );
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForFunction(
      () =>
        !document.querySelector('[data-video="ambientación de compra"] video')
          .paused,
    );
    await p.locator(".delivery-reference summary").click();
    const secondary = p.locator('[data-video="clip de referencia de ficción"]');
    assert.equal(await secondary.locator("video").getAttribute("src"), null);
    await secondary
      .getByRole("button", {
        name: "Reproducir clip de referencia de ficción",
        exact: true,
      })
      .click();
    await p.waitForFunction(() => {
      const v = document.querySelector(
        '[data-video="clip de referencia de ficción"] video',
      );
      return v.currentTime > 0.2 && !v.paused;
    });
    assert(await hero.locator("video").evaluate((v) => v.paused));
    await secondary
      .getByRole("button", {
        name: "Pausar clip de referencia de ficción",
        exact: true,
      })
      .click();
    await p.locator(".delivery-reference summary").click();
    assert(await secondary.locator("video").evaluate((v) => v.paused));
    await go("/nosotros");
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.screenshot({
      path: out + "/nosotros-" + width + ".png",
      fullPage: true,
    });
    await go("/ayuda");
    await p.locator(".help-topic summary").first().click();
    await p.screenshot({
      path: out + "/ayuda-" + width + ".png",
      fullPage: true,
    });
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    const footer = p.locator("footer");
    const hrefs = await footer
      .locator("a")
      .evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    assert(
      hrefs.includes("/nosotros") &&
        hrefs.includes("/contacto") &&
        hrefs.includes("/sistema-diseno"),
    );
    for (const href of new Set(hrefs)) {
      assert(href.startsWith("/"));
      await go(href);
      assert.equal(
        await p
          .getByRole("heading", {
            name: "Esta página no está en el catálogo.",
            exact: true,
          })
          .count(),
        0,
      );
    }
    await go("/");
    await p.locator("footer").scrollIntoViewIfNeeded();
    await p.screenshot({ path: out + "/footer-" + width + ".png" });
    metrics.push({
      width,
      requests: requests.filter((r) => r.includes("/video/web/")),
      noOverflow: await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    });
    passed.push(
      width +
        ": videos reproducen fotogramas, pausa/reanuda, salen de pantalla y visibilidad simulada; secundario opt-in sin descarga inicial, posters y controles; Nosotros/Ayuda/footer sin desbordar y enlaces internos resuelven.",
    );
    console.log(passed.at(-1));
    await p.close();
  }
  for (const scenario of ["reduce", "blocked", "failed"]) {
    p = await b.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: scenario === "reduce" ? "reduce" : "no-preference",
    });
    if (scenario === "blocked")
      await p.addInitScript(() => {
        const play = HTMLMediaElement.prototype.play;
        let first = true;
        HTMLMediaElement.prototype.play = function () {
          if (first) {
            first = false;
            return Promise.reject(
              new DOMException("Bloqueado", "NotAllowedError"),
            );
          }
          return play.call(this);
        };
      });
    if (scenario === "failed")
      await p.route("**/video/web/video-intro.mp4", (r) => r.abort());
    await go("/");
    const hero = p.locator('[data-video="ambientación de compra"]');
    await hero.scrollIntoViewIfNeeded();
    if (scenario === "reduce") {
      assert.equal(await hero.locator("video").getAttribute("src"), null);
      assert(
        await hero
          .locator("img")
          .evaluate((i) => i.complete && i.naturalWidth > 0),
      );
    } else {
      await expect(hero).toHaveAttribute("data-state", scenario);
      assert(
        await hero
          .locator("img")
          .evaluate((i) => i.complete && i.naturalWidth > 0),
      );
      if (scenario === "blocked") {
        await hero
          .getByRole("button", {
            name: "Reproducir ambientación de compra",
            exact: true,
          })
          .click();
        await p.waitForFunction(
          () =>
            !document.querySelector(
              '[data-video="ambientación de compra"] video',
            ).paused,
        );
      }
    }
    assert(
      await p
        .getByRole("link", { name: /Explorar productos/ })
        .first()
        .isVisible(),
    );
    await p.screenshot({ path: out + "/video-" + scenario + ".png" });
    await p.close();
    passed.push(
      "Video " +
        scenario +
        ": alternativa estática y CTA disponibles; bloqueo permite reintento manual.",
    );
  }
  assert.deepEqual(errors, []);
} catch (e) {
  errors.push(e.message);
  if (p && !p.isClosed())
    await p.screenshot({ path: out + "/video-fallo.png" });
  throw e;
} finally {
  await fs.writeFile(
    out + "/video-ui.json",
    JSON.stringify(
      { passed, errors, metrics, browser: await b.version() },
      null,
      2,
    ),
  );
  await b.close();
}
