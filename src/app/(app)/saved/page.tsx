import type { Metadata } from "next";
import { SavedView } from "@/components/app/SavedCompare";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default async function Page() {
  return <SavedView listings={await getListings()} />;
}
