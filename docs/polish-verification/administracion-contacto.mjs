const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://127.0.0.1:4174",
  out = "docs/polish-verification",
  b = await chromium.launch(),
  passed = [],
  errors = [];
let p;
const go = async (path) => {
  await p.goto(base + path);
  await p.locator("h1").waitFor();
};
try {
  for (const width of [1440, 1024, 768, 600, 390]) {
    p = await b.newPage({ viewport: { width, height: 1000 } });
    p.on("pageerror", (e) => errors.push(e.message));
    await go("/login");
    await p
      .getByRole("button", {
        name: "Completar acceso de administrador",
        exact: true,
      })
      .click();
    await p
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await p.waitForURL("**/admin");
    for (const route of [
      "/admin",
      "/admin/productos",
      "/admin/categorias",
      "/admin/inventario",
      "/admin/pedidos",
      "/admin/reportes",
    ]) {
      await go(route);
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + " " + width,
      );
      if ([1440, 768, 390].includes(width))
        await p.screenshot({
          path: out + "/admin-" + route.split("/").pop() + "-" + width + ".png",
          fullPage: true,
        });
    }
    await go("/admin/inventario");
    for (const [id, label, klass] of [
      ["ROS-001", "Disponible", "inventory-available"],
      ["ROS-006", "Stock bajo", "inventory-low"],
      ["ROS-009", "Agotado", "inventory-empty"],
    ]) {
      await p.locator("#inventory-search").fill(id);
      const chip = p.locator(".inventory-state");
      await expect(chip).toHaveText(label);
      await expect(chip).toHaveClass(new RegExp(klass));
    }
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-001");
    await p
      .getByRole("button", { name: "Desactivar ROS-001", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Confirmar desactivación", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await go("/admin/inventario?q=ROS-001");
    await expect(p.locator(".inventory-state")).toHaveText("Desactivado");
    await expect(p.locator(".inventory-state")).toHaveClass(
      /inventory-inactive/,
    );
    await go("/admin/productos");
    await p.locator("#admin-products-search").fill("ROS-006");
    await p
      .getByRole("button", { name: "Editar ROS-006", exact: true })
      .click();
    await p.locator("#product-threshold").fill("2");
    await p
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await go("/admin/inventario?q=ROS-006");
    await expect(p.locator(".inventory-state")).toHaveText("Disponible");
    await go("/admin/categorias");
    await p
      .getByRole("button", { name: "Crear categoría", exact: true })
      .click();
    await p
      .locator("#tax-name")
      .fill("Categoría de prueba con un nombre suficientemente largo");
    await p
      .locator("#tax-description")
      .fill(
        "Descripción de prueba para revisar el contenido largo y el comportamiento del modal en pantallas pequeñas. ".repeat(
          3,
        ),
      );
    await p.locator("#tax-description").focus();
    await p.keyboard.press("Tab");
    assert(
      await p
        .getByRole("dialog")
        .evaluate((el) => el.contains(document.activeElement)),
    );
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.keyboard.press("Escape");
    await p
      .getByRole("button", { name: "Descartar cambios", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await go("/sistema-diseno");
    await p.getByRole("tab", { name: "Componentes", exact: true }).click();
    await p
      .getByRole("heading", {
        name: "Video suplementario · componente real",
        exact: true,
      })
      .waitFor();
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    passed.push(
      width +
        ": seis secciones administrativas sin desbordar, estados stock/umbral y desactivado diferenciados; cambiar umbral recalcula; modal largo conserva foco/Escape y DS actualizado.",
    );
    console.log(passed.at(-1));
    await p.close();
  }
  p = await b.newPage({ viewport: { width: 390, height: 1000 } });
  await go("/contacto");
  for (const id of ["name", "email", "subject", "message"])
    await p.locator("#contact-" + id).fill("   ");
  await p
    .getByRole("button", {
      name: "Enviar consulta de demostración",
      exact: true,
    })
    .click();
  for (const id of ["name", "email", "subject", "message"])
    await expect(p.locator("#contact-" + id + "-error")).toBeVisible();
  await expect(p.locator("#contact-name")).toBeFocused();
  await p.locator("#contact-name").fill("  María-José O'Neill  ");
  await p.locator("#contact-email").fill("  prueba@rosita.test  ");
  await p.locator("#contact-subject").fill("  Consulta del prototipo  ");
  await p
    .locator("#contact-message")
    .fill("  Quisiera conocer el funcionamiento de la entrega simulada.  ");
  const send = p.getByRole("button", {
    name: "Enviar consulta de demostración",
    exact: true,
  });
  await send.evaluate((el) => {
    el.click();
    el.click();
  });
  await p
    .getByText("Consulta de demostración completada.", { exact: true })
    .waitFor();
  await p.screenshot({ path: out + "/contacto-valido-390.png" });
  passed.push(
    "Contacto: solo espacios rechazados, primer error recibe foco; nombre con tildes/guion/apóstrofe y email con espacios exteriores aceptados; doble envío produce confirmación simulada.",
  );
  await p.close();
  assert.deepEqual(errors, []);
} catch (e) {
  errors.push(e.message);
  if (p && !p.isClosed())
    await p.screenshot({ path: out + "/admin-fallo.png" });
  throw e;
} finally {
  await fs.writeFile(
    out + "/administracion-contacto.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
