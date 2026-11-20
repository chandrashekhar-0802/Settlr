# Local setup

Requirements: Node.js 20.9+ (tested on 24), npm.

```powershell
npm install
npm run dev          # http://localhost:3000 — demo mode, no keys needed
```

## Checks

```powershell
npm run check        # eslint + tsc --noEmit + vitest
npx playwright install chromium
npm run build
npm run test:e2e     # starts `next start` on :3100 and runs journeys + screenshots
```

## Connected mode (optional, Supabase free tier)

1. Create a project at supabase.com (free plan).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then optionally `supabase/seed.sql` (demo rows, labelled DEMO).
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API). Do not paste keys into chat, issues or commits.
4. Auth → URL configuration: Site URL `http://localhost:3000`, redirect URL `http://localhost:3000/auth/callback`.
5. Make yourself an admin after signing up — in the SQL editor:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```

No service-role key is used by the app.
