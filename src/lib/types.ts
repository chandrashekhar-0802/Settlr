export type Category = "accommodation" | "food" | "transport" | "essentials";

export type Kind =
  | "pg" | "flat" | "hostel"
  | "tiffin" | "mess" | "home-meals" | "meal-subscription"
  | "metro" | "bus" | "bike-rental" | "shared-ride" | "cab" | "walk"
  | "wifi" | "laundry" | "cleaning" | "furniture" | "moving" | "grocery" | "household" | "maintenance";

export type Listing = {
  id: string;
  category: Category;
  kind: Kind;
  name: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  /** Recurring monthly cost in INR (0 when not recurring). */
  monthly: number;
  /** One-time setup / installation / service cost in INR. */
  oneTime: number;
  /** Refundable deposit in INR. */
  deposit: number;
  priceNote?: string;
  amenities: string[];
  /** True only after a real admin verification. Seeded demo data is never verified. */
  verified: boolean;
  /** Sample data shown with a DEMO badge. */
  isDemo: boolean;
  // accommodation
  sharing?: "single" | "double" | "triple";
  furnished?: boolean;
  foodIncluded?: boolean;
  wifiIncluded?: boolean;
  laundryIncluded?: boolean;
  gender?: "any" | "men" | "women";
  // food
  diet?: "veg" | "non-veg" | "both";
  mealsPerDay?: number;
  timings?: string;
  serviceDays?: string;
  delivery?: ("delivery" | "pickup" | "dine-in")[];
  // transport (assumption-driven estimates, see lib/commute.ts)
  speedKmh?: number;
  perKm?: number;
  fixedMonthly?: number;
  maxKm?: number;
};

export type Workplace = { name: string; area: string; lat: number; lng: number };

export type Priority = "save-money" | "close-to-work" | "better-stay" | "better-commute" | "food-convenience" | "safety";

/** Plan slots: one per thing the user needs. Essentials are per-kind. */
export type Need = "accommodation" | "food" | "commute" | "wifi" | "furniture" | "laundry" | "cleaning" | "essentials";

export type RelocationProfile = {
  city: string;
  workplace: Workplace;
  moveDate: string; // yyyy-mm-dd
  budget: number; // monthly INR
  priorities: Priority[];
  needs: Need[];
  name?: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  category: string;
  due: string | null;
  done: boolean;
};

export type Inquiry = { id: string; listingId: string; listingName: string; message: string; createdAt: string; delivered: boolean };
