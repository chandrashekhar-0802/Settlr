import { NextResponse } from "next/server";
import { getListing } from "@/lib/listings";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { fieldErrors, inquirySchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/email";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!rateLimit(`inq:${clientIp(req)}`, 5)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true, stored: false }); // honeypot

  const listing = await getListing(d.listingId);
  if (!listing) return NextResponse.json({ error: "That listing is no longer available." }, { status: 404 });

  const sb = await supabaseServer();
  if (!sb) {
    // Demo mode: validated, but nothing is stored server-side or sent to anyone.
    return NextResponse.json({ ok: true, stored: false, emailed: false, demo: true });
  }
  const { data: u } = await sb.auth.getUser();
  const { error } = await sb.from("service_inquiries").insert({
    listing_id: listing.id,
    listing_name: listing.name,
    user_id: u.user?.id ?? null,
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    move_date: d.moveDate || null,
    message: d.message,
  });
  if (error) {
    console.error("inquiry insert failed:", error.code);
    return NextResponse.json({ error: "Could not save your inquiry. Please try again." }, { status: 500 });
  }
  const emailed = await sendEmail(d.email, `Your Settlr inquiry: ${listing.name}`, `Hi ${d.name},\n\nWe received your inquiry about ${listing.name} (${listing.locality}). The Settlr team will review it and follow up.\n\n— Settlr`);
  return NextResponse.json({ ok: true, stored: true, emailed, demo: listing.isDemo });
}
