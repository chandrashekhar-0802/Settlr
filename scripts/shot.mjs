// Dev helper: node scripts/shot.mjs <url> <out.png> [width] [height] [fullPage 0|1]
import { chromium } from "@playwright/test";
const [,, url, out, w = "1440", h = "900", full = "0"] = process.argv;
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, reducedMotion: full === "1" ? "reduce" : "no-preference" });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
await p.screenshot({ path: out, fullPage: full === "1" });
console.log("errors:", JSON.stringify(errs.slice(0, 8)));
await b.close();
