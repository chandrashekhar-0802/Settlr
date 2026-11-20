"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, inputCls } from "@/components/ui";
import { CHECKLIST_CATEGORIES, defaultChecklist } from "@/lib/checklist";
import { fmtDate, todayIso } from "@/lib/format";
import { useSettlr } from "@/lib/store";
import type { ChecklistItem } from "@/lib/types";
import { RequireProfile } from "./RequireProfile";

export function ChecklistView() {
  return (
    <RequireProfile>
      <Checklist />
    </RequireProfile>
  );
}

function Checklist() {
  const { state, setChecklist } = useSettlr();
  const items = state.checklist ?? [];
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<string>(CHECKLIST_CATEGORIES[0]);
  const [due, setDue] = useState("");
  const [err, setErr] = useState("");
  const today = todayIso();

  const update = (id: string, patch: Partial<ChecklistItem>) => setChecklist((all) => all.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => setChecklist((all) => all.filter((i) => i.id !== id));
  const shown = items.filter((i) => (filter === "all" ? true : filter === "done" ? i.done : !i.done));

  return (
    <>
      <PageHeader
        eyebrow="Moving checklist"
        title="Everything to do, in order"
        body={`Due dates are based on your move date, ${fmtDate(state.profile!.moveDate)}.`}
        actions={
          items.length === 0 && (
            <Button onClick={() => setChecklist(() => defaultChecklist(state.profile!.moveDate))}>Load default tasks</Button>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Show">
            {(["all", "open", "done"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="min-h-9 rounded-full bg-white px-4 text-sm font-semibold capitalize ring-1 ring-line aria-pressed:bg-navy aria-pressed:text-white">
                {f}
              </button>
            ))}
          </div>
          {CHECKLIST_CATEGORIES.map((c) => {
            const group = shown.filter((i) => i.category === c).sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"));
            if (!group.length) return null;
            return (
              <section key={c} aria-labelledby={`cat-${c}`}>
                <h2 id={`cat-${c}`} className="mb-2 text-sm font-bold text-muted">
                  {c}
                </h2>
                <Card className="divide-y divide-line">
                  {group.map((i) => (
                    <Task key={i.id} i={i} today={today} onChange={(p) => update(i.id, p)} onRemove={() => remove(i.id)} />
                  ))}
                </Card>
              </section>
            );
          })}
          {shown.length === 0 && <p className="text-sm text-muted">No tasks here.</p>}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="text-sm text-muted">Completion</p>
            <p className="mt-1 text-4xl font-extrabold">{pct}%</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-tint" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist completion">
              <div className="h-full rounded-full bg-mint transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {done} of {items.length} tasks done
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold">Add a task</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (title.trim().length < 2) return setErr("Enter a task (2+ characters).");
                setChecklist((all) => [...all, { id: crypto.randomUUID(), title: title.trim().slice(0, 140), category: cat, due: due || null, done: false }]);
                setTitle("");
                setDue("");
                setErr("");
              }}
            >
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Buy a pressure cooker" className={inputCls} aria-label="Task" aria-invalid={Boolean(err)} maxLength={140} />
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls} aria-label="Category">
                {CHECKLIST_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} aria-label="Due date (optional)" />
              {err && (
                <p role="alert" className="text-xs font-medium text-coral">
                  {err}
                </p>
              )}
              <Button type="submit" className="w-full">
                <Icon name="plus" size={16} /> Add task
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Task({ i, today, onChange, onRemove }: { i: ChecklistItem; today: string; onChange: (p: Partial<ChecklistItem>) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(i.title);
  const [due, setDue] = useState(i.due ?? "");
  const overdue = !i.done && i.due && i.due < today;
  if (editing)
    return (
      <form
        className="flex flex-wrap items-center gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim().length < 2) return;
          onChange({ title: title.trim().slice(0, 140), due: due || null });
          setEditing(false);
        }}
      >
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} min-w-0 flex-1 basis-48`} aria-label="Task title" maxLength={140} />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputCls} w-auto`} aria-label="Due date" />
        <Button type="submit">Save</Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </form>
    );
  return (
    <div className="group flex items-center gap-3 px-4 py-3">
      <input type="checkbox" checked={i.done} onChange={(e) => onChange({ done: e.target.checked })} className="size-5 shrink-0" aria-label={`Mark "${i.title}" ${i.done ? "not done" : "done"}`} />
      <span className={`min-w-0 flex-1 text-sm ${i.done ? "text-muted line-through" : ""}`}>{i.title}</span>
      {i.due && <span className={`shrink-0 text-xs ${overdue ? "font-semibold text-coral" : "text-muted"}`}>{overdue ? "Overdue · " : ""}{fmtDate(i.due)}</span>}
      <button type="button" onClick={() => setEditing(true)} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-tint hover:text-navy" aria-label={`Edit "${i.title}"`}>
        <Icon name="edit" size={16} />
      </button>
      <button type="button" onClick={onRemove} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-coral-soft hover:text-coral" aria-label={`Delete "${i.title}"`}>
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}
