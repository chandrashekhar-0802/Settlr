import { NextResponse } from "next/server";
import { safeNext } from "@/lib/safe-redirect";
import { supabaseServer } from "@/lib/supabase/server";

/** Exchanges the email-link code for a session, then redirects to a same-site path only. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const sb = await supabaseServer();
  if (sb && code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
