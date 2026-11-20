"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, Field, inputCls, inr, LinkButton } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { SLOT_LABEL } from "@/lib/plan";
import { useSettlr } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabase/client";
import { RequireProfile } from "./RequireProfile";

const PRIORITY_LABEL: Record<string, string> = {
  "save-money": "Save money", "close-to-work": "Close to work", "better-stay": "Better accommodation",
  "better-commute": "Better commute", "food-convenience": "Food convenience", safety: "Safety & reliability",
};

export function ProfileView() {
  return (
    <RequireProfile>
      <Profile />
    </RequireProfile>
  );
}

function Profile() {
  const { state, user, setProfile } = useSettlr();
  const p = state.profile!;
  const [name, setName] = useState(p.name ?? "");
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Profile" title={p.name || "Your profile"} body={user ? `Signed in as ${user.email}` : "Not signed in — your data stays in this browser."} actions={<LinkButton href="/onboarding" variant="secondary">Edit relocation answers</LinkButton>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-bold">About you</h2>
          <form
            className="mt-4 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setProfile({ ...p, name: name.trim().slice(0, 60) || undefined });
              setSaved(true);
            }}
          >
            <div className="flex-1">
              <Field label="Display name">
                <input value={name} onChange={(e) => (setName(e.target.value), setSaved(false))} className={inputCls} maxLength={60} autoComplete="given-name" />
              </Field>
            </div>
            <Button type="submit">Save</Button>
          </form>
          {saved && (
            <p role="status" className="mt-2 text-sm text-mint">
              Saved.
            </p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted">City</dt>
              <dd className="font-semibold">Pune</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Workplace</dt>
              <dd className="font-semibold">{p.workplace.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Move date</dt>
              <dd className="font-semibold">{fmtDate(p.moveDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Monthly budget</dt>
              <dd className="font-semibold">{inr(p.budget)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted">Priorities</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">{p.priorities.map((x) => <Badge key={x} tone="blue">{PRIORITY_LABEL[x]}</Badge>)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted">Needs help with</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">{p.needs.map((x) => <Badge key={x}>{SLOT_LABEL[x]}</Badge>)}</dd>
            </div>
          </dl>
        </Card>
        <Card className="p-6">
          <h2 className="font-bold">Your inquiries</h2>
          {state.inquiries.length ? (
            <ul className="mt-4 divide-y divide-line">
              {state.inquiries.map((i) => (
                <li key={i.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/services/${i.listingId}`} className="font-semibold hover:text-blue">
                      {i.listingName}
                    </Link>
                    <Badge tone={i.delivered ? "mint" : "muted"}>{i.delivered ? "Received by Settlr" : "Saved locally"}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-muted">{i.message}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(i.createdAt).toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No inquiries yet. Use “Inquire” on any listing.</p>
          )}
        </Card>
      </div>
    </>
  );
}

export function SettingsView() {
  const { state, user, connected, reset } = useSettlr();
  const router = useRouter();
  const confirmDlg = useRef<HTMLDialogElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function exportData() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "settlr-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function signOut() {
    await supabaseBrowser()?.auth.signOut();
    reset();
    router.push("/");
  }

  async function deleteAll() {
    setBusy(true);
    const sb = supabaseBrowser();
    if (sb && user) {
      const { error } = await sb.rpc("delete_my_account");
      if (error) {
        setBusy(false);
        setMsg("Could not delete your account. Please try again or contact us.");
        return;
      }
      await sb.auth.signOut();
    }
    reset();
    router.push("/?deleted=1");
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Account & data" />
      <div className="grid max-w-3xl gap-6">
        <Card className="p-6">
          <h2 className="font-bold">Account</h2>
          {!connected ? (
            <p className="mt-2 text-sm text-muted">Demo mode — there are no accounts. Everything is stored in this browser&apos;s local storage.</p>
          ) : user ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>
                Signed in as <strong>{user.email}</strong>
              </span>
              <div className="flex gap-2">
                <LinkButton href="/update-password" variant="secondary">
                  Change password
                </LinkButton>
                <Button variant="secondary" onClick={signOut}>
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <LinkButton href="/login">Log in</LinkButton>
              <LinkButton href="/sign-up" variant="secondary">
                Create account
              </LinkButton>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="font-bold">Your data</h2>
          <p className="mt-2 text-sm text-muted">Download a copy of your plan, checklist, saved items and inquiries, or delete it all.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportData}>
              Download my data (JSON)
            </Button>
            <Button variant="secondary" className="!text-coral" onClick={() => confirmDlg.current?.showModal()}>
              {user ? "Delete my account and data" : "Delete my data"}
            </Button>
          </div>
          {msg && (
            <p role="alert" className="mt-3 text-sm text-coral">
              {msg}
            </p>
          )}
        </Card>
      </div>
      <dialog ref={confirmDlg} aria-labelledby="del-title" className="m-auto w-[min(92vw,440px)] rounded-3xl bg-white p-6 shadow-lift">
        <h2 id="del-title" className="text-lg font-extrabold">
          Delete everything?
        </h2>
        <p className="mt-2 text-sm text-muted">
          {user ? "Your account, relocation profile, plan, checklist, saved items and inquiries will be permanently deleted. This cannot be undone." : "Your plan, checklist, saved items and inquiries will be removed from this browser. This cannot be undone."}
        </p>
        <form method="dialog" className="mt-6 flex justify-end gap-2">
          <Button type="submit" variant="secondary" autoFocus>
            Cancel
          </Button>
          <Button variant="coral" disabled={busy} onClick={deleteAll}>
            {busy ? "Deleting…" : "Delete permanently"}
          </Button>
        </form>
      </dialog>
    </>
  );
}
