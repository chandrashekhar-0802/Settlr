-- Settlr schema. Run once in the Supabase SQL editor (or `supabase db push`).
-- Design notes (refined from the original proposal):
--   * cities / localities / service categories live in code for the Pune MVP (src/lib/pune.ts) and as CHECK constraints here;
--     promote to tables when a second city or admin-managed taxonomy arrives.
--   * amenities are a text[] on listings (no join table needed at this size).
--   * no reviews table yet: we will not show reviews until they come from real, verified stays.
--   * listing_images deferred until provider uploads exist; listings render illustrations meanwhile.


-- ── helpers ──────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Admins are granted only via SQL / service role. No client policy can write this table.
create table public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "admins: read own row" on public.admins for select using (user_id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── listings (public catalogue) ─────────────────────────────────────────
create table public.listings (
  id text primary key default gen_random_uuid()::text,
  category text not null check (category in ('accommodation','food','transport','essentials')),
  kind text not null,
  name text not null check (char_length(name) between 2 and 120),
  locality text not null,
  city text not null default 'pune' check (city in ('pune')),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  description text not null default '',
  monthly integer not null default 0 check (monthly >= 0),
  one_time integer not null default 0 check (one_time >= 0),
  deposit integer not null default 0 check (deposit >= 0),
  price_note text,
  amenities text[] not null default '{}',
  attrs jsonb not null default '{}',          -- sharing, furnished, foodIncluded, diet, timings, speedKmh, perKm…
  verified boolean not null default false,     -- only set by an admin after real verification
  is_demo boolean not null default false,      -- sample data, always badged DEMO in the UI
  published boolean not null default false,
  provider_application_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_public_idx on public.listings (city, category) where published;
create trigger listings_touch before update on public.listings for each row execute function public.touch_updated_at();
alter table public.listings enable row level security;
create policy "listings: public reads published" on public.listings for select using (published or public.is_admin());
create policy "listings: admin insert" on public.listings for insert with check (public.is_admin());
create policy "listings: admin update" on public.listings for update using (public.is_admin()) with check (public.is_admin());
create policy "listings: admin delete" on public.listings for delete using (public.is_admin());

-- ── private user data (owner-only) ──────────────────────────────────────
create table public.relocation_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  city text not null default 'pune',
  workplace jsonb not null,
  move_date date not null,
  budget integer not null check (budget between 1000 and 1000000),
  priorities text[] not null default '{}',
  needs text[] not null default '{}',
  display_name text check (char_length(display_name) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger relocation_profiles_touch before update on public.relocation_profiles for each row execute function public.touch_updated_at();

create table public.saved_listings (
  user_id uuid not null references auth.users on delete cascade,
  listing_id text not null references public.listings on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.plan_items (
  user_id uuid not null references auth.users on delete cascade,
  slot text not null check (slot in ('accommodation','food','commute','wifi','furniture','laundry','cleaning','essentials')),
  choice text not null check (char_length(choice) <= 64), -- listing id or 'none'
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);

create table public.checklist_items (
  user_id uuid not null references auth.users on delete cascade,
  id text not null check (char_length(id) <= 64),
  title text not null check (char_length(title) between 1 and 140),
  category text not null check (char_length(category) <= 40),
  due date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

do $$
declare t text;
begin
  foreach t in array array['relocation_profiles','saved_listings','plan_items','checklist_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%s: owner only" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t, t);
  end loop;
end $$;

-- ── inquiries ───────────────────────────────────────────────────────────
create table public.service_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id text references public.listings on delete set null,
  listing_name text not null,
  user_id uuid references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) <= 120),
  phone text check (char_length(phone) <= 20),
  move_date date,
  message text not null check (char_length(message) between 10 and 1000),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
create index service_inquiries_user_idx on public.service_inquiries (user_id);
alter table public.service_inquiries enable row level security;
create policy "inquiries: anyone can create as self or anonymous" on public.service_inquiries for insert
  with check ((user_id is null or user_id = auth.uid()) and status = 'new');
create policy "inquiries: owner or admin reads" on public.service_inquiries for select using (user_id = auth.uid() or public.is_admin());
create policy "inquiries: admin updates" on public.service_inquiries for update using (public.is_admin()) with check (public.is_admin());

-- ── provider applications ──────────────────────────────────────────────
create table public.provider_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (char_length(business_name) between 1 and 120),
  category text not null check (category in ('accommodation','food','transport','essentials')),
  locality text not null check (char_length(locality) <= 80),
  contact_name text not null check (char_length(contact_name) <= 80),
  email text not null check (char_length(email) <= 120),
  phone text not null check (char_length(phone) <= 20),
  services text not null check (char_length(services) <= 1500),
  pricing text not null check (char_length(pricing) <= 500),
  website text check (char_length(website) <= 200),
  notes text check (char_length(notes) <= 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.provider_applications enable row level security;
create policy "applications: anyone submits as pending" on public.provider_applications for insert
  with check (status = 'pending' and reviewed_by is null and reviewed_at is null);
create policy "applications: admin reads" on public.provider_applications for select using (public.is_admin());
create policy "applications: admin updates" on public.provider_applications for update using (public.is_admin()) with check (public.is_admin());
alter table public.listings add constraint listings_application_fk foreign key (provider_application_id) references public.provider_applications on delete set null;

-- ── reports ─────────────────────────────────────────────────────────────
create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings on delete cascade,
  user_id uuid references auth.users on delete set null,
  reason text not null check (char_length(reason) between 5 and 500),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
alter table public.listing_reports enable row level security;
create policy "reports: anyone files open reports" on public.listing_reports for insert with check (status = 'open' and (user_id is null or user_id = auth.uid()));
create policy "reports: admin reads" on public.listing_reports for select using (public.is_admin());
create policy "reports: admin updates" on public.listing_reports for update using (public.is_admin()) with check (public.is_admin());

-- ── audit log ───────────────────────────────────────────────────────────
create table public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid not null references auth.users on delete cascade,
  action text not null,
  target text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.admin_audit_logs enable row level security;
create policy "audit: admin reads" on public.admin_audit_logs for select using (public.is_admin());
create policy "audit: admin writes own entries" on public.admin_audit_logs for insert with check (public.is_admin() and admin_id = auth.uid());

-- ── self-service account deletion ──────────────────────────────────────
-- Deletes the caller's auth user; ON DELETE CASCADE removes their profile, plan, checklist, saved items and inquiries.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
