import type { Metadata } from "next";
import { ProviderForm } from "@/components/ProviderForm";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "List your service", description: "Apply to list your PG, tiffin, laundry or other service on Settlr." };

export default function Page() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <Eyebrow>For service providers</Eyebrow>
        <h1 className="mt-3 text-4xl font-extrabold">List your service on Settlr</h1>
        <p className="mt-4 text-muted">Reach young professionals moving to Pune for work. Applications are reviewed by the Settlr team before anything is published.</p>
        <ol className="mt-8 space-y-4 text-sm">
          {["Submit this form", "We review your details (status: pending)", "We contact you to verify the business", "Your listing goes live — and only then can it show a verified badge"].map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
              <span className="pt-1">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 rounded-2xl bg-tint p-4 text-xs text-muted">Submitting doesn&apos;t make you verified or published. Settlr may in future charge a commission on successful bookings — only under a written agreement.</p>
      </div>
      <ProviderForm />
    </div>
  );
}
