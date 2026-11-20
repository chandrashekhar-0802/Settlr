"use client";

import { useRef } from "react";
import { Button } from "@/components/ui";
import { roadKm } from "@/lib/commute";
import { SLOT_KINDS } from "@/lib/plan";
import { MAX_COMPARE, useSettlr } from "@/lib/store";
import type { Listing, Need } from "@/lib/types";
import { InquiryDialog, type InquiryHandle } from "./InquiryDialog";
import { CompareTray } from "./CompareTray";

export function ServiceActions({ l }: { l: Listing }) {
  const { state, toggleSave, toggleCompare, choose } = useSettlr();
  const inquiry = useRef<InquiryHandle>(null);
  const saved = state.saved.includes(l.id);
  const comparing = state.compare.includes(l.id);
  const slot = (Object.keys(SLOT_KINDS) as Need[]).find((s) => SLOT_KINDS[s].includes(l.kind));
  const inPlan = slot && state.choices[slot] === l.id;
  const wp = state.profile?.workplace;
  return (
    <>
      {wp && l.locality !== "Citywide" && l.category !== "transport" && (
        <p className="mt-4 rounded-xl bg-bg px-3 py-2 text-sm">
          ≈{roadKm(l, wp).toFixed(1)} km by road to {wp.name} <span className="text-xs text-muted">(estimate)</span>
        </p>
      )}
      <div className="mt-6 grid gap-2">
        <Button onClick={() => inquiry.current?.open(l)}>Send an inquiry</Button>
        {state.profile && slot && (
          <Button variant={inPlan ? "secondary" : "coral"} onClick={() => choose(slot, inPlan ? null : l.id)}>
            {inPlan ? "Remove from my plan" : "Use in my plan"}
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" aria-pressed={saved} onClick={() => toggleSave(l.id)}>
            {saved ? "Saved ♥" : "Save"}
          </Button>
          <Button variant="secondary" aria-pressed={comparing} disabled={!comparing && state.compare.length >= MAX_COMPARE} onClick={() => toggleCompare(l.id)}>
            {comparing ? "Comparing" : "Compare"}
          </Button>
        </div>
      </div>
      <InquiryDialog ref={inquiry} />
      <CompareTray />
    </>
  );
}
