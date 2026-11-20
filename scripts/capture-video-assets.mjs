// Captures real Settlr screens (2x, 1920×1080 viewport) for the explainer video.
// node scripts/capture-video-assets.mjs [baseUrl]  → video/assets/screens/*.jpg + hero.webm
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, renameSync, readdirSync, rmSync, writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = "video/assets/screens";
mkdirSync(out, { recursive: true });
const state = {
  profile: { city: "pune", workplace: { name: "Hinjewadi Phase 1", area: "Hinjewadi", lat: 18.5912, lng: 73.738 }, moveDate: "2027-01-15", budget: 25000, priorities: ["close-to-work", "food-convenience"], needs: ["accommodation", "food", "commute", "wifi", "laundry", "furniture"], name: "Asha" },
  saved: ["acc-5", "acc-6", "food-3"], compare: ["acc-5", "acc-6", "acc-9"], choices: {}, checklist: null, inquiries: [],
};
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const next = async (p) => { await p.locator("main form").evaluate((f) => f.requestSubmit()); await p.waitForTimeout(400); };
const rects = {};
// Records CSS-pixel boxes (1920×1080 viewport) of key elements so the video camera can frame them exactly.
const SEL = {
  "home-hero": ["h1", "main a[href='/onboarding']"],
  "home-problem": ["section:nth-of-type(2) ol", "section:nth-of-type(2) h2"],
  "home-how": ["#how-it-works figure", "#how-it-works ol"],
  "onb-city": ["main form"], "onb-work": ["main form"], "onb-date": ["main form"], "onb-budget": ["main form"], "onb-priorities": ["main form"],
  dashboard: ["main section:nth-of-type(1)", "#video-h"],
  "dashboard-widgets": ["main > div > div > div:nth-of-type(3)"],
  "explore-stays": ["main article", "aside[aria-label='Filters']", "[data-testid='result-count']"],
  "explore-food": ["main article"],
  "explore-transport": ["main article", "main aside"],
  "my-plan": ["main ol > li", "main aside"],
  budget: ["main [role='img']", "main table", "main .grid > div:nth-child(2) > div"],
  checklist: ["main aside", "main section"],
  compare: ["main table"],
};
const box = async (p, name) => {
  rects[name] = await p.evaluate((sels) => Object.fromEntries(sels.map((s) => { const e = document.querySelector(s); if (!e) return [s, null]; const r = e.getBoundingClientRect(); return [s, { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }]; })), SEL[name] ?? []);
};
const save = async (p, name, opts = {}) => {
  await box(p, name);
  const png = await p.screenshot(opts);
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(`${out}/${name}.jpg`);
  console.log("shot", name);
};

// Fresh visitor: home + onboarding
{
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  await save(p, "home-hero");
  await p.evaluate(() => document.querySelector("h2")?.closest("section")?.scrollIntoView({ block: "start" }));
  await p.addStyleTag({ content: ".reveal,.parallax{animation:none!important}" });
  await p.waitForTimeout(800);
  await save(p, "home-problem");
  await p.evaluate(() => document.getElementById("how-it-works")?.scrollIntoView({ block: "start" }));
  await p.waitForTimeout(800);
  await p.getByRole("button", { name: /Build your settling plan/ }).hover();
  await p.waitForTimeout(1200);
  await save(p, "home-how");
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(base + "/onboarding", { waitUntil: "networkidle" });
  await save(p, "onb-city");
  await next(p);
  await save(p, "onb-work");
  await next(p);
  await save(p, "onb-date");
  await next(p);
  await p.getByLabel("Or type an amount (₹)").fill("25000");
  await save(p, "onb-budget");
  await next(p);
  await p.getByRole("button", { name: "Food convenience" }).click();
  await save(p, "onb-priorities");
  await ctx.close();
}

// Returning user with a plan
{
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await ctx.addInitScript((s) => { if (!localStorage.getItem("settlr:v1")) localStorage.setItem("settlr:v1", JSON.stringify(s)); }, state);
  const p = await ctx.newPage();
  for (const [route, name] of [["/dashboard", "dashboard"], ["/explore/accommodation", "explore-stays"], ["/explore/food", "explore-food"], ["/explore/transport", "explore-transport"], ["/my-plan", "my-plan"], ["/budget", "budget"], ["/checklist", "checklist"], ["/compare", "compare"]]) {
    await p.goto(base + route, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await save(p, name);
  }
  await p.goto(base + "/dashboard", { waitUntil: "networkidle" });
  await p.evaluate(() => window.scrollTo(0, 1100));
  await p.waitForTimeout(500);
  await save(p, "dashboard-widgets");
  await ctx.close();
}

// Short real recording of the live 3D hero (pointer parallax)
{
  const tmp = "video/assets/_rec";
  rmSync(tmp, { recursive: true, force: true });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: tmp, size: { width: 1920, height: 1080 } } });
  const p = await ctx.newPage();
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(5000);
  for (let i = 0; i <= 60; i++) {
    await p.mouse.move(1200 + Math.sin(i / 10) * 300, 500 + Math.cos(i / 12) * 150);
    await p.waitForTimeout(100);
  }
  await ctx.close();
  const f = readdirSync(tmp).find((x) => x.endsWith(".webm"));
  renameSync(`${tmp}/${f}`, `${out}/hero-raw.webm`);
  rmSync(tmp, { recursive: true, force: true });
  console.log("recorded hero-raw.webm");
}
await b.close();
writeFileSync("video/script/rects.json", JSON.stringify(rects, null, 1));
console.log("wrote video/script/rects.json");
