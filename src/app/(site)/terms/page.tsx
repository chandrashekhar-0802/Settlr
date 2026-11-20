import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return (
    <ProsePage eyebrow="Legal" title="Terms of use" intro="Last updated November 2026.">
      <h2>An early MVP</h2>
      <p>Settlr is a planning tool in early development. Listings marked <strong>DEMO</strong> are sample data and do not represent real providers, prices or availability.</p>
      <h2>Estimates, not guarantees</h2>
      <p>Commute times, distances and costs are estimates based on stated assumptions. Prices shown are indicative. Always confirm details directly with a provider before paying anything.</p>
      <h2>No payments or bookings</h2>
      <p>Settlr does not take payments or confirm bookings. Any arrangement you make with a provider is between you and that provider.</p>
      <h2>Verification</h2>
      <p>A provider is shown as verified only after Settlr completes a verification process. Unverified providers have not been checked. Use caution: visit before paying and get receipts for deposits.</p>
      <h2>Acceptable use</h2>
      <p>Don&apos;t submit false information, spam providers, or try to access other users&apos; data.</p>
      <h2>Changes</h2>
      <p>We may update these terms as the product develops.</p>
    </ProsePage>
  );
}
