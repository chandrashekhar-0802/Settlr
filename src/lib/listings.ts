import "server-only";
import { DEMO_LISTINGS } from "./demo-data";
import { supabaseServer } from "./supabase/server";
import type { Category, Listing } from "./types";

/**
 * Listings source. Demo mode → bundled sample data (all flagged isDemo).
 * Connected mode → only published rows from Supabase (which may include seeded demo rows, still flagged is_demo).
 * The two sources are never mixed.
 */
export async function getListings(category?: Category): Promise<Listing[]> {
  const sb = await supabaseServer();
  if (!sb) return category ? DEMO_LISTINGS.filter((l) => l.category === category) : DEMO_LISTINGS;
  let q = sb.from("listings").select("*").eq("published", true).eq("city", "pune");
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) {
    console.error("listings query failed:", error.code);
    return [];
  }
  return (data ?? []).map(fromRow);
}

export async function getListing(id: string) {
  const all = await getListings();
  return all.find((l) => l.id === id) ?? null;
}

/** DB row (snake_case + jsonb attrs) → Listing */
export function fromRow(r: Record<string, unknown>): Listing {
  const attrs = (r.attrs ?? {}) as Partial<Listing>;
  return {
    ...attrs,
    id: String(r.id),
    category: r.category as Category,
    kind: r.kind as Listing["kind"],
    name: String(r.name),
    locality: String(r.locality),
    city: String(r.city),
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: String(r.description ?? ""),
    monthly: Number(r.monthly ?? 0),
    oneTime: Number(r.one_time ?? 0),
    deposit: Number(r.deposit ?? 0),
    priceNote: (r.price_note as string) ?? undefined,
    amenities: (r.amenities as string[]) ?? [],
    verified: Boolean(r.verified),
    isDemo: Boolean(r.is_demo),
  };
}
