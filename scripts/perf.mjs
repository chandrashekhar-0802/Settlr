// Measures LCP, CLS and transferred JS for a page: node scripts/perf.mjs [url] [width]
import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://localhost:3100/";
const width = +(process.argv[3] ?? 1440);
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width, height: width < 600 ? 844 : 900 } });
const cdp = await p.context().newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 });
let js = 0;
p.on("response", async (r) => { if (r.url().endsWith(".js")) js += Number((await r.headerValue("content-length")) ?? (await r.body()).length); });
await p.addInitScript(() => {
  window.__lcp = 0; window.__cls = 0;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
});
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
const m = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3), fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0) }));
console.log(JSON.stringify({ url, width, ...m, jsKB: Math.round(js / 1024) }));
await b.close();
