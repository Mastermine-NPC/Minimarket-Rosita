const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const b = await chromium.launch(),
  metrics = [];
try {
  for (const width of [1440, 768, 390]) {
    const p = await b.newPage({ viewport: { width, height: 900 } });
    await p.goto(
      "http://127.0.0.1:4173/categoria/consumibles?subcategoria=snacks",
    );
    await p.locator(".catalog-products").waitFor();
    if (width < 1024) {
      await p.getByRole("button", { name: /^Filtros/ }).click();
      await p.getByRole("dialog").waitFor();
      await p.waitForTimeout(600);
      const pane = await p
        .getByRole("dialog")
        .evaluate((e) => ({
          opacity: getComputedStyle(e).opacity,
          transform: getComputedStyle(e).transform,
          width: e.getBoundingClientRect().width,
        }));
      assert.equal(pane.opacity, "1");
      metrics.push({ width, pane });
    }
    await p.screenshot({
      path: `docs/subcategory-verification/vista-${width}.png`,
    });
    await p.close();
  }
  await fs.writeFile(
    "docs/subcategory-verification/visual.json",
    JSON.stringify(metrics, null, 2),
  );
} finally {
  await b.close();
}
