import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <ProsePage eyebrow="Legal" title="Privacy Policy" intro="Last updated November 2026. Plain language, MVP edition.">
      <h2>What we collect</h2>
      <ul>
        <li><strong>Relocation answers</strong>: city, workplace area, move date, monthly budget, priorities and needs.</li>
        <li><strong>Your activity</strong>: saved listings, plan choices, checklist tasks and inquiries you send.</li>
        <li><strong>Account details</strong> (only if you create an account): email address and a securely hashed password managed by our authentication provider, Supabase.</li>
      </ul>
      <h2>Where it is stored</h2>
      <p>In <strong>demo mode</strong>, everything stays in your browser&apos;s local storage and never reaches our servers. When you have an <strong>account</strong>, your data is stored in our Supabase database, protected by row-level security so only you can read your relocation plan.</p>
      <h2>How we use it</h2>
      <p>Only to build and show your plan, and to pass your inquiry to the Settlr team for follow-up. We do not sell your data, and we do not send promotional email automatically.</p>
      <h2>Maps</h2>
      <p>When you open a map, your browser loads tiles from OpenStreetMap&apos;s tile servers, which can see your IP address. We never send your location — maps use stored area coordinates only.</p>
      <h2>Your rights</h2>
      <p>You can download or permanently delete your data at any time from <Link href="/settings">Settings</Link>. Deleting your account removes your profile, plan, checklist, saved items and inquiries.</p>
      <h2>Contact</h2>
      <p>See <Link href="/contact">Contact</Link>.</p>
    </ProsePage>
  );
}
