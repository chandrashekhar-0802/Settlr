"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Badge, Field, inputCls, inr, LinkButton } from "@/components/ui";
import { roadKm } from "@/lib/commute";
import { rankCommutes } from "@/lib/plan";
import { LOCALITIES, WORKPLACES } from "@/lib/pune";
import { useSettlr } from "@/lib/store";
import type { Listing, RelocationProfile } from "@/lib/types";

export function TransportView({ modes }: { modes: Listing[] }) {
  const { state, choose } = useSettlr();
  const p = state.profile;
  const [wpName, setWpName] = useState(p?.workplace.name ?? WORKPLACES[0].name);
  const [from, setFrom] = useState<string>(LOCALITIES[1].name);
  const workplace = p && p.workplace.name === wpName ? p.workplace : WORKPLACES.find((w) => w.name === wpName) ?? WORKPLACES[0];
  const loc = LOCALITIES.find((l) => l.name === from)!;
  const km = roadKm(loc, workplace);
  const all = useMemo(() => {
    const profile: RelocationProfile = p ?? { city: "pune", workplace, moveDate: "", budget: 25000, priorities: [], needs: [] };
    const ranked = rankCommutes(modes, km, { ...profile, workplace });
    const unavailable = modes.filter((m) => !ranked.some((r) => r.mode.id === m.id));
    return { ranked, unavailable };
  }, [modes, km, p, workplace]);
  const chosen = state.choices.commute;

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-5 rounded-[var(--radius-card)] bg-white p-5 shadow-soft ring-1 ring-line/70 lg:sticky lg:top-24 lg:self-start">
        <Field label="From (where you'll live)">
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls}>
            {LOCALITIES.map((l) => (
              <option key={l.name}>{l.name}</option>
            ))}
          </select>
        </Field>
        <Field label="To (workplace)">
          <select value={wpName} onChange={(e) => setWpName(e.target.value)} className={inputCls}>
            {p && !WORKPLACES.some((w) => w.name === p.workplace.name) && <option>{p.workplace.name}</option>}
            {WORKPLACES.map((w) => (
              <option key={w.name}>{w.name}</option>
            ))}
          </select>
        </Field>
        <div className="rounded-xl bg-bg p-4 text-sm">
          <p className="text-xs text-muted">Estimated road distance</p>
          <p className="text-2xl font-extrabold">≈{km.toFixed(1)} km</p>
          <p className="mt-1 text-xs text-muted">Straight-line distance between area centres × 1.35. Not a routed distance.</p>
        </div>
      </aside>
      <div className="space-y-4">
        {all.ranked.map((e, i) => (
          <article key={e.mode.id} className="grid gap-4 rounded-[var(--radius-card)] bg-white p-5 shadow-soft ring-1 ring-line/70 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-blue-soft text-blue">
                  <Icon name={e.mode.kind === "walk" ? "pin" : "bus"} size={18} />
                </span>
                <h2 className="font-bold">{e.mode.name}</h2>
                {i === 0 && <Badge tone="mint">Best fit</Badge>}
                {chosen === e.mode.id && <Badge tone="navy">In your plan</Badge>}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Distance" value={`≈${e.km.toFixed(1)} km`} />
                <Stat label="Time each way" value={`~${e.minutes} min`} />
                <Stat label="Monthly cost" value={inr(e.monthly)} />
                <Stat label="Convenience" value={`${e.convenience}/100`} />
              </dl>
              <p className="mt-3 text-xs text-muted">
                <strong>Method:</strong> {e.method} {e.mode.description}
              </p>
            </div>
            {p && (
              <button
                type="button"
                onClick={() => choose("commute", chosen === e.mode.id ? null : e.mode.id)}
                aria-pressed={chosen === e.mode.id}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold ring-1 ring-line hover:bg-tint aria-pressed:bg-navy aria-pressed:text-white"
              >
                {chosen === e.mode.id ? "Selected" : "Use in my plan"}
              </button>
            )}
          </article>
        ))}
        {all.unavailable.map((m) => (
          <article key={m.id} className="rounded-[var(--radius-card)] border border-dashed border-line bg-white/50 p-5 text-sm">
            <p className="font-semibold text-muted">{m.name}</p>
            <p className="text-xs text-muted">Not practical for ≈{km.toFixed(1)} km (estimate unavailable beyond {m.maxKm} km).</p>
          </article>
        ))}
        {!p && (
          <div className="rounded-[var(--radius-card)] bg-blue-soft p-5 text-sm">
            <p className="font-semibold">Want this in your plan?</p>
            <p className="mt-1 text-muted">Create your relocation plan and Settlr will pick a commute that fits your budget.</p>
            <LinkButton href="/onboarding" className="mt-3">
              Start onboarding
            </LinkButton>
          </div>
        )}
        <p className="text-xs text-muted">
          Live routes and fares are not integrated. Check <Link className="underline" href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</Link> or the operator before you rely on a route.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
