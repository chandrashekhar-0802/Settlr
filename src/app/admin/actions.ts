"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCALITIES } from "@/lib/pune";
import { isAdmin, supabaseServer } from "@/lib/supabase/server";

/** Every action re-checks admin status on the server; RLS enforces it again in the database. */
async function adminClient() {
  const sb = await supabaseServer();
  if (!sb || !(await isAdmin())) throw new Error("Not authorised");
  const { data } = await sb.auth.getUser();
  return { sb, uid: data.user!.id };
}

async function audit(sb: NonNullable<Awaited<ReturnType<typeof supabaseServer>>>, uid: string, action: string, target: string, details: object = {}) {
  await sb.from("admin_audit_logs").insert({ admin_id: uid, action, target, details });
}

const id = z.string().min(1).max(64);

export async function reviewApplication(form: FormData) {
  const { sb, uid } = await adminClient();
  const appId = id.parse(form.get("id"));
  const status = z.enum(["approved", "rejected"]).parse(form.get("status"));
  const { error } = await sb.from("provider_applications").update({ status, reviewed_by: uid, reviewed_at: new Date().toISOString() }).eq("id", appId);
  if (error) throw new Error("Update failed");
  await audit(sb, uid, `application.${status}`, appId);
  revalidatePath("/admin");
}

/** Creates an UNPUBLISHED, UNVERIFIED draft listing from an approved application for the admin to complete. */
export async function draftFromApplication(form: FormData) {
  const { sb, uid } = await adminClient();
  const appId = id.parse(form.get("id"));
  const { data: app } = await sb.from("provider_applications").select("*").eq("id", appId).single();
  if (!app || app.status !== "approved") throw new Error("Application must be approved first");
  const loc = LOCALITIES.find((l) => l.name === app.locality) ?? LOCALITIES[0];
  const kind = { accommodation: "pg", food: "tiffin", transport: "bike-rental", essentials: "laundry" }[app.category as string];
  const { data, error } = await sb
    .from("listings")
    .insert({ category: app.category, kind, name: app.business_name, locality: loc.name, lat: loc.lat, lng: loc.lng, description: app.services, price_note: app.pricing, provider_application_id: app.id, published: false, verified: false, is_demo: false })
    .select("id")
    .single();
  if (error) throw new Error("Could not create draft");
  await audit(sb, uid, "listing.draft_from_application", data.id, { application: appId });
  revalidatePath("/admin");
}

const listingSchema = z.object({
  id: z.string().max(64).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  category: z.enum(["accommodation", "food", "transport", "essentials"]),
  kind: z.string().trim().min(2).max(30),
  locality: z.string().refine((v) => LOCALITIES.some((l) => l.name === v), "Unknown locality"),
  description: z.string().trim().max(1500),
  monthly: z.coerce.number().int().min(0).max(1_000_000),
  oneTime: z.coerce.number().int().min(0).max(1_000_000),
  deposit: z.coerce.number().int().min(0).max(1_000_000),
  amenities: z.string().max(500),
});

export async function saveListing(form: FormData) {
  const { sb, uid } = await adminClient();
  const d = listingSchema.parse(Object.fromEntries(form));
  const loc = LOCALITIES.find((l) => l.name === d.locality)!;
  const row = {
    name: d.name, category: d.category, kind: d.kind, locality: d.locality, lat: loc.lat, lng: loc.lng, description: d.description,
    monthly: d.monthly, one_time: d.oneTime, deposit: d.deposit,
    amenities: d.amenities.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 20),
  };
  const q = d.id ? sb.from("listings").update(row).eq("id", d.id) : sb.from("listings").insert({ ...row, published: false });
  const { error } = await q;
  if (error) throw new Error("Save failed");
  await audit(sb, uid, d.id ? "listing.update" : "listing.create", d.id || d.name);
  revalidatePath("/admin");
}

export async function setListingFlag(form: FormData) {
  const { sb, uid } = await adminClient();
  const listingId = id.parse(form.get("id"));
  const flag = z.enum(["published", "verified"]).parse(form.get("flag"));
  const value = form.get("value") === "true";
  const note = z.string().trim().max(300).parse(form.get("note") ?? "");
  if (flag === "verified" && value && note.length < 10) throw new Error("Describe how the provider was verified (10+ characters).");
  const { error } = await sb.from("listings").update({ [flag]: value }).eq("id", listingId);
  if (error) throw new Error("Update failed");
  await audit(sb, uid, `listing.${flag}.${value}`, listingId, note ? { note } : {});
  revalidatePath("/admin");
  revalidatePath("/explore", "layout");
}

export async function setInquiryStatus(form: FormData) {
  const { sb, uid } = await adminClient();
  const inqId = id.parse(form.get("id"));
  const status = z.enum(["new", "contacted", "closed"]).parse(form.get("status"));
  const { error } = await sb.from("service_inquiries").update({ status }).eq("id", inqId);
  if (error) throw new Error("Update failed");
  await audit(sb, uid, `inquiry.${status}`, inqId);
  revalidatePath("/admin");
}

export async function resolveReport(form: FormData) {
  const { sb, uid } = await adminClient();
  const reportId = id.parse(form.get("id"));
  const { error } = await sb.from("listing_reports").update({ status: "resolved" }).eq("id", reportId);
  if (error) throw new Error("Update failed");
  await audit(sb, uid, "report.resolved", reportId);
  revalidatePath("/admin");
}
