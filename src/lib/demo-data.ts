/**
 * DEMO DATA. Every record here is fictional sample data, shown with a DEMO badge and never marked verified.
 * Prices are plausible ranges for Pune used to exercise the planner — not quotes from real providers.
 * Generated deterministically so ids and numbers are stable across builds and tests.
 */
import { LOCALITIES } from "./pune";
import type { Kind, Listing } from "./types";

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = rng(20261121);
const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
const round = (n: number, to = 100) => Math.round(n / to) * to;
const jitter = (lat: number, lng: number) => ({ lat: +(lat + (r() - 0.5) * 0.02).toFixed(5), lng: +(lng + (r() - 0.5) * 0.02).toFixed(5) });

// Rent multiplier per locality (relative, illustrative).
const PRICE: Record<string, number> = { Hinjewadi: 1, Wakad: 0.97, Baner: 1.18, Kharadi: 1.12, "Viman Nagar": 1.2, Hadapsar: 0.9, "Pimpri-Chinchwad": 0.85 };

const STAY_NAMES = ["Nest", "Commons", "Residency", "Living", "House", "Stay", "Homes", "Quarters"];
const STAY_PREFIX = ["Maple", "Sahyadri", "Banyan", "Lotus", "Indigo", "Coral", "Skyline", "Tulsi", "Monsoon", "Meadow", "Pebble", "Amber"];
const AMEN = ["Wi-Fi", "Power backup", "Housekeeping", "Laundry", "CCTV", "Security guard", "Gym", "Attached bathroom", "AC", "Parking", "Hot water", "Lift", "Fridge", "Washing machine"];

const stays: Listing[] = [];
let n = 0;
for (const loc of LOCALITIES) {
  const kinds: ("pg" | "flat" | "hostel")[] = ["pg", "pg", "flat", "hostel"];
  for (const kind of kinds) {
    n++;
    const sharing = kind === "flat" ? pick(["single", "double"] as const) : pick(["single", "double", "triple"] as const);
    const base = { pg: 10500, flat: 17000, hostel: 7000 }[kind];
    const share = { single: 1.35, double: 1, triple: 0.8 }[sharing];
    const monthly = round(base * share * PRICE[loc.name] * (0.9 + r() * 0.25), 250);
    const foodIncluded = kind !== "flat" && r() > 0.35;
    const wifiIncluded = kind !== "flat" ? r() > 0.25 : r() > 0.7;
    const furnished = kind !== "flat" || r() > 0.4;
    const amenities = [...new Set([
      ...(wifiIncluded ? ["Wi-Fi"] : []),
      ...AMEN.filter((a) => a !== "Wi-Fi" && r() > 0.55),
    ])];
    const laundryIncluded = amenities.includes("Laundry");
    stays.push({
      id: `acc-${n}`,
      category: "accommodation",
      kind,
      name: `${pick(STAY_PREFIX)} ${pick(STAY_NAMES)} ${kind === "hostel" ? "Hostel" : kind === "flat" ? "Apartments" : "PG"}`,
      locality: loc.name,
      city: "pune",
      ...jitter(loc.lat, loc.lng),
      description:
        kind === "flat"
          ? `A ${sharing === "single" ? "1 RK" : "2 BHK shared"} apartment in ${loc.name}. ${furnished ? "Comes furnished" : "Unfurnished — budget for furniture"}; utilities billed separately.`
          : `${sharing[0].toUpperCase() + sharing.slice(1)}-sharing ${kind === "pg" ? "paying-guest rooms" : "hostel beds"} in ${loc.name}. ${foodIncluded ? "Meals included." : "Meals not included."}`,
      monthly,
      oneTime: kind === "flat" ? round(monthly * 0.5, 500) : 0, // brokerage / maintenance setup on flats
      deposit: round(monthly * (kind === "flat" ? 3 : kind === "pg" ? 1.5 : 1), 500),
      priceNote: kind === "flat" ? "One-time cost is an illustrative brokerage/setup estimate." : undefined,
      amenities,
      verified: false,
      isDemo: true,
      sharing,
      furnished,
      foodIncluded,
      wifiIncluded,
      laundryIncluded,
      gender: kind === "flat" ? "any" : pick(["any", "men", "women"] as const),
    });
  }
}

const FOOD_NAMES = ["Annapurna", "Ghar Ka Khana", "Thali House", "Aai's Kitchen", "Daily Dabba", "Spice Route", "Green Leaf", "Tiffin Tales", "Rasoi", "Mess Express", "Homestyle Bowls", "Swad"];
const food: Listing[] = [];
const foodKinds: Kind[] = ["tiffin", "mess", "home-meals", "meal-subscription"];
LOCALITIES.forEach((loc, i) => {
  for (let j = 0; j < 2; j++) {
    const kind = foodKinds[(i + j) % foodKinds.length];
    const meals = kind === "mess" ? 2 : pick([1, 2, 2]);
    const diet = pick(["veg", "veg", "both", "non-veg"] as const);
    food.push({
      id: `food-${food.length + 1}`,
      category: "food",
      kind,
      name: `${FOOD_NAMES[(i * 2 + j) % FOOD_NAMES.length]} ${kind === "mess" ? "Mess" : kind === "tiffin" ? "Tiffins" : kind === "home-meals" ? "Home Meals" : "Meal Plan"}`,
      locality: loc.name,
      city: "pune",
      ...jitter(loc.lat, loc.lng),
      description: `${meals === 2 ? "Lunch and dinner" : "One meal a day"} — ${diet === "veg" ? "pure veg" : diet === "both" ? "veg and non-veg options" : "non-veg focused"} home-style food${kind === "tiffin" ? ", delivered" : ""}.`,
      monthly: round((meals === 2 ? 3600 : 2100) * (0.9 + r() * 0.35) * (diet === "non-veg" ? 1.15 : 1), 100),
      oneTime: 0,
      deposit: kind === "meal-subscription" ? 500 : 0,
      amenities: [kind === "tiffin" ? "Doorstep delivery" : "Fresh daily", ...(r() > 0.5 ? ["Weekly menu"] : []), ...(r() > 0.6 ? ["Sunday special"] : [])],
      verified: false,
      isDemo: true,
      diet,
      mealsPerDay: meals,
      timings: meals === 2 ? "Lunch 12:30–2:30 · Dinner 8:00–10:00" : "Dinner 8:00–10:00",
      serviceDays: pick(["Mon–Sat", "All days", "Mon–Fri"]),
      delivery: kind === "tiffin" ? ["delivery"] : kind === "mess" ? ["dine-in", "pickup"] : ["delivery", "pickup"],
    });
  }
});

/**
 * Transport "listings" are commute MODES with explicit cost/speed assumptions — not live fares or timetables.
 * lib/commute.ts turns them into per-user estimates.
 */
const transport: Listing[] = [
  { kind: "bus", name: "City bus (PMPML) — estimate", speedKmh: 16, perKm: 1.6, fixedMonthly: 0, desc: "Public bus. Assumes ~16 km/h door-to-door including waits and a fare of ~₹1.6/km; check PMPML for passes and routes." },
  { kind: "metro", name: "Pune Metro + feeder — estimate", speedKmh: 24, perKm: 2.2, fixedMonthly: 0, desc: "Metro with a short auto/walk at each end. Coverage depends on your exact route; route data is not configured, so treat this as a rough estimate only." },
  { kind: "bike-rental", name: "Monthly bike rental — estimate", speedKmh: 24, perKm: 2.5, fixedMonthly: 3200, desc: "Rented scooter/bike on a monthly plan plus fuel (~₹2.5/km). Parking and helmet are your responsibility." },
  { kind: "shared-ride", name: "Shared auto / bike-taxi — estimate", speedKmh: 20, perKm: 9, fixedMonthly: 0, desc: "App-based shared autos or bike taxis. Assumes ~₹9/km; surge pricing not modelled." },
  { kind: "cab", name: "Cab (ride-hailing) — estimate", speedKmh: 22, perKm: 18, fixedMonthly: 0, desc: "Private cab each way. Fastest door-to-door but the most expensive; assumes ~₹18/km, no surge." },
  { kind: "walk", name: "Walk", speedKmh: 4.5, perKm: 0, fixedMonthly: 0, maxKm: 2.5, desc: "Free and reliable if you live within ~2.5 km of work." },
].map((t, i) => ({
  id: `tr-${i + 1}`,
  category: "transport" as const,
  kind: t.kind as Kind,
  name: t.name,
  locality: "Citywide",
  city: "pune",
  lat: 18.55,
  lng: 73.84,
  description: t.desc,
  monthly: t.fixedMonthly,
  oneTime: 0,
  deposit: t.kind === "bike-rental" ? 2000 : 0,
  priceNote: "Estimate based on stated assumptions, not live fares.",
  amenities: [],
  verified: false,
  isDemo: true,
  speedKmh: t.speedKmh,
  perKm: t.perKm,
  fixedMonthly: t.fixedMonthly,
  maxKm: t.maxKm,
}));

const ESS: { kind: Kind; label: string; monthly: [number, number]; oneTime: [number, number]; deposit?: number; desc: string; names: string[] }[] = [
  { kind: "wifi", label: "Broadband", monthly: [550, 999], oneTime: [0, 1500], desc: "Home broadband, 100–300 Mbps plans. Installation may apply.", names: ["Swift Fibre", "LinkUp Broadband", "Zip Net"] },
  { kind: "laundry", label: "Laundry", monthly: [900, 1600], oneTime: [0, 0], desc: "Weekly pickup wash-and-fold subscription.", names: ["Fold & Fresh", "Spin Cycle Co."] },
  { kind: "cleaning", label: "Home cleaning", monthly: [1500, 2600], oneTime: [0, 0], desc: "Room/apartment cleaning, 3 visits a week.", names: ["Neat Nook", "SparkleHome"] },
  { kind: "furniture", label: "Furniture rental", monthly: [1400, 3200], oneTime: [0, 500], deposit: 3000, desc: "Bed, mattress, study table and chair on a monthly plan.", names: ["RentRoom Furnish", "Easy Nest Rentals"] },
  { kind: "moving", label: "Movers", monthly: [0, 0], oneTime: [3500, 9000], desc: "Intercity/local shifting of boxes and a two-wheeler. One-time.", names: ["Swift Shift Movers", "BoxBuddy Packers"] },
  { kind: "grocery", label: "Groceries", monthly: [2500, 3500], oneTime: [0, 0], desc: "Monthly staples estimate for one person via local kirana or quick commerce.", names: ["Kirana Monthly Basket"] },
  { kind: "household", label: "Household setup kit", monthly: [0, 0], oneTime: [2500, 4500], desc: "Bucket, bedsheets, kitchen basics, extension board — one-time starter kit.", names: ["Starter Home Kit"] },
  { kind: "maintenance", label: "Repairs on call", monthly: [0, 0], oneTime: [300, 600], desc: "Electrician/plumber visits, priced per visit.", names: ["FixIt Local"] },
];
const essentials: Listing[] = [];
for (const e of ESS) {
  e.names.forEach((name, i) => {
    const loc = LOCALITIES[(essentials.length * 3) % LOCALITIES.length];
    essentials.push({
      id: `ess-${essentials.length + 1}`,
      category: "essentials",
      kind: e.kind,
      name,
      locality: e.kind === "grocery" || e.kind === "household" ? "Citywide" : loc.name,
      city: "pune",
      ...jitter(loc.lat, loc.lng),
      description: e.desc,
      monthly: round(e.monthly[0] + (e.monthly[1] - e.monthly[0]) * (i ? 0.25 : 0.7), 50),
      oneTime: round(e.oneTime[0] + (e.oneTime[1] - e.oneTime[0]) * (i ? 0.3 : 0.6), 50),
      deposit: e.deposit ?? 0,
      amenities: [e.label],
      verified: false,
      isDemo: true,
    });
  });
}

export const DEMO_LISTINGS: Listing[] = [...stays, ...food, ...transport, ...essentials];
