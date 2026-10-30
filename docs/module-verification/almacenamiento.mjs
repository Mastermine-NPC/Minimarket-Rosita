const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = "docs/module-verification",
  base = "http://127.0.0.1:4173",
  b = await chromium.launch(),
  passed = [],
  errors = [];
let p;
const data = () =>
  p.evaluate(
    () => JSON.parse(localStorage.getItem("minimarket-rosita:app")).data,
  );
const go = async (path) => {
  await p.goto(base + path);
  await p.locator("h1").waitFor();
};
const login = async () => {
  await go("/login");
  await p
    .getByRole("button", {
      name: "Completar acceso de administrador",
      exact: true,
    })
    .click();
  await p.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await p.waitForURL("**/admin");
};
try {
  p = await b.newPage({ viewport: { width: 768, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await login();
  await go("/admin/productos");
  await p.getByRole("button", { name: "Editar ROS-001", exact: true }).click();
  const before = await data();
  const original = before.products.find((i) => i.id === "ROS-001").imageKey;
  const file = p.locator("#image-file");
  const invalid = async (name, mimeType, buffer, match) => {
    await file.setInputFiles({ name, mimeType, buffer });
    await expect(p.locator(".image-picker [role=alert]")).toContainText(match);
    assert.equal(Object.keys((await data()).media).length, 0);
    assert.equal(await p.locator("#image-library").inputValue(), original);
  };
  await invalid(
    "imagen.svg",
    "image/svg+xml",
    Buffer.from("<svg/>"),
    "JPG, PNG o WebP",
  );
  await invalid(
    "enorme.png",
    "image/png",
    Buffer.alloc(8 * 1024 * 1024 + 1),
    "máximo 8 MB",
  );
  await invalid(
    "rota.png",
    "image/png",
    Buffer.from("dañado"),
    "archivo puede estar dañado",
  );
  const bytes = await p.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 320;
    c.getContext("2d").fillRect(0, 0, 640, 320);
    return Array.from(
      Uint8Array.from(atob(c.toDataURL("image/png").split(",")[1]), (x) =>
        x.charCodeAt(0),
      ),
    );
  });
  await p.evaluate(() => {
    window.__put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Quota", "QuotaExceededError");
    };
  });
  await invalid(
    "cuota.png",
    "image/png",
    Buffer.from(bytes),
    "espacio disponible",
  );
  await p.evaluate(() => {
    IDBObjectStore.prototype.put = window.__put;
  });
  passed.push(
    "Formato SVG, tamaño >8 MB, PNG corrupto y cuota IndexedDB: error útil; no se agrega metadata ni se cambia la selección previa.",
  );
  await file.setInputFiles({
    name: "correcta.png",
    mimeType: "image/png",
    buffer: Buffer.from(bytes),
  });
  await p.locator("img.upload-preview").waitFor();
  await p
    .getByRole("button", { name: "Guardar producto", exact: true })
    .click();
  await p.getByRole("dialog").waitFor({ state: "hidden" });
  await go("/producto/ROS-001");
  await p.locator('.product-zoom-open img[src^="blob:"]').waitFor();
  await p.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open("minimarket-rosita-assets", 1);
        r.onsuccess = () => {
          const db = r.result,
            tx = db.transaction("images", "readwrite");
          tx.objectStore("images").clear();
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = reject;
        };
      }),
  );
  await p.reload();
  await expect(
    p.getByRole("button", { name: "Ampliar imagen", exact: true }),
  ).toBeDisabled();
  await expect(p.locator(".product-zoom-open")).toContainText(
    /no disponible|no se|encontr/i,
  );
  passed.push(
    "Referencia con archivo ausente muestra reemplazo y deshabilita ampliación, sin romper detalle ni compra.",
  );
  await p.evaluate(() => {
    localStorage.setItem("otra-aplicacion", "conservar");
    localStorage.setItem("minimarket-rosita:viejo", "borrar");
  });
  await p.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open("otra-aplicacion", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("datos");
        r.onsuccess = () => {
          const db = r.result,
            tx = db.transaction("datos", "readwrite");
          tx.objectStore("datos").put("conservar", "clave");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = reject;
        };
      }),
  );
  await p.evaluate(
    () =>
      new Promise((resolve) => {
        const r = indexedDB.open("minimarket-rosita-assets", 1);
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("images", "readwrite");
          t.objectStore("images").put({
            id: "huerfana",
            blob: new Blob(["prueba"]),
          });
          t.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
  );
  await go("/estado");
  await p
    .getByRole("button", { name: "Restablecer datos de Rosita", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Sí, restablecer Rosita", exact: true })
    .click();
  await p.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("minimarket-rosita:app")).data
        .sessionUserId === null,
  );
  const reset = await data();
  assert.equal(reset.products.length, 24);
  assert.equal(reset.categories.length, 6);
  assert.equal(reset.users.length, 2);
  assert.deepEqual(reset.media, {});
  assert.equal(
    await p.evaluate(
      () =>
        new Promise((resolve) => {
          const r = indexedDB.open("minimarket-rosita-assets", 1);
          r.onsuccess = () => {
            const db = r.result,
              t = db.transaction("images");
            const q = t.objectStore("images").count();
            q.onsuccess = () => {
              db.close();
              resolve(q.result);
            };
          };
        }),
    ),
    0,
  );
  assert.equal(
    await p.evaluate(() => localStorage.getItem("otra-aplicacion")),
    "conservar",
  );
  assert.equal(
    await p.evaluate(() => localStorage.getItem("minimarket-rosita:viejo")),
    null,
  );
  assert.equal(
    await p.evaluate(
      () =>
        new Promise((resolve) => {
          const r = indexedDB.open("otra-aplicacion", 1);
          r.onsuccess = () => {
            const db = r.result,
              t = db.transaction("datos");
            const q = t.objectStore("datos").get("clave");
            q.onsuccess = () => {
              db.close();
              resolve(q.result);
            };
          };
        }),
    ),
    "conservar",
  );
  passed.push(
    "Restablecimiento real por UI devuelve catálogo y dos cuentas iniciales; conserva clave localStorage y registro IndexedDB ajenos.",
  );
  await login();
  for (const path of [
    "/admin",
    "/admin/productos",
    "/admin/categorias",
    "/admin/inventario",
    "/admin/pedidos",
    "/admin/reportes",
    "/sistema-diseno",
  ]) {
    await go(path);
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      path,
    );
    await p.screenshot({
      path:
        out + "/tablet-" + path.split("/").filter(Boolean).join("-") + ".png",
      fullPage: true,
    });
  }
  await go("/sistema-diseno");
  await p.getByRole("tab", { name: "Componentes", exact: true }).click();
  await p
    .getByRole("heading", {
      name: "Patrones de información y gestión · 2.5.0",
      exact: true,
    })
    .waitFor();
  await p.screenshot({
    path: out + "/sistema-componentes-768.png",
    fullPage: true,
  });
  passed.push(
    "Panel y sistema de diseño a 768 px: rutas reales sin desbordamiento de página; componentes nuevos visibles.",
  );
  await p.close();
  p = await b.newPage();
  const raw = '{"version":99,"data":{"futuro":true}}';
  await go("/");
  await p.evaluate(
    (raw) => localStorage.setItem("minimarket-rosita:app", raw),
    raw,
  );
  await p.reload();
  await p
    .getByText(/versión más reciente/)
    .first()
    .waitFor();
  await p.locator('a[href="/login"]').first().click();
  await p
    .getByRole("button", {
      name: "Completar acceso de administrador",
      exact: true,
    })
    .click();
  await p.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await p.waitForURL("**/admin");
  assert.equal(
    await p.evaluate(() => localStorage.getItem("minimarket-rosita:app")),
    raw,
  );
  passed.push(
    "Formato futuro preservado byte por byte tras iniciar sesión temporal por UI; no sobrescritura automática.",
  );
  await p.close();
  p = await b.newPage();
  await go("/catalogo");
  await p.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota", "QuotaExceededError");
    };
  });
  await p
    .locator('article[data-product-id="ROS-001"]')
    .getByRole("button", { name: /Agregar al carrito:/ })
    .click();
  await p
    .getByText(/No se pudieron guardar los cambios/)
    .first()
    .waitFor();
  await expect(
    p.getByRole("button", { name: "Abrir carrito, 1 unidad", exact: true }),
  ).toBeVisible();
  passed.push(
    "Fallo de escritura localStorage informa sesión temporal y permite seguir usando el carrito en memoria.",
  );
  await p.close();
  assert.deepEqual(errors, []);
} catch (e) {
  errors.push(e.stack);
  if (p && !p.isClosed())
    await p.screenshot({ path: out + "/storage-fallo.png", fullPage: true });
  throw e;
} finally {
  console.log(passed);
  await fs.writeFile(
    out + "/almacenamiento.json",
    JSON.stringify({ passed, errors, browser: await b.version() }, null, 2),
  );
  await b.close();
}
