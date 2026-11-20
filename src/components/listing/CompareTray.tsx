"use client";

import { MAX_COMPARE, useSettlr } from "@/lib/store";
import { LinkButton } from "@/components/ui";

export function CompareTray() {
  const { state, clearCompare } = useSettlr();
  const n = state.compare.length;
  if (!n) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl bg-navy py-2 pl-5 pr-2 text-sm text-white shadow-lift">
        <span>
          <strong>{n}</strong> of {MAX_COMPARE} selected to compare
        </span>
        <button type="button" onClick={clearCompare} className="min-h-10 rounded-xl px-3 text-white/70 hover:text-white">
          Clear
        </button>
        <LinkButton href="/compare" variant="coral" className="min-h-10">
          Compare
        </LinkButton>
      </div>
    </div>
  );
}
