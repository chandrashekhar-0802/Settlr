"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Listing, Workplace } from "@/lib/types";
import { PUNE_CENTER } from "@/lib/pune";

/**
 * Leaflet + OpenStreetMap tiles. Loaded only when the user opens the map view.
 * Uses stored coordinates only (no geocoding calls); attribution required by the OSM tile policy is kept.
 */
export default function MapView({ items, workplace }: { items: Listing[]; workplace?: Workplace }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView(PUNE_CENTER, 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const dot = (color: string, size = 14) =>
        L.divIcon({ className: "", html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgb(23 40 58/.3)"></span>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      const pts: [number, number][] = [];
      for (const l of items.filter((i) => i.locality !== "Citywide")) {
        const m = L.marker([l.lat, l.lng], { icon: dot(l.category === "food" ? "#F36A5B" : l.category === "essentials" ? "#3FAE8C" : "#6879DE"), title: l.name, keyboard: true }).addTo(map);
        const a = document.createElement("a");
        a.href = `/services/${l.id}`;
        a.textContent = l.name;
        a.style.fontWeight = "700";
        m.bindPopup(a);
        pts.push([l.lat, l.lng]);
      }
      if (workplace) {
        L.marker([workplace.lat, workplace.lng], { icon: dot("#17283A", 20), title: `Workplace: ${workplace.name}` }).addTo(map).bindTooltip(`Work · ${workplace.name}`, { permanent: true, direction: "top", offset: [0, -10] });
        pts.push([workplace.lat, workplace.lng]);
      }
      if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 14 });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [items, workplace]);

  return <div ref={el} className="h-[560px] w-full overflow-hidden rounded-[var(--radius-card)] ring-1 ring-line" role="region" aria-label="Map of listings" />;
}
