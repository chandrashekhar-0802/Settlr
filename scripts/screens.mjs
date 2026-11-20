// Screenshot sweep: node scripts/screens.mjs [baseUrl] [routes,comma,separated]
// Seeds a demo relocation profile in localStorage so app pages render with data.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3100";
const routes = (process.argv[3] ?? "/,/onboarding,/dashboard,/explore,/explore/accommodation,/explore/food,/explore/transport,/explore/essentials,/my-plan,/budget,/compare,/checklist,/services/acc-5,/for-employers,/provider/apply,/admin,/help").split(",");
const widths = (process.env.WIDTHS ?? "1440,1024,390").split(",").map(Number);
const state = {
  profile: { city: "pune", workplace: { name: "Hinjewadi Phase 1", area: "Hinjewadi", lat: 18.5912, lng: 73.738 }, moveDate: "2027-01-15", budget: 25000, priorities: ["close-to-work", "food-convenience"], needs: ["accommodation", "food", "commute", "wifi", "laundry", "furniture"], name: "Asha" },
  saved: ["acc-5", "acc-6", "food-3"], compare: ["acc-5", "acc-6", "acc-9"], choices: {}, checklist: null, inquiries: [],
};
mkdirSync("shots", { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript((s) => { if (!localStorage.getItem("settlr:v1")) localStorage.setItem("settlr:v1", JSON.stringify(s)); }, state);
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: "networkidle" });
    await p.waitForTimeout(r === "/" ? 2500 : 600);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const name = `shots/${w}${r.replaceAll("/", "_") || "_home"}.png`;
    await p.screenshot({ path: name, fullPage: true });
    console.log(`${w} ${r} overflow=${overflow}${errs.length ? " ERR " + errs.join(" | ") : ""}`);
    errs.length = 0;
  }
  await ctx.close();
}
await b.close();
