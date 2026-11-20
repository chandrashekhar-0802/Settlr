import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { fieldErrors, providerSchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/email";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!rateLimit(`prov:${clientIp(req)}`, 3)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const parsed = providerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;
  if (d.hp) return NextResponse.json({ ok: true, stored: false });

  const sb = await supabaseServer();
  if (!sb) return NextResponse.json({ ok: true, stored: false, demo: true });

  // RLS only allows inserting status = 'pending'; verification is a separate admin step.
  const { error } = await sb.from("provider_applications").insert({
    business_name: d.businessName,
    category: d.category,
    locality: d.locality,
    contact_name: d.contactName,
    email: d.email,
    phone: d.phone,
    services: d.services,
    pricing: d.pricing,
    website: d.website || null,
    notes: d.notes || null,
  });
  if (error) {
    console.error("provider application insert failed:", error.code);
    return NextResponse.json({ error: "Could not submit right now. Please try again." }, { status: 500 });
  }
  const emailed = await sendEmail(d.email, "We received your Settlr provider application", `Hi ${d.contactName},\n\nThanks for applying to list ${d.businessName} on Settlr. Your application is pending review; we'll contact you before anything is published.\n\n— Settlr`);
  return NextResponse.json({ ok: true, stored: true, emailed });
}
