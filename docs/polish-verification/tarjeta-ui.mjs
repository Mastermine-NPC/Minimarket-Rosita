const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.BASE_URL || "http://127.0.0.1:4174",
  out = "docs/polish-verification",
  b = await chromium.launch(),
  passed = [],
  errors = [];
let p;
const go = async (path) => {
  await p.goto(base + path);
  await p.locator("h1").waitFor();
};
const saved = () =>
  p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
  );
const fillDelivery = async () => {
  await p.locator("#delivery-recipient").fill("Cliente Prueba");
  await p.locator("#delivery-phone").fill("999123456");
  await p.locator("#delivery-address").fill("Calle ficticia 123");
  await p.locator("#delivery-zone").selectOption("demo-a");
  await p
    .getByRole("button", { name: "Continuar al pago simulado", exact: true })
    .click();
  await p.locator("input[value=card-demo]").check();
};
const setup = async (width) => {
  p = await b.newPage({ viewport: { width, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await go("/login");
  await p
    .getByRole("button", { name: "Completar acceso de cliente", exact: true })
    .click();
  await p.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await p.waitForURL("**/cuenta");
  await go("/producto/ROS-004");
  await p
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  await go("/checkout");
  await fillDelivery();
};
try {
  for (const width of [1440, 768, 390]) {
    await setup(width);
    let posts = 0;
    p.on("request", (r) => {
      if (r.method() === "POST") posts++;
    });
    const sim = p.getByRole("button", {
      name: "Simular pago con tarjeta",
      exact: true,
    });
    await sim.click();
    await expect(p.locator("#card-holder")).toBeFocused();
    await expect(p.locator("#card-number-error")).toBeVisible();
    await p
      .getByRole("button", { name: "Completar rechazo", exact: true })
      .click();
    assert.equal(await p.locator("#card-cvv").getAttribute("type"), "password");
    await sim.click();
    await p
      .getByRole("button", { name: "Procesando tarjeta…", exact: true })
      .waitFor();
    await p.getByText(/Tarjeta ficticia rechazada/).waitFor();
    assert.equal((await saved()).orders.length, 0);
    assert.equal((await saved()).inventory["ROS-004"].stock, 9);
    await p
      .getByRole("button", { name: "Completar error", exact: true })
      .click();
    await sim.click();
    await p.getByText(/Error simulado de conexión/).waitFor();
    assert.equal((await saved()).orders.length, 0);
    await p
      .getByRole("button", { name: "Completar aprobación", exact: true })
      .click();
    await sim.evaluate((el) => {
      el.click();
      el.click();
    });
    await p.getByText(/Pago simulado aprobado/).waitFor();
    assert.equal(await p.locator("#card-number").inputValue(), "");
    assert.equal(await p.locator("#card-cvv").inputValue(), "");
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Editar entrega", exact: true })
      .click();
    await p.locator("#delivery-zone").selectOption("demo-b");
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await p
      .getByText(/Simula y aprueba la tarjeta de prueba antes de revisar/)
      .waitFor();
    await p
      .getByRole("button", { name: "Completar aprobación", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Simular pago con tarjeta", exact: true })
      .click();
    await p.getByText(/Pago simulado aprobado/).waitFor();
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Confirmar pedido de demostración",
        exact: true,
      })
      .evaluate((el) => {
        el.click();
        el.click();
      });
    await p.waitForURL(/\/pedido\/ROS-.+\/confirmacion$/);
    await p.getByText(/terminada en 0001/).waitFor();
    const d = await saved();
    assert.equal(d.orders.length, 1);
    assert.equal(d.inventory["ROS-004"].stock, 8);
    assert.equal(d.orders[0].payment, "card-demo");
    assert.deepEqual(Object.keys(d.orders[0].cardReceipt).sort(), [
      "brand",
      "last4",
      "reference",
    ]);
    assert.equal(d.movements.filter((m) => m.kind === "order-out").length, 1);
    const raw = JSON.stringify(d);
    assert(
      !raw.includes("0000000000000001") &&
        !raw.includes("0000 0000 0000 0001") &&
        !raw.includes("12/99") &&
        !raw.includes('"cvv"'),
    );
    assert.equal(posts, 0);
    await p.reload();
    await p.getByText(/terminada en 0001/).waitFor();
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.screenshot({ path: out + "/tarjeta-confirmada-" + width + ".png" });
    passed.push(
      width +
        ": obligatorios/foco, rechazo/error sin pedido, aprobación con campos limpiados, cambio de envío exige simular de nuevo, doble clic genera un pedido/stock único, sin PAN/vencimiento/CVV persistidos ni POST.",
    );
    console.log(passed.at(-1));
    await p.close();
  }
  await setup(390);
  await p
    .getByRole("button", { name: "Completar aprobación", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Simular pago con tarjeta", exact: true })
    .click();
  await p.getByRole("link", { name: "Volver al carrito", exact: true }).click();
  await p.waitForTimeout(800);
  assert.equal((await saved()).orders.length, 0);
  await go("/checkout");
  await p
    .getByRole("button", { name: "Completar aprobación", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Simular pago con tarjeta", exact: true })
    .click();
  await p.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await p.waitForTimeout(800);
  assert.equal((await saved()).orders.length, 0);
  assert.equal((await saved()).cart["ROS-004"], 1);
  passed.push(
    "Abandonar formulario o cerrar sesión durante procesamiento cancela la simulación; no pedido tardío y carrito conservado.",
  );
  await p.close();
  assert.deepEqual(errors, []);
} catch (e) {
  errors.push(e.message);
  throw e;
} finally {
  await fs.writeFile(
    out + "/tarjeta-ui.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
