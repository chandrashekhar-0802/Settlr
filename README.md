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
