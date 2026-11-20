import { inr } from "./format";
import type { Listing } from "./types";

/** Shared by server and client components (kept out of "use client" files). */
export const KIND_LABEL: Record<string, string> = {
  pg: "PG", flat: "Flat", hostel: "Hostel", tiffin: "Tiffin", mess: "Mess", "home-meals": "Home meals", "meal-subscription": "Meal plan",
  metro: "Metro", bus: "Bus", "bike-rental": "Bike rental", "shared-ride": "Shared ride", cab: "Cab", walk: "Walk",
  wifi: "Wi-Fi", laundry: "Laundry", cleaning: "Cleaning", furniture: "Furniture", moving: "Movers", grocery: "Groceries", household: "Household", maintenance: "Repairs",
};

export function priceLine(l: Listing) {
  if (l.category === "transport") return l.fixedMonthly ? `${inr(l.fixedMonthly)}/mo + usage` : "Pay per trip";
  if (l.monthly) return `${inr(l.monthly)}/mo`;
  if (l.oneTime) return `${inr(l.oneTime)} one-time`;
  return "Price on request";
}
