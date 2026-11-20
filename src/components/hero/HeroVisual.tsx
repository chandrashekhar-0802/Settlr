"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CityScene = dynamic(() => import("./CityScene"), { ssr: false });

/** WebGL available and the device isn't obviously low-powered or on data saver. */
function canRender3D() {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return false;
    if (matchMedia("(max-width: 767px)").matches) return false; // phones get the static render
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroVisual() {
  const box = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability detection must run in the browser
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener("change", onMq);
    // Defer the 3D bundle until the browser is idle so text renders first.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    idle(() => setUse3D(canRender3D()));
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (box.current) io.observe(box.current);
    return () => {
      mq.removeEventListener("change", onMq);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={box} className="relative aspect-[5/4] w-full lg:aspect-auto lg:h-full">
      <Image
        src="/hero-city.webp"
        alt="Miniature isometric city: an office tower, a PG building, a food stall, a bus and metro line, a Wi-Fi mast and moving boxes, connected by service pipes"
        fill
        priority
        sizes="(min-width: 1024px) 58vw, 100vw"
        className={`object-contain transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      {use3D && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <CityScene active={active} reduced={reduced} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
