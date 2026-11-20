import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ExploreView } from "@/components/listing/ExploreView";
import { getListings } from "@/lib/listings";

const META = {
  accommodation: { title: "Accommodation in Pune", body: "PGs, shared flats and hostels. Filter by rent, area, sharing, amenities and distance to work." },
  food: { title: "Food & tiffin services", body: "Tiffins, messes, home-style meals and monthly meal plans near you." },
  essentials: { title: "Essential services", body: "Wi-Fi, laundry, cleaning, furniture rental, movers, groceries and repairs." },
} as const;
type Cat = keyof typeof META;

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(META).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: META[category as Cat]?.title ?? "Explore" };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ kind?: string }> }) {
  const { category } = await params;
  if (!(category in META)) notFound();
  const { kind } = await searchParams;
  const listings = await getListings(category as Cat);
  const m = META[category as Cat];
  return (
    <>
      <PageHeader eyebrow="Explore Pune" title={m.title} body={m.body} />
      <ExploreView key={kind ?? "all"} listings={listings} category={category as Cat} initialKind={kind} />
    </>
  );
}
