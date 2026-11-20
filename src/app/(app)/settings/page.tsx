import type { Metadata } from "next";
import { SettingsView } from "@/components/app/AccountViews";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default function Page() {
  return <SettingsView />;
}
