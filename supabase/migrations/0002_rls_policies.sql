create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  );
$$;

create or replace function public.can_manage_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_admin(), false)
      or coalesce(auth.role(), '') = 'service_role';
$$;

grant execute on function public.is_admin() to authenticated, anon, service_role;
grant execute on function public.can_manage_admin() to authenticated, anon, service_role;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.bets enable row level security;
alter table public.audit_log enable row level security;

-- profiles are readable to authenticated users because this is a social league UI.
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid() or public.is_admin()
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  id = auth.uid() or public.is_admin()
)
with check (
  id = auth.uid() or public.is_admin()
);

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
on public.profiles
for delete
to authenticated
using (public.is_admin());

drop policy if exists "matches_select_authenticated" on public.matches;
create policy "matches_select_authenticated"
on public.matches
for select
to authenticated
using (true);

drop policy if exists "matches_write_admin_only" on public.matches;
create policy "matches_write_admin_only"
on public.matches
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "bets_select_authenticated" on public.bets;
create policy "bets_select_authenticated"
on public.bets
for select
to authenticated
using (true);

drop policy if exists "bets_insert_own_or_admin" on public.bets;
create policy "bets_insert_own_or_admin"
on public.bets
for insert
to authenticated
with check (
  profile_id = auth.uid() or public.is_admin()
);

drop policy if exists "bets_update_own_or_admin" on public.bets;
create policy "bets_update_own_or_admin"
on public.bets
for update
to authenticated
using (
  profile_id = auth.uid() or public.is_admin()
)
with check (
  profile_id = auth.uid() or public.is_admin()
);

drop policy if exists "bets_delete_admin_only" on public.bets;
create policy "bets_delete_admin_only"
on public.bets
for delete
to authenticated
using (public.is_admin());

drop policy if exists "audit_log_select_admin_only" on public.audit_log;
create policy "audit_log_select_admin_only"
on public.audit_log
for select
to authenticated
using (public.is_admin());

drop policy if exists "audit_log_insert_admin_only" on public.audit_log;
create policy "audit_log_insert_admin_only"
on public.audit_log
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "audit_log_delete_admin_only" on public.audit_log;
create policy "audit_log_delete_admin_only"
on public.audit_log
for delete
to authenticated
using (public.is_admin());
