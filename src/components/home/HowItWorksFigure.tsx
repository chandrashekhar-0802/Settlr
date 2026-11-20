"use client";

/**
 * Fig. 1 — "The settling bench". An original isometric instrument in the Anatomy style:
 * a carriage carrying your suitcase rides a rail past three stations — a map plate (where you're moving),
 * a dial-and-switch panel (needs & budget) and a plan printer (your settling plan).
 * The object is the explanation; the readout is driven by the same step state that moves the parts.
 */
import { useEffect, useRef, useState } from "react";

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const pr = (x: number, y: number, z: number) => [(x - y) * COS, (x + y) * SIN - z] as const;
const pts = (a: (readonly [number, number])[]) => a.map((p) => p.join(",")).join(" ");

type Tone = { top: string; left: string; right: string; stroke?: string };
const T = {
  base: { top: "#f6f9fc", left: "#dfe8f1", right: "#cdd9e5" },
  plate: { top: "#ffffff", left: "#e6edf4", right: "#d6e1eb" },
  navy: { top: "#3a4f66", left: "#22364b", right: "#17283a" },
  blue: { top: "#8d9bea", left: "#6879de", right: "#5565c4" },
  coral: { top: "#f8907f", left: "#f36a5b", right: "#d9584a" },
  sun: { top: "#f9d77e", left: "#f6c653", right: "#dcab37" },
  mint: { top: "#86d3b8", left: "#3fae8c", right: "#33967a" },
  steel: { top: "#c9d4df", left: "#aebccb", right: "#97a7b8" },
} satisfies Record<string, Tone>;

/** A solid box: x,y on the floor, z up. Visible faces: top, +y (left on screen), +x (right on screen). */
function Box({ x, y, z, w, d, h, t, sw = 0.6 }: { x: number; y: number; z: number; w: number; d: number; h: number; t: Tone; sw?: number }) {
  const top = [pr(x, y, z + h), pr(x + w, y, z + h), pr(x + w, y + d, z + h), pr(x, y + d, z + h)];
  const left = [pr(x, y + d, z), pr(x + w, y + d, z), pr(x + w, y + d, z + h), pr(x, y + d, z + h)];
  const right = [pr(x + w, y, z), pr(x + w, y + d, z), pr(x + w, y + d, z + h), pr(x + w, y, z + h)];
  const s = { stroke: "#17283a", strokeOpacity: 0.28, strokeWidth: sw, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points={pts(left)} fill={t.left} {...s} />
      <polygon points={pts(right)} fill={t.right} {...s} />
      <polygon points={pts(top)} fill={t.top} {...s} />
    </g>
  );
}

function Dot({ x, y, z, r = 1.1, fill = "#17283a" }: { x: number; y: number; z: number; r?: number; fill?: string }) {
  const [a, b] = pr(x, y, z);
  return <circle cx={a} cy={b} r={r} fill={fill} />;
}

function Line({ a, b, w = 0.8, c = "#17283a", o = 0.35 }: { a: [number, number, number]; b: [number, number, number]; w?: number; c?: string; o?: number }) {
  const [x1, y1] = pr(...a);
  const [x2, y2] = pr(...b);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeOpacity={o} strokeLinecap="round" />;
}

const STEPS = [
  { title: "Tell us where you're moving", body: "Pick the city and your workplace. Everything is measured from there.", readout: "Pune · Hinjewadi Phase 1" },
  { title: "Choose your needs and budget", body: "Set a monthly budget and switch on what you need: stay, food, commute, Wi-Fi and more.", readout: "₹25,000 / month · 6 needs" },
  { title: "Build your settling plan", body: "Settlr ranks options, avoids double-paying for included services and prints a plan you can edit.", readout: "Plan ready · costs split · checklist dated" },
];
const STATION_X = [55, 155, 255];

export function HowItWorksFigure() {
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const fig = useRef<HTMLDivElement>(null);

  // Calm idle tour; stops once the reader takes control, when offscreen, or under reduced motion.
  useEffect(() => {
    if (touched || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (fig.current) io.observe(fig.current);
    const id = setInterval(() => visible && setStep((s) => (s + 1) % 3), 3400);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [touched]);

  const go = (i: number) => {
    setTouched(true);
    setStep(i);
  };

  // Carriage position along the rail (x), as a screen-space translation.
  const [cx, cy] = pr(STATION_X[step] - STATION_X[0], 0, 0);
  const knob = step >= 1 ? 44 : 10; // budget slider travel
  const card = step === 2 ? 1 : 0;
  const [kx, ky] = pr(knob, 0, 0);
  const [px, py] = pr(0, 0, card * 26);

  const vb = (() => {
    const xs = [pr(0, 120, 0)[0], pr(330, 0, 0)[0]];
    const top = -8;
    return `${xs[0] - 10} ${top} ${xs[1] - xs[0] + 20} ${pr(330, 120, -14)[1] - top + 6}`;
  })();

  return (
    <div ref={fig} className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <ol className="space-y-3" aria-label="How Settlr works">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => go(i)}
              onMouseEnter={() => go(i)}
              aria-pressed={step === i}
              className="group flex w-full gap-4 rounded-2xl p-5 text-left ring-1 ring-transparent transition-colors aria-pressed:bg-white aria-pressed:shadow-soft aria-pressed:ring-line"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-sm font-extrabold text-navy group-aria-pressed:bg-navy group-aria-pressed:text-white">
                {i + 1}
              </span>
              <span>
                <span className="block text-lg font-bold">{s.title}</span>
                <span className="mt-1 block text-sm text-muted">{s.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <figure className="rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-line/70 sm:p-6">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <span>Fig. 1</span>
          <span>The settling bench</span>
        </div>
        <svg viewBox={vb} className="mt-2 h-auto w-full [&_.mv]:transition-transform [&_.mv]:duration-700 [&_.mv]:ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:[&_.mv]:transition-none" role="img" aria-label={`Step ${step + 1}: ${STEPS[step].title}`}>
          {/* feet */}
          {[[6, 6], [314, 6], [6, 104], [314, 104]].map(([x, y]) => (
            <Box key={`${x}${y}`} x={x - 5} y={y - 5} z={-12} w={10} d={10} h={4} t={T.navy} />
          ))}
          {/* base plate + bevel */}
          <Box x={0} y={0} z={-8} w={320} d={110} h={8} t={T.base} />
          <Box x={3} y={3} z={0} w={314} d={104} h={1.2} t={T.plate} sw={0.4} />
          {/* corner screws */}
          {[[8, 8], [312, 8], [8, 102], [312, 102]].map(([x, y]) => (
            <g key={`s${x}${y}`}>
              <Dot x={x} y={y} z={1.2} r={1.9} fill="#cdd9e5" />
              <Dot x={x} y={y} z={1.2} r={0.7} />
            </g>
          ))}
          {/* label plate */}
          <Box x={280} y={88} z={1.2} w={30} d={14} h={0.8} t={T.steel} sw={0.4} />
          {[0, 1, 2].map((i) => (
            <Line key={i} a={[284, 91 + i * 3.6, 2]} b={[306 - i * 4, 91 + i * 3.6, 2]} w={0.6} o={0.45} />
          ))}

          {/* ── Station 1: map plate with pin ── */}
          <Box x={22} y={14} z={1.2} w={66} d={56} h={3} t={T.plate} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Line key={`g${i}`} a={[22 + i * 16.5, 14, 4.2]} b={[22 + i * 16.5, 70, 4.2]} w={0.5} o={0.2} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Line key={`h${i}`} a={[22, 14 + i * 18.7, 4.2]} b={[88, 14 + i * 18.7, 4.2]} w={0.5} o={0.2} />
          ))}
          <Line a={[30, 60, 4.3]} b={[52, 40, 4.3]} w={2.2} c="#6879DE" o={0.55} />
          <Line a={[52, 40, 4.3]} b={[80, 30, 4.3]} w={2.2} c="#6879DE" o={0.55} />
          <Box x={50} y={38} z={4.2} w={4} d={4} h={step === 0 ? 22 : 16} t={T.navy} sw={0.4} />
          <g className="mv" style={{ transform: `translateY(${step === 0 ? -6 : 0}px)` }}>
            <circle cx={pr(52, 40, 30)[0]} cy={pr(52, 40, 30)[1]} r={7.5} fill="#F36A5B" stroke="#17283a" strokeOpacity={0.3} strokeWidth={0.6} />
            <circle cx={pr(52, 40, 30)[0]} cy={pr(52, 40, 30)[1]} r={2.8} fill="#fff" />
          </g>
          <Box x={74} y={24} z={4.2} w={10} d={10} h={14} t={T.blue} />

          {/* ── Station 2: needs switches + budget slider ── */}
          <Box x={118} y={14} z={1.2} w={74} d={56} h={12} t={T.steel} />
          <Box x={124} y={20} z={13.2} w={62} d={8} h={1} t={T.navy} sw={0.4} />
          {Array.from({ length: 9 }, (_, i) => (
            <Line key={`t${i}`} a={[126 + i * 7, 31, 13.4]} b={[126 + i * 7, i % 4 === 0 ? 35 : 33, 13.4]} w={0.6} o={0.5} />
          ))}
          <g className="mv" style={{ transform: `translate(${kx}px, ${ky}px)` }}>
            <Box x={126} y={19} z={14.2} w={8} d={10} h={6} t={T.sun} />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const on = step >= 1 && i !== 4;
            return (
              <g key={`sw${i}`}>
                <Box x={124 + (i % 3) * 21} y={42 + Math.floor(i / 3) * 14} z={13.2} w={16} d={9} h={1.5} t={T.plate} sw={0.4} />
                <Box x={(on ? 132 : 125) + (i % 3) * 21} y={43 + Math.floor(i / 3) * 14} z={14.7} w={7} d={7} h={3} t={on ? T.mint : T.steel} sw={0.4} />
              </g>
            );
          })}

          {/* ── Station 3: plan printer ── */}
          <Box x={222} y={16} z={1.2} w={64} d={52} h={34} t={T.plate} />
          <Box x={230} y={24} z={35.2} w={48} d={8} h={1.5} t={T.navy} sw={0.4} />
          <g className="mv" style={{ transform: `translate(${px}px, ${py}px)` }}>
            <Box x={234} y={26} z={20} w={40} d={2} h={18} t={{ top: "#fff", left: "#fff", right: "#e6edf4" }} sw={0.5} />
            {[0, 1, 2, 3].map((i) => (
              <Line key={`p${i}`} a={[238, 28, 34 - i * 4]} b={[i === 0 ? 256 : 268 - i * 3, 28, 34 - i * 4]} w={i === 0 ? 1.6 : 0.8} c={i === 0 ? "#F36A5B" : "#17283a"} o={i === 0 ? 0.9 : 0.4} />
            ))}
          </g>
          <Box x={230} y={24} z={35.2} w={48} d={8} h={1.5} t={T.navy} sw={0.4} />
          <Dot x={278} y={68} z={28} r={1.8} fill={step === 2 ? "#3FAE8C" : "#cdd9e5"} />
          <Dot x={278} y={68} z={22} r={1.8} fill={step === 2 ? "#cdd9e5" : "#F6C653"} />
          {[0, 1, 2].map((i) => (
            <Line key={`v${i}`} a={[240 + i * 6, 68, 8]} b={[240 + i * 6, 68, 14]} w={1.4} o={0.3} />
          ))}

          {/* rail + ruler along the front */}
          <Box x={10} y={84} z={1.2} w={300} d={6} h={3} t={T.steel} />
          {Array.from({ length: 31 }, (_, i) => (
            <Line key={`r${i}`} a={[10 + i * 10, 92, 1.3]} b={[10 + i * 10, i % 5 === 0 ? 98 : 95, 1.3]} w={0.6} o={i % 5 === 0 ? 0.55 : 0.3} />
          ))}
          {STATION_X.map((x, i) => (
            <Dot key={`st${i}`} x={x} y={80} z={1.3} r={2.2} fill={step === i ? "#F36A5B" : "#cdd9e5"} />
          ))}

          {/* carriage with suitcase */}
          <g className="mv" style={{ transform: `translate(${cx}px, ${cy}px)` }}>
            <Box x={STATION_X[0] - 14} y={80} z={4.2} w={28} d={14} h={4} t={T.navy} />
            {[-9, 9].map((dx) => (
              <Dot key={dx} x={STATION_X[0] + dx} y={94} z={4.6} r={1.6} fill="#cdd9e5" />
            ))}
            <Box x={STATION_X[0] - 9} y={83} z={8.2} w={18} d={9} h={20} t={T.coral} />
            <Box x={STATION_X[0] - 9} y={83} z={17} w={18} d={9} h={2} t={T.sun} sw={0.4} />
            <Box x={STATION_X[0] - 4} y={86} z={28.2} w={8} d={3} h={3} t={T.navy} sw={0.4} />
          </g>
        </svg>
        <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>Hover or tap a step · the carriage moves to that station</span>
          <span className="rounded-full bg-tint px-3 py-1 font-semibold text-navy" aria-live="polite">
            Example: {STEPS[step].readout}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
