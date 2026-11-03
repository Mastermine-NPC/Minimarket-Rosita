import { createServer } from "vite";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const site = process.env.SITE_URL;
if (!site) throw new Error("Define SITE_URL con el origen público confirmado. No se inventará un dominio para el sitemap.");
const origin = new URL(site);
if (!/^https?:$/.test(origin.protocol) || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/") {
  throw new Error("SITE_URL debe ser un origen HTTP(S) sin credenciales, ruta, parámetros ni fragmentos.");
}
const outputFlag = process.argv.indexOf("--output");
const output = path.resolve(outputFlag >= 0 ? process.argv[outputFlag + 1] : "dist/sitemap.xml");
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "silent" });
try {
  const { initialState } = await vite.ssrLoadModule("/src/data/demo.ts");
  const { currentProducts } = await vite.ssrLoadModule("/src/lib/catalog-state.ts");
  const routes = new Set([
    "/", "/catalogo", "/nosotros", "/ayuda", "/contacto",
    ...initialState.categories.filter(c => c.active).map(c => "/categoria/" + encodeURIComponent(c.slug || c.id)),
    ...currentProducts(initialState).filter(p => p.active !== false).map(p => "/producto/" + encodeURIComponent(p.publicId || p.id)),
  ]);
  const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  await writeFile(output, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...routes].map(route => `  <url><loc>${escape(new URL(route, origin).href)}</loc></url>`).join("\n") + "\n</urlset>\n");
  console.log(`Sitemap: ${routes.size} URLs públicas en ${output}`);
} finally { await vite.close(); }
