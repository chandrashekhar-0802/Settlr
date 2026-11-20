import type { Metadata } from "next";
import { ChecklistView } from "@/components/app/ChecklistView";

export const metadata: Metadata = { title: "Moving checklist", robots: { index: false } };

export default function Page() {
  return <ChecklistView />;
}
