import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingArt } from "@/components/listing/ListingArt";
import { KIND_LABEL, priceLine, TrustBadges } from "@/components/listing/ListingCard";
import { ServiceActions } from "@/components/listing/ServiceActions";
import { inr } from "@/components/ui";
import { getListing } from "@/lib/listings";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const l = await getListing((await params).id);
  return { title: l ? `${l.name} · ${l.locality}` : "Service not found" };
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const l = await getListing((await params).id);
  if (!l) notFound();
  const facts: [string, string][] = [
    ["Type", KIND_LABEL[l.kind]],
    ["Area", l.locality],
    ...(l.sharing ? ([["Sharing", l.sharing[0].toUpperCase() + l.sharing.slice(1)]] as [string, string][]) : []),
    ...(l.furnished != null ? ([["Furnishing", l.furnished ? "Furnished" : "Unfurnished"]] as [string, string][]) : []),
    ...(l.gender ? ([["Residents", l.gender === "any" ? "Anyone" : `${l.gender[0].toUpperCase()}${l.gender.slice(1)} only`]] as [string, string][]) : []),
    ...(l.diet ? ([["Diet", l.diet === "both" ? "Veg & non-veg" : l.diet === "veg" ? "Veg" : "Non-veg"]] as [string, string][]) : []),
    ...(l.timings ? ([["Meal timings", l.timings]] as [string, string][]) : []),
    ...(l.serviceDays ? ([["Service days", l.serviceDays]] as [string, string][]) : []),
    ...(l.delivery ? ([["Options", l.delivery.map((d) => d.replace("-", " ")).join(", ")]] as [string, string][]) : []),
  ];
  const back = l.category === "accommodation" || l.category === "food" || l.category === "transport" ? `/explore/${l.category}` : "/explore/essentials";
  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/explore" className="hover:text-navy">Explore</Link> / <Link href={back} className="hover:text-navy capitalize">{l.category}</Link> / <span className="text-navy">{l.name}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-[28px] ring-1 ring-line/70">
            <ListingArt listing={l} className="aspect-[16/9] w-full" />
          </div>
          <p className="mt-2 text-xs text-muted">Illustration — no verified photos for demo listings.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold">{l.name}</h1>
            <TrustBadges l={l} />
          </div>
          <p className="mt-3 text-muted">{l.description}</p>
          <dl className="mt-8 grid gap-4 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line/70 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="font-semibold capitalize">{v}</dd>
              </div>
            ))}
          </dl>
          {l.amenities.length > 0 && (
            <>
              <h2 className="mt-8 font-bold">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <li key={a} className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-line">{a}</li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-8 rounded-[var(--radius-card)] bg-sun-soft p-5 text-sm text-[#6b4f08]">
            <p className="font-bold">Before you pay anything</p>
            <p className="mt-1">{l.verified ? "This provider has been verified by Settlr." : "This provider has not been verified by Settlr."} Visit or video-call first, get a written receipt for any deposit, and never pay to an unknown personal account.</p>
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-line/70">
            <p className="text-3xl font-extrabold">{priceLine(l)}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Monthly</dt><dd className="font-semibold">{inr(l.monthly)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">One-time</dt><dd className="font-semibold">{inr(l.oneTime)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Refundable deposit</dt><dd className="font-semibold">{inr(l.deposit)}</dd></div>
            </dl>
            {l.priceNote && <p className="mt-3 text-xs text-muted">{l.priceNote}</p>}
            <ServiceActions l={l} />
          </div>
        </aside>
      </div>
    </article>
  );
}
