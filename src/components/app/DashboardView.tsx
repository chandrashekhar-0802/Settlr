"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { Arrow, Badge, Card, inr, LinkButton } from "@/components/ui";
import { fmtDate, todayIso } from "@/lib/format";
import { SLOT_LABEL, type PlanLine } from "@/lib/plan";
import { useSettlr } from "@/lib/store";
import type { Listing, Need } from "@/lib/types";
import { RequireProfile } from "./RequireProfile";
import { usePlan, useProgress } from "./usePlan";
import { ExplainerVideo } from "./ExplainerVideo";

const MAIN: { slot: Need | "essentials-group"; title: string; icon: IconName; href: string; tone: string }[] = [
  { slot: "accommodation", title: "Find your stay", icon: "home", href: "/explore/accommodation", tone: "bg-blue-soft text-blue" },
  { slot: "food", title: "Plan your meals", icon: "food", href: "/explore/food", tone: "bg-coral-soft text-coral" },
  { slot: "commute", title: "Explore your commute", icon: "bus", href: "/explore/transport", tone: "bg-sun-soft text-[#9a7414]" },
  { slot: "essentials-group", title: "Arrange essentials", icon: "basket", href: "/explore/essentials", tone: "bg-mint-soft text-mint" },
];

export function DashboardView({ listings }: { listings: Listing[] }) {
  return (
    <RequireProfile>
      <Dashboard listings={listings} />
    </RequireProfile>
  );
}

function Dashboard({ listings }: { listings: Listing[] }) {
  const { state } = useSettlr();
  const p = state.profile!;
  const plan = usePlan(listings)!;
  const progress = useProgress(listings);
  const t = plan.totals;
  const byId = new Map(listings.map((l) => [l.id, l]));
  const saved = state.saved.map((id) => byId.get(id)).filter(Boolean) as Listing[];
  const today = todayIso();
  const upcoming = (state.checklist ?? []).filter((i) => !i.done).sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9")).slice(0, 4);
  const daysToMove = Math.round((new Date(p.moveDate).getTime() - new Date(today).getTime()) / 864e5);
  const line = (s: Need) => plan.lines.find((l) => l.slot === s);
  const essentials = plan.lines.filter((l) => ["wifi", "furniture", "laundry", "cleaning", "essentials"].includes(l.slot));

  const nextSteps: { text: string; href: string }[] = [];
  if (!state.choices.accommodation) nextSteps.push({ text: "Confirm a stay — compare the top picks", href: "/my-plan" });
  if (state.saved.length < 2) nextSteps.push({ text: "Save at least 2 stays to compare side by side", href: "/explore/accommodation" });
  if (t.overBudget) nextSteps.push({ text: "Your plan is over budget — swap a cheaper option", href: "/budget" });
  if (upcoming[0]) nextSteps.push({ text: upcoming[0].title, href: "/checklist" });
  if (!state.inquiries.length) nextSteps.push({ text: "Send your first inquiry to a shortlisted stay", href: "/saved" });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-[32px] bg-navy p-6 text-white sm:p-10">
        <div aria-hidden className="absolute -right-10 -top-10 size-56 rounded-[48px] bg-blue/30 rotate-12" />
        <div aria-hidden className="absolute bottom-[-40px] right-40 size-24 rounded-3xl bg-coral/40 -rotate-12" />
        <div className="relative">
          <p className="text-sm text-white/60">{p.name ? `Hi ${p.name},` : "Hi there,"}</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Welcome to your new beginning.</h1>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {(
              [
                ["Destination", "Pune", "pin"],
                ["Workplace", p.workplace.name, "briefcase"],
                ["Moving", `${fmtDate(p.moveDate)}${daysToMove >= 0 ? ` · ${daysToMove}d` : ""}`, "calendar"],
                ["Budget", `${inr(p.budget)}/mo`, "wallet"],
              ] as [string, string, IconName][]
            ).map(([k, v, i]) => (
              <div key={k} className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs text-white/60">
                  <Icon name={i} size={14} /> {k}
                </dt>
                <dd className="mt-1 truncate font-bold">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs text-white/60">Planning progress</dt>
              <dd className="mt-1 flex items-center gap-2 font-bold">
                {progress}%
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <span className="block h-full rounded-full bg-sun" style={{ width: `${progress}%` }} />
                </span>
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <LinkButton href="/my-plan" variant="coral">
              View my plan <Arrow />
            </LinkButton>
            <LinkButton href="/onboarding" variant="secondary" className="!bg-white/10 !text-white !ring-white/20">
              Edit answers
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Video */}
      <ExplainerVideo />

      {/* Main cards */}
      <section aria-labelledby="main-h">
        <h2 id="main-h" className="sr-only">
          Your plan by category
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MAIN.map((m) => {
            const l = m.slot === "essentials-group" ? undefined : line(m.slot);
            const needed = m.slot === "essentials-group" ? essentials.length > 0 : Boolean(l);
            return (
              <Card key={m.title} className="lift flex flex-col p-5">
                <span className={`grid size-11 place-items-center rounded-xl ${m.tone}`}>
                  <Icon name={m.icon} size={22} />
                </span>
                <h3 className="mt-4 font-bold">{m.title}</h3>
                <div className="mt-1 flex-1 text-sm text-muted">
                  {!needed ? (
                    "Not in your needs"
                  ) : m.slot === "essentials-group" ? (
                    <ul className="space-y-0.5">
                      {essentials.map((e) => (
                        <li key={e.slot} className="flex justify-between gap-2">
                          <span>{SLOT_LABEL[e.slot]}</span>
                          <span className="font-semibold text-navy">{e.coveredBy ? "Included" : e.listing ? inr(e.monthly) : "—"}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <SlotSummary l={l!} />
                  )}
                </div>
                <Link href={m.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
                  Browse options <Arrow />
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Widgets */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-bold">Monthly cost estimate</h2>
          <p className="mt-3 text-3xl font-extrabold">{inr(t.monthly)}</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-tint" aria-hidden>
            <div className={`h-full rounded-full ${t.overBudget ? "bg-coral" : "bg-blue"}`} style={{ width: `${Math.min(100, (t.monthly / p.budget) * 100)}%` }} />
          </div>
          <p className={`mt-3 text-sm font-semibold ${t.overBudget ? "text-coral" : "text-mint"}`}>
            {t.overBudget ? `${inr(-t.remaining)} over budget` : `${inr(t.remaining)} left of ${inr(p.budget)}`}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-sm">
            <dt className="text-muted">One-time</dt>
            <dd className="text-right font-semibold">{inr(t.oneTime)}</dd>
            <dt className="text-muted">Deposits</dt>
            <dd className="text-right font-semibold">{inr(t.deposits)}</dd>
            <dt className="text-muted">Move-in cash</dt>
            <dd className="text-right font-bold">{inr(t.moveIn)}</dd>
          </dl>
          <Link href="/budget" className="mt-4 inline-block text-sm font-semibold text-blue">
            Open budget planner →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Upcoming moving tasks</h2>
            <Link href="/checklist" className="text-sm font-semibold text-blue">
              All
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="mt-4 space-y-3">
              {upcoming.map((i) => (
                <li key={i.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${i.due && i.due < today ? "bg-coral" : "bg-blue"}`} />
                  <span className="flex-1">{i.title}</span>
                  {i.due && <span className={`shrink-0 text-xs ${i.due < today ? "font-semibold text-coral" : "text-muted"}`}>{fmtDate(i.due)}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">All tasks done. 🎉</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-bold">Recommended next steps</h2>
          <ol className="mt-4 space-y-2">
            {nextSteps.slice(0, 4).map((s, i) => (
              <li key={s.text}>
                <Link href={s.href} className="flex items-start gap-3 rounded-xl p-2 text-sm hover:bg-tint">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">{i + 1}</span>
                  {s.text}
                </Link>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Saved providers</h2>
            <Link href="/saved" className="text-sm font-semibold text-blue">
              {saved.length ? `View all ${saved.length}` : "Browse"}
            </Link>
          </div>
          {saved.length ? (
            <ul className="mt-4 divide-y divide-line">
              {saved.slice(0, 4).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/services/${l.id}`} className="min-w-0 truncate font-semibold hover:text-blue">
                    {l.name}
                  </Link>
                  <span className="shrink-0 text-muted">
                    {l.locality} · {l.monthly ? `${inr(l.monthly)}/mo` : inr(l.oneTime)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Tap the heart on any listing to save it here.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-bold">Quick actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(
              [
                ["Compare", "/compare", "compare"],
                ["Budget", "/budget", "wallet"],
                ["Checklist", "/checklist", "check"],
                ["Find food", "/explore/food", "food"],
              ] as [string, string, IconName][]
            ).map(([label, href, icon]) => (
              <Link key={href} href={href} className="flex min-h-16 flex-col items-start justify-center gap-1 rounded-xl bg-bg px-3 text-sm font-semibold hover:bg-tint">
                <Icon name={icon} size={18} className="text-blue" />
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SlotSummary({ l }: { l: PlanLine }) {
  if (l.coveredBy) return <p className="text-mint">{l.coveredBy}</p>;
  if (!l.listing) return <p>Nothing selected yet</p>;
  return (
    <>
      <p className="font-semibold text-navy">{l.listing.name}</p>
      <p>
        {l.commute ? `~${l.commute.minutes} min · ` : ""}
        {inr(l.monthly)}/mo {l.listing.isDemo && <Badge tone="sun" className="ml-1 align-middle">Demo</Badge>}
      </p>
    </>
  );
}
