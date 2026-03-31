create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  telegram_user_id bigint null unique,
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  match_id text not null unique,
  season int not null,
  tournament text not null,
  stage text not null,
  match_no int null,
  team_a text not null,
  team_b text not null,
  venue text null,
  date_local date not null,
  start_time_local timestamptz not null,
  start_time_utc timestamptz not null,
  lock_time_local timestamptz not null,
  lock_time_utc timestamptz not null,
  lock_rule text not null,
  status text not null default 'scheduled',
  winner text null,
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_status_check check (status in ('scheduled', 'locked', 'completed', 'settled', 'cancelled')),
  constraint matches_winner_check check (
    winner is null or winner = team_a or winner = team_b
  )
);

create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  bet_type text not null default 'winner',
  selection text not null,
  submitted_at timestamptz not null default now(),
  status text not null,
  result_points int null,
  source text not null,
  raw_text text null,
  parsed_confidence numeric null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bets_type_check check (bet_type = 'winner'),
  constraint bets_status_check check (status in ('submitted', 'rejected_late', 'rejected_invalid', 'settled', 'auto_no_bet')),
  constraint bets_result_points_check check (result_points in (-1, 0, 1) or result_points is null)
);

create unique index if not exists uq_bets_profile_match_bet_type
  on public.bets(profile_id, match_id, bet_type);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  action text not null,
  object_type text not null,
  object_id text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_is_active on public.profiles(is_active);
create index if not exists idx_matches_match_id on public.matches(match_id);
create index if not exists idx_matches_season on public.matches(season);
create index if not exists idx_matches_date_local on public.matches(date_local);
create index if not exists idx_matches_start_time_utc on public.matches(start_time_utc);
create index if not exists idx_matches_lock_time_utc on public.matches(lock_time_utc);
create index if not exists idx_bets_profile_id on public.bets(profile_id);
create index if not exists idx_bets_match_id on public.bets(match_id);
create index if not exists idx_bets_status on public.bets(status);
create index if not exists idx_audit_log_object on public.audit_log(object_type, object_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_matches_updated_at on public.matches;
create trigger trg_matches_updated_at
before update on public.matches
for each row
execute function public.set_updated_at();

drop trigger if exists trg_bets_updated_at on public.bets;
create trigger trg_bets_updated_at
before update on public.bets
for each row
execute function public.set_updated_at();
