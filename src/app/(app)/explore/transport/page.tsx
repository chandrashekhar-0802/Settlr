import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TransportView } from "@/components/listing/TransportView";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Commute options" };

export default async function TransportPage() {
  const modes = await getListings("transport");
  return (
    <>
      <PageHeader
        eyebrow="Explore Pune"
        title="Your daily commute"
        body="Compare bus, metro, bike rental, shared rides, cabs and walking — estimated from your area to your workplace. These are estimates from stated assumptions, not live travel times."
      />
      <TransportView modes={modes} />
    </>
  );
}
