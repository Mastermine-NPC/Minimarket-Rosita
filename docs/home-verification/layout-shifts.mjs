const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.addInitScript(() => {
  window.shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      window.shifts.push({
        at: e.startTime,
        value: e.value,
        input: e.hadRecentInput,
        sources: e.sources.map((s) => ({
          node: s.node?.outerHTML?.slice(0, 220),
          previous: s.previousRect.toJSON(),
          current: s.currentRect.toJSON(),
        })),
      });
  }).observe({ type: "layout-shift", buffered: true });
});
await p.goto("http://127.0.0.1:4173");
await p.waitForTimeout(2500);
console.log("INITIAL", JSON.stringify(await p.evaluate(() => window.shifts)));
await p.mouse.wheel(0, 240);
await p.waitForTimeout(500);
await p.locator(".home-carousel-viewport").scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
console.log("SCROLL", JSON.stringify(await p.evaluate(() => window.shifts)));
await b.close();
