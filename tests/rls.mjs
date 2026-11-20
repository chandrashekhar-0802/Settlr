// RLS + schema check against an in-memory Postgres (PGlite) with a stubbed Supabase auth schema.
// npm run test:rls
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const [mig, seed] = process.argv.slice(2).map((f) => readFileSync(f, "utf8"));
const db = new PGlite();
const ok = (m) => console.log("PASS", m);
const fail = (m) => { console.log("FAIL", m); process.exitCode = 1; };
const check = (cond, m) => (cond ? ok(m) : fail(m));
// Reading a forbidden table passes if it errors (no privilege) or returns zero rows (RLS).
const noRows = async (p) => { try { return (await p).rows[0].n === 0; } catch { return true; } };
// Minimal Supabase auth stub
await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
`);
try { await db.exec(mig); } catch (e) { console.log("SQL ERROR:", e.message, e.position); process.exit(1); }
// Only the privileges the migrations grant (newer Supabase projects grant nothing by default).
await db.exec(readFileSync(process.argv[4] ?? "supabase/migrations/0002_grants.sql", "utf8"));
await db.exec(seed);
ok("migration + seed applied: " + (await db.query("select count(*)::int n from listings")).rows[0].n + " listings");
const A = "11111111-1111-1111-1111-111111111111", B = "22222222-2222-2222-2222-222222222222", ADM = "33333333-3333-3333-3333-333333333333";
await db.exec(`insert into auth.users values ('${A}','a@x.com'),('${B}','b@x.com'),('${ADM}','adm@x.com'); insert into admins values ('${ADM}');`);
await db.exec(`insert into listings (id,category,kind,name,locality,lat,lng,published) values ('draft-1','food','tiffin','Draft Tiffin','Wakad',18.6,73.76,false)`);
const as = async (role, uid, sql) => {
  await db.exec(`reset role; select set_config('test.uid', '${uid ?? ""}', false); set role ${role};`);
  try { return sql.trim().includes(";") ? (await db.exec(sql)).at(-1) : await db.query(sql); } finally { await db.exec("reset role"); }
};
const expectErr = async (label, p) => { try { await p; fail(label + " (no error)"); } catch { ok(label); } };

// listings
check((await as("anon", null, "select count(*)::int n from listings where id='draft-1'")).rows[0].n === 0, "anon cannot see unpublished listing");
check((await as("anon", null, "select count(*)::int n from listings")).rows[0].n === 62, "anon sees 62 published");
await expectErr("anon cannot insert listing", as("anon", null, "insert into listings (category,kind,name,locality,lat,lng) values ('food','tiffin','x y','Wakad',1,1)"));
const upd = await as("authenticated", A, "update listings set verified=true where id='acc-1' returning id");
check(upd.rows.length === 0, "user cannot verify a listing");
check((await as("authenticated", ADM, "select count(*)::int n from listings where id='draft-1'")).rows[0].n === 1, "admin sees draft");
check((await as("authenticated", ADM, "update listings set published=true where id='draft-1' returning id")).rows.length === 1, "admin can publish");
// admins table
await expectErr("user cannot make themselves admin", as("authenticated", A, `insert into admins values ('${A}')`));
// profiles
await as("authenticated", A, `insert into relocation_profiles (user_id, workplace, move_date, budget) values ('${A}', '{}', '2027-01-01', 25000)`);
check((await as("authenticated", B, "select count(*)::int n from relocation_profiles")).rows[0].n === 0, "user B cannot read user A's plan");
check(await noRows(as("anon", null, "select count(*)::int n from relocation_profiles")), "anon cannot read plans");
await expectErr("user B cannot write a row for A", as("authenticated", B, `insert into saved_listings values ('${A}','acc-1')`));
await as("authenticated", A, `insert into saved_listings values ('${A}','acc-1'); insert into checklist_items (user_id,id,title,category) values ('${A}','d1','Pack','Packing'); insert into plan_items values ('${A}','accommodation','acc-2')`);
ok("user writes own saved/checklist/plan rows");
// inquiries
await as("anon", null, `insert into service_inquiries (listing_id, listing_name, name, email, message) values ('acc-1','x','Ravi','r@x.com','Is this available in Jan?')`);
ok("anon can submit inquiry");
await expectErr("anon cannot spoof inquiry user_id", as("anon", null, `insert into service_inquiries (listing_id, listing_name, user_id, name, email, message) values ('acc-1','x','${A}','R','r@x.com','Is this available?')`));
check(await noRows(as("anon", null, "select count(*)::int n from service_inquiries")), "anon cannot read inquiries");
check((await as("authenticated", ADM, "select count(*)::int n from service_inquiries")).rows[0].n === 1, "admin reads inquiries");
// applications
await as("anon", null, `insert into provider_applications (business_name,category,locality,contact_name,email,phone,services,pricing) values ('B','food','Wakad','C','c@x.com','9999999999','Veg meals daily','3000')`);
ok("anon can apply as provider");
await expectErr("cannot self-approve application", as("anon", null, `insert into provider_applications (business_name,category,locality,contact_name,email,phone,services,pricing,status) values ('B','food','Wakad','C','c@x.com','9','Veg meals daily','3000','approved')`));
check((await as("authenticated", A, "select count(*)::int n from provider_applications")).rows[0].n === 0, "users cannot read applications");
// audit
await expectErr("non-admin cannot write audit log", as("authenticated", A, `insert into admin_audit_logs (admin_id, action, target) values ('${A}','x','y')`));
// delete account cascade
await as("authenticated", A, "select delete_my_account()");
check((await db.query(`select (select count(*) from relocation_profiles where user_id='${A}')::int + (select count(*) from saved_listings where user_id='${A}')::int + (select count(*) from checklist_items where user_id='${A}')::int n`)).rows[0].n === 0, "delete_my_account cascades user data");
await expectErr("anon cannot call delete_my_account", as("anon", null, "select delete_my_account()"));
