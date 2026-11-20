import type { Listing } from "./types";

/** Great-circle distance in km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Roads are rarely straight: estimate road distance as straight line × 1.35. */
export const ROAD_FACTOR = 1.35;
export const WORKDAYS_PER_MONTH = 22;

export function roadKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return haversineKm(a, b) * ROAD_FACTOR;
}

export type CommuteEstimate = {
  mode: Listing;
  km: number;
  minutes: number;
  monthly: number;
  /** 0–100, higher is more convenient (time-dominated, penalises transfers/walking far). */
  convenience: number;
  available: boolean;
  method: string;
};

const TRANSFER_PENALTY: Record<string, number> = { bus: 12, metro: 10, "shared-ride": 4, cab: 0, "bike-rental": 0, walk: 0 };

/** Pure estimate from stored coordinates and the mode's stated assumptions. Never a live travel time. */
export function estimateCommute(mode: Listing, km: number): CommuteEstimate {
  const speed = mode.speedKmh ?? 20;
  const available = mode.maxKm == null || km <= mode.maxKm;
  const minutes = Math.round((km / speed) * 60 + (TRANSFER_PENALTY[mode.kind] ?? 0) / 2);
  const monthly = Math.round((mode.fixedMonthly ?? 0) + (mode.perKm ?? 0) * km * 2 * WORKDAYS_PER_MONTH);
  const convenience = available ? Math.max(5, Math.min(100, Math.round(100 - minutes * 1.1 - (TRANSFER_PENALTY[mode.kind] ?? 0)))) : 0;
  return {
    mode,
    km,
    minutes,
    monthly,
    convenience,
    available,
    method: `Road distance ≈ straight line × ${ROAD_FACTOR}; ${speed} km/h average; ${mode.perKm ? `₹${mode.perKm}/km` : "no per-km cost"}${mode.fixedMonthly ? ` + ₹${mode.fixedMonthly}/month` : ""}; ${WORKDAYS_PER_MONTH} workdays, 2 trips/day.`,
  };
}
