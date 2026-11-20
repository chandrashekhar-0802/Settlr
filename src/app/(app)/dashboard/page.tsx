import type { Metadata } from "next";
import { DashboardView } from "@/components/app/DashboardView";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function Page() {
  return <DashboardView listings={await getListings()} />;
}
