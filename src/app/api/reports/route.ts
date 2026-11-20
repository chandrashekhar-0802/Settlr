import { NextResponse } from "next/server";
import { z } from "zod";
import { getListing } from "@/lib/listings";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { supabaseServer } from "@/lib/supabase/server";

const schema = z.object({ listingId: z.string().min(1).max(64), reason: z.string().trim().min(5, "Tell us what's wrong (5+ characters)").max(500) });

export async function POST(req: Request) {
  if (!rateLimit(`rep:${clientIp(req)}`, 5)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  if (!(await getListing(parsed.data.listingId))) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const sb = await supabaseServer();
  if (!sb) return NextResponse.json({ ok: true, stored: false });
  const { data: u } = await sb.auth.getUser();
  const { error } = await sb.from("listing_reports").insert({ listing_id: parsed.data.listingId, reason: parsed.data.reason, user_id: u.user?.id ?? null });
  if (error) return NextResponse.json({ error: "Could not file the report." }, { status: 500 });
  return NextResponse.json({ ok: true, stored: true });
}
