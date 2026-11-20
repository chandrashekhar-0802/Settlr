import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <ProsePage eyebrow="Contact" title="Get in touch" intro="Settlr is an early-stage project. Here's how to reach the team.">
      <h2>About a listing</h2>
      <p>Use the <strong>Inquire</strong> button on any listing. Inquiries go to the Settlr team for review (in demo mode they stay in your browser and are not sent).</p>
      <h2>Service providers</h2>
      <p>Run a PG, tiffin service, laundry or another local service in Pune? <Link href="/provider/apply">Apply to be listed</Link>. Applications are reviewed before anything is published.</p>
      <h2>Employers</h2>
      <p>Interested in relocation support for new joiners? See <Link href="/for-employers">Settlr for employers</Link>.</p>
      <h2>Bugs and feedback</h2>
      <p>Open an issue on <a href="https://github.com/chandrashekhar-0802/Settlr/issues" target="_blank" rel="noopener noreferrer">GitHub</a>. Please don&apos;t post personal information there.</p>
    </ProsePage>
  );
}
