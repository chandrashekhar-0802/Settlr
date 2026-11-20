"use client";

import { useState } from "react";
import { Card, Field, inputCls, inr, LinkButton } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { SLOT_LABEL } from "@/lib/plan";
import { useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { RequireProfile } from "./RequireProfile";
import { usePlan } from "./usePlan";

const COLORS = ["#17283A", "#6879DE", "#F36A5B", "#F6C653", "#3FAE8C", "#9AA9F0", "#F8A99E", "#86D3B8"];

export function BudgetView({ listings }: { listings: Listing[] }) {
  return (
    <RequireProfile>
      <Budget listings={listings} />
    </RequireProfile>
  );
}

function Budget({ listings }: { listings: Listing[] }) {
  const { state, setProfile } = useSettlr();
  const p = state.profile!;
  const plan = usePlan(listings)!;
  const [withOptional, setWithOptional] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [draft, setDraft] = useState(String(p.budget));
  const t = plan.totals;

  const rows = plan.lines.filter((l) => l.monthly > 0 && (withOptional || !l.optional));
  const monthly = rows.reduce((s, l) => s + l.monthly, 0);
  const remaining = p.budget - monthly;
  const scale = Math.max(p.budget, monthly);
  const budgetErr = +draft < 5000 || +draft > 200000 ? "Between ₹5,000 and ₹2,00,000" : "";

  return (
    <>
      <PageHeader eyebrow="Budget planner" title="Where your money goes" body="Monthly recurring costs, one-time setup and refundable deposits are kept separate. Change any service in your plan and this page updates." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!budgetErr) setProfile({ ...p, budget: Math.round(+draft) });
              }}
            >
              <Field label="Monthly budget (₹)" error={budgetErr}>
                <input type="number" inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value)} className={`${inputCls} w-40`} aria-invalid={Boolean(budgetErr)} />
              </Field>
              <button type="submit" disabled={Boolean(budgetErr) || +draft === p.budget} className="min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-40">
                Update
              </button>
            </form>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={withOptional} onChange={(e) => setWithOptional(e.target.checked)} className="size-4" />
              Include optional extras
            </label>
          </div>

          {/* Interactive stacked bar: hover/focus a segment or row to highlight it */}
          <div className="mt-8">
            <div className="flex h-12 overflow-hidden rounded-2xl bg-tint" role="img" aria-label={`Monthly costs ${inr(monthly)} of ${inr(p.budget)} budget`}>
              {rows.map((l, i) => (
                <div
                  key={l.slot}
                  title={`${SLOT_LABEL[l.slot]}: ${inr(l.monthly)}`}
                  onMouseEnter={() => setFocus(l.slot)}
                  onMouseLeave={() => setFocus(null)}
                  className="h-full transition-opacity duration-200"
                  style={{ width: `${(l.monthly / scale) * 100}%`, background: COLORS[i % COLORS.length], opacity: focus && focus !== l.slot ? 0.3 : 1 }}
                />
              ))}
            </div>
            <div className="relative mt-1 h-5 text-[11px] text-muted">
              <span className="absolute -translate-x-1/2 border-l border-navy/40 pl-1" style={{ left: `${(p.budget / scale) * 100}%` }}>
                Budget
              </span>
            </div>
          </div>

          <table className="mt-6 w-full text-sm">
            <caption className="sr-only">Monthly costs by category</caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Provider</th>
                <th className="pb-2 text-right font-semibold">Monthly</th>
                <th className="pb-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {plan.lines.map((l) => {
                const i = rows.indexOf(l);
                const counted = i >= 0;
                return (
                  <tr
                    key={l.slot}
                    tabIndex={0}
                    onMouseEnter={() => setFocus(l.slot)}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => setFocus(l.slot)}
                    onBlur={() => setFocus(null)}
                    className={`border-t border-line outline-none transition-colors ${focus === l.slot ? "bg-tint" : ""}`}
                  >
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: counted ? COLORS[i % COLORS.length] : "#DBE6EF" }} />
                        {SLOT_LABEL[l.slot]}
                        {l.optional && <span className="text-xs text-muted">(optional)</span>}
                      </span>
                    </td>
                    <td className="max-w-[12rem] truncate py-2.5 text-muted">{l.coveredBy ? "Included in stay" : l.listing?.name ?? "—"}</td>
                    <td className="py-2.5 text-right font-semibold">{inr(l.monthly)}</td>
                    <td className="py-2.5 text-right text-muted">{counted && monthly ? `${Math.round((l.monthly / monthly) * 100)}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy">
                <td className="pt-3 font-bold" colSpan={2}>
                  Total monthly
                </td>
                <td className="pt-3 text-right font-extrabold" colSpan={2}>
                  {inr(monthly)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>

        <div className="space-y-4">
          <Card className={`p-6 ${remaining < 0 ? "ring-2 ring-coral" : ""}`}>
            <p className="text-sm text-muted">{remaining < 0 ? "Budget overrun" : "Budget remaining each month"}</p>
            <p className={`mt-1 text-4xl font-extrabold ${remaining < 0 ? "text-coral" : "text-mint"}`}>{inr(Math.abs(remaining))}</p>
            {remaining < 0 && (
              <p role="alert" className="mt-2 text-sm text-coral">
                Your plan costs more than your budget. Try a shared room, a stay with meals included, or a cheaper commute.
              </p>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="font-bold">Initial move-in cost</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {(
                [
                  ["First month (recurring)", monthly],
                  ["One-time setup", t.oneTime],
                  ["Refundable deposits", t.deposits],
                ] as [string, number][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold">{inr(v)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-bold">Total to move in</dt>
                <dd className="font-extrabold">{inr(monthly + t.oneTime + t.deposits)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">Deposits are usually refundable when you leave; one-time costs are not. Included amenities are never charged twice.</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold">How this is calculated</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              <li>Monthly = sum of each selected service&apos;s monthly price (commute uses distance × stated ₹/km × 22 workdays × 2).</li>
              <li>Food, Wi-Fi and laundry are ₹0 when your stay includes them.</li>
              <li>Optional extras are shown separately unless you include them.</li>
            </ul>
            <LinkButton href="/my-plan" variant="secondary" className="mt-4">
              Change services
            </LinkButton>
          </Card>
        </div>
      </div>
    </>
  );
}
