import type { Metadata } from "next";
import { MyPlanView } from "@/components/app/MyPlanView";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "My plan", robots: { index: false } };

export default async function Page() {
  return <MyPlanView listings={await getListings()} />;
}
