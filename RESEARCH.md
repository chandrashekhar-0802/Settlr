# Research & dependency decisions

Checked November 2026 (GitHub metadata via `gh api`, npm registry versions via `npm view`).

| Repo | License | Activity | Decision |
|---|---|---|---|
| affaan-m/ECC | MIT | very active | **Patterns only.** Adopted: research-first, small verified phases, tests before claims, security review at checkpoints. Did not install its plugin bundle — mostly unrelated agent config. |
| GoogleChrome/modern-web-guidance | Apache-2.0 | active | **Used** (installed as a Claude Code skill). Applied guides: `scroll-entry-exit-effects` (CSS `animation-timeline: view()` reveals behind `@supports` + `prefers-reduced-motion`, no polyfill since they are decorative) and `dialog` (native `<dialog>` + `showModal()` for the mobile menu, filter drawer and inquiry form; no manual focus traps; `overscroll-behavior: contain` instead of locking `body`). |
| wheresryan22/anatomy | MIT | active | **Approach adopted, kit not vendored.** Its craft rules (object-as-explanation, four-tone shaded solids, framed "Fig n" card with live readout, calm eased motion, stills under reduced motion) drive the original isometric "How Settlr works" figure. Its full kit + audit tooling is sized for multi-hour engineering figures; a hand-built React SVG kept the bundle at zero extra dependencies. |
| heygen-com/hyperframes | Apache-2.0 | very active | **Reserved for Phase 6 (video)**, gated on UI approval. Nothing installed or rendered yet. |
| gosom/google-maps-scraper | MIT | active | **Not used.** Scraping Google Maps conflicts with Google's terms and would make listings unlicensed. Settlr uses curated/demo data, provider applications, and OpenStreetMap tiles with attribution. |
| DietrichGebert/ponytail | MIT | active | **Used, mandatory.** Active as a Claude Code plugin for the whole build (simplest-solution ladder); `ponytail-review` / `ponytail-audit` run at checkpoints — results in ARCHITECTURE.md. |
| pmndrs/react-three-fiber | MIT | active | **Used** (v9, React 19). Declarative Three.js scene for the hero city. |
| pmndrs/drei | MIT | active | **Used, tree-shaken**: `RoundedBox` (bevels), `ContactShadows`, `Html` (hover labels), `Environment` + `Lightformer` (studio reflections without downloading an HDR). |
| darkroomengineering/lenis | MIT | active | **Used** for desktop smooth wheel scrolling; disabled for reduced motion, native on touch. ~4 kB. |
| 14islands/r3f-scroll-rig | MIT | last push Dec 2025 | **Not used.** Built to sync many DOM-tracked meshes; we have one canvas whose camera reads scroll progress inside `useFrame` (no React re-renders), which takes a few lines. |
| shadcn-ui/ui | MIT | very active | **Not used as a dependency.** It is a copy-paste generator; we need ~6 primitives (button, badge, card, field, dialog) which are small Tailwind components in `src/components/ui.tsx`, and native `<dialog>` covers the overlay primitive. |
| microsoft/playwright | Apache-2.0 | very active | **Used** for end-to-end journeys and the 1440/1024/390 screenshot sweep. |

## Other choices

- **Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind 4** — Vercel-native, file-based routes, server components for listing data. Next 16 renames middleware to `proxy.ts`.
- **Animation: CSS first.** Scroll reveals use native scroll-driven animations; the 3D camera uses scroll progress in the render loop. **GSAP and Motion were not added** — no task needed a third animation system.
- **Maps: Leaflet + OpenStreetMap tiles**, loaded only when the user opens the map view. Stored coordinates only, no geocoding calls, attribution shown. The public OSM tile server is fine for a demo; a commercial launch should move to a tile provider with an SLA (OSM tile usage policy).
- **Backend: Supabase** (Auth, Postgres, RLS) behind `@supabase/ssr`. Optional — without credentials the app runs in labelled demo mode.
- **Validation: zod** on every server entry point.
- **Recommendations: deterministic rules** (`src/lib/plan.ts`), no AI key required. Gemini is not integrated; it would only ever be an optional explanation layer on top, never a source of prices or availability.
