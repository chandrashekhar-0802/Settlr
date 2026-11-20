"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, inr, LinkButton } from "@/components/ui";
import { KIND_LABEL } from "@/components/listing/ListingCard";
import { fmtDate } from "@/lib/format";
import { SLOT_LABEL, type PlanLine } from "@/lib/plan";
import { useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { RequireProfile } from "./RequireProfile";
import { usePlan } from "./usePlan";
import { PageHeader } from "@/components/PageHeader";

export function MyPlanView({ listings }: { listings: Listing[] }) {
  return (
    <RequireProfile>
      <Plan listings={listings} />
    </RequireProfile>
  );
}

function Plan({ listings }: { listings: Listing[] }) {
  const { state, choose } = useSettlr();
  const plan = usePlan(listings)!;
  const p = state.profile!;
  const t = plan.totals;
  const custom = Object.keys(state.choices).length > 0;
  const keyDates = (state.checklist ?? []).filter((i) => i.due).sort((a, b) => a.due!.localeCompare(b.due!));
  const milestones = [keyDates[0], ...keyDates.filter((i) => i.due === p.moveDate), keyDates.at(-1)].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="My relocation plan"
        title={`Settling into Pune · ${p.workplace.name}`}
        body="Every pick comes with its reasons. Swap anything — the totals recalculate instantly."
        actions={
          <>
            {custom && (
              <Button variant="secondary" onClick={() => Object.keys(state.choices).forEach((k) => choose(k as PlanLine["slot"], null))}>
                Reset to recommended
              </Button>
            )}
            <LinkButton href="/onboarding" variant="secondary">
              Edit answers
            </LinkButton>
          </>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ol className="space-y-4">
          {plan.lines.map((l) => (
            <PlanItem key={l.slot} l={l} />
          ))}
        </ol>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h2 className="font-bold">Totals</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row k="Monthly recurring" v={inr(t.monthly)} strong />
              <Row k="One-time setup" v={inr(t.oneTime)} />
              <Row k="Refundable deposits" v={inr(t.deposits)} />
              {t.optionalMonthly > 0 && <Row k="Optional extras (not counted)" v={`${inr(t.optionalMonthly)}/mo`} muted />}
              <div className="border-t border-line pt-3">
                <Row k="Cash needed to move in" v={inr(t.moveIn)} strong />
                <p className="mt-1 text-xs text-muted">First month + one-time + deposits</p>
              </div>
              <div className={`rounded-xl px-3 py-2 ${t.overBudget ? "bg-coral-soft text-coral" : "bg-mint-soft text-mint"}`}>
                <Row k={t.overBudget ? "Over budget by" : "Left each month"} v={inr(Math.abs(t.remaining))} strong />
              </div>
            </dl>
            <LinkButton href="/budget" variant="secondary" className="mt-4 w-full">
              Open budget planner
            </LinkButton>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold">Timeline</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {milestones.map((m, i) => (
                <li key={`${m!.id}${i}`} className="flex gap-3">
                  <Icon name="calendar" size={16} className="mt-0.5 text-blue" />
                  <span>
                    <span className="block text-xs text-muted">{fmtDate(m!.due!)}</span>
                    {m!.title}
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/checklist" className="mt-4 inline-block text-sm font-semibold text-blue">
              Full checklist →
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ k, v, strong, muted }: { k: string; v: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${muted ? "text-muted" : ""}`}>
      <dt>{k}</dt>
      <dd className={strong ? "font-extrabold" : "font-semibold"}>{v}</dd>
    </div>
  );
}

function PlanItem({ l }: { l: PlanLine }) {
  const { state, choose } = useSettlr();
  const chosen = state.choices[l.slot];
  return (
    <li>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue">
              {SLOT_LABEL[l.slot]}
              {l.optional && <Badge>Optional</Badge>}
              {chosen && chosen !== "none" && <Badge tone="navy">Your pick</Badge>}
            </p>
            {l.listing ? (
              <h3 className="mt-1 text-lg font-bold">
                <Link href={`/services/${l.listing.id}`} className="hover:text-blue">
                  {l.listing.name}
                </Link>
                <span className="ml-2 text-sm font-medium text-muted">
                  {KIND_LABEL[l.listing.kind]}
                  {l.listing.locality !== "Citywide" && ` · ${l.listing.locality}`}
                </span>
              </h3>
            ) : (
              <h3 className="mt-1 text-lg font-bold text-muted">{l.coveredBy ? "Covered" : "Nothing selected"}</h3>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="text-lg font-extrabold">{l.monthly ? `${inr(l.monthly)}/mo` : l.coveredBy ? "₹0" : "—"}</p>
            {(l.oneTime > 0 || l.deposit > 0) && (
              <p className="text-xs text-muted">
                {l.oneTime > 0 && `${inr(l.oneTime)} one-time`}
                {l.oneTime > 0 && l.deposit > 0 && " · "}
                {l.deposit > 0 && `${inr(l.deposit)} deposit`}
              </p>
            )}
          </div>
        </div>
        {l.reasons.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {l.reasons.map((r) => (
              <li key={r} className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.startsWith("Not yet verified") ? "bg-tint text-muted" : r.includes("over") ? "bg-coral-soft text-coral" : "bg-mint-soft text-[#2c7d64]"}`}>
                {r}
              </li>
            ))}
          </ul>
        )}
        {l.commute && <p className="mt-2 text-xs text-muted">Estimate method: {l.commute.method}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(l.alternatives.length > 0 || l.listing) && (
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Replace with</span>
              <select
                value=""
                onChange={(e) => e.target.value && choose(l.slot, e.target.value)}
                className="min-h-10 max-w-[16rem] rounded-xl bg-white px-3 text-sm ring-1 ring-line"
                aria-label={`Replace ${SLOT_LABEL[l.slot]}`}
              >
                <option value="">Choose…</option>
                {l.alternatives.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.monthly ? `${inr(a.monthly)}/mo` : a.category === "transport" ? "estimate" : inr(a.oneTime)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {chosen ? (
            <Button variant="ghost" onClick={() => choose(l.slot, null)}>
              Use recommendation
            </Button>
          ) : (
            l.listing && (
              <Button variant="ghost" onClick={() => choose(l.slot, "none")}>
                Remove
              </Button>
            )
          )}
        </div>
      </Card>
    </li>
  );
}
