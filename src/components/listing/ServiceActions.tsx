"use client";

import { useRef, useState } from "react";
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
      <ReportLink id={l.id} />
      <InquiryDialog ref={inquiry} />
      <CompareTray />
    </>
  );
}

function ReportLink({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-4 text-xs font-semibold text-muted underline underline-offset-2 hover:text-coral">
        Report this listing
      </button>
    );
  return (
    <form
      className="mt-4 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
        const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: id, reason }) });
        const j = await res.json().catch(() => ({}));
        setMsg(res.ok ? (j.stored ? "Thanks — the Settlr team will review this listing." : "Demo mode: report validated but not sent anywhere.") : j.error ?? "Something went wrong.");
      }}
    >
      <label className="block text-xs font-semibold" htmlFor="reason">What&apos;s wrong with this listing?</label>
      <textarea id="reason" name="reason" rows={2} maxLength={500} className="w-full rounded-xl p-2 text-sm ring-1 ring-line" />
      <Button type="submit" variant="secondary">Send report</Button>
      {msg && <p role="status" className="text-xs text-muted">{msg}</p>}
    </form>
  );
}
