-- Table privileges for the Data API roles. Newer Supabase projects don't auto-grant these, and RLS only
-- filters rows a role is already allowed to touch. Least privilege; RLS policies in 0001 still decide which rows.
-- Idempotent: safe to run more than once.

grant usage on schema public to anon, authenticated;

-- Visitors (not signed in): browse the catalogue, submit inquiries / provider applications / reports.
grant select on public.listings to anon;
grant insert on public.service_inquiries, public.provider_applications, public.listing_reports to anon;

-- Signed-in users: own data (RLS: user_id = auth.uid()) plus the visitor actions.
grant select on public.listings to authenticated;
grant select, insert, update, delete on public.relocation_profiles, public.saved_listings, public.plan_items, public.checklist_items to authenticated;
grant select, insert on public.service_inquiries to authenticated;
grant insert on public.provider_applications, public.listing_reports to authenticated;
grant select on public.admins to authenticated;

-- Admin-only actions are granted to `authenticated` but gated by is_admin() in RLS.
grant insert, update, delete on public.listings to authenticated;
grant update on public.service_inquiries to authenticated;
grant select, update on public.provider_applications, public.listing_reports to authenticated;
grant select, insert on public.admin_audit_logs to authenticated;
grant usage on all sequences in schema public to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
