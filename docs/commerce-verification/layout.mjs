const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch();
const p = await b.newPage();
const results = [],
  errors = [];
p.on("pageerror", (e) => errors.push(e.message));
for (const width of [1440, 1280, 1024, 1023, 900, 801, 800, 768, 600, 390]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const route of [
    "/",
    "/catalogo",
    "/producto/ROS-001",
    "/carrito",
    "/sistema-diseno",
    "/comprobacion",
    "/estado",
  ]) {
    await p.goto("http://127.0.0.1:5173" + route);
    await p.locator("h1").waitFor();
    await p.evaluate(() => document.fonts.ready);
    const check = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      broken: [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src),
    }));
    results.push({ width, route, ...check });
  }
}
await fs.writeFile(
  "./docs/commerce-verification/layout.json",
  JSON.stringify({ results, errors }, null, 2),
);
console.log(
  JSON.stringify({
    cases: results.length,
    failures: results.filter((x) => x.overflow || x.broken.length),
    errors,
  }),
);
await b.close();
