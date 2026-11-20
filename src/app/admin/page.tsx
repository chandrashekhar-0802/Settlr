import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge, btn, inputCls, inr } from "@/components/ui";
import { LOCALITIES } from "@/lib/pune";
import { currentUser, isAdmin, supabaseServer } from "@/lib/supabase/server";
import { draftFromApplication, resolveReport, reviewApplication, saveListing, setInquiryStatus, setListingFlag } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader app />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-8 sm:px-6">{children}</main>
    </>
  );
}

function Locked({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <Shell>
      <div className="mx-auto max-w-xl rounded-[28px] bg-white p-8 text-center shadow-soft ring-1 ring-line/70">
        <p className="text-xs font-bold uppercase tracking-widest text-blue">Admin</p>
        <h1 className="mt-2 text-2xl font-extrabold">{title}</h1>
        <div className="mt-3 text-sm text-muted">{body}</div>
      </div>
    </Shell>
  );
}

export default async function AdminPage() {
  const sb = await supabaseServer();
  if (!sb)
    return (
      <Locked
        title="Admin requires a configured backend"
        body={<p>This deployment runs in demo mode. Admin tools need Supabase so permissions can be enforced in the database — see SETUP.md. There is deliberately no client-side admin switch.</p>}
      />
    );
  const user = await currentUser();
  if (!user) return <Locked title="Please log in" body={<Link className={btn("primary", "mt-2")} href="/login?next=/admin">Log in</Link>} />;
  if (!(await isAdmin())) return <Locked title="You don't have access" body={<p>This area is restricted to Settlr administrators.</p>} />;

  const [apps, inquiries, listings, reports, logs] = await Promise.all([
    sb.from("provider_applications").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("service_inquiries").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("listings").select("id,name,category,kind,locality,monthly,one_time,deposit,description,amenities,published,verified,is_demo").order("updated_at", { ascending: false }).limit(200),
    sb.from("listing_reports").select("*").eq("status", "open").order("created_at", { ascending: false }),
    sb.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(20),
  ]);
  const cats = ["accommodation", "food", "transport", "essentials"];

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Admin</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {user.email}. Every change is checked server-side and recorded in the audit log.</p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="Admin sections">
        {["applications", "inquiries", "listings", "reports", "categories", "audit"].map((s) => (
          <a key={s} href={`#${s}`} className="rounded-full bg-white px-4 py-2 font-semibold capitalize ring-1 ring-line">{s}</a>
        ))}
      </nav>

      <Section id="applications" title={`Provider applications (${apps.data?.filter((a) => a.status === "pending").length ?? 0} pending)`}>
        {apps.data?.length ? apps.data.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white p-5 ring-1 ring-line/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">{a.business_name} <span className="font-normal text-muted">· {a.category} · {a.locality}</span></p>
              <Badge tone={a.status === "pending" ? "sun" : a.status === "approved" ? "mint" : "coral"}>{a.status}</Badge>
            </div>
            <p className="mt-2 text-sm">{a.services}</p>
            <p className="mt-1 text-xs text-muted">Pricing: {a.pricing} · {a.contact_name} · {a.email} · {a.phone}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.status === "pending" && (["approved", "rejected"] as const).map((s) => (
                <form key={s} action={reviewApplication}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="status" value={s} />
                  <button className={btn(s === "approved" ? "primary" : "secondary")}>{s === "approved" ? "Approve" : "Reject"}</button>
                </form>
              ))}
              {a.status === "approved" && (
                <form action={draftFromApplication}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className={btn("secondary")}>Create draft listing</button>
                </form>
              )}
            </div>
          </div>
        )) : <Empty>No applications yet.</Empty>}
      </Section>

      <Section id="inquiries" title="Inquiries">
        {inquiries.data?.length ? (
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line/70">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="p-3">Listing</th><th className="p-3">From</th><th className="p-3">Message</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {inquiries.data.map((i) => (
                  <tr key={i.id} className="border-t border-line align-top">
                    <td className="p-3 font-semibold">{i.listing_name}</td>
                    <td className="p-3">{i.name}<br /><span className="text-xs text-muted">{i.email}{i.phone ? ` · ${i.phone}` : ""}</span></td>
                    <td className="max-w-sm p-3">{i.message}</td>
                    <td className="p-3">
                      <form action={setInquiryStatus} className="flex gap-1">
                        <input type="hidden" name="id" value={i.id} />
                        <select name="status" defaultValue={i.status} className="min-h-9 rounded-lg px-2 ring-1 ring-line" aria-label="Inquiry status">
                          <option>new</option><option>contacted</option><option>closed</option>
                        </select>
                        <button className="rounded-lg bg-navy px-3 text-xs font-semibold text-white">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No inquiries yet.</Empty>}
      </Section>

      <Section id="listings" title={`Listings (${listings.data?.length ?? 0})`}>
        <details className="rounded-2xl bg-white p-5 ring-1 ring-line/70">
          <summary className="cursor-pointer font-bold">+ Create a listing</summary>
          <ListingForm />
        </details>
        {listings.data?.map((l) => (
          <details key={l.id} className="rounded-2xl bg-white p-4 ring-1 ring-line/70">
            <summary className="flex cursor-pointer flex-wrap items-center gap-2">
              <span className="font-semibold">{l.name}</span>
              <span className="text-xs text-muted">{l.kind} · {l.locality} · {inr(l.monthly)}/mo</span>
              {l.is_demo && <Badge tone="sun">Demo</Badge>}
              <Badge tone={l.published ? "mint" : "muted"}>{l.published ? "Published" : "Draft"}</Badge>
              {l.verified && <Badge tone="blue">Verified</Badge>}
            </summary>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={setListingFlag}>
                <input type="hidden" name="id" value={l.id} /><input type="hidden" name="flag" value="published" /><input type="hidden" name="value" value={String(!l.published)} />
                <button className={btn("secondary")}>{l.published ? "Unpublish" : "Publish"}</button>
              </form>
              <form action={setListingFlag} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={l.id} /><input type="hidden" name="flag" value="verified" /><input type="hidden" name="value" value={String(!l.verified)} />
                {!l.verified && <input name="note" required minLength={10} placeholder="How was this verified? (site visit, documents…)" className={`${inputCls} w-80`} />}
                <button className={btn("secondary")} disabled={l.is_demo}>{l.verified ? "Remove verification" : "Mark verified"}</button>
              </form>
            </div>
            <ListingForm l={l} />
          </details>
        ))}
      </Section>

      <Section id="reports" title={`Reported listings (${reports.data?.length ?? 0} open)`}>
        {reports.data?.length ? reports.data.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-line/70">
            <p className="text-sm"><Link href={`/services/${r.listing_id}`} className="font-semibold text-blue">{r.listing_id}</Link> — {r.reason}</p>
            <form action={resolveReport}><input type="hidden" name="id" value={r.id} /><button className={btn("secondary")}>Mark resolved</button></form>
          </div>
        )) : <Empty>No open reports.</Empty>}
      </Section>

      <Section id="categories" title="Categories">
        <div className="grid gap-3 sm:grid-cols-4">
          {cats.map((c) => (
            <div key={c} className="rounded-2xl bg-white p-4 ring-1 ring-line/70">
              <p className="font-semibold capitalize">{c}</p>
              <p className="text-xs text-muted">{listings.data?.filter((l) => l.category === c).length ?? 0} listings</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">Categories and kinds are fixed in code and database constraints for the MVP, so the planner and filters stay consistent.</p>
      </Section>

      <Section id="audit" title="Recent admin activity">
        <ul className="divide-y divide-line rounded-2xl bg-white ring-1 ring-line/70">
          {logs.data?.length ? logs.data.map((g) => (
            <li key={g.id} className="flex justify-between gap-3 p-3 text-sm"><span><strong>{g.action}</strong> · {g.target}</span><span className="text-xs text-muted">{new Date(g.created_at).toLocaleString("en-IN")}</span></li>
          )) : <li className="p-3 text-sm text-muted">Nothing yet.</li>}
        </ul>
      </Section>
    </Shell>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24 space-y-3">
      <h2 className="text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">{children}</p>;
}

type Row = { id: string; name: string; category: string; kind: string; locality: string; monthly: number; one_time: number; deposit: number; description: string; amenities: string[] };
function ListingForm({ l }: { l?: Row }) {
  return (
    <form action={saveListing} className="mt-4 grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="id" value={l?.id ?? ""} />
      <input name="name" defaultValue={l?.name} required placeholder="Name" aria-label="Name" className={inputCls} />
      <select name="category" defaultValue={l?.category ?? "accommodation"} aria-label="Category" className={inputCls}>
        {["accommodation", "food", "transport", "essentials"].map((c) => <option key={c}>{c}</option>)}
      </select>
      <input name="kind" defaultValue={l?.kind ?? "pg"} required placeholder="Kind (pg, flat, tiffin…)" aria-label="Kind" className={inputCls} />
      <select name="locality" defaultValue={l?.locality ?? LOCALITIES[0].name} aria-label="Locality" className={inputCls}>
        {LOCALITIES.map((x) => <option key={x.name}>{x.name}</option>)}
      </select>
      <input name="monthly" type="number" min={0} defaultValue={l?.monthly ?? 0} aria-label="Monthly ₹" className={inputCls} />
      <input name="oneTime" type="number" min={0} defaultValue={l?.one_time ?? 0} aria-label="One-time ₹" className={inputCls} />
      <input name="deposit" type="number" min={0} defaultValue={l?.deposit ?? 0} aria-label="Deposit ₹" className={inputCls} />
      <input name="amenities" defaultValue={l?.amenities?.join(", ")} placeholder="Amenities, comma separated" aria-label="Amenities" className={`${inputCls} sm:col-span-2`} />
      <textarea name="description" defaultValue={l?.description} rows={2} placeholder="Description" aria-label="Description" className={`${inputCls} py-2 sm:col-span-3`} />
      <button className={btn("primary", "sm:col-span-3 sm:justify-self-start")}>{l ? "Save changes" : "Create draft"}</button>
    </form>
  );
}
