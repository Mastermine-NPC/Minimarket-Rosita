const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const { expect } = await import(
  process.env.PLAYWRIGHT_EXPECT_MODULE || "playwright/test"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const root = ".",
  out = root + "/docs/admin-verification/regresion-cliente";
await fs.mkdir(out, { recursive: true });
const b = await chromium.launch();
const passed = [],
  errors = [];
let current;
async function record(message) {
  passed.push(message);
  console.log(message);
  await fs.writeFile(
    out + "/flujo.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
}
try {
  for (const width of [1440, 768, 390]) {
    const p = await b.newPage({ viewport: { width, height: 1000 } });
    current = p;
    p.on("pageerror", (e) => errors.push(e.message));
    const go = async (path) => {
      await p.goto("http://127.0.0.1:5173" + path);
      await p.locator("h1").waitFor();
    };
    const shot = async (name) => {
      await p.waitForTimeout(250);
      await p.screenshot({
        path: out + "/" + name + "-" + width + ".png",
        fullPage: true,
      });
    };
    await go("/catalogo");
    const card = p.locator('article[data-product-id="ROS-004"]');
    await card.getByRole("button", { name: /Agregar al carrito:/ }).click();
    await card
      .getByRole("button", {
        name: "Aumentar Set de destornilladores",
        exact: true,
      })
      .click();
    await expect(
      p.getByRole("button", { name: "Abrir carrito, 2 unidades", exact: true }),
    ).toBeVisible();
    await go("/carrito");
    await p
      .getByRole("link", { name: "Continuar con mi pedido", exact: true })
      .click();
    await p
      .getByRole("heading", { name: "Tu cuenta de demostración.", exact: true })
      .waitFor();
    await p
      .getByRole("link", { name: "Crear cuenta de demostración", exact: true })
      .click();
    await expect(p).toHaveURL(/registro.*volver/);
    await p
      .getByRole("button", {
        name: "Crear cuenta de demostración",
        exact: true,
      })
      .click();
    await expect(p.locator("#auth-name-error")).toBeVisible();
    await expect(p.locator("#auth-email-error")).toBeVisible();
    await expect(p.locator("#auth-password-error")).toBeVisible();
    await expect(p.locator("#auth-name")).toBeFocused();
    await p.locator("#auth-name").fill("Ana Rosita");
    await p.locator("#auth-email").fill("  CLIENTE@ROSITA.TEST  ");
    await p.locator("#auth-password").fill("Demo123!");
    await p.locator("#auth-confirm").fill("distinta");
    await p
      .getByRole("button", { name: "Mostrar contraseña", exact: true })
      .click();
    await expect(p.locator("#auth-password")).toHaveAttribute("type", "text");
    await p
      .getByRole("button", { name: "Ocultar contraseña", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Crear cuenta de demostración",
        exact: true,
      })
      .click();
    await expect(p.locator("#auth-confirm-error")).toContainText(
      "no coinciden",
    );
    await shot("registro");
    await p.locator("#auth-confirm").fill("Demo123!");
    await p
      .getByRole("button", {
        name: "Crear cuenta de demostración",
        exact: true,
      })
      .click();
    await expect(p).toHaveURL(/\/checkout$/);
    await expect(
      p.getByRole("heading", { name: "¿Dónde lo recibirías?", exact: true }),
    ).toBeVisible();
    await expect(
      p.getByRole("button", { name: "Abrir carrito, 2 unidades", exact: true }),
    ).toBeVisible();
    const auth = await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
    );
    assert.equal(
      auth.users.find((u) => u.role === "customer").email,
      "cliente@rosita.test",
    );
    assert(!JSON.stringify(auth).includes("Demo123!"));
    assert.match(
      auth.users.find((u) => u.role === "customer").salt,
      /^[a-f0-9]{32}$/,
    );
    assert.match(
      auth.users.find((u) => u.role === "customer").verifier,
      /^[a-f0-9]{64}$/,
    );
    await record(
      width +
        ": registro validado, contraseñas distintas/mostrar, correo normalizado, verificador sin texto plano y retorno con carrito",
    );
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await expect(p.locator("#recipient-error")).toBeVisible();
    await expect(p.locator("#phone-error")).toBeVisible();
    await expect(p.locator("#zone-error")).toBeVisible();
    await p.locator("#delivery-recipient").fill("Ana Rosita");
    await p.locator("#delivery-phone").fill("123");
    await p.locator("#delivery-address").fill("Jr. Prueba 123");
    await p.locator("#delivery-zone").selectOption("demo-a");
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await expect(p.locator("#phone-error")).toContainText("9 dígitos");
    await p.locator("#delivery-phone").fill("999123456");
    await p.locator("#delivery-reference").fill("Portón de prueba");
    await shot("entrega");
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await expect(
      p.getByRole("heading", { name: "Un pago, solo de prueba.", exact: true }),
    ).toBeFocused();
    await p.locator("#cash-amount").fill("1");
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await expect(p.locator("#cash-error")).toContainText("cubrir el total");
    await p.locator("#cash-amount").fill("50");
    await p
      .getByRole("button", { name: "Volver a entrega", exact: true })
      .click();
    await expect(p.locator("#delivery-address")).toHaveValue("Jr. Prueba 123");
    await expect(p.locator("#delivery-reference")).toHaveValue(
      "Portón de prueba",
    );
    await p
      .getByRole("button", { name: "Continuar al pago simulado", exact: true })
      .click();
    await expect(p.locator("#cash-amount")).toHaveValue("50");
    await shot("pago");
    await p
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await expect(
      p.getByRole("heading", { name: "Todo en su lugar.", exact: true }),
    ).toBeFocused();
    await expect(p.locator(".order-summary .order-total dd")).toContainText(
      "35.00",
    );
    await expect(p.locator(".order-summary")).toContainText("15.00");
    await shot("revision");
    await p
      .getByRole("button", {
        name: "Confirmar pedido de demostración",
        exact: true,
      })
      .evaluate((el) => {
        el.click();
        el.click();
      });
    await expect(
      p.getByRole("button", { name: "Creando pedido…", exact: true }),
    ).toBeDisabled();
    await expect(p).toHaveURL(/\/pedido\/ROS-.+\/confirmacion$/);
    await p
      .getByRole("heading", {
        name: "¡Tu pedido de prueba está listo!",
        exact: true,
      })
      .waitFor();
    const orderId = await p.locator(".order-code").innerText();
    let saved = await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
    );
    assert.equal(saved.orders.length, 1);
    assert.equal(saved.inventory["ROS-004"].stock, 7);
    assert.deepEqual(saved.cart, {});
    assert.equal(saved.orders[0].totalCents, 3500);
    assert.equal(saved.orders[0].shippingCents, 400);
    assert.equal(saved.orders[0].cashTenderCents, 5000);
    assert.equal(saved.orders[0].lines[0].quantity, 2);
    await p.reload();
    await expect(p.locator(".order-code")).toHaveText(orderId);
    await expect(
      p.getByRole("link", { name: "Mi cuenta: Ana Rosita", exact: true }),
    ).toBeVisible();
    await shot("confirmacion");
    await record(
      width +
        ": entrega validada, campos al regresar, efectivo insuficiente/vuelto, total en céntimos y pedido único ante doble clic; stock y sesión persistentes",
    );
    await p.getByRole("link", { name: "Seguir pedido", exact: true }).click();
    for (const label of [
      "Pedido recibido",
      "En preparación",
      "En camino",
      "Entregado",
    ]) {
      await expect(p.locator(".order-next h2")).toHaveText(label);
      if (label !== "Entregado") {
        await p
          .getByRole("button", {
            name: "Simular siguiente estado",
            exact: true,
          })
          .click();
        await p
          .getByRole("dialog")
          .getByRole("button", {
            name: "Confirmar avance de estado",
            exact: true,
          })
          .click();
        await p.getByRole("dialog").waitFor({ state: "hidden" });
        await p.reload();
        await p.locator(".order-next h2").waitFor();
      }
    }
    await expect(
      p.getByRole("button", { name: "Simular siguiente estado", exact: true }),
    ).toBeDisabled();
    await shot("seguimiento");
    saved = await p.evaluate(
      () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
    );
    assert.equal(saved.inventory["ROS-004"].stock, 7);
    await go("/mis-pedidos");
    await expect(p.locator(".order-history-card")).toHaveCount(1);
    await p
      .locator(".order-history-card")
      .getByRole("link", { name: "Ver detalle", exact: true })
      .click();
    await expect(p.locator(".order-code")).toHaveText(orderId);
    await go("/producto/ROS-004");
    await expect(p.locator(".detail-info .stock-label")).toContainText(
      "7 unidades",
    );
    await record(
      width +
        ": confirmación, historial, detalle, seguimiento manual persistente y stock descontado una sola vez",
    );
    await go("/catalogo");
    await p
      .locator('article[data-product-id="ROS-001"]')
      .getByRole("button", { name: /Agregar al carrito:/ })
      .click();
    await p.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await expect(p).toHaveURL(/\/login$/);
    await expect(
      p.getByRole("button", { name: "Abrir carrito, 1 unidad", exact: true }),
    ).toBeVisible();
    await p.locator("#auth-email").fill("cliente@rosita.test");
    await p.locator("#auth-password").fill("incorrecta");
    await p
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await expect(
      p.getByText("El correo o la contraseña de demostración no coinciden.", {
        exact: true,
      }),
    ).toBeVisible();
    await go("/registro");
    await p.locator("#auth-name").fill("Otra Ana");
    await p.locator("#auth-email").fill(" CLIENTE@ROSITA.TEST ");
    await p.locator("#auth-password").fill("Demo123!");
    await p.locator("#auth-confirm").fill("Demo123!");
    await p
      .getByRole("button", {
        name: "Crear cuenta de demostración",
        exact: true,
      })
      .click();
    await expect(p.locator("#auth-email-error")).toContainText("Ya existe");
    await go("/login?volver=%2Fmis-pedidos");
    await p.locator("#auth-email").fill(" CLIENTE@ROSITA.TEST ");
    await p.locator("#auth-password").fill("Demo123!");
    await p
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await expect(p).toHaveURL(/\/mis-pedidos$/);
    await expect(p.locator(".order-history-card")).toHaveCount(1);
    await p.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await go("/registro");
    await p.locator("#auth-name").fill("Cliente Dos");
    await p.locator("#auth-email").fill("dos@rosita.test");
    await p.locator("#auth-password").fill("Otra123!");
    await p.locator("#auth-confirm").fill("Otra123!");
    await p
      .getByRole("button", {
        name: "Crear cuenta de demostración",
        exact: true,
      })
      .click();
    await expect(p).toHaveURL(/\/cuenta$/);
    await go("/mis-pedidos");
    await expect(
      p.getByRole("heading", { name: "Aún no tienes pedidos.", exact: true }),
    ).toBeVisible();
    await go("/pedido/" + orderId + "/seguimiento");
    await expect(
      p.getByRole("heading", {
        name: "No encontramos este pedido.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(p.locator(".order-summary")).toHaveCount(0);
    await go("/login?volver=https%3A%2F%2Fevil.example");
    await expect(p).toHaveURL(/\/cuenta$/);
    await record(
      width +
        ": correo duplicado, acceso incorrecto/correcto, salida conservando carrito, otro cliente aislado desde UI y retorno externo rechazado",
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await go("/checkout");
    await expect(
      p.locator('.checkout-steps [aria-current="step"]'),
    ).toContainText("Entrega");
    await p.locator("#delivery-recipient").focus();
    await p.keyboard.press("Tab");
    await expect(p.locator("#delivery-phone")).toBeFocused();
    assert.notEqual(
      await p
        .locator("#delivery-phone")
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "none",
    );
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await record(
      width +
        ": teclado, foco visible, movimiento reducido y composición sin desplazamiento horizontal",
    );
    await p.close();
  }
  assert.deepEqual(errors, []);
  await record("Sin errores JavaScript en los recorridos");
} catch (e) {
  console.error(e);
  if (current && !current.isClosed())
    await current.screenshot({
      path: out + "/fallo-flujo.png",
      fullPage: true,
    });
  await fs.writeFile(out + "/fallo-flujo.txt", String(e));
  process.exitCode = 1;
} finally {
  await b.close();
}
