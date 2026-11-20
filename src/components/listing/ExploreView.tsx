"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Button, EmptyState, inputCls, inr, LinkButton } from "@/components/ui";
import { applyFilters, EMPTY_FILTERS, type Filters } from "@/lib/filters";
import { LOCALITIES } from "@/lib/pune";
import { useSettlr } from "@/lib/store";
import type { Category, Listing } from "@/lib/types";
import { CardSkeleton, KIND_LABEL, ListingCard } from "./ListingCard";
import { InquiryDialog, type InquiryHandle } from "./InquiryDialog";
import { CompareTray } from "./CompareTray";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="skeleton h-[560px] rounded-[var(--radius-card)]" /> });

const AMENITIES = ["Wi-Fi", "AC", "Attached bathroom", "Power backup", "Housekeeping", "CCTV", "Security guard", "Gym", "Parking"];

export function ExploreView({ listings, category, initialKind }: { listings: Listing[]; category: Category; initialKind?: string }) {
  const { state, ready } = useSettlr();
  const workplace = state.profile?.workplace;
  const [f, setF] = useState<Filters>({ ...EMPTY_FILTERS, kinds: initialKind ? [initialKind] : [], sort: workplace && category === "accommodation" ? "distance" : "recommended" });
  const [view, setView] = useState<"list" | "map">("list");
  const drawer = useRef<HTMLDialogElement>(null);
  const inquiry = useRef<InquiryHandle>(null);

  const kinds = useMemo(() => [...new Set(listings.map((l) => l.kind))], [listings]);
  const maxPrice = useMemo(() => Math.max(1000, ...listings.map((l) => l.monthly)), [listings]);
  const result = useMemo(() => applyFilters(listings, f, workplace), [listings, f, workplace]);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, page: 1, ...patch }));
  const toggle = (key: "localities" | "kinds" | "sharing" | "amenities", v: string) => set({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });
  const active = f.localities.length + f.kinds.length + f.sharing.length + f.amenities.length + Number(f.furnished) + Number(f.foodIncluded) + Number(f.verifiedOnly) + Number(Boolean(f.diet)) + Number(f.maxPrice != null) + Number(f.maxKm != null);

  const panel = (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-sm font-bold">Monthly price</legend>
        <input
          type="range"
          min={500}
          max={maxPrice}
          step={250}
          value={f.maxPrice ?? maxPrice}
          onChange={(e) => set({ maxPrice: +e.target.value >= maxPrice ? null : +e.target.value })}
          className="mt-3 w-full"
          aria-label="Maximum monthly price"
        />
        <p className="text-xs text-muted">{f.maxPrice == null ? "Any price" : `Up to ${inr(f.maxPrice)}/mo`}</p>
      </fieldset>
      {kinds.length > 1 && (
        <fieldset>
          <legend className="text-sm font-bold">Type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {kinds.map((k) => (
              <Chip key={k} on={f.kinds.includes(k)} onClick={() => toggle("kinds", k)}>
                {KIND_LABEL[k]}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="text-sm font-bold">Locality</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LOCALITIES.map((l) => (
            <Chip key={l.name} on={f.localities.includes(l.name)} onClick={() => toggle("localities", l.name)}>
              {l.name}
            </Chip>
          ))}
        </div>
      </fieldset>
      {category === "accommodation" && (
        <>
          <fieldset>
            <legend className="text-sm font-bold">Sharing</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {["single", "double", "triple"].map((s) => (
                <Chip key={s} on={f.sharing.includes(s)} onClick={() => toggle("sharing", s)}>
                  <span className="capitalize">{s}</span>
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">Amenities</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <Chip key={a} on={f.amenities.includes(a)} onClick={() => toggle("amenities", a)}>
                  {a}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2.5">
            <legend className="text-sm font-bold">Must have</legend>
            <Check label="Furnished" checked={f.furnished} onChange={(v) => set({ furnished: v })} />
            <Check label="Food included" checked={f.foodIncluded} onChange={(v) => set({ foodIncluded: v })} />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">Commute suitability</legend>
            {workplace ? (
              <>
                <select value={f.maxKm ?? ""} onChange={(e) => set({ maxKm: e.target.value ? +e.target.value : null })} className={`${inputCls} mt-2`} aria-label="Maximum distance to work">
                  <option value="">Any distance</option>
                  <option value="5">Within 5 km of work</option>
                  <option value="10">Within 10 km</option>
                  <option value="15">Within 15 km</option>
                </select>
                <p className="mt-1 text-xs text-muted">Estimated road distance to {workplace.name}</p>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted">Add your workplace in onboarding to filter by distance.</p>
            )}
          </fieldset>
        </>
      )}
      {category === "food" && (
        <fieldset>
          <legend className="text-sm font-bold">Diet</legend>
          <select value={f.diet} onChange={(e) => set({ diet: e.target.value })} className={`${inputCls} mt-2`} aria-label="Diet">
            <option value="">Any</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-veg</option>
          </select>
        </fieldset>
      )}
      <Check label="Verified providers only" checked={f.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} />
      {active > 0 && (
        <button type="button" className="text-sm font-semibold text-blue underline-offset-4 hover:underline" onClick={() => setF({ ...EMPTY_FILTERS, sort: f.sort, q: f.q })}>
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Search</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search by name, area or amenity" className={`${inputCls} pl-10`} />
        </label>
        <select value={f.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })} className={`${inputCls.replace("w-full ", "")} w-auto`} aria-label="Sort">
          <option value="recommended">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          {workplace && <option value="distance">Closest to work</option>}
        </select>
        <Button variant="secondary" className="lg:hidden" onClick={() => drawer.current?.showModal()}>
          <Icon name="filter" size={18} /> Filters{active ? ` (${active})` : ""}
        </Button>
        <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-line" role="group" aria-label="View">
          {(["list", "map"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold capitalize aria-pressed:bg-navy aria-pressed:text-white">
              <Icon name={v} size={16} /> {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 rounded-[var(--radius-card)] bg-white p-5 shadow-soft ring-1 ring-line/70">{panel}</div>
        </aside>
        <section aria-live="polite" aria-busy={!ready}>
          <p className="mb-4 text-sm text-muted" data-testid="result-count">
            {result.total} {result.total === 1 ? "result" : "results"}
            {listings.some((l) => l.isDemo) && " · demo data"}
          </p>
          {!ready ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : result.total === 0 ? (
            <EmptyState
              title={listings.length ? "No matches" : "No listings yet"}
              body={listings.length ? "Try widening your price range or clearing a filter." : "There are no published listings in this category yet."}
              action={listings.length ? <Button variant="secondary" onClick={() => setF(EMPTY_FILTERS)}>Clear filters</Button> : <LinkButton href="/provider/apply">List a service</LinkButton>}
            />
          ) : view === "map" ? (
            <MapView items={result.items.map((x) => x.l)} workplace={workplace} />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map(({ l, km }) => (
                  <ListingCard key={l.id} l={l} km={km} onInquire={(x) => inquiry.current?.open(x)} />
                ))}
              </div>
              {result.pages > 1 && (
                <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="secondary" disabled={result.page <= 1} onClick={() => setF((p) => ({ ...p, page: p.page - 1 }))}>
                    Previous
                  </Button>
                  <span className="px-3 text-sm text-muted">
                    Page {result.page} of {result.pages}
                  </span>
                  <Button variant="secondary" disabled={result.page >= result.pages} onClick={() => setF((p) => ({ ...p, page: p.page + 1 }))}>
                    Next
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      <dialog ref={drawer} aria-labelledby="filters-title" {...({ closedby: "any" } as object)} className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-3xl bg-white p-0 shadow-lift">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 id="filters-title" className="font-bold">
            Filters
          </h2>
          <form method="dialog">
            <button className="grid size-10 place-items-center rounded-xl ring-1 ring-line" aria-label="Close filters">
              ✕
            </button>
          </form>
        </div>
        <div className="p-5">{panel}</div>
        <form method="dialog" className="sticky bottom-0 border-t border-line bg-white p-4">
          <Button type="submit" className="w-full">
            Show {result.total} results
          </Button>
        </form>
      </dialog>
      <InquiryDialog ref={inquiry} />
      <CompareTray />
    </>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="min-h-9 rounded-full bg-tint px-3 text-xs font-semibold text-navy/80 transition-colors hover:bg-line aria-pressed:bg-navy aria-pressed:text-white">
      {children}
    </button>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4" />
      {label}
    </label>
  );
}
