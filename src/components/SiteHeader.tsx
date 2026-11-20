"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Logo } from "./Logo";
import { Arrow, btn } from "./ui";
import { useSettlr } from "@/lib/store";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/for-employers", label: "For employers" },
  { href: "/help", label: "Help" },
];
const APP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-plan", label: "My plan" },
  { href: "/explore", label: "Explore" },
  { href: "/budget", label: "Budget" },
  { href: "/checklist", label: "Checklist" },
  { href: "/saved", label: "Saved" },
];

export function SiteHeader({ app = false }: { app?: boolean }) {
  const { state, user, connected } = useSettlr();
  const path = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  const items = app ? APP_NAV : NAV;
  const hasPlan = Boolean(state.profile);
  const close = () => menu.current?.close();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo href={app ? "/dashboard" : "/"} />
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {items.map((n) => {
            const active = path === n.href || (n.href !== "/" && !n.href.includes("#") && path.startsWith(n.href + "/"));
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className="rounded-lg px-3 py-2 text-sm font-medium text-navy/75 hover:bg-tint hover:text-navy aria-[current=page]:bg-white aria-[current=page]:text-navy aria-[current=page]:shadow-soft"
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {connected && !user && (
            <Link href="/login" className={btn("ghost")}>
              Log in
            </Link>
          )}
          {app ? (
            <Link href="/profile" className={btn("secondary")}>
              Profile
            </Link>
          ) : (
            <Link href={hasPlan ? "/dashboard" : "/onboarding"} className={btn("primary")}>
              {hasPlan ? "My dashboard" : "Get started"} <Arrow />
            </Link>
          )}
        </div>
        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-xl ring-1 ring-line md:hidden"
          aria-label="Open menu"
          onClick={() => menu.current?.showModal()}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <dialog
        ref={menu}
        aria-label="Menu"
        {...({ closedby: "any" } as object)}
        className="m-0 ml-auto h-dvh max-h-none w-[min(86vw,340px)] bg-white p-0 shadow-lift"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-bold">Menu</span>
          <button type="button" onClick={close} className="inline-flex size-11 items-center justify-center rounded-xl ring-1 ring-line" aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-3">
          {[...items, ...(app ? [{ href: "/compare", label: "Compare" }, { href: "/settings", label: "Settings" }] : [])].map((n) => (
            <Link key={n.href} href={n.href} onClick={close} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-tint">
              {n.label}
            </Link>
          ))}
          <Link href={hasPlan ? "/dashboard" : "/onboarding"} onClick={close} className={btn("primary", "mt-4")}>
            {hasPlan ? "My dashboard" : "Start settling"}
          </Link>
          {connected && !user && (
            <Link href="/login" onClick={close} className={btn("secondary", "mt-2")}>
              Log in
            </Link>
          )}
        </nav>
      </dialog>
    </header>
  );
}
