import { roadKm } from "./commute";
import type { Listing, Workplace } from "./types";

export type Filters = {
  q: string;
  maxPrice: number | null;
  localities: string[];
  kinds: string[];
  sharing: string[];
  amenities: string[];
  furnished: boolean;
  foodIncluded: boolean;
  verifiedOnly: boolean;
  diet: string;
  maxKm: number | null;
  sort: "recommended" | "price-asc" | "price-desc" | "distance";
  page: number;
};

export const EMPTY_FILTERS: Filters = {
  q: "", maxPrice: null, localities: [], kinds: [], sharing: [], amenities: [],
  furnished: false, foodIncluded: false, verifiedOnly: false, diet: "", maxKm: null, sort: "recommended", page: 1,
};

export const PAGE_SIZE = 9;

export function applyFilters(all: Listing[], f: Filters, workplace?: Workplace) {
  const q = f.q.trim().toLowerCase();
  const withKm = all.map((l) => ({ l, km: workplace && l.locality !== "Citywide" ? roadKm(l, workplace) : undefined }));
  const out = withKm.filter(({ l, km }) => {
    if (q && !`${l.name} ${l.locality} ${l.description} ${l.amenities.join(" ")}`.toLowerCase().includes(q)) return false;
    if (f.maxPrice != null && l.monthly > f.maxPrice) return false;
    if (f.localities.length && !f.localities.includes(l.locality)) return false;
    if (f.kinds.length && !f.kinds.includes(l.kind)) return false;
    if (f.sharing.length && (!l.sharing || !f.sharing.includes(l.sharing))) return false;
    if (f.amenities.length && !f.amenities.every((a) => l.amenities.includes(a))) return false;
    if (f.furnished && !l.furnished) return false;
    if (f.foodIncluded && !l.foodIncluded) return false;
    if (f.verifiedOnly && !l.verified) return false;
    if (f.diet && l.diet && l.diet !== f.diet && l.diet !== "both") return false;
    if (f.maxKm != null && (km == null || km > f.maxKm)) return false;
    return true;
  });
  const by = {
    "price-asc": (a: (typeof out)[0], b: (typeof out)[0]) => a.l.monthly - b.l.monthly,
    "price-desc": (a: (typeof out)[0], b: (typeof out)[0]) => b.l.monthly - a.l.monthly,
    distance: (a: (typeof out)[0], b: (typeof out)[0]) => (a.km ?? 1e9) - (b.km ?? 1e9),
    recommended: (a: (typeof out)[0], b: (typeof out)[0]) =>
      Number(b.l.verified) - Number(a.l.verified) || (a.km ?? 99) / 2 + a.l.monthly / 4000 - ((b.km ?? 99) / 2 + b.l.monthly / 4000),
  }[f.sort];
  out.sort(by);
  const pages = Math.max(1, Math.ceil(out.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  return { total: out.length, pages, page, items: out.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}
