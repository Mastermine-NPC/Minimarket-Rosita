const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://127.0.0.1:4173");
await p.locator(".home-magnetic-primary").hover();
await p.waitForTimeout(200);
const dark = await p
  .locator(".presentation-cursor>div")
  .evaluate((e) => ({
    color: getComputedStyle(e).color,
    background: getComputedStyle(e).backgroundColor,
    transition: getComputedStyle(e).transitionProperty,
  }));
await p.locator(".home-carousel-viewport").scrollIntoViewIfNeeded();
await p.locator(".home-product-slide a").first().hover();
const light = await p
  .locator(".presentation-cursor>div")
  .evaluate((e) => ({
    color: getComputedStyle(e).color,
    background: getComputedStyle(e).backgroundColor,
    transition: getComputedStyle(e).transitionProperty,
  }));
assert.equal(dark.background, "rgb(244, 184, 200)");
assert.equal(dark.color, "rgb(23, 35, 29)");
assert.equal(light.background, "rgb(20, 90, 70)");
assert.equal(light.color, "rgb(255, 255, 255)");
assert(!light.transition.includes("background"));
await fs.writeFile(
  "docs/home-verification/cursor-contraste.json",
  JSON.stringify({ dark, light, passed: true }, null, 2),
);
await b.close();
