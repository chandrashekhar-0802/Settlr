"use client";

/**
 * User state: relocation profile, saved items, comparison tray, plan choices, checklist, inquiries.
 * Demo mode → this browser's localStorage only.
 * Connected mode + signed in → Supabase tables (RLS: each user reads/writes only their own rows), localStorage as a cache.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { defaultChecklist } from "./checklist";
import type { Choices } from "./plan";
import { supabaseBrowser } from "./supabase/client";
import type { ChecklistItem, Inquiry, Need, RelocationProfile } from "./types";

export type State = {
  profile: RelocationProfile | null;
  saved: string[];
  compare: string[];
  choices: Choices;
  checklist: ChecklistItem[] | null;
  inquiries: Inquiry[];
};

const EMPTY: State = { profile: null, saved: [], compare: [], choices: {}, checklist: null, inquiries: [] };
const KEY = "settlr:v1";
export const MAX_COMPARE = 4;

/** A profile always has a checklist; regenerate defaults if one is missing. */
const withChecklist = (s: State): State => (s.profile && !s.checklist ? { ...s, checklist: defaultChecklist(s.profile.moveDate) } : s);

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return withChecklist(raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY);
  } catch {
    return EMPTY;
  }
}

type Ctx = {
  state: State;
  ready: boolean;
  connected: boolean;
  user: User | null;
  setProfile: (p: RelocationProfile) => void;
  toggleSave: (id: string) => void;
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;
  choose: (slot: Need, id: string | "none" | null) => void;
  setChecklist: (fn: (items: ChecklistItem[]) => ChecklistItem[]) => void;
  addInquiry: (i: Inquiry) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ connected, children }: { connected: boolean; children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const sb = connected ? supabaseBrowser() : null;

  // Hydrate from localStorage, then (connected) from the user's rows.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setState(load());
    if (!sb) return setReady(true);
    const hydrate = async (u: User | null) => {
      setUser(u);
      if (!u) return setReady(true);
      const [p, s, c, k, i] = await Promise.all([
        sb.from("relocation_profiles").select("*").eq("user_id", u.id).maybeSingle(),
        sb.from("saved_listings").select("listing_id").eq("user_id", u.id),
        sb.from("plan_items").select("slot,choice").eq("user_id", u.id),
        sb.from("checklist_items").select("id,title,category,due,done").eq("user_id", u.id).order("created_at"),
        sb.from("service_inquiries").select("id,listing_id,listing_name,message,created_at").eq("user_id", u.id).order("created_at", { ascending: false }),
      ]);
      setState((prev) => withChecklist({
        ...prev,
        profile: p.data
          ? { city: p.data.city, workplace: p.data.workplace, moveDate: p.data.move_date, budget: p.data.budget, priorities: p.data.priorities, needs: p.data.needs, name: p.data.display_name ?? undefined }
          : prev.profile,
        saved: s.data ? s.data.map((r: { listing_id: string }) => r.listing_id) : prev.saved,
        choices: c.data ? Object.fromEntries(c.data.map((r: { slot: string; choice: string }) => [r.slot, r.choice])) : prev.choices,
        checklist: k.data?.length ? k.data : prev.checklist,
        inquiries: i.data
          ? i.data.map((r: { id: string; listing_id: string; listing_name: string; message: string; created_at: string }) => ({ id: r.id, listingId: r.listing_id, listingName: r.listing_name, message: r.message, createdAt: r.created_at, delivered: false }))
          : prev.inquiries,
      }));
      // Guest who onboarded before signing up: push the local profile to the new account.
      if (!p.data) {
        const local = load().profile;
        if (local)
          await sb.from("relocation_profiles").upsert({ user_id: u.id, city: local.city, workplace: local.workplace, move_date: local.moveDate, budget: local.budget, priorities: local.priorities, needs: local.needs, display_name: local.name ?? null });
      }
      setReady(true);
    };
    sb.auth.getUser().then(({ data }: { data: { user: User | null } }) => hydrate(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((evt: string, session: { user: User } | null) => {
      if (evt === "SIGNED_IN" || evt === "SIGNED_OUT") hydrate(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: state still works for this session */
    }
  }, [state, ready]);

  // Remote write-through. Errors are logged without data; local state stays the source of truth for the UI.
  const remote = useCallback(
    (fn: (uid: string) => PromiseLike<{ error: unknown }>) => {
      if (!sb || !user) return;
      fn(user.id).then(({ error }) => error && console.warn("Settlr sync failed"));
    },
    [sb, user],
  );

  const api = useMemo<Ctx>(
    () => ({
      state,
      ready,
      connected,
      user,
      setProfile: (p) => {
        setState((s) => ({ ...s, profile: p, checklist: s.checklist ?? defaultChecklist(p.moveDate) }));
        remote((uid) =>
          sb!.from("relocation_profiles").upsert({ user_id: uid, city: p.city, workplace: p.workplace, move_date: p.moveDate, budget: p.budget, priorities: p.priorities, needs: p.needs, display_name: p.name ?? null }),
        );
        if (!state.checklist) {
          const items = defaultChecklist(p.moveDate);
          remote((uid) => sb!.from("checklist_items").insert(items.map((it) => ({ ...it, user_id: uid }))));
        }
      },
      toggleSave: (id) => {
        const on = !state.saved.includes(id);
        setState((s) => ({ ...s, saved: on ? [...s.saved, id] : s.saved.filter((x) => x !== id) }));
        remote((uid) => (on ? sb!.from("saved_listings").insert({ user_id: uid, listing_id: id }) : sb!.from("saved_listings").delete().eq("user_id", uid).eq("listing_id", id)));
      },
      toggleCompare: (id) => {
        if (!state.compare.includes(id) && state.compare.length >= MAX_COMPARE) return false;
        setState((s) => ({ ...s, compare: s.compare.includes(id) ? s.compare.filter((x) => x !== id) : [...s.compare, id] }));
        return true;
      },
      clearCompare: () => setState((s) => ({ ...s, compare: [] })),
      choose: (slot, id) => {
        setState((s) => {
          const choices = { ...s.choices };
          if (id == null) delete choices[slot];
          else choices[slot] = id;
          return { ...s, choices };
        });
        remote((uid) =>
          id == null ? sb!.from("plan_items").delete().eq("user_id", uid).eq("slot", slot) : sb!.from("plan_items").upsert({ user_id: uid, slot, choice: id }),
        );
      },
      setChecklist: (fn) => {
        const before = state.checklist ?? [];
        const after = fn(before);
        setState((s) => ({ ...s, checklist: after }));
        if (!sb || !user) return;
        const removed = before.filter((b) => !after.some((a) => a.id === b.id)).map((b) => b.id);
        const changed = after.filter((a) => before.find((b) => b.id === a.id) !== a);
        if (removed.length) remote((uid) => sb.from("checklist_items").delete().eq("user_id", uid).in("id", removed));
        if (changed.length) remote((uid) => sb.from("checklist_items").upsert(changed.map((c) => ({ ...c, user_id: uid }))));
      },
      addInquiry: (i) => setState((s) => ({ ...s, inquiries: [i, ...s.inquiries] })),
      reset: () => {
        setState(EMPTY);
        try {
          localStorage.removeItem(KEY);
        } catch {}
      },
    }),
    [state, ready, connected, user, remote, sb],
  );

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export function useSettlr() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useSettlr outside StoreProvider");
  return ctx;
}
