"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Field, inputCls, LinkButton } from "@/components/ui";
import { safeNext } from "@/lib/safe-redirect";
import { useSettlr } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabase/client";

export type AuthMode = "login" | "sign-up" | "reset" | "update";
const TITLES: Record<AuthMode, [string, string]> = {
  login: ["Welcome back", "Log in to see your relocation plan."],
  "sign-up": ["Create your account", "Save your plan, checklist and shortlist across devices."],
  reset: ["Reset your password", "We'll email you a secure link."],
  update: ["Choose a new password", "At least 8 characters."],
};
const CTA: Record<AuthMode, string> = { login: "Log in", "sign-up": "Create account", reset: "Send reset link", update: "Update password" };

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { connected } = useSettlr();
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState(params.get("error") === "link" ? "That link is invalid or has expired. Please try again." : "");
  const [title, body] = TITLES[mode];

  if (!connected)
    return (
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <div className="mt-6 rounded-2xl bg-sun-soft p-5 text-sm text-[#6b4f08]">
          <p className="font-bold">Accounts aren&apos;t enabled in this deployment</p>
          <p className="mt-1">This is the demo build. Sign-in needs a Supabase project to be configured (see SETUP.md). Every feature works in demo mode — your data stays in this browser.</p>
        </div>
        <LinkButton href="/onboarding" className="mt-6 w-full">
          Continue in demo mode
        </LinkButton>
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (mode !== "update" && !/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if ((mode === "sign-up" || mode === "update") && password.length < 8) return setError("Use at least 8 characters for your password.");
    if (mode === "login" && !password) return setError("Enter your password.");
    setError("");
    setStatus("busy");
    const sb = supabaseBrowser()!;
    const origin = window.location.origin;
    if (mode === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return setStatus("idle"), setError("Email or password is incorrect."); // generic: no account enumeration
      router.replace(safeNext(params.get("next")));
      return router.refresh();
    }
    if (mode === "update") {
      const { error } = await sb.auth.updateUser({ password });
      if (error) return setStatus("idle"), setError(error.message);
      return router.replace("/dashboard");
    }
    if (mode === "sign-up") {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` } });
      if (error) return setStatus("idle"), setError(error.message);
      if (data.session) return router.replace("/onboarding");
      return setStatus("sent");
    }
    await sb.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/update-password` });
    setStatus("sent"); // same message whether or not the account exists
  }

  if (status === "sent")
    return (
      <div role="status">
        <h1 className="text-3xl font-extrabold">Check your inbox</h1>
        <p className="mt-3 text-muted">{mode === "reset" ? "If an account exists for that email, a reset link is on its way." : "We sent a confirmation link. Open it to activate your account."}</p>
        <LinkButton href="/login" variant="secondary" className="mt-6">
          Back to log in
        </LinkButton>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-muted">{body}</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        {mode !== "update" && (
          <Field label="Email">
            <input name="email" type="email" autoComplete="email" required className={inputCls} />
          </Field>
        )}
        {mode !== "reset" && (
          <Field label={mode === "update" ? "New password" : "Password"}>
            <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} className={inputCls} />
          </Field>
        )}
        {mode === "login" && (
          <Link href="/reset-password" className="block text-right text-sm font-semibold text-blue">
            Forgot password?
          </Link>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium text-coral">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={status === "busy"}>
          {status === "busy" ? "Please wait…" : CTA[mode]}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New to Settlr?{" "}
            <Link href="/sign-up" className="font-semibold text-blue">
              Create an account
            </Link>
          </>
        ) : mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue">
              Log in
            </Link>
          </>
        ) : (
          <Link href="/login" className="font-semibold text-blue">
            Back to log in
          </Link>
        )}
      </p>
      {mode === "sign-up" && (
        <p className="mt-4 text-center text-xs text-muted">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
