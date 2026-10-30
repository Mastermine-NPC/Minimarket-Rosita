// Harness de verificación. Requiere Playwright externo; no es una dependencia de la aplicación.
import { chromium } from "playwright";
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
  await p.goto(base);
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
    1,
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
    path: root + "/docs/verification/comprobacion-" + width + ".png",
    fullPage: true,
  });
  passed.push(
    width +
      ": dos rutas, enlace profundo, estado compartido/persistente, soles, movimiento reducido y sin desbordamiento",
  );
  await p.close();
}
const p = await browser.newPage();
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(base);
await p.evaluate(() => {
  localStorage.setItem("otra-app:conservar", "intacto");
  localStorage.setItem("minimarket-rosita:aux", "prueba");
  localStorage.setItem("minimarket-rosita:app", "{json roto");
});
await p.reload();
await p.getByText(/No se pudo leer el contenido guardado/).waitFor();
assert.equal(await p.locator("output").innerText(), "0");
assert.equal(
  await p.evaluate(() => localStorage.getItem("minimarket-rosita:app")),
  "{json roto",
);
await p.getByRole("button", { name: "Aumentar cantidad", exact: true }).click();
assert.equal(
  await p.evaluate(
    () =>
      JSON.parse(localStorage.getItem("minimarket-rosita:app")).data
        .demoQuantity,
  ),
  1,
);
await p.getByRole("link", { name: "Ver en la segunda ruta" }).click();
await p
  .getByRole("button", { name: "Restablecer datos de Rosita", exact: true })
  .click();
await p
  .getByRole("button", { name: "Sí, restablecer Rosita", exact: true })
  .click();
assert.equal(await p.locator("output").innerText(), "0");
assert.equal(
  await p.evaluate(() => localStorage.getItem("otra-app:conservar")),
  "intacto",
);
assert.equal(
  await p.evaluate(() => localStorage.getItem("minimarket-rosita:aux")),
  null,
);
passed.push(
  "Persistencia: JSON inválido recuperable y reset exclusivo del prefijo Rosita, sin borrar claves ajenas",
);
await p.evaluate(() =>
  localStorage.setItem(
    "minimarket-rosita:app",
    JSON.stringify({ version: 99, data: { demoQuantity: 7 } }),
  ),
);
await p.reload();
await p.getByText(/Hay datos de una versión más reciente/).waitFor();
await p.getByRole("button", { name: "Aumentar cantidad", exact: true }).click();
assert.equal(
  await p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
  ),
  99,
);
await p
  .getByRole("button", { name: "Restablecer datos de Rosita", exact: true })
  .click();
await p
  .getByRole("button", { name: "Sí, restablecer Rosita", exact: true })
  .click();
assert.equal(await p.locator("output").innerText(), "0");
assert.equal(
  await p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).version,
  ),
  1,
);
assert.equal(
  await p.getByText(/Hay datos de una versión más reciente/).count(),
  0,
);
passed.push(
  "Persistencia: versión futura conservada sin sobrescribir hasta restablecimiento explícito",
);
const reducer = await p.evaluate(async () => {
  const { rositaReducer } = await import("/src/app/state/reducer.ts");
  let s = { demoQuantity: 0 };
  for (let i = 0; i < 40; i++) s = rositaReducer(s, { type: "demo/increment" });
  const upper = s.demoQuantity;
  for (let i = 0; i < 40; i++) s = rositaReducer(s, { type: "demo/decrement" });
  return { upper, lower: s.demoQuantity };
});
assert.deepEqual(reducer, { upper: 24, lower: 0 });
passed.push("Reducer: cantidades enteras limitadas al rango 0–24");
await p.close();
const q = await browser.newPage();
q.on("pageerror", (e) => errors.push(e.message));
await q.addInitScript(() =>
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new DOMException("Bloqueado", "SecurityError");
    },
  }),
);
await q.goto(base);
await q.getByText(/El navegador no permite almacenamiento local/).waitFor();
await q.getByRole("button", { name: "Aumentar cantidad", exact: true }).click();
assert.equal(await q.locator("output").innerText(), "1");
await q
  .locator("[data-sonner-toast]")
  .filter({ hasText: "No se pudieron guardar" })
  .waitFor();
passed.push(
  "Almacenamiento bloqueado: interfaz funcional y error útil, sin excepción no controlada",
);
await q.close();
assert.deepEqual(errors, []);
await fs.writeFile(
  root + "/docs/verification/browser-smoke.json",
  JSON.stringify(
    {
      passed,
      errors,
      environment: "Chromium local mediante Vite dev, no publicación",
    },
    null,
    2,
  ),
);
console.log(passed);
await browser.close();
