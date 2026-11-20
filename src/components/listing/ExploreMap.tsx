"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="skeleton h-[560px] rounded-[var(--radius-card)]" /> });

/** Map is opt-in so OpenStreetMap tiles are only requested when someone actually wants them. */
export function ExploreMap({ items }: { items: Listing[] }) {
  const [show, setShow] = useState(false);
  const { state } = useSettlr();
  if (!show)
    return (
      <div className="grid h-64 place-items-center rounded-[var(--radius-card)] border border-dashed border-line bg-white/60 text-center">
        <div>
          <p className="font-semibold">See all services on a map</p>
          <p className="mt-1 text-sm text-muted">Loads OpenStreetMap tiles.</p>
          <Button className="mt-4" onClick={() => setShow(true)}>
            Show map
          </Button>
        </div>
      </div>
    );
  return <MapView items={items} workplace={state.profile?.workplace} />;
}
