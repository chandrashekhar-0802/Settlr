// One-time database setup for connected mode: npm run db:setup
// Reads SUPABASE_DB_URL from .env.local (Supabase → Connect → Session pooler URI with your DB password),
// applies supabase/migrations/0001_init.sql (skipped if already applied), loads the DEMO seed, then verifies.
// The app itself never uses this URL; delete it from .env.local afterwards.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const url = env.SUPABASE_DB_URL;
if (!url || url.includes("[YOUR")) {
  console.error("Add SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@...pooler.supabase.com:5432/postgres to .env.local first.");
  process.exit(1);
}
const db = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await db.connect();
console.log("connected to", new URL(url).host);

const exists = (await db.query("select to_regclass('public.listings') is not null as ok")).rows[0].ok;
if (exists) console.log("schema already present — skipping migration");
else {
  await db.query(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  console.log("migration applied");
}
await db.query(readFileSync("supabase/seed.sql", "utf8"));
const n = (await db.query("select count(*)::int n from public.listings")).rows[0].n;
const rls = (await db.query("select count(*)::int n from pg_tables where schemaname='public' and not rowsecurity")).rows[0].n;
const admins = (await db.query("select count(*)::int n from public.admins")).rows[0].n;
console.log(`listings: ${n} · tables without RLS: ${rls} · admins: ${admins}`);
if (rls) console.error("WARNING: some public tables have RLS disabled");
await db.end();
console.log("done. To make yourself admin after signing up, run in the Supabase SQL editor:\n  insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';");
