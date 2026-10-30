const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const b = await chromium.launch();
let result = [];
for (const [name, url] of [
  ["animals", "https://lesanimals.digital/equipe/"],
  ["lightship", "https://www.lightshiprv.com/"],
]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const response = await p
    .goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
    .catch(() => null);
  await p.waitForTimeout(2500);
  await p.screenshot({
    path: "./docs/home-verification/references/" + name + "-top.png",
  });
  const before = await p.locator("body").innerText();
  await p.mouse.move(1100, 600);
  await p.waitForTimeout(200);
  await p.mouse.wheel(0, 700);
  await p.waitForTimeout(1200);
  await p.screenshot({
    path: "./docs/home-verification/references/" + name + "-scroll.png",
  });
  const audit = await p.evaluate(() => ({
    cursor: getComputedStyle(document.body).cursor,
    videos: [...document.querySelectorAll("video")].map((v) => ({
      autoplay: v.autoplay,
      muted: v.muted,
      paused: v.paused,
    })),
    animated: [...document.querySelectorAll("*")]
      .filter((e) => getComputedStyle(e).transform !== "none")
      .slice(0, 14)
      .map((e) => ({
        tag: e.tagName,
        cls: e.className?.baseVal || e.className,
        transform: getComputedStyle(e).transform,
      })),
    scroll: scrollY,
  }));
  result.push({
    name,
    url,
    status: response?.status(),
    text: before.slice(0, 400),
    audit,
  });
  await p.close();
}
await fs.writeFile(
  "./docs/home-verification/references/references.json",
  JSON.stringify(result, null, 2),
);
console.log(result);
await b.close();
