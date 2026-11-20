"use client";

import Link from "next/link";
import { useSettlr } from "@/lib/store";

/** Always tells the user where their data lives. */
export function ModeBanner() {
  const { connected, user, ready } = useSettlr();
  if (!ready) return null;
  if (!connected)
    return (
      <div className="bg-sun-soft px-4 py-2 text-center text-xs font-medium text-[#6b4f08]" role="note">
        <strong>Demo mode</strong> — sample listings; your plan is saved only in this browser.{" "}
        <Link href="/help#demo" className="underline underline-offset-2">
          What does this mean?
        </Link>
      </div>
    );
  if (!user)
    return (
      <div className="bg-blue-soft px-4 py-2 text-center text-xs font-medium text-navy" role="note">
        You&apos;re browsing as a guest.{" "}
        <Link href="/sign-up" className="font-bold underline underline-offset-2">
          Create an account
        </Link>{" "}
        to save your plan across devices.
      </div>
    );
  return null;
}
