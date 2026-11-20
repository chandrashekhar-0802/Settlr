# Settlr

**Your new job. Your new city. Everything sorted.**

Settlr helps people relocating for their first job find a stay, food, a commute and everyday essentials — organised around their workplace and monthly budget. First city: **Pune** (Hinjewadi, Wakad, Baner, Kharadi, Viman Nagar, Hadapsar, Pimpri-Chinchwad).

- Premium landing page with a real-time 3D miniature city (React Three Fiber) and a static fallback
- Guided onboarding → a personalised, explainable relocation plan (rule-based, no AI key needed)
- Explore stays, food, commute options and essentials with search, filters, sorting, pagination and a map
- Save, compare, swap items in the plan and watch the budget recalculate
- Budget planner (monthly vs one-time vs deposits vs optional), moving checklist, inquiries
- Provider applications + admin review (Supabase, RLS-enforced)

> **Honesty note:** all listings in this MVP are sample data shown with a **DEMO** badge. Nothing is marked verified without a real verification process. Settlr does not process payments. Commute times and costs are estimates from stated assumptions, not live data.

## Quick start

```powershell
npm install
npm run dev
```

Runs in **demo mode** without any keys. See [SETUP.md](SETUP.md) for Supabase, [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel, [ARCHITECTURE.md](ARCHITECTURE.md) for how it fits together and [RESEARCH.md](RESEARCH.md) for dependency decisions.

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · Three.js / React Three Fiber / Drei · Lenis · Leaflet + OpenStreetMap · Supabase (optional) · zod · Vitest · Playwright

## Routes

| Route | What it is |
|---|---|
| `/` | Landing page with the 3D city hero and product story |
| `/onboarding` | 6-step relocation setup → plan generation |
| `/dashboard` | Personalised dashboard (plan summary, costs, tasks, explainer slot) |
| `/my-plan` | Explainable plan: swap / remove any service, totals recalculate |
| `/budget` | Budget planner: monthly vs one-time vs deposits vs optional |
| `/explore`, `/explore/accommodation`, `/explore/food`, `/explore/essentials` | Search, filters, sort, pagination, list/map |
| `/explore/transport` | Commute estimates with stated method |
| `/services/[id]` | Service detail, inquiry, save, compare, report |
| `/saved`, `/compare`, `/checklist`, `/profile`, `/settings` | Shortlist, side-by-side comparison, dated checklist, profile, data export/deletion |
| `/login`, `/sign-up`, `/reset-password`, `/update-password` | Supabase auth (connected mode) |
| `/provider/apply`, `/for-employers`, `/help`, `/about`, `/contact`, `/privacy`, `/terms` | Public pages |
| `/admin` | Admin (server + RLS enforced; locked in demo mode) |

## Quality checks

```powershell
npm run check       # eslint + tsc + vitest (engine, commute, filters, checklist)
npm run test:rls    # schema + row-level-security checks against in-memory Postgres
npm run build
npm run test:e2e    # Playwright journeys, desktop + mobile
```

## Explainer video

A 60-second English explainer, made with [HyperFrames](https://github.com/heygen-com/hyperframes) from real screenshots and a real recording of this site, plays on `/dashboard`. It's served from `public/video/` (Vercel CDN): `settlr-explainer.mp4`, a poster image and `settlr-explainer.vtt` captions.

The editable project is in `video/` (see `video/README.md`): script, timing, scenes, captions, voice and music sources.
