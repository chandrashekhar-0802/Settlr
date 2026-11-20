// Lists elements that stick out of a 390px viewport: node scripts/overflow.mjs <url>
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() =>
  localStorage.setItem(
    "settlr:v1",
    JSON.stringify({ profile: { city: "pune", workplace: { name: "Hinjewadi Phase 1", area: "Hinjewadi", lat: 18.5912, lng: 73.738 }, moveDate: "2027-01-15", budget: 25000, priorities: [], needs: ["accommodation", "food", "commute", "wifi", "laundry", "furniture"] }, saved: [], compare: ["acc-5", "acc-6", "acc-9"], choices: {}, checklist: null, inquiries: [] }),
  ),
);
const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const out = await p.evaluate(() => {
  const wide = [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > 391 && !e.closest("table"));
  return [`scrollWidth=${document.documentElement.scrollWidth}`, ...wide.slice(0, 6).map((e) => `${e.tagName}.${String(e.className).slice(0, 70)} right=${Math.round(e.getBoundingClientRect().right)}`)].join("\n");
});
console.log(out);
await b.close();
