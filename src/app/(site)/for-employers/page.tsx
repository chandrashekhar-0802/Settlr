import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/icons";
import { Eyebrow, LinkButton } from "@/components/ui";

export const metadata: Metadata = { title: "For employers", description: "Relocation support for companies hiring freshers in Pune." };

const POINTS: [IconName, string, string][] = [
  ["briefcase", "Joiner-ready from day one", "New hires arrive with a stay, a commute and a first-week checklist sorted."],
  ["wallet", "Budget guidance", "Plans built around your relocation allowance, with costs split clearly."],
  ["check", "Batch checklists", "Shared joining-document and onboarding tasks dated to each joining day."],
  ["shield", "Verified providers (planned)", "A verification process for stays and services near your campus."],
];

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-3xl">
        <Eyebrow>Settlr for employers</Eyebrow>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-6xl">Help your new joiners settle faster.</h1>
        <p className="mt-5 text-lg text-muted">We&apos;re exploring corporate relocation partnerships with companies hiring freshers and interns in Pune. This is an early programme — no pricing or commitments yet.</p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(([icon, t, b]) => (
          <div key={t} className="rounded-[var(--radius-card)] bg-white p-6 shadow-soft ring-1 ring-line/70">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue"><Icon name={icon} size={22} /></span>
            <p className="mt-4 font-bold">{t}</p>
            <p className="mt-1 text-sm text-muted">{b}</p>
          </div>
        ))}
      </div>
      <div className="mt-14 rounded-[28px] bg-navy p-8 text-white sm:p-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Interested in a pilot?</h2>
        <p className="mt-2 max-w-2xl text-white/70">Tell us about your incoming batch and campus location. We&apos;ll follow up — nothing is shared or billed without a written agreement.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="https://github.com/chandrashekhar-0802/Settlr/issues/new?title=Employer%20pilot%20interest" variant="coral" target="_blank" rel="noopener noreferrer">Register interest</LinkButton>
          <LinkButton href="/onboarding" variant="secondary">Try the planner</LinkButton>
        </div>
      </div>
    </div>
  );
}
