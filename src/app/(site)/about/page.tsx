import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return (
    <ProsePage eyebrow="About Settlr" title="Settling in shouldn't be the hard part." intro="Settlr is a relocation planner for people moving to a new city for their first job.">
      <p>Landing an offer is a milestone. Then comes the scramble: finding a PG you can trust, working out what&apos;s actually affordable, figuring out food, a commute and a dozen small essentials — usually from another city, with little local knowledge.</p>
      <p>Settlr puts all of that around one point on the map: your workplace. Tell us where you&apos;re going, when and with what budget, and Settlr builds a plan you can understand and change — with every number explained.</p>
      <h2>What we believe</h2>
      <ul>
        <li><strong>Honest data.</strong> Nothing is labelled verified unless it has been through a real verification process. Sample data is always marked DEMO.</li>
        <li><strong>Transparent maths.</strong> Monthly, one-time and deposit costs are never blended. Estimates say how they were estimated.</li>
        <li><strong>No dark patterns.</strong> No payments are taken in this MVP and no promotional emails are sent automatically.</li>
      </ul>
      <h2>Where we are</h2>
      <p>Settlr is an early MVP launching in Pune (Hinjewadi, Wakad, Baner, Kharadi, Viman Nagar, Hadapsar and Pimpri-Chinchwad). In future we may earn a commission on successful bookings once provider agreements are in place.</p>
      <div className="flex gap-3 pt-4">
        <LinkButton href="/onboarding">Start planning</LinkButton>
        <LinkButton href="/provider/apply" variant="secondary">List your service</LinkButton>
      </div>
    </ProsePage>
  );
}
