import { describe, expect, it } from "vitest";
import { DEMO_LISTINGS } from "@/lib/demo-data";
import { budgetFit, buildPlan, rankCommutes, rankForSlot } from "@/lib/plan";
import { estimateCommute, haversineKm, roadKm, WORKDAYS_PER_MONTH } from "@/lib/commute";
import { applyFilters, EMPTY_FILTERS, PAGE_SIZE } from "@/lib/filters";
import { defaultChecklist } from "@/lib/checklist";
import { addDays, inr } from "@/lib/format";
import { WORKPLACES } from "@/lib/pune";
import type { Listing, RelocationProfile } from "@/lib/types";

const profile: RelocationProfile = {
  city: "pune",
  workplace: WORKPLACES[0],
  moveDate: "2027-01-10",
  budget: 25000,
  priorities: ["close-to-work"],
  needs: ["accommodation", "food", "commute", "wifi", "furniture", "laundry"],
};

const base: Omit<Listing, "id" | "kind" | "category"> = {
  name: "T", locality: "Hinjewadi", city: "pune", lat: 18.5913, lng: 73.7389, description: "x",
  monthly: 0, oneTime: 0, deposit: 0, amenities: ["Wi-Fi"], verified: false, isDemo: true,
};

describe("demo data", () => {
  it("is all flagged demo and never verified", () => {
    expect(DEMO_LISTINGS.length).toBeGreaterThan(50);
    expect(DEMO_LISTINGS.every((l) => l.isDemo && !l.verified)).toBe(true);
    expect(new Set(DEMO_LISTINGS.map((l) => l.id)).size).toBe(DEMO_LISTINGS.length);
  });
});

describe("geo + commute", () => {
  it("haversine is ~0 for same point and plausible across Pune", () => {
    expect(haversineKm(WORKPLACES[0], WORKPLACES[0])).toBe(0);
    const d = haversineKm(WORKPLACES[0], WORKPLACES[2]); // Hinjewadi → Kharadi ≈ 22 km straight line
    expect(d).toBeGreaterThan(18);
    expect(d).toBeLessThan(26);
  });
  it("monthly cost = fixed + perKm × km × 2 × workdays", () => {
    const mode = { ...base, id: "m", kind: "bike-rental", category: "transport", perKm: 2, fixedMonthly: 1000, speedKmh: 20 } as Listing;
    const e = estimateCommute(mode, 10);
    expect(e.monthly).toBe(1000 + 2 * 10 * 2 * WORKDAYS_PER_MONTH);
    expect(e.minutes).toBe(30 + 2); // ride + parking/wait
  });
  it("applies minimum fares, so a cab never wins a very short trip on cost", () => {
    const cab = DEMO_LISTINGS.find((l) => l.kind === "cab")!;
    expect(estimateCommute(cab, 0.5).monthly).toBe(100 * 2 * WORKDAYS_PER_MONTH);
    const best = rankCommutes(DEMO_LISTINGS, 0.6, profile)[0];
    expect(best.mode.kind).toBe("walk");
  });
  it("walking is unavailable beyond its range", () => {
    const walk = DEMO_LISTINGS.find((l) => l.kind === "walk")!;
    expect(estimateCommute(walk, 1).available).toBe(true);
    expect(estimateCommute(walk, 5).available).toBe(false);
  });
});

describe("plan engine", () => {
  it("budgetFit is 1 under target, 0 at 2× target", () => {
    expect(budgetFit(500, 1000)).toBe(1);
    expect(budgetFit(2000, 1000)).toBe(0);
    expect(budgetFit(1500, 1000)).toBeCloseTo(0.5);
  });

  it("prefers closer stays when close-to-work is a priority", () => {
    const near = { ...base, id: "near", category: "accommodation", kind: "pg", monthly: 11000 } as Listing;
    const far = { ...base, id: "far", category: "accommodation", kind: "pg", monthly: 11000, lat: 18.5515, lng: 73.9348 } as Listing;
    expect(rankForSlot([far, near], "accommodation", profile)[0].listing.id).toBe("near");
  });

  it("does not double count food/Wi-Fi/laundry included in the stay", () => {
    const stay = { ...base, id: "s", category: "accommodation", kind: "pg", monthly: 10000, deposit: 15000, foodIncluded: true, wifiIncluded: true, laundryIncluded: true, furnished: true } as Listing;
    const tiffin = { ...base, id: "f", category: "food", kind: "tiffin", monthly: 3000 } as Listing;
    const wifi = { ...base, id: "w", category: "essentials", kind: "wifi", monthly: 700, oneTime: 1000 } as Listing;
    const plan = buildPlan([stay, tiffin, wifi], profile);
    expect(plan.lines.find((l) => l.slot === "food")?.coveredBy).toMatch(/Meals are included/);
    expect(plan.lines.find((l) => l.slot === "wifi")?.coveredBy).toMatch(/Wi-Fi is included/);
    expect(plan.totals.monthly).toBe(10000); // commute is 0 km here (same point → walk)
    expect(plan.totals.deposits).toBe(15000);
    expect(plan.totals.moveIn).toBe(10000 + 0 + 15000);
  });

  it("totals separate monthly, one-time, deposits and optional extras", () => {
    const stay = { ...base, id: "s", category: "accommodation", kind: "flat", monthly: 15000, oneTime: 7500, deposit: 45000, furnished: true } as Listing;
    const furn = { ...base, id: "fu", category: "essentials", kind: "furniture", monthly: 2000, deposit: 3000 } as Listing;
    const p = buildPlan([stay, furn], { ...profile, needs: ["accommodation", "furniture"] });
    expect(p.totals.monthly).toBe(15000);
    expect(p.totals.oneTime).toBe(7500);
    expect(p.totals.deposits).toBe(45000);
    expect(p.totals.optionalMonthly).toBe(2000); // furnished stay → furniture optional, excluded from total
    expect(p.totals.remaining).toBe(25000 - 15000);
    expect(p.totals.overBudget).toBe(false);
  });

  it("user replacement recalculates; 'none' removes a slot", () => {
    const a = { ...base, id: "a", category: "accommodation", kind: "pg", monthly: 9000 } as Listing;
    const b = { ...base, id: "b", category: "accommodation", kind: "pg", monthly: 30000 } as Listing;
    const p = buildPlan([a, b], { ...profile, needs: ["accommodation"] }, { accommodation: "b" });
    expect(p.lines[0].listing?.id).toBe("b");
    expect(p.totals.overBudget).toBe(true);
    expect(buildPlan([a, b], { ...profile, needs: ["accommodation"] }, { accommodation: "none" }).totals.monthly).toBe(0);
  });

  it("builds a full plan from demo data deterministically", () => {
    const p1 = buildPlan(DEMO_LISTINGS, profile);
    const p2 = buildPlan(DEMO_LISTINGS, profile);
    expect(p1).toEqual(p2);
    expect(p1.lines.map((l) => l.slot)).toEqual(["accommodation", "food", "commute", "wifi", "furniture", "laundry"]);
    expect(p1.lines.every((l) => l.reasons.length > 0 || l.listing === null)).toBe(true);
  });
});

describe("filters", () => {
  it("filters by price, locality and paginates", () => {
    const stays = DEMO_LISTINGS.filter((l) => l.category === "accommodation");
    const r = applyFilters(stays, { ...EMPTY_FILTERS, maxPrice: 12000, localities: ["Wakad", "Hinjewadi"] });
    expect(r.items.every(({ l }) => l.monthly <= 12000 && ["Wakad", "Hinjewadi"].includes(l.locality))).toBe(true);
    const all = applyFilters(stays, EMPTY_FILTERS);
    expect(all.items.length).toBe(Math.min(PAGE_SIZE, stays.length));
    expect(all.pages).toBe(Math.ceil(stays.length / PAGE_SIZE));
  });
  it("sorts by price ascending", () => {
    const r = applyFilters(DEMO_LISTINGS.filter((l) => l.category === "food"), { ...EMPTY_FILTERS, sort: "price-asc" });
    const prices = r.items.map(({ l }) => l.monthly);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
  it("distance filter uses the workplace", () => {
    const r = applyFilters(DEMO_LISTINGS.filter((l) => l.category === "accommodation"), { ...EMPTY_FILTERS, maxKm: 5 }, WORKPLACES[0]);
    expect(r.items.every(({ km }) => km != null && km <= 5)).toBe(true);
    expect(roadKm(WORKPLACES[0], WORKPLACES[0])).toBe(0);
  });
});

describe("checklist + format", () => {
  it("due dates follow the move date", () => {
    const items = defaultChecklist("2027-01-10");
    expect(items.find((i) => i.title.startsWith("Sign and return"))?.due).toBe("2026-12-11");
    expect(addDays("2027-03-01", -1)).toBe("2027-02-28");
  });
  it("formats INR with Indian grouping", () => {
    expect(inr(125000)).toBe("₹1,25,000");
  });
});
