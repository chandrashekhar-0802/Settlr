/**
 * Settlr planning engine: transparent, deterministic, rule-based. No AI.
 * Every recommendation carries human-readable reasons, and every number is reproducible from the inputs.
 */
import { estimateCommute, roadKm, type CommuteEstimate } from "./commute";
import type { Kind, Listing, Need, Priority, RelocationProfile } from "./types";

/** Share of the monthly budget we aim to spend per slot (sums to < 1 to leave savings headroom). */
export const BUDGET_SHARE: Record<string, number> = { accommodation: 0.45, food: 0.17, commute: 0.1, wifi: 0.04, furniture: 0.06, laundry: 0.04, cleaning: 0.05, essentials: 0.1 };

/** Which listing kinds can fill each plan slot. */
export const SLOT_KINDS: Record<Need, Kind[]> = {
  accommodation: ["pg", "flat", "hostel"],
  food: ["tiffin", "mess", "home-meals", "meal-subscription"],
  commute: ["metro", "bus", "bike-rental", "shared-ride", "cab", "walk"],
  wifi: ["wifi"],
  furniture: ["furniture"],
  laundry: ["laundry"],
  cleaning: ["cleaning"],
  essentials: ["grocery"],
};

/** Which plan slot a listing kind fills (undefined for kinds the planner doesn't use). */
export const slotFor = (kind: Kind) => (Object.keys(SLOT_KINDS) as Need[]).find((s) => SLOT_KINDS[s].includes(kind));

export const SLOT_LABEL: Record<Need, string> = {
  accommodation: "Stay",
  food: "Food",
  commute: "Commute",
  wifi: "Wi-Fi",
  furniture: "Furniture",
  laundry: "Laundry",
  cleaning: "Cleaning",
  essentials: "Groceries & essentials",
};

export type Scored = { listing: Listing; score: number; reasons: string[]; km?: number };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const has = (p: Priority[], x: Priority) => p.includes(x);

/** Budget fit: 1 when at/under target, falls to 0 at 2× target. */
export function budgetFit(cost: number, target: number) {
  if (target <= 0) return cost === 0 ? 1 : 0;
  return clamp01(1 - (cost - target) / target);
}

export function scoreListing(l: Listing, slot: Need, profile: RelocationProfile, from?: { lat: number; lng: number }): Scored {
  const pr = profile.priorities;
  const target = profile.budget * (BUDGET_SHARE[slot] ?? 0.05);
  const reasons: string[] = [];
  const w = { budget: has(pr, "save-money") ? 2 : 1, distance: has(pr, "close-to-work") ? 2 : 1, quality: has(pr, "better-stay") ? 2 : 1, trust: has(pr, "safety") ? 2 : 1 };

  const b = budgetFit(l.monthly, target);
  if (l.monthly <= target) reasons.push(`Within your ${SLOT_LABEL[slot].toLowerCase()} target of ₹${Math.round(target).toLocaleString("en-IN")}/mo`);
  else reasons.push(`₹${Math.round(l.monthly - target).toLocaleString("en-IN")} over your ${SLOT_LABEL[slot].toLowerCase()} target`);

  // Distance matters for the stay (to work) and food (to the stay, else to work).
  const anchor = slot === "accommodation" ? profile.workplace : from ?? profile.workplace;
  const km = l.locality === "Citywide" ? undefined : roadKm(l, anchor);
  const d = km == null ? 0.6 : clamp01(1 - km / 18);
  if (km != null && slot === "accommodation") reasons.push(`≈${km.toFixed(1)} km by road to ${profile.workplace.name} (estimate)`);
  if (km != null && slot === "food" && km < 4) reasons.push(`Serves near your stay (≈${km.toFixed(1)} km)`);

  let q = Math.min(1, l.amenities.length / 7);
  if (slot === "accommodation") {
    if (l.foodIncluded && has(pr, "food-convenience")) { q = Math.min(1, q + 0.3); reasons.push("Meals included — matches 'food convenience'"); }
    if (l.furnished) q = Math.min(1, q + 0.1);
    if (has(pr, "safety") && l.amenities.some((a) => a === "CCTV" || a === "Security guard")) reasons.push("Has CCTV / security");
  }
  if (slot === "food" && l.delivery?.includes("delivery") && has(pr, "food-convenience")) { q = Math.min(1, q + 0.3); reasons.push("Delivers to your door"); }

  const completeness = [l.description, l.amenities.length, l.monthly || l.oneTime].filter(Boolean).length / 3;
  const trust = l.verified ? 1 : 0.4;

  const total = w.budget + w.distance + w.quality + w.trust + 0.5;
  const score = (b * w.budget + d * w.distance + q * w.quality + trust * w.trust + completeness * 0.5) / total;
  if (!l.verified) reasons.push("Not yet verified by Settlr");
  return { listing: l, score: Math.round(score * 100), reasons, km };
}

export function rankForSlot(listings: Listing[], slot: Need, profile: RelocationProfile, from?: { lat: number; lng: number }) {
  return listings
    .filter((l) => SLOT_KINDS[slot].includes(l.kind))
    .map((l) => scoreListing(l, slot, profile, from))
    .sort((a, b) => b.score - a.score || a.listing.monthly - b.listing.monthly || a.listing.id.localeCompare(b.listing.id));
}

export function rankCommutes(modes: Listing[], km: number, profile: RelocationProfile): CommuteEstimate[] {
  const pr = profile.priorities;
  const target = profile.budget * BUDGET_SHARE.commute;
  const wCost = has(pr, "save-money") ? 2 : 1;
  const wConv = has(pr, "better-commute") || has(pr, "close-to-work") ? 2 : 1;
  return modes
    .filter((m) => SLOT_KINDS.commute.includes(m.kind))
    .map((m) => estimateCommute(m, km))
    .filter((e) => e.available)
    .sort((a, b) => {
      const s = (e: CommuteEstimate) => (budgetFit(e.monthly, target) * wCost + (e.convenience / 100) * wConv) / (wCost + wConv);
      return s(b) - s(a) || a.monthly - b.monthly;
    });
}

export type PlanLine = {
  slot: Need;
  listing: Listing | null;
  /** Why this slot is empty (e.g. covered by the stay) — shown instead of a provider. */
  coveredBy?: string;
  reasons: string[];
  monthly: number;
  oneTime: number;
  deposit: number;
  optional: boolean;
  commute?: CommuteEstimate;
  alternatives: Listing[];
};

export type Plan = {
  lines: PlanLine[];
  totals: { monthly: number; oneTime: number; deposits: number; optionalMonthly: number; moveIn: number; remaining: number; overBudget: boolean };
};

/** "none" = user explicitly removed the slot. */
export type Choices = Partial<Record<Need, string | "none">>;

const ESSENTIAL_SLOTS: Need[] = ["wifi", "furniture", "laundry", "cleaning", "essentials"];

export function buildPlan(listings: Listing[], profile: RelocationProfile, choices: Choices = {}): Plan {
  const byId = new Map(listings.map((l) => [l.id, l]));
  const needs = new Set(profile.needs);
  const lines: PlanLine[] = [];
  const choose = (slot: Need, ranked: Scored[]) => {
    const c = choices[slot];
    if (c === "none") return null;
    const chosen = c ? byId.get(c) : undefined;
    if (chosen) return { listing: chosen, reasons: ["Your pick"], km: undefined } as Scored;
    return ranked[0] ?? null;
  };

  // 1. Stay
  let stay: Listing | null = null;
  if (needs.has("accommodation")) {
    const ranked = rankForSlot(listings, "accommodation", profile);
    const pick = choose("accommodation", ranked);
    stay = pick?.listing ?? null;
    lines.push(line("accommodation", pick, ranked));
  }
  const home = stay ?? profile.workplace;

  // 2. Food — skipped when the stay already includes meals (no double counting).
  if (needs.has("food")) {
    if (stay?.foodIncluded && !choices.food) {
      lines.push(covered("food", `Meals are included at ${stay.name}`, rankForSlot(listings, "food", profile, home)));
    } else {
      const ranked = rankForSlot(listings, "food", profile, home);
      lines.push(line("food", choose("food", ranked), ranked));
    }
  }

  // 3. Commute — from the chosen stay (or workplace area) to work.
  if (needs.has("commute")) {
    const km = stay ? roadKm(stay, profile.workplace) : 0;
    const ranked = rankCommutes(listings, km, profile);
    const c = choices.commute;
    const est = c === "none" ? undefined : (c && ranked.find((e) => e.mode.id === c)) || ranked[0];
    lines.push({
      slot: "commute",
      listing: est?.mode ?? null,
      reasons: est
        ? [
            stay ? `≈${km.toFixed(1)} km by road, about ${est.minutes} min each way (estimate)` : "Pick a stay to estimate your commute distance",
            `Convenience ${est.convenience}/100`,
          ]
        : [],
      monthly: stay ? est?.monthly ?? 0 : 0,
      oneTime: 0,
      deposit: est?.mode.deposit ?? 0,
      optional: false,
      commute: est,
      alternatives: ranked.map((e) => e.mode).filter((m) => m.id !== est?.mode.id),
    });
  }

  // 4. Essentials — avoid paying for what the stay already includes.
  for (const slot of ESSENTIAL_SLOTS) {
    if (!needs.has(slot)) continue;
    if (slot === "wifi" && stay?.wifiIncluded && !choices.wifi) { lines.push(covered("wifi", `Wi-Fi is included at ${stay.name}`, rankForSlot(listings, "wifi", profile, home))); continue; }
    if (slot === "laundry" && stay?.laundryIncluded && !choices.laundry) { lines.push(covered("laundry", `Laundry is included at ${stay.name}`, rankForSlot(listings, "laundry", profile, home))); continue; }
    const ranked = rankForSlot(listings, slot, profile, home);
    const l = line(slot, choose(slot, ranked), ranked);
    // Furniture on a furnished stay, and cleaning generally, are optional extras.
    if ((slot === "furniture" && stay?.furnished) || slot === "cleaning") {
      l.optional = true;
      if (slot === "furniture") l.reasons.unshift("Optional — your stay is already furnished");
    }
    lines.push(l);
  }

  const core = lines.filter((l) => !l.optional);
  const monthly = sum(core.map((l) => l.monthly));
  const oneTime = sum(core.map((l) => l.oneTime));
  const deposits = sum(core.map((l) => l.deposit));
  const optionalMonthly = sum(lines.filter((l) => l.optional).map((l) => l.monthly));
  return {
    lines,
    totals: { monthly, oneTime, deposits, optionalMonthly, moveIn: monthly + oneTime + deposits, remaining: profile.budget - monthly, overBudget: monthly > profile.budget },
  };
}

function line(slot: Need, pick: Scored | null, ranked: Scored[]): PlanLine {
  const l = pick?.listing ?? null;
  return {
    slot,
    listing: l,
    reasons: pick?.reasons ?? [],
    monthly: l?.monthly ?? 0,
    oneTime: l?.oneTime ?? 0,
    deposit: l?.deposit ?? 0,
    optional: false,
    alternatives: ranked.map((r) => r.listing).filter((x) => x.id !== l?.id).slice(0, 8),
  };
}

function covered(slot: Need, why: string, ranked: Scored[]): PlanLine {
  return { slot, listing: null, coveredBy: why, reasons: [why], monthly: 0, oneTime: 0, deposit: 0, optional: false, alternatives: ranked.map((r) => r.listing).slice(0, 8) };
}

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
