import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Icon, type IconName } from "@/components/icons";
import { Badge } from "@/components/ui";
import { getListings } from "@/lib/listings";
import { LOCALITIES } from "@/lib/pune";
import { ExploreMap } from "@/components/listing/ExploreMap";

export const metadata: Metadata = { title: "Explore Pune" };

const CATS: { href: string; cat: string; icon: IconName; title: string; body: string; tone: string }[] = [
  { href: "/explore/accommodation", cat: "accommodation", icon: "home", title: "Accommodation", body: "PGs, flats & hostels", tone: "bg-blue-soft text-blue" },
  { href: "/explore/food", cat: "food", icon: "food", title: "Food", body: "Tiffins, messes & meal plans", tone: "bg-coral-soft text-coral" },
  { href: "/explore/transport", cat: "transport", icon: "bus", title: "Transport", body: "Commute estimates to work", tone: "bg-sun-soft text-[#9a7414]" },
  { href: "/explore/essentials", cat: "essentials", icon: "basket", title: "Essentials", body: "Wi-Fi, laundry, furniture & more", tone: "bg-mint-soft text-mint" },
];

export default async function ExplorePage() {
  const all = await getListings();
  return (
    <>
      <PageHeader eyebrow="Pune" title="Explore services" body="Everything you need to settle in, organised by category. All listings in this MVP are labelled demo data." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATS.map((c) => (
          <Link key={c.href} href={c.href} className="lift rounded-[var(--radius-card)] bg-white p-6 shadow-soft ring-1 ring-line/70">
            <span className={`grid size-12 place-items-center rounded-xl ${c.tone}`}>
              <Icon name={c.icon} size={24} />
            </span>
            <p className="mt-5 text-lg font-bold">{c.title}</p>
            <p className="text-sm text-muted">{c.body}</p>
            <p className="mt-4 text-xs font-semibold text-blue">
              {c.cat === "transport" ? "6 modes" : `${all.filter((l) => l.category === c.cat).length} listings`} →
            </p>
          </Link>
        ))}
      </div>
      <h2 className="mt-14 text-xl font-extrabold">Neighbourhoods</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LOCALITIES.map((l) => {
          const stays = all.filter((x) => x.category === "accommodation" && x.locality === l.name);
          const from = stays.length ? Math.min(...stays.map((s) => s.monthly)) : null;
          return (
            <div key={l.name} className="rounded-2xl bg-white p-5 ring-1 ring-line/70">
              <div className="flex items-center justify-between">
                <p className="font-bold">{l.name}</p>
                <Badge>{stays.length} stays</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{l.blurb}</p>
              {from != null && <p className="mt-3 text-sm">Demo stays from <strong>₹{from.toLocaleString("en-IN")}</strong>/mo</p>}
            </div>
          );
        })}
      </div>
      <h2 className="mt-14 text-xl font-extrabold">Map</h2>
      <div className="mt-4">
        <ExploreMap items={all.filter((l) => l.category !== "transport")} />
      </div>
    </>
  );
}
