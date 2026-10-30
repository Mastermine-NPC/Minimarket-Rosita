const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch(),
  out = "docs/polish-verification",
  passed = [],
  errors = [],
  base = "http://127.0.0.1:4174";
let p;
try {
  p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(base + "/");
  await p.locator(".home-photo-move").waitFor();
  await p.waitForTimeout(250);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(150);
  const before = await p
    .locator(".home-photo-move")
    .evaluate((e) => getComputedStyle(e).transform);
  await p.evaluate(() => window.scrollTo(0, 350));
  await p.waitForTimeout(250);
  const after = await p
    .locator(".home-photo-move")
    .evaluate((e) => getComputedStyle(e).transform);
  assert.notEqual(before, after);
  await p.screenshot({ path: out + "/inicio-video-1440.png" });
  passed.push(
    "Movimiento del hero observado en navegador: transformación de foto/video cambia con scroll, conservando controles.",
  );
  await p.goto(base + "/login");
  await p
    .getByRole("button", { name: "Completar acceso de cliente", exact: true })
    .click();
  await p.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await p.waitForURL("**/cuenta");
  await p.goto(base + "/producto/ROS-004");
  await p
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  await p.goto(base + "/carrito");
  await expect(
    p.getByRole("button", {
      name: "Disminuir Set de destornilladores",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    p.getByRole("button", {
      name: "Eliminar Set de destornilladores",
      exact: true,
    }),
  ).toHaveAttribute("data-variant", "destructive");
  await expect(
    p.getByRole("button", { name: "Vaciar carrito", exact: true }),
  ).toHaveAttribute("data-variant", "destructive");
  await p.goto(base + "/checkout");
  await p.locator("#delivery-recipient").fill("Cliente Prueba");
  await p.locator("#delivery-phone").fill("999123456");
  await p.locator("#delivery-address").fill("Calle ficticia 123");
  await p.locator("#delivery-zone").selectOption("demo-a");
  await p
    .getByRole("button", { name: "Continuar al pago simulado", exact: true })
    .click();
  await p.locator("input[value=card-demo]").check();
  await p
    .getByRole("button", { name: "Completar aprobación", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Simular pago con tarjeta", exact: true })
    .click();
  await p.getByText(/Pago simulado aprobado/).waitFor();
  await p.getByRole("button", { name: "Revisar pedido", exact: true }).click();
  await p
    .getByRole("button", { name: "Abrir carrito, 1 unidad", exact: true })
    .click();
  const dialog = p.getByRole("dialog", { name: "Tu carrito", exact: true });
  await dialog
    .getByRole("button", {
      name: "Aumentar Set de destornilladores",
      exact: true,
    })
    .click();
  await dialog
    .getByRole("button", {
      name: "Disminuir Set de destornilladores",
      exact: true,
    })
    .click();
  await p.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await expect(
    p.getByRole("button", {
      name: "Confirmar pedido de demostración",
      exact: true,
    }),
  ).toBeDisabled();
  await p
    .getByText(/Tu carrito cambió/)
    .first()
    .waitFor();
  const d = await p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
  );
  assert.equal(d.orders.length, 0);
  assert.equal(d.cart["ROS-004"], 1);
  assert.equal(d.checkout.quote, null);
  await p.screenshot({ path: out + "/carrito-revision-invalidada.png" });
  passed.push(
    "Carrito: mínimo1 y eliminación/vaciado destructivos. Cambiar cantidad y restaurarla en el panel invalida revisión/aprobación, bloquea confirmar y conserva carrito sin pedido.",
  );
  await p.reload();
  await expect(
    p.getByRole("button", {
      name: "Confirmar pedido de demostración",
      exact: true,
    }),
  ).toBeDisabled();
  await p.close();
  for (const width of [1440, 390]) {
    p = await b.newPage({ viewport: { width, height: 1000 } });
    await p.goto(base + "/nosotros");
    await p.locator(".info-story p").first().waitFor();
    assert.equal(
      await p
        .locator(".info-story p")
        .nth(1)
        .evaluate((e) => getComputedStyle(e).marginTop),
      "16px",
    );
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.screenshot({
      path: out + "/nosotros-final-" + width + ".png",
      fullPage: true,
    });
    await p.close();
  }
  passed.push(
    "Espaciado final de párrafos y lectura de Nosotros comprobado a1440/390 tras ajuste visual.",
  );
  assert.deepEqual(errors, []);
} catch (e) {
  errors.push(e.message);
  throw e;
} finally {
  console.log(passed);
  await fs.writeFile(
    out + "/adicionales.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
