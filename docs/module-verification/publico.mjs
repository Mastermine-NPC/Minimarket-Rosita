const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  out = "docs/module-verification",
  passed = [],
  errors = [],
  base = "http://127.0.0.1:4173";
let p;
try {
  for (const width of [1440, 768, 390]) {
    p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    const go = async (url) => {
      await p.goto(base + url);
      await p.locator("h1").waitFor();
    };
    await go("/");
    const menu = p.getByRole("button", { name: "Menú", exact: true });
    await menu.click();
    const sheet = p.getByRole("dialog", {
      name: "Rosita y ayuda",
      exact: true,
    });
    await sheet.waitFor();
    assert.equal(await sheet.getByRole("link").count(), 6);
    assert.equal(
      await sheet
        .getByRole("link", { name: "Consumibles", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await sheet
        .getByRole("link", { name: "Ferretería", exact: true })
        .count(),
      0,
    );
    await sheet.locator("a,button").last().focus();
    await p.keyboard.press("Tab");
    assert(await sheet.evaluate((e) => e.contains(document.activeElement)));
    await p.keyboard.press("Escape");
    await p.locator("[data-slot=sheet-content]").waitFor({ state: "detached" });
    assert(await menu.evaluate((e) => e === document.activeElement));
    await menu.click();
    await p
      .getByRole("dialog")
      .getByRole("link", { name: "Preguntas frecuentes", exact: true })
      .click();
    await p.waitForURL("**/ayuda#preguntas-frecuentes");
    await p.locator("#preguntas-frecuentes").waitFor();
    await p.locator("[data-slot=sheet-content]").waitFor({ state: "detached" });
    await p.waitForTimeout(500);
    const anchor = await p.locator("#preguntas-frecuentes").boundingBox();
    assert(anchor.y >= 0 && anchor.y < 500, JSON.stringify(anchor));
    const question = p.locator(".help-topic summary").first();
    await question.focus();
    await p.keyboard.press("Enter");
    assert(await question.evaluate((e) => e.parentElement.open));
    await p.keyboard.press("Space");
    assert(!(await question.evaluate((e) => e.parentElement.open)));
    await go("/nosotros");
    assert(await p.getByRole("img", { name: /Interior real/ }).isVisible());
    assert(await p.getByText(/8 de julio de 2011/).count());
    await p.screenshot({ path: out + "/nosotros-" + width + ".png" });
    await go("/catalogo");
    if (width < 1280) {
      assert(await p.locator("#catalog-category").isVisible());
      await p.locator("#catalog-category").selectOption("consumibles");
      await p.waitForURL("**/categoria/consumibles");
    }
    await go("/contacto");
    let posts = 0;
    p.on("request", (r) => {
      if (r.method() === "POST") posts++;
    });
    const send = p.getByRole("button", {
      name: "Enviar consulta de demostración",
      exact: true,
    });
    await send.click();
    await expect(p.locator("#contact-name-error")).toBeVisible();
    await expect(p.locator("#contact-name")).toBeFocused();
    await p.locator("#contact-name").fill("Cliente de prueba");
    await p.locator("#contact-email").fill("invalido");
    await p.locator("#contact-subject").fill("Consulta ficticia");
    await p
      .locator("#contact-message")
      .fill("Mensaje de demostración para probar el formulario.");
    await send.click();
    await expect(p.locator("#contact-email-error")).toBeVisible();
    await p.locator("#contact-email").fill("consulta@rosita.test");
    await send.click();
    await p
      .getByRole("button", { name: "Procesando consulta…", exact: true })
      .waitFor();
    await p
      .getByText("Consulta de demostración completada.", { exact: true })
      .waitFor();
    assert.equal(posts, 0);
    assert.equal(await p.getByRole("checkbox").count(), 0);
    await p.screenshot({ path: out + "/contacto-" + width + ".png" });
    passed.push(
      width +
        ": menú informativo no duplica categorías; teclado/Escape/foco, FAQ/ancla, Nosotros con foto real, selector móvil y contacto validado sin envío real.",
    );
    console.log(passed.at(-1));
    await go("/login");
    await p
      .getByRole("button", { name: "Completar acceso de cliente", exact: true })
      .click();
    assert.equal(
      await p.locator("#auth-email").inputValue(),
      "cliente@rosita.test",
    );
    assert(new URL(p.url()).pathname === "/login");
    await p
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await p.waitForURL("**/cuenta");
    await p.locator("#profile-name").fill("Cliente Exposición");
    await p.locator("#profile-email").fill("cuenta-" + width + "@rosita.test");
    await p
      .getByRole("button", { name: "Guardar perfil", exact: true })
      .click();
    await expect(
      p.getByRole("heading", {
        name: "Hola, Cliente Exposición.",
        exact: true,
      }),
    ).toBeVisible();
    await p.reload();
    await expect(p.locator("#profile-email")).toHaveValue(
      "cuenta-" + width + "@rosita.test",
    );
    await go("/admin/reportes");
    await expect(
      p.getByRole("heading", {
        name: "Este espacio es para administración.",
        exact: true,
      }),
    ).toBeVisible();
    await go("/cuenta");
    await p
      .locator("main")
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
    await p.waitForURL("**/login");
    await p
      .getByRole("button", { name: "Completar acceso de cliente", exact: true })
      .click();
    assert.equal(
      await p.locator("#auth-email").inputValue(),
      "cuenta-" + width + "@rosita.test",
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await go("/nosotros");
    assert.equal(await p.locator(".presentation-cursor").count(), 0);
    await go("/contacto");
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    passed.push(
      width +
        ": acceso de prueba no automático, perfil editable/persistente, cliente sin panel, credencial actualizada y composición sin desbordamiento con movimiento reducido.",
    );
    console.log(passed.at(-1));
    await p.close();
  }
  assert.equal(errors.length, 0);
} catch (e) {
  errors.push(e.stack);
  if (p && !p.isClosed())
    await p.screenshot({ path: out + "/public-fallo.png", fullPage: true });
  throw e;
} finally {
  await fs.writeFile(
    out + "/publico.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
