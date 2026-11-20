"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, inr } from "@/components/ui";
import { MAX_COMPARE, useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { km as fmtKm } from "@/lib/format";
import { KIND_LABEL, priceLine } from "@/lib/labels";

export { KIND_LABEL, priceLine };
import { ListingArt } from "./ListingArt";


export function TrustBadges({ l }: { l: Listing }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {l.isDemo && <Badge tone="sun">Demo</Badge>}
      {l.verified ? (
        <Badge tone="mint">
          <Icon name="shield" size={12} /> Verified
        </Badge>
      ) : (
        <Badge>Unverified</Badge>
      )}
    </span>
  );
}


export function ListingCard({ l, km, onInquire }: { l: Listing; km?: number; onInquire: (l: Listing) => void }) {
  const { state, toggleSave, toggleCompare } = useSettlr();
  const saved = state.saved.includes(l.id);
  const comparing = state.compare.includes(l.id);
  const full = !comparing && state.compare.length >= MAX_COMPARE;

  return (
    <article className="lift group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line/70">
      <div className="relative">
        <ListingArt listing={l} className="aspect-[16/9] w-full" />
        <div className="absolute left-3 top-3">
          <TrustBadges l={l} />
        </div>
        <button
          type="button"
          onClick={() => toggleSave(l.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${l.name} from saved` : `Save ${l.name}`}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/95 text-navy shadow-soft transition-colors aria-pressed:bg-coral aria-pressed:text-white"
        >
          <Icon name="heart" size={18} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-muted">
          {KIND_LABEL[l.kind]} · {l.locality}
          {km != null && ` · ≈${fmtKm(km)} to work`}
        </p>
        <h3 className="mt-1 text-[17px] font-bold leading-snug">
          <Link href={`/services/${l.id}`} className="hover:text-blue">
            {l.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{l.description}</p>
        {l.category === "accommodation" && (
          <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-navy/80">
            <li className="rounded-full bg-tint px-2 py-0.5 capitalize">{l.sharing} sharing</li>
            <li className="rounded-full bg-tint px-2 py-0.5">{l.furnished ? "Furnished" : "Unfurnished"}</li>
            {l.foodIncluded && <li className="rounded-full bg-mint-soft px-2 py-0.5 text-mint">Food incl.</li>}
            {l.wifiIncluded && <li className="rounded-full bg-blue-soft px-2 py-0.5 text-blue">Wi-Fi incl.</li>}
            {l.gender && l.gender !== "any" && <li className="rounded-full bg-tint px-2 py-0.5 capitalize">{l.gender} only</li>}
          </ul>
        )}
        {l.category === "food" && (
          <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-navy/80">
            <li className="rounded-full bg-tint px-2 py-0.5">{l.diet === "veg" ? "Veg" : l.diet === "both" ? "Veg & non-veg" : "Non-veg"}</li>
            <li className="rounded-full bg-tint px-2 py-0.5">{l.mealsPerDay} meal{l.mealsPerDay === 1 ? "" : "s"}/day</li>
            <li className="rounded-full bg-tint px-2 py-0.5">{l.serviceDays}</li>
          </ul>
        )}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-lg font-extrabold">{priceLine(l)}</p>
              {l.deposit > 0 && <p className="text-xs text-muted">Deposit {inr(l.deposit)}</p>}
            </div>
          </div>
          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => toggleCompare(l.id)}
              disabled={full}
              aria-pressed={comparing}
              title={full ? `You can compare up to ${MAX_COMPARE}` : undefined}
              className="min-h-10 rounded-xl text-xs font-semibold ring-1 ring-line hover:bg-tint disabled:opacity-40 aria-pressed:bg-navy aria-pressed:text-white aria-pressed:ring-navy"
            >
              {comparing ? "Comparing" : "Compare"}
            </button>
            <Link href={`/services/${l.id}`} className="grid min-h-10 place-items-center rounded-xl text-xs font-semibold ring-1 ring-line hover:bg-tint">
              Details
            </Link>
            <button type="button" onClick={() => onInquire(l)} className="min-h-10 rounded-xl bg-navy text-xs font-semibold text-white hover:bg-navy-2">
              Inquire
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line/70">
      <div className="skeleton aspect-[16/9]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
