"use client";

import Link from "next/link";
import { useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, EmptyState, inr, LinkButton } from "@/components/ui";
import { InquiryDialog, type InquiryHandle } from "@/components/listing/InquiryDialog";
import { CardSkeleton, KIND_LABEL, ListingCard } from "@/components/listing/ListingCard";
import { CompareTray } from "@/components/listing/CompareTray";
import { roadKm } from "@/lib/commute";
import { slotFor } from "@/lib/plan";
import { useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";

export function SavedView({ listings }: { listings: Listing[] }) {
  const { state, ready } = useSettlr();
  const inquiry = useRef<InquiryHandle>(null);
  const byId = new Map(listings.map((l) => [l.id, l]));
  const saved = state.saved.map((id) => byId.get(id)).filter(Boolean) as Listing[];
  const wp = state.profile?.workplace;
  return (
    <>
      <PageHeader eyebrow="Shortlist" title="Saved services" body="Everything you've hearted, across stays, food and essentials." />
      {!ready ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <CardSkeleton key={i} />)}</div>
      ) : saved.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Tap the heart on any listing to keep it here for later." action={<LinkButton href="/explore">Explore Pune</LinkButton>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((l) => (
            <ListingCard key={l.id} l={l} km={wp && l.locality !== "Citywide" ? roadKm(l, wp) : undefined} onInquire={(x) => inquiry.current?.open(x)} />
          ))}
        </div>
      )}
      <InquiryDialog ref={inquiry} />
      <CompareTray />
    </>
  );
}

type Row = { label: string; get: (l: Listing) => string | number | boolean | undefined; best?: "min" | "max"; fmt?: (v: number) => string };

export function CompareView({ listings }: { listings: Listing[] }) {
  const { state, ready, toggleCompare, clearCompare, choose } = useSettlr();
  const byId = new Map(listings.map((l) => [l.id, l]));
  const items = state.compare.map((id) => byId.get(id)).filter(Boolean) as Listing[];
  const wp = state.profile?.workplace;
  const mixed = new Set(items.map((i) => i.category)).size > 1;

  const rows: Row[] = [
    { label: "Type", get: (l) => KIND_LABEL[l.kind] },
    { label: "Area", get: (l) => l.locality },
    { label: "Monthly", get: (l) => l.monthly, best: "min", fmt: inr },
    { label: "Deposit", get: (l) => l.deposit, best: "min", fmt: inr },
    { label: "One-time", get: (l) => l.oneTime, best: "min", fmt: inr },
    ...(wp ? [{ label: `Distance to ${wp.name}`, get: (l: Listing) => (l.locality === "Citywide" ? undefined : +roadKm(l, wp).toFixed(1)), best: "min" as const, fmt: (v: number) => `≈${v} km` }] : []),
    { label: "Sharing", get: (l) => l.sharing },
    { label: "Furnished", get: (l) => l.furnished },
    { label: "Food included", get: (l) => l.foodIncluded },
    { label: "Wi-Fi included", get: (l) => l.wifiIncluded },
    { label: "Diet", get: (l) => l.diet },
    { label: "Meals / day", get: (l) => l.mealsPerDay },
    { label: "Service days", get: (l) => l.serviceDays },
    { label: "Amenities", get: (l) => l.amenities.length, best: "max", fmt: (v) => `${v}` },
    { label: "Verified", get: (l) => l.verified },
  ];
  // Only show rows where at least one item has data AND the values actually differ (or there's a single item).
  const visible = rows.filter((r) => {
    const vals = items.map(r.get);
    if (vals.every((v) => v === undefined)) return false;
    return items.length < 2 || new Set(vals.map(String)).size > 1 || ["Monthly", "Type"].includes(r.label);
  });

  return (
    <>
      <PageHeader eyebrow="Compare" title="Side-by-side comparison" body="Only the rows that differ are shown. Best value in each row is highlighted." actions={items.length > 0 && <Button variant="secondary" onClick={clearCompare}>Clear all</Button>} />
      {!ready ? (
        <div className="skeleton h-80 rounded-[var(--radius-card)]" />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing to compare yet" body="Add up to 4 stays, food services or essentials using the Compare button on any listing." action={<LinkButton href="/explore/accommodation">Browse stays</LinkButton>} />
      ) : (
        <>
          {mixed && <p className="mb-4 rounded-xl bg-sun-soft px-4 py-2 text-sm text-[#6b4f08]">You&apos;re comparing different categories — comparisons are most useful within one category.</p>}
          <div className="relative overflow-x-auto rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line/70">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th scope="col" className="w-44 p-4 text-left text-xs font-semibold text-muted">
                    Feature
                  </th>
                  {items.map((l) => (
                    <th key={l.id} scope="col" className="p-4 text-left align-top">
                      <Link href={`/services/${l.id}`} className="font-bold hover:text-blue">
                        {l.name}
                      </Link>
                      <div className="mt-1 flex gap-1">{l.isDemo && <Badge tone="sun">Demo</Badge>}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const nums = items.map(r.get).filter((v): v is number => typeof v === "number");
                  const best = r.best && nums.length > 1 ? (r.best === "min" ? Math.min(...nums) : Math.max(...nums)) : null;
                  return (
                    <tr key={r.label} className="border-t border-line">
                      <th scope="row" className="p-4 text-left text-xs font-semibold text-muted">
                        {r.label}
                      </th>
                      {items.map((l) => {
                        const v = r.get(l);
                        const isBest = best != null && v === best;
                        return (
                          <td key={l.id} className={`p-4 capitalize ${isBest ? "font-bold text-mint" : ""}`}>
                            {v === undefined ? <span className="text-muted">—</span> : typeof v === "boolean" ? (v ? "Yes" : "No") : typeof v === "number" && r.fmt ? r.fmt(v) : String(v)}
                            {isBest && <span className="sr-only"> (best)</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t border-line">
                  <td className="p-4" />
                  {items.map((l) => {
                    const slot = slotFor(l.kind);
                    const inPlan = slot && state.choices[slot] === l.id;
                    return (
                      <td key={l.id} className="space-y-2 p-4">
                        {state.profile && slot && (
                          <Button className="w-full" variant={inPlan ? "secondary" : "primary"} onClick={() => choose(slot, inPlan ? null : l.id)}>
                            {inPlan ? "In my plan" : "Use in plan"}
                          </Button>
                        )}
                        <Button variant="ghost" className="w-full" onClick={() => toggleCompare(l.id)}>
                          Remove
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
