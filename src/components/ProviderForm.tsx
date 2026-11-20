"use client";

import { useState } from "react";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { LOCALITIES } from "@/lib/pune";

export function ProviderForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [result, setResult] = useState<{ stored: boolean; emailed?: boolean } | null>(null);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/provider-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setMsg(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setResult(json);
      setStatus("done");
    } catch {
      setMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "done")
    return (
      <Card className="p-8" role="status">
        <h2 className="text-2xl font-extrabold">Application received</h2>
        <p className="mt-2 text-muted">
          {result?.stored
            ? `Your application is now pending review.${result.emailed ? " A confirmation email is on its way." : ""} You are not yet listed or verified.`
            : "Demo mode: your application was validated but not stored or sent anywhere, because no backend is configured."}
        </p>
      </Card>
    );

  const err = (k: string) => ({ "aria-invalid": Boolean(errors[k]) });
  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <div className="sm:col-span-2">
          <Field label="Business name" error={errors.businessName}>
            <input name="businessName" required maxLength={120} className={inputCls} {...err("businessName")} />
          </Field>
        </div>
        <Field label="Category" error={errors.category}>
          <select name="category" className={inputCls} defaultValue="accommodation">
            <option value="accommodation">Accommodation (PG / flat / hostel)</option>
            <option value="food">Food / tiffin / mess</option>
            <option value="transport">Transport / bike rental</option>
            <option value="essentials">Essentials (Wi-Fi, laundry, furniture…)</option>
          </select>
        </Field>
        <Field label="Locality" error={errors.locality}>
          <select name="locality" className={inputCls}>
            {LOCALITIES.map((l) => (
              <option key={l.name}>{l.name}</option>
            ))}
            <option>Other (Pune)</option>
          </select>
        </Field>
        <Field label="Contact person" error={errors.contactName}>
          <input name="contactName" required autoComplete="name" maxLength={80} className={inputCls} {...err("contactName")} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" required autoComplete="tel" className={inputCls} {...err("phone")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email" error={errors.email}>
            <input name="email" type="email" required autoComplete="email" className={inputCls} {...err("email")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Services offered" error={errors.services} hint="Rooms, sharing types, meal plans, amenities…">
            <textarea name="services" rows={3} required maxLength={1500} className={`${inputCls} py-3`} {...err("services")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Pricing details" error={errors.pricing} hint="e.g. Double sharing ₹9,500/mo, deposit ₹15,000">
            <input name="pricing" required maxLength={500} className={inputCls} {...err("pricing")} />
          </Field>
        </div>
        <Field label="Website (optional)" error={errors.website}>
          <input name="website" type="url" placeholder="https://" className={inputCls} {...err("website")} />
        </Field>
        <Field label="Anything else (optional)" error={errors.notes}>
          <input name="notes" maxLength={1000} className={inputCls} />
        </Field>
        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-coral sm:col-span-2">
            {msg}
          </p>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={status === "busy"} className="w-full sm:w-auto">
            {status === "busy" ? "Submitting…" : "Submit application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
