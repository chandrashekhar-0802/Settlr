# Architecture

```
src/
  app/                 Next.js App Router routes (see README for the route list)
    api/               Route handlers: inquiries, provider applications (zod-validated, rate-limited)
    admin/             Server-rendered, admin-only (checked in the database, not the client)
  components/          UI: header/footer, ui primitives, listing cards, hero 3D scene, plan widgets
  lib/
    types.ts           Domain types (Listing, RelocationProfile, ChecklistItem…)
    demo-data.ts       Deterministic, clearly-labelled DEMO listings for Pune
    listings.ts        Server data access: demo data OR Supabase, never both
    plan.ts            Planning engine (ranking, plan assembly, totals) — pure functions
    commute.ts         Distance + commute estimates from stored coordinates and stated assumptions
    filters.ts         Search / filter / sort / paginate — pure
    checklist.ts       Default tasks relative to the move date
    store.tsx          Client user-state store (localStorage in demo, Supabase rows when signed in)
    supabase/          Browser + server clients
  proxy.ts             Session refresh + optimistic redirect for private routes (connected mode)
supabase/
  migrations/          Schema, RLS policies, admin function
  seed.sql             Optional demo rows (flagged is_demo)
tests/unit             Vitest: engine, commute, filters, checklist, formatting
tests/e2e              Playwright: main journeys + screenshot sweep
```

## Two modes

| | Demo mode (no env) | Connected mode (Supabase env set) |
|---|---|---|
| Listings | `demo-data.ts`, all `DEMO` | `listings` table, `published = true` only |
| User data | this browser's localStorage | user-owned rows under RLS |
| Auth | none — banner says "Demo mode" | Supabase email/password, reset, sessions |
| Inquiries / provider applications | validated, kept in this browser, UI says nothing was sent | stored in DB; admins review |
| Admin | locked with setup instructions | `is_admin()` in Postgres |

## Planning engine

`buildPlan(listings, profile, choices)` is pure and deterministic:

1. **Stay** — each listing is scored 0–100 from budget fit (vs. 45% of budget), road distance to the workplace (straight line × 1.35), amenity/quality match, trust (verified) and data completeness. Priorities double the relevant weight. Reasons are produced alongside the score.
2. **Food / Wi-Fi / laundry** — skipped with a "covered by your stay" line when the stay includes them, so nothing is double counted. The user can still pick one.
3. **Commute** — modes are estimated from the chosen stay to work using stated speed and ₹/km assumptions × 22 workdays × 2 trips.
4. **Essentials** — furniture becomes *optional* on a furnished stay; cleaning is always optional. Optional lines are shown but excluded from the monthly total.
5. **Totals** — monthly recurring, one-time, deposits, optional monthly, move-in cash (first month + one-time + deposits), remaining budget, over-budget flag.

User replacements are stored as `choices[slot] = listingId | "none"` and the plan recomputes instantly.

## Security

- Secrets only in env vars; `.env*` ignored except `.env.example`.
- RLS on every table. User tables: `user_id = auth.uid()`. Listings: public read of published rows only; writes admin-only.
- Admin = row in `admins`, which has no client write policy (set via SQL / service role). `is_admin()` is `security definer` and checked in RLS and on the server — never from user metadata.
- Server routes validate with zod, cap field lengths, and rate-limit per IP (in-memory per instance — see note in code).
- Login redirects only accept same-site relative paths.

## Checkpoint reviews

- **Ponytail audit (Phase 5):** removed a dead icon map and a duplicate screenshot script, merged a duplicated plan-slot lookup into `slotFor()`, dropped `forwardRef` (React 19 ref prop), un-exported an internal helper. Every remaining dependency maps to a requested feature.
- **Security review (Phase 5):** fixed one self-XSS (user-typed workplace name passed to a Leaflet HTML tooltip — now a text node). No `dangerouslySetInnerHTML`; `npm audit` clean; no secrets in git; RLS verified by `npm run test:rls` (22 checks: cross-user isolation, anon limits, no self-admin, no self-verification, no self-approval, inquiry spoofing, account-deletion cascade).
- **Performance (local, simulated 10 Mbps / 40 ms):** home LCP ≈ 0.5 s at 1440 and 390, CLS 0. The Three.js bundle loads after idle and only on capable desktop browsers; phones get a pre-rendered WebP of the scene.
