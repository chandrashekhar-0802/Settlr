"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { Button, Field, inputCls } from "@/components/ui";
import { useSettlr } from "@/lib/store";
import type { Listing } from "@/lib/types";

export type InquiryHandle = { open: (l: Listing) => void };

/** Native modal <dialog>: focus, Esc and inert page come from the browser. */
export function InquiryDialog({ ref }: { ref: Ref<InquiryHandle> }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const { state, addInquiry, connected } = useSettlr();
  const [listing, setListing] = useState<Listing | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ stored: boolean; emailed?: boolean } | null>(null);
  const [msg, setMsg] = useState("");

  useImperativeHandle(ref, () => ({
    open: (l) => {
      setListing(l);
      setErrors({});
      setStatus("idle");
      setResult(null);
      setMsg("");
      dlg.current?.showModal();
    },
  }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!listing) return;
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, listingId: listing.id }) });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setMsg(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      addInquiry({ id: crypto.randomUUID(), listingId: listing.id, listingName: listing.name, message: data.message, createdAt: new Date().toISOString(), delivered: Boolean(json.stored) });
      setResult(json);
      setStatus("done");
    } catch {
      setMsg("Network error — check your connection and try again.");
      setStatus("error");
    }
  }

  const p = state.profile;
  return (
    <dialog ref={dlg} aria-labelledby="inq-title" className="m-auto w-[min(94vw,520px)] rounded-3xl bg-white p-0 shadow-lift backdrop:bg-navy/40">
      {listing && (
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="inq-title" className="text-xl font-extrabold">
                Ask about {listing.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{listing.locality}</p>
            </div>
            <form method="dialog">
              <button className="grid size-10 place-items-center rounded-xl ring-1 ring-line" aria-label="Close">
                ✕
              </button>
            </form>
          </div>
          {status === "done" ? (
            <div className="mt-6 rounded-2xl bg-mint-soft p-5 text-sm" role="status">
              <p className="font-bold text-mint">Inquiry recorded</p>
              <p className="mt-1 text-navy/80">
                {result?.stored
                  ? `Saved for the Settlr team to review${result.emailed ? " — a confirmation email is on its way." : ". No email was sent (email isn't configured)."}`
                  : "Demo mode: your message was validated and saved in this browser only. It was not sent to anyone."}
              </p>
              {listing.isDemo && <p className="mt-2 text-xs text-muted">This is a demo listing — there is no real provider behind it.</p>}
              <form method="dialog" className="mt-4">
                <Button>Done</Button>
              </form>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              {listing.isDemo && <p className="rounded-xl bg-sun-soft px-3 py-2 text-xs text-[#7a5b0c]">Demo listing — inquiries are not forwarded to a real provider.</p>}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" error={errors.name}>
                  <input name="name" required autoComplete="name" defaultValue={p?.name ?? ""} className={inputCls} aria-invalid={Boolean(errors.name)} />
                </Field>
                <Field label="Phone (optional)" error={errors.phone}>
                  <input name="phone" type="tel" autoComplete="tel" className={inputCls} aria-invalid={Boolean(errors.phone)} />
                </Field>
              </div>
              <Field label="Email" error={errors.email}>
                <input name="email" type="email" required autoComplete="email" className={inputCls} aria-invalid={Boolean(errors.email)} />
              </Field>
              <Field label="Move-in date" error={errors.moveDate}>
                <input name="moveDate" type="date" defaultValue={p?.moveDate ?? ""} className={inputCls} />
              </Field>
              <Field label="Message" error={errors.message}>
                <textarea
                  name="message"
                  required
                  rows={4}
                  defaultValue={`Hi, I'm relocating to Pune${p ? ` for work at ${p.workplace.name}` : ""}. Is this available${p ? ` from ${p.moveDate}` : ""}?`}
                  className={`${inputCls} py-3`}
                  aria-invalid={Boolean(errors.message)}
                />
              </Field>
              {status === "error" && (
                <p role="alert" className="text-sm font-medium text-coral">
                  {msg}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted">{connected ? "Shared only with the Settlr team." : "Demo mode: nothing leaves your browser."}</p>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send inquiry"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
