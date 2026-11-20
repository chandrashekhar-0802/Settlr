"use client";

import type { ReactNode } from "react";
import { useSettlr } from "@/lib/store";
import { EmptyState, LinkButton } from "@/components/ui";

export function RequireProfile({ children }: { children: ReactNode }) {
  const { state, ready } = useSettlr();
  if (!ready)
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-10 w-1/2 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-40 rounded-[var(--radius-card)]" />
          ))}
        </div>
      </div>
    );
  if (!state.profile)
    return (
      <EmptyState
        title="Let's set up your move first"
        body="Answer six quick questions — city, workplace, date, budget, priorities and needs — and Settlr builds your plan."
        action={<LinkButton href="/onboarding">Start onboarding</LinkButton>}
      />
    );
  return <>{children}</>;
}
