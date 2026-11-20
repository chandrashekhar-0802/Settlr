// Captures the live 3D hero as the static poster/fallback image: node scripts/capture-poster.mjs [baseUrl]
import { chromium } from "@playwright/test";
import sharp from "sharp";
const base = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto(base + "/", { waitUntil: "networkidle" });
await p.addStyleTag({ content: "html,body,section{background:transparent!important} section>div:first-child{display:none}" });
await p.waitForSelector("canvas");
await p.waitForTimeout(5000);
const el = await p.$("canvas");
const png = await el.screenshot({ omitBackground: true });
await sharp(png).resize({ width: 1400 }).webp({ quality: 82, alphaQuality: 90 }).toFile("public/hero-city.webp");
console.log("wrote public/hero-city.webp");
await b.close();
