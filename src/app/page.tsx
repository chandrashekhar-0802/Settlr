import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { HowItWorksFigure } from "@/components/home/HowItWorksFigure";
import { Icon, type IconName } from "@/components/icons";
import { Arrow, Badge, Eyebrow, LinkButton, inr } from "@/components/ui";
import { DEMO_LISTINGS } from "@/lib/demo-data";
import { buildPlan, SLOT_LABEL } from "@/lib/plan";
import { CITIES, LOCALITIES, WORKPLACES } from "@/lib/pune";

const CATEGORIES: { icon: IconName; title: string; body: string; href: string }[] = [
  { icon: "home", title: "Accommodation", body: "PGs, shared flats and hostels near work", href: "/explore/accommodation" },
  { icon: "food", title: "Food", body: "Tiffins, messes and monthly meal plans", href: "/explore/food" },
  { icon: "bus", title: "Transport", body: "Bus, metro, bike rental or cab — estimated", href: "/explore/transport" },
  { icon: "wifi", title: "Wi-Fi", body: "Broadband plans and installation costs", href: "/explore/essentials?kind=wifi" },
  { icon: "sofa", title: "Furniture", body: "Rent a bed, desk and chair monthly", href: "/explore/essentials?kind=furniture" },
  { icon: "laundry", title: "Laundry", body: "Weekly wash-and-fold subscriptions", href: "/explore/essentials?kind=laundry" },
  { icon: "sparkle", title: "Cleaning", body: "Room and apartment cleaning help", href: "/explore/essentials?kind=cleaning" },
  { icon: "basket", title: "Daily essentials", body: "Groceries, movers and a starter kit", href: "/explore/essentials" },
];

const WEEK = [
  { when: "4 weeks before", what: "Sign your offer, set a budget, shortlist stays", icon: "briefcase" },
  { when: "2 weeks before", what: "Compare 3 stays, book travel and movers", icon: "compare" },
  { when: "Move-in day", what: "Check in, pay deposit with a receipt, unpack", icon: "home" },
  { when: "Day 1–2", what: "Wi-Fi, SIM, tiffin started, trial commute", icon: "wifi" },
  { when: "First week", what: "Joining day, update address, find a clinic", icon: "check" },
] as const;

// A real plan computed by the engine on demo data — not a mock-up.
const sample = buildPlan(DEMO_LISTINGS, {
  city: "pune",
  workplace: WORKPLACES[0],
  moveDate: "2027-01-15",
  budget: 25000,
  priorities: ["save-money", "close-to-work"],
  needs: ["accommodation", "food", "commute", "wifi", "laundry"],
});

export default function Home() {
  const t = sample.totals;
  const shares = sample.lines.filter((l) => l.monthly > 0);
  const colors = ["#17283A", "#6879DE", "#F36A5B", "#F6C653", "#3FAE8C"];
  const pct = shares.map((l) => (l.monthly / 25000) * 100);
  const ends = pct.map((_, i) => pct.slice(0, i + 1).reduce((a, b) => a + b, 0));
  const acc = ends.at(-1) ?? 0;
  const donut = shares.map((_, i) => `${colors[i % colors.length]} ${ends[i] - pct[i]}% ${ends[i]}%`);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_75%_40%,#ffffff_0%,transparent_70%)]" />
          <div className="mx-auto grid max-w-[1400px] items-center gap-6 px-4 pb-10 pt-10 sm:px-6 lg:min-h-[min(calc(100svh-4rem),820px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:pb-0 lg:pt-0">
            <div className="max-w-xl lg:py-16">
              <Eyebrow>The smarter way to relocate</Eyebrow>
              <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[3.4rem] xl:text-[3.9rem]">
                New job.
                <br />
                New city.
                <br />
                <span className="text-blue">Everything sorted.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
                Moving for your first job? Find your stay, food, commute and everyday essentials, all organized around your workplace and budget.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/onboarding" className="min-h-12 px-6">
                  Start Settling <Arrow />
                </LinkButton>
                <LinkButton href="#how-it-works" variant="secondary" className="min-h-12 px-6">
                  See How It Works
                </LinkButton>
              </div>
              <p className="mt-8 text-sm text-muted">Built for the next chapter of your career.</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="pin" size={16} className="text-coral" /> Launching in Pune
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="wallet" size={16} className="text-blue" /> Free to plan
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="shield" size={16} className="text-mint" /> No payments taken
                </span>
              </div>
            </div>
            <div className="relative -mx-4 sm:-mx-6 lg:mx-0 lg:-mr-6 lg:h-[min(calc(100svh-4rem),820px)]">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* A. PROBLEM */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="reveal max-w-3xl">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              Getting the job was the hard part.
              <br />
              <span className="text-muted">Settling in shouldn&apos;t be.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-muted">
              Today you piece a move together from scattered listings, group chats and guesswork — in a city you&apos;ve never lived in, often with your first salary still weeks away.
            </p>
          </div>
          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                ["home", "Search for a PG", "Dozens of listings, few photos you can trust"],
                ["compare", "Compare prices", "Rent, deposit, brokerage — never in one place"],
                ["food", "Find food", "Ask around for a tiffin that actually delivers"],
                ["bus", "Plan the commute", "Guess how far is too far from the office"],
                ["basket", "Arrange essentials", "Wi-Fi, bedding, laundry, a bucket…"],
              ] as const
            ).map(([icon, title, body], i) => (
              <li key={title} className="reveal relative rounded-2xl bg-white p-5 shadow-soft ring-1 ring-line/70" style={{ rotate: `${[-1.5, 1, -0.5, 1.5, -1][i]}deg` }}>
                <span className="text-xs font-bold text-coral">0{i + 1}</span>
                <Icon name={icon} size={26} className="mt-3 text-navy" />
                <p className="mt-3 font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
                {i < 4 && <span aria-hidden className="absolute -right-3 top-1/2 hidden h-px w-6 border-t-2 border-dashed border-coral/50 lg:block" />}
              </li>
            ))}
          </ol>
          <p className="reveal mt-10 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            <Icon name="check" size={16} /> Settlr turns five searches into one plan.
          </p>
        </section>

        {/* B. HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-20 bg-white/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal max-w-2xl">
              <Eyebrow>How Settlr works</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">Three steps from offer letter to settled.</h2>
            </div>
            <div className="mt-14">
              <HowItWorksFigure />
            </div>
          </div>
        </section>

        {/* C. EVERYTHING IN ONE PLACE */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Everything in one place</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">Every essential, around one address: your office.</h2>
            </div>
            <LinkButton href="/explore" variant="secondary">
              Explore Pune <Arrow />
            </LinkButton>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Link key={c.title} href={c.href} className="reveal lift group rounded-2xl bg-white p-6 shadow-soft ring-1 ring-line/70">
                <span className={`grid size-12 place-items-center rounded-xl ${["bg-blue-soft text-blue", "bg-coral-soft text-coral", "bg-sun-soft text-[#9a7414]", "bg-mint-soft text-mint"][i % 4]}`}>
                  <Icon name={c.icon} size={24} />
                </span>
                <p className="mt-5 font-bold">{c.title}</p>
                <p className="mt-1 text-sm text-muted">{c.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Browse <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* D. PERSONALISED PLANNING */}
        <section className="bg-navy py-24 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
            <div className="reveal">
              <Eyebrow className="!text-sun">Personalised planning</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">A budget that knows rent isn&apos;t the only number.</h2>
              <p className="mt-5 max-w-lg text-white/70">
                Settlr separates monthly costs from one-time setup and refundable deposits, skips services your stay already includes, and explains every pick. Swap anything — totals update instantly.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/80">
                {["Monthly vs one-time vs deposits, never blended", "No double-paying for food or Wi-Fi your PG includes", "Readable reasons behind every recommendation"].map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-white/10 text-sun">
                      <Icon name="check" size={14} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <LinkButton href="/onboarding" variant="coral" className="mt-10">
                Create my plan <Arrow />
              </LinkButton>
            </div>
            <div className="reveal rounded-[28px] bg-white p-6 text-navy shadow-lift sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sample plan · demo data</p>
                  <p className="mt-1 text-lg font-bold">₹25,000 budget · Hinjewadi Phase 1</p>
                </div>
                <Badge tone="sun">Demo</Badge>
              </div>
              <div className="mt-6 grid items-center gap-6 sm:grid-cols-[150px_1fr]">
                <div className="relative mx-auto size-[150px] rounded-full" style={{ background: `conic-gradient(${donut.join(",")}, #E9F2F8 ${acc}% 100%)` }}>
                  <div className="absolute inset-[18px] grid place-items-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-[11px] text-muted">Monthly</p>
                      <p className="text-lg font-extrabold">{inr(t.monthly)}</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {sample.lines.map((l) => {
                    const idx = shares.indexOf(l);
                    return (
                      <li key={l.slot} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full" style={{ background: idx >= 0 ? colors[idx % colors.length] : "#DBE6EF" }} />
                          {SLOT_LABEL[l.slot]}
                        </span>
                        <span className="font-semibold">{l.coveredBy ? <span className="text-xs font-medium text-mint">Included in stay</span> : inr(l.monthly)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center text-sm">
                <div>
                  <dt className="text-xs text-muted">Left each month</dt>
                  <dd className="font-bold text-mint">{inr(t.remaining)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">One-time</dt>
                  <dd className="font-bold">{inr(t.oneTime)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Deposits</dt>
                  <dd className="font-bold">{inr(t.deposits)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* E. CITY EXPLORER */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="reveal max-w-2xl">
            <Eyebrow>City explorer</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">Starting with Pune.</h2>
            <p className="mt-4 text-muted">We only show cities where we have configured data. More are on the way.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Link href="/explore" className="reveal lift group relative overflow-hidden rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-line/70">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-extrabold">Pune</h3>
                <Badge tone="mint">Live</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">7 neighbourhoods · demo listings for stays, food, commute and essentials</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {LOCALITIES.map((l) => (
                  <li key={l.name} className="rounded-xl bg-bg px-4 py-3">
                    <p className="text-sm font-bold">{l.name}</p>
                    <p className="text-xs text-muted">{l.blurb}</p>
                  </li>
                ))}
              </ul>
            </Link>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {CITIES.filter((c) => !c.live).map((c) => (
                <li key={c.id} className="reveal flex items-center justify-between rounded-2xl border border-dashed border-line bg-white/50 px-5 py-4">
                  <span className="font-semibold text-muted">{c.name}</span>
                  <Badge>Coming soon</Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* F. FIRST WEEK */}
        <section className="bg-white/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal max-w-2xl">
              <Eyebrow>Your first week</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">A checklist that moves with your date.</h2>
              <p className="mt-4 text-muted">Tell us when you&apos;re moving and every task gets a due date — documents, packing, travel and the first-week basics.</p>
            </div>
            <ol className="relative mt-14 grid gap-6 md:grid-cols-5">
              <span aria-hidden className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-blue via-coral to-sun md:block" />
              {WEEK.map((w, i) => (
                <li key={w.when} className="reveal relative flex gap-4 md:block">
                  <span className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl shadow-soft ${i === 2 ? "bg-coral text-white" : "bg-white text-navy ring-1 ring-line"}`}>
                    <Icon name={w.icon} size={22} />
                  </span>
                  <div className="md:mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue">{w.when}</p>
                    <p className="mt-1 text-sm font-semibold">{w.what}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* G. EMPLOYERS */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="reveal grid items-center gap-8 rounded-[28px] bg-blue-soft p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
            <div>
              <Eyebrow>For employers</Eyebrow>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">Help new joiners arrive ready on day one.</h2>
              <p className="mt-3 max-w-2xl text-muted">We&apos;re exploring relocation partnerships with companies hiring freshers in Pune — shared plans, onboarding checklists and budget guidance for your incoming batch.</p>
            </div>
            <LinkButton href="/for-employers">
              Talk to us <Arrow />
            </LinkButton>
          </div>
        </section>

        {/* H. FINAL CTA */}
        <section className="relative overflow-hidden bg-navy py-24 text-center text-white">
          <div aria-hidden className="parallax absolute -left-10 top-10 size-40 rounded-[40px] bg-blue/30" style={{ ["--drift" as string]: "50px" }} />
          <div aria-hidden className="parallax absolute -right-6 bottom-6 size-28 rotate-12 rounded-3xl bg-coral/40" style={{ ["--drift" as string]: "-40px" }} />
          <div className="reveal relative mx-auto max-w-2xl px-4">
            <h2 className="text-4xl font-extrabold sm:text-6xl">Your new chapter starts here.</h2>
            <p className="mt-5 text-white/70">Five minutes to a plan for your stay, food, commute and first week.</p>
            <LinkButton href="/onboarding" variant="coral" className="mt-10 min-h-12 px-7">
              Create My Plan <Arrow />
            </LinkButton>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
