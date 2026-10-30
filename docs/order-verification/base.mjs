// Harness de verificación. Requiere Playwright externo; no es una dependencia de la aplicación.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const root = process.cwd();
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch();
let passed = [],
  errors = [];
for (const width of [1440, 768, 390]) {
  const p = await browser.newPage({ viewport: { width, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(base + "/comprobacion");
  await p.getByRole("heading", { name: /La base de Rosita/ }).waitFor();
  await p
    .getByRole("button", { name: "Validar formulario", exact: true })
    .click();
  assert(await p.locator("#nombre-error").isVisible());
  assert(await p.locator("#correo-error").isVisible());
  assert.equal(
    await p.locator("#nombre").evaluate((el) => el === document.activeElement),
    true,
  );
  await p
    .getByLabel("Nombre de prueba", { exact: true })
    .fill("Cliente de prueba");
  await p.getByLabel("Correo de prueba", { exact: true }).fill("incorrecto");
  await p
    .getByRole("button", { name: "Validar formulario", exact: true })
    .click();
  assert.match(
    await p.locator("#correo-error").innerText(),
    /nombre@ejemplo.com/,
  );
  await p
    .getByLabel("Correo de prueba", { exact: true })
    .fill("cliente@rosita.test");
  await p
    .getByRole("button", { name: "Validar formulario", exact: true })
    .click();
  await p.getByText("Validación correcta", { exact: true }).waitFor();
  await p
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Formulario validado" })
    .waitFor();
  await p.getByLabel("Nombre de prueba", { exact: true }).fill("Otra prueba");
  assert.equal(
    await p.getByText("Validación correcta", { exact: true }).count(),
    0,
  );
  passed.push(
    width +
      ": formulario obligatorio/correo, foco de error y confirmación/notificación sin envío",
  );
  const trigger = p.getByRole("button", { name: "Probar modal", exact: true });
  await trigger.click();
  const dialog = p.getByRole("dialog");
  await dialog.waitFor();
  assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
  assert(
    await p
      .getByRole("button", { name: "Cerrar modal", exact: true })
      .evaluate((el) => parseFloat(getComputedStyle(el).minHeight) >= 44),
  );
  const buttons = dialog.locator("button");
  await buttons.last().focus();
  await p.keyboard.press("Tab");
  assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
  await p.keyboard.press("Shift+Tab");
  assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
  await p.keyboard.press("Escape");
  assert.equal(
    await trigger.evaluate((el) => el === document.activeElement),
    true,
  );
  await p.keyboard.press("Tab");
  assert(
    await p.evaluate(
      () => getComputedStyle(document.activeElement).outlineStyle !== "none",
    ),
  );
  await p
    .getByRole("button", { name: "Probar notificación", exact: true })
    .click();
  await p
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Notificación de prueba" })
    .waitFor();
  passed.push(
    width +
      ": modal, ciclo de teclado/Escape/restauración, foco visible y aviso Sonner",
  );
  await p
    .getByRole("button", { name: "Aumentar cantidad", exact: true })
    .click();
  assert.equal(await p.locator("output").innerText(), "1");
  await p.getByRole("link", { name: "Ver en la segunda ruta" }).click();
  await p.getByRole("heading", { name: /Cambia la ruta/ }).waitFor();
  assert.equal(await p.locator("output").innerText(), "1");
  await p.reload();
  await p.getByRole("heading", { name: /Cambia la ruta/ }).waitFor();
  assert.equal(await p.locator("output").innerText(), "1");
  await p
    .getByRole("button", { name: "Aumentar cantidad", exact: true })
    .click();
  await p.getByRole("link", { name: "Volver a comprobación" }).click();
  await p.getByRole("heading", { name: /La base de Rosita/ }).waitFor();
  assert.equal(await p.locator("output").innerText(), "2");
  assert.match(await p.locator(".demo-total").innerText(), /7[.,]00/);
  assert.equal(
    await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
    ),
    3,
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.getByText("Movimiento reducido activo", { exact: false }).waitFor();
  assert.equal(
    await p
      .locator('[data-testid="motion-sample"]')
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await p.screenshot({
    path: root + "/docs/order-verification/comprobacion-" + width + ".png",
    fullPage: true,
  });
  passed.push(
    width +
      ": dos rutas, enlace profundo, estado compartido/persistente, soles, movimiento reducido y sin desbordamiento",
  );
  await p.close();
}
assert.deepEqual(errors, []);
await fs.writeFile(
  root + "/docs/order-verification/base-tecnica.json",
  JSON.stringify({ passed, errors }, null, 2),
);
console.log(passed);
await browser.close();
