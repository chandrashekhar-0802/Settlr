"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon, type IconName } from "@/components/icons";
import { Arrow, Badge, Button, Field, inputCls, inr } from "@/components/ui";
import { addDays, todayIso } from "@/lib/format";
import { CITIES, LOCALITIES, WORKPLACES } from "@/lib/pune";
import { useSettlr } from "@/lib/store";
import type { Need, Priority, RelocationProfile, Workplace } from "@/lib/types";
import Link from "next/link";

const PRIORITIES: { id: Priority; label: string; icon: IconName }[] = [
  { id: "save-money", label: "Save money", icon: "wallet" },
  { id: "close-to-work", label: "Stay close to work", icon: "pin" },
  { id: "better-stay", label: "Better accommodation", icon: "home" },
  { id: "better-commute", label: "Better commute", icon: "bus" },
  { id: "food-convenience", label: "Food convenience", icon: "food" },
  { id: "safety", label: "Safety and reliability", icon: "shield" },
];
const NEEDS: { id: Need; label: string; icon: IconName }[] = [
  { id: "accommodation", label: "Accommodation", icon: "home" },
  { id: "food", label: "Food", icon: "food" },
  { id: "commute", label: "Commute", icon: "bus" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi" },
  { id: "furniture", label: "Furniture", icon: "sofa" },
  { id: "laundry", label: "Laundry", icon: "laundry" },
  { id: "cleaning", label: "Cleaning", icon: "sparkle" },
  { id: "essentials", label: "Groceries & essentials", icon: "basket" },
];
const OTHER = "__other";
const STEPS = ["City", "Workplace", "Move date", "Budget", "Priorities", "Needs"];

export default function Onboarding() {
  const router = useRouter();
  const { state, ready, setProfile } = useSettlr();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("pune");
  const [wpPreset, setWpPreset] = useState(WORKPLACES[0].name);
  const [wpName, setWpName] = useState("");
  const [wpArea, setWpArea] = useState<string>(LOCALITIES[0].name);
  const [moveDate, setMoveDate] = useState(() => addDays(todayIso(), 30));
  const [budget, setBudget] = useState(25000);
  const [priorities, setPriorities] = useState<Priority[]>(["close-to-work"]);
  const [needs, setNeeds] = useState<Need[]>(["accommodation", "food", "commute", "wifi"]);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // Editing: prefill from the saved profile.
  useEffect(() => {
    const p = state.profile;
    if (!ready || !p) return;
    /* eslint-disable react-hooks/set-state-in-effect -- one-time prefill once the store hydrates */
    setCity(p.city);
    const preset = WORKPLACES.find((w) => w.name === p.workplace.name);
    setWpPreset(preset ? preset.name : OTHER);
    if (!preset) {
      setWpName(p.workplace.name);
      setWpArea(p.workplace.area);
    }
    setMoveDate(p.moveDate);
    setBudget(p.budget);
    setPriorities(p.priorities);
    setNeeds(p.needs);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [ready, state.profile]);

  // Move focus to the step heading for keyboard and screen-reader users.
  useEffect(() => heading.current?.focus(), [step]);

  function validate(): string {
    if (step === 0 && !CITIES.find((c) => c.id === city)?.live) return "Only Pune is live right now.";
    if (step === 1 && wpPreset === OTHER && wpName.trim().length < 2) return "Enter your workplace name.";
    if (step === 2 && (!moveDate || moveDate < addDays(todayIso(), -60))) return "Pick a valid move date.";
    if (step === 3 && (!Number.isFinite(budget) || budget < 5000 || budget > 200000)) return "Enter a monthly budget between ₹5,000 and ₹2,00,000.";
    if (step === 4 && priorities.length === 0) return "Pick at least one priority.";
    if (step === 5 && needs.length === 0) return "Pick at least one thing you need help with.";
    return "";
  }

  function next() {
    const e = validate();
    setError(e);
    if (e) return;
    if (step < STEPS.length - 1) return setStep(step + 1);
    const area = LOCALITIES.find((l) => l.name === wpArea)!;
    const workplace: Workplace =
      wpPreset === OTHER ? { name: wpName.trim(), area: area.name, lat: area.lat, lng: area.lng } : WORKPLACES.find((w) => w.name === wpPreset)!;
    const profile: RelocationProfile = { city, workplace, moveDate, budget: Math.round(budget), priorities, needs, name: state.profile?.name };
    setGenerating(true);
    setProfile(profile);
    // Short, honest processing state: the plan itself is computed instantly and deterministically.
    setTimeout(() => router.push("/dashboard"), 1400);
  }

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  if (generating)
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center" role="status" aria-live="polite">
        <div>
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-white shadow-lift">
            <svg viewBox="0 0 40 40" className="size-10 motion-safe:animate-spin" aria-hidden>
              <circle cx="20" cy="20" r="16" fill="none" stroke="#E9F2F8" strokeWidth="5" />
              <path d="M20 4a16 16 0 0 1 16 16" fill="none" stroke="#6879DE" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-8 text-2xl font-extrabold">Building your settling plan…</h1>
          <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm text-muted">
            {["Measuring distances to your workplace", "Ranking stays against your budget", "Skipping services your stay includes", "Dating your moving checklist"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="check" size={16} className="text-mint" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  return (
    <div className="min-h-dvh bg-bg">
      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Logo />
        <Link href={state.profile ? "/dashboard" : "/"} className="text-sm font-semibold text-muted hover:text-navy">
          {state.profile ? "Cancel" : "Exit"}
        </Link>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-muted">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Onboarding progress">
            <div className="h-full rounded-full bg-blue transition-[width] duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <form
          className="mt-8 rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-line/70 sm:p-10"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          noValidate
        >
          <h1 ref={heading} tabIndex={-1} className="text-2xl font-extrabold outline-none sm:text-3xl">
            {["Where are you moving?", "Where will you work?", "When are you moving?", "What's your monthly budget?", "What matters most?", "What do you need help with?"][step]}
          </h1>

          <div className="mt-8">
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="City">
                {CITIES.map((c) => (
                  <label key={c.id} className={`relative flex min-h-16 items-center justify-between rounded-2xl px-4 ring-1 ${c.live ? "cursor-pointer ring-line has-[:checked]:bg-navy has-[:checked]:text-white has-[:checked]:ring-navy" : "cursor-not-allowed opacity-50 ring-line"}`}>
                    <input type="radio" name="city" value={c.id} checked={city === c.id} disabled={!c.live} onChange={() => setCity(c.id)} className="sr-only" />
                    <span className="font-semibold">{c.name}</span>
                    {c.live ? <Badge tone="mint">Live</Badge> : <span className="text-[10px] font-bold uppercase">Soon</span>}
                  </label>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Field label="Workplace area" hint="We use the approximate area centre to estimate distances — not your exact office address.">
                  <select value={wpPreset} onChange={(e) => setWpPreset(e.target.value)} className={inputCls}>
                    {WORKPLACES.map((w) => (
                      <option key={w.name}>{w.name}</option>
                    ))}
                    <option value={OTHER}>Somewhere else…</option>
                  </select>
                </Field>
                {wpPreset === OTHER && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company or office name">
                      <input value={wpName} onChange={(e) => setWpName(e.target.value)} className={inputCls} placeholder="e.g. Acme Technologies" maxLength={80} />
                    </Field>
                    <Field label="Nearest area">
                      <select value={wpArea} onChange={(e) => setWpArea(e.target.value)} className={inputCls}>
                        {LOCALITIES.map((l) => (
                          <option key={l.name}>{l.name}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <Field label="Move date" hint="Your checklist due dates are calculated from this.">
                <input type="date" value={moveDate} min={addDays(todayIso(), -60)} onChange={(e) => setMoveDate(e.target.value)} className={`${inputCls} max-w-xs`} />
              </Field>
            )}

            {step === 3 && (
              <div>
                <p className="text-4xl font-extrabold text-blue">{inr(budget || 0)}<span className="text-base font-semibold text-muted"> / month</span></p>
                <input type="range" min={8000} max={80000} step={500} value={Math.min(80000, Math.max(8000, budget || 8000))} onChange={(e) => setBudget(+e.target.value)} className="mt-6 w-full" aria-label="Monthly budget slider" />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>₹8,000</span>
                  <span>₹80,000</span>
                </div>
                <Field label="Or type an amount (₹)">
                  <input type="number" inputMode="numeric" min={5000} max={200000} step={500} value={budget || ""} onChange={(e) => setBudget(+e.target.value)} className={`${inputCls} mt-1 max-w-xs`} />
                </Field>
                <p className="mt-3 text-xs text-muted">Include everything you plan to spend monthly on living costs: rent, food, travel and bills.</p>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {PRIORITIES.map((p) => (
                  <ToggleCard key={p.id} on={priorities.includes(p.id)} onClick={() => toggle(priorities, p.id, setPriorities)} icon={p.icon} label={p.label} />
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {NEEDS.map((n) => (
                  <ToggleCard key={n.id} on={needs.includes(n.id)} onClick={() => toggle(needs, n.id, setNeeds)} icon={n.icon} label={n.label} />
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-6 text-sm font-medium text-coral">
              {error}
            </p>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => (setError(""), setStep(Math.max(0, step - 1)))} disabled={step === 0}>
              Back
            </Button>
            <Button type="submit" className="min-h-12 px-6">
              {step === STEPS.length - 1 ? "Generate my plan" : "Continue"} <Arrow />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function ToggleCard({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: IconName; label: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="flex min-h-16 items-center gap-3 rounded-2xl px-4 text-left font-semibold ring-1 ring-line transition-colors hover:bg-tint aria-pressed:bg-navy aria-pressed:text-white aria-pressed:ring-navy">
      <Icon name={icon} size={22} />
      <span className="flex-1">{label}</span>
      {on && <Icon name="check" size={18} />}
    </button>
  );
}
