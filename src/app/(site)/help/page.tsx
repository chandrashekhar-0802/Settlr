import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Help & FAQ" };

const FAQ: [string, React.ReactNode, string?][] = [
  ["What is demo mode?", <>When Settlr runs without a configured backend, it uses clearly labelled sample listings and saves your plan only in this browser&apos;s local storage. Nothing is sent to a server, inquiries are not forwarded, and clearing your browser data removes your plan.</>, "demo"],
  ["Are the listings real?", <>Not yet. Every listing in this MVP is sample data with a <strong>DEMO</strong> badge. Real providers will appear once they apply and are reviewed.</>],
  ["What does “verified” mean?", <>A verified badge appears only after Settlr has checked a provider through a real process. Unverified listings have not been checked — visit before paying.</>],
  ["How are commute times calculated?", <>From stored area coordinates: straight-line distance × 1.35 for roads, divided by an average speed per mode. Costs use stated ₹/km assumptions × 22 workdays × 2 trips. They are estimates, not live data.</>],
  ["Why is food ₹0 in my plan?", <>If your chosen stay includes meals, Settlr doesn&apos;t add a separate tiffin. Same for Wi-Fi and laundry. You can still pick one from <Link href="/my-plan">My plan</Link>.</>],
  ["What's the difference between one-time, deposit and monthly?", <>Monthly costs repeat (rent, food). One-time costs are paid once and not returned (brokerage, installation, movers). Deposits are usually refundable when you leave.</>],
  ["Does Settlr take payments?", <>No. Settlr never processes payments in this MVP.</>],
  ["How do I delete my data?", <>Go to <Link href="/settings">Settings</Link> → Delete my data.</>],
  ["Is Settlr available outside Pune?", <>Not yet. Mumbai, Bengaluru, Hyderabad, Chennai and Delhi NCR are planned.</>],
];

export default function Page() {
  return (
    <ProsePage eyebrow="Help" title="Frequently asked questions">
      <div className="space-y-3">
        {FAQ.map(([q, a, id]) => (
          <details key={q} id={id} className="group rounded-2xl bg-white p-5 ring-1 ring-line/70 open:shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {q}
              <span aria-hidden className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-muted">{a}</p>
          </details>
        ))}
      </div>
      <p>Still stuck? <Link href="/contact">Contact us</Link>.</p>
    </ProsePage>
  );
}
