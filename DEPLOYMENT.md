# Deploying Settlr to Vercel (manual)

Settlr is a standard Next.js 16 app. It deploys on Vercel's free **Hobby** plan with no paid features.

## 1. Import the repository

1. vercel.com → **Add New… → Project** → import `chandrashekhar-0802/Settlr`.
2. **Framework preset:** Next.js (auto-detected).
3. **Root directory:** `/` · **Build command:** `next build` (default) · **Output:** default · **Install:** `npm install` (default).
4. **Node.js version:** 20.x or newer (Project Settings → General).

## 2. Environment variables

| Variable | Scope | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | Recommended | e.g. `https://settlr.vercel.app`. Used for metadata, sitemap, robots. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Optional | Enables connected mode. Safe in the browser; protected by RLS. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Optional | Supabase publishable/anon key. Safe in the browser; protected by RLS. |
| `RESEND_API_KEY` | **Server-only secret** | Optional | Transactional emails. Never prefix with `NEXT_PUBLIC_`. |
| `RESEND_FROM` | Server-only | Optional | Verified sender, e.g. `Settlr <hello@yourdomain.com>`. |

- **Without any variables the site deploys in demo mode** (sample data, browser-only storage, accounts and admin disabled with clear messaging).
- `NEXT_PUBLIC_*` values are embedded in the browser bundle; never put secrets there.
- No Supabase **service-role** key is used anywhere — don't add one.
- Never set `RATE_LIMIT_OFF` in Vercel (it exists only for local end-to-end tests).
- After changing env vars, **redeploy** (Deployments → ⋯ → Redeploy) so they take effect.

## 3. Supabase (only if using connected mode)

1. Create a free project at supabase.com.
2. SQL editor → run `supabase/migrations/0001_init.sql`, then (optional) `supabase/seed.sql` for DEMO-labelled listings.
3. **Authentication → URL Configuration**
   - Site URL: `https://<your-domain>`
   - Redirect URLs: `https://<your-domain>/auth/callback` (add `http://localhost:3000/auth/callback` for local dev and, if you want previews, `https://*-<your-team>.vercel.app/auth/callback`).
4. Make an admin (after that person signs up):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'admin@example.com';
   ```
5. Supabase's built-in email sender is rate-limited on the free plan; configure custom SMTP (e.g. Resend) under Auth → SMTP before real users sign up.

## 4. Domain

Project → Settings → Domains → add your domain and follow the DNS instructions (A/CNAME). Then update `NEXT_PUBLIC_SITE_URL` and the Supabase Site/Redirect URLs to the new domain and redeploy.

## 5. Manual deploy checklist

- [ ] `npm run check && npm run build` passes locally
- [ ] `npm run test:e2e` passes
- [ ] Env vars set for Production (and Preview if wanted)
- [ ] Supabase redirect URLs include `/auth/callback` on the deployed domain
- [ ] Visit `/`, `/onboarding`, `/dashboard`, `/explore/accommodation`, `/admin` on the deployment
- [ ] `/robots.txt` and `/sitemap.xml` show the production domain

## Troubleshooting

| Symptom | Fix |
|---|---|
| Still says "Demo mode" | `NEXT_PUBLIC_SUPABASE_*` missing or set after the build — redeploy. |
| Login link lands on `/login?error=link` | Callback URL not in Supabase redirect list, or link expired. |
| Empty listings in connected mode | Seed not run, or listings not `published`. |
| Admin says "You don't have access" | Add the user's id to `public.admins` (SQL above). |
| Map tiles don't load | OpenStreetMap tile server unreachable or rate-limited — see below. |

## Platform notes if Settlr becomes commercial

- **Vercel Hobby is for non-commercial use only.** A commercial launch needs the Pro plan (or another host).
- **OpenStreetMap's public tile server** is not meant for production traffic; switch to a tile provider with an SLA (MapTiler, Stadia, Thunderforest, or self-hosted) and keep the attribution.
- **Supabase free projects pause after inactivity** and have limited auth emails; upgrade or configure SMTP.
- The in-memory rate limiter is per serverless instance; use a shared store (e.g. Upstash Redis) at scale.

## Explainer video

`public/video/settlr-explainer.mp4` (≈6 MB, H.264/AAC, `faststart`), its poster and `settlr-explainer.vtt` captions ship with the site and are served by Vercel's CDN with byte-range support, so they stream on iOS, Android and desktop. Nothing extra to configure. To replace it, re-encode the HyperFrames render with:

```powershell
ffmpeg -i video/renders/settlr-explainer.mp4 -t 60 -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 128k public/video/settlr-explainer.mp4
```

## Resend sender

`RESEND_FROM=Settlr <onboarding@resend.dev>` works immediately but Resend only delivers it to your own Resend account address. To email real users, verify your domain in Resend (add its DNS records) and change `RESEND_FROM` to an address on that domain.
