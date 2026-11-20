import { addDays } from "./format";
import type { ChecklistItem } from "./types";

export const CHECKLIST_CATEGORIES = [
  "Important documents",
  "Work joining documents",
  "Accommodation",
  "Packing",
  "Travel",
  "Household setup",
  "Essentials",
  "First-week tasks",
] as const;

/** [category, title, days relative to move date] */
const DEFAULTS: [string, string, number][] = [
  ["Important documents", "Keep Aadhaar, PAN and passport copies (digital + 2 printed sets)", -21],
  ["Important documents", "Collect degree certificates and mark sheets", -21],
  ["Work joining documents", "Sign and return the offer letter", -30],
  ["Work joining documents", "Prepare relieving letter / internship certificate and bank details for payroll", -14],
  ["Work joining documents", "Keep 4 passport-size photos for HR and ID card", -10],
  ["Accommodation", "Shortlist 3 stays on Settlr and compare them", -21],
  ["Accommodation", "Visit or video-call the stay before paying any deposit", -10],
  ["Accommodation", "Get a written receipt / rent agreement for the deposit", -5],
  ["Packing", "Pack clothes for 2 weeks, chargers and medicines", -3],
  ["Packing", "Book movers if shifting boxes or a two-wheeler", -12],
  ["Travel", "Book train / bus / flight to Pune", -14],
  ["Travel", "Plan the route from the station or airport to your stay", -2],
  ["Household setup", "Buy bedsheets, bucket, basic kitchen items", 1],
  ["Essentials", "Set up Wi-Fi (if not included) and a local SIM / port number", 2],
  ["Essentials", "Start a tiffin or mess subscription", 1],
  ["First-week tasks", "Do a trial commute to the office before joining day", -1],
  ["First-week tasks", "Update address with your bank and employer", 7],
  ["First-week tasks", "Find the nearest clinic, pharmacy and grocery store", 3],
];

export function defaultChecklist(moveDate: string): ChecklistItem[] {
  return DEFAULTS.map(([category, title, offset], i) => ({
    id: `d${i + 1}`,
    category,
    title,
    due: addDays(moveDate, offset),
    done: false,
  }));
}
