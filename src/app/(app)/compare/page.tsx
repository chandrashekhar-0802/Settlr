import type { Metadata } from "next";
import { CompareView } from "@/components/app/SavedCompare";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Compare" };

export default async function Page() {
  return <CompareView listings={await getListings()} />;
}
