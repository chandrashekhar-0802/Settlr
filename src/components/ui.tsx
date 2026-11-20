import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "coral";
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 min-h-11 text-sm font-semibold transition-[background,color,box-shadow,translate] duration-200 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-navy text-white shadow-soft hover:bg-navy-2",
  secondary: "bg-white text-navy ring-1 ring-line hover:ring-navy/30",
  ghost: "text-navy hover:bg-tint",
  coral: "bg-coral text-white shadow-soft hover:brightness-105",
};

export function btn(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({ variant = "primary", className = "", ...p }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={btn(variant, className)} {...p} />;
}

export function LinkButton({ variant = "primary", className = "", ...p }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={btn(variant, className)} {...p} />;
}

export function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9m-3.5-4L12.5 8 8.5 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const tones = {
  navy: "bg-navy text-white",
  blue: "bg-blue-soft text-blue",
  coral: "bg-coral-soft text-coral",
  sun: "bg-sun-soft text-[#9a7414]",
  mint: "bg-mint-soft text-mint",
  muted: "bg-tint text-muted",
};
export function Badge({ tone = "muted", children, className = "" }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Card({ className = "", ...p }: ComponentProps<"div">) {
  return <div className={`rounded-[var(--radius-card)] bg-white ring-1 ring-line/70 shadow-soft ${className}`} {...p} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-coral">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputCls =
  "w-full min-h-11 rounded-xl bg-white px-3.5 text-[15px] ring-1 ring-line placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-blue aria-[invalid=true]:ring-coral";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.16em] text-blue ${className}`}>{children}</p>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <p className="font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export { inr } from "@/lib/format";
