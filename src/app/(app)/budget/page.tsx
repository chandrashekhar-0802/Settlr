import type { Metadata } from "next";
import { BudgetView } from "@/components/app/BudgetView";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Budget planner", robots: { index: false } };

export default async function Page() {
  return <BudgetView listings={await getListings()} />;
}
