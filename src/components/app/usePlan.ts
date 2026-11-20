"use client";

import { useMemo } from "react";
import { buildPlan } from "@/lib/plan";
import { useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";

export function usePlan(listings: Listing[]) {
  const { state } = useSettlr();
  return useMemo(() => (state.profile ? buildPlan(listings, state.profile, state.choices) : null), [listings, state.profile, state.choices]);
}

/** Overall progress: half from checklist completion, half from plan slots filled. */
export function useProgress(listings: Listing[]) {
  const { state } = useSettlr();
  const plan = usePlan(listings);
  const items = state.checklist ?? [];
  const tasks = items.length ? items.filter((i) => i.done).length / items.length : 0;
  const slots = plan?.lines.length ? plan.lines.filter((l) => l.listing || l.coveredBy).length / plan.lines.length : 0;
  return Math.round((tasks * 0.5 + slots * 0.5) * 100);
}
