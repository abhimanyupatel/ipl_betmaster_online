-- 0005_manual_backfill_historical_bets.sql
--
-- Purpose:
-- Backfill bets that were made outside the app before Betmaster went live.
--
-- How to use:
-- 1. Replace the VALUES rows in temp_historical_bets with your own data.
-- 2. Run this in the Supabase SQL editor after your base schema/RPC migrations exist.
-- 3. Review the preview queries before running the final INSERT.
--
-- Notes:
-- - This script assumes tables: profiles, matches, bets, audit_log already exist.
-- - It matches profiles by username and matches by external text match_id.
-- - Historical picks are inserted as already-settled rows.
-- - Use result_points:
--     1  = correct pick
--     0  = incorrect pick
--    -1  = no bet / missed pick
--
-- Recommended source labels:
-- - 'historical_backfill'
-- - 'manual_backfill'
--
-- Optional safety:
-- Wrap the final INSERT in a transaction and ROLLBACK first to preview effects.

begin;

create temporary table temp_historical_bets (
  username text not null,
  match_external_id text not null,
  selection text not null,
  result_points int not null,
  submitted_at timestamptz null,
  source text not null default 'historical_backfill',
  raw_text text null
) on commit drop;

-- Replace these sample rows with your real backfill data.
insert into temp_historical_bets (
  username,
  match_external_id,
  selection,
  result_points,
  submitted_at,
  source,
  raw_text
) values
  ('abhi',  'ipl2026-002', 'Mumbai Indians', 1, '2026-03-29 12:45:00+00', 'historical_backfill', 'Picked manually before tool launch'),
  ('rahul', 'ipl2026-002', 'Kolkata Knight Riders', 0, '2026-03-29 12:55:00+00', 'historical_backfill', 'Picked manually before tool launch'),
  ('sid',   'ipl2026-002', '__NO_BET__', -1, '2026-03-29 13:31:00+00', 'historical_backfill', 'Missed the lock');

-- Preview 1: map usernames and match IDs.
with mapped as (
  select
    t.*,
    p.id as profile_id,
    p.display_name,
    m.id as match_uuid,
    m.team_a,
    m.team_b,
    m.winner as match_winner
  from temp_historical_bets t
  left join public.profiles p
    on lower(p.username) = lower(t.username)
  left join public.matches m
    on m.match_id = t.match_external_id
)
select *
from mapped
order by match_external_id, username;

-- Preview 2: unresolved rows that would fail insert.
with mapped as (
  select
    t.*,
    p.id as profile_id,
    m.id as match_uuid
  from temp_historical_bets t
  left join public.profiles p
    on lower(p.username) = lower(t.username)
  left join public.matches m
    on m.match_id = t.match_external_id
)
select *
from mapped
where profile_id is null
   or match_uuid is null;

-- Final insert.
insert into public.bets (
  profile_id,
  match_id,
  bet_type,
  selection,
  submitted_at,
  status,
  result_points,
  source,
  raw_text,
  parsed_confidence
)
select
  p.id as profile_id,
  m.id as match_id,
  'winner' as bet_type,
  case
    when t.result_points = -1 then '__NO_BET__'
    else t.selection
  end as selection,
  coalesce(t.submitted_at, m.lock_time_utc) as submitted_at,
  case
    when t.result_points = -1 then 'auto_no_bet'
    else 'settled'
  end as status,
  t.result_points,
  t.source,
  t.raw_text,
  null as parsed_confidence
from temp_historical_bets t
join public.profiles p
  on lower(p.username) = lower(t.username)
join public.matches m
  on m.match_id = t.match_external_id
where not exists (
  select 1
  from public.bets b
  where b.profile_id = p.id
    and b.match_id = m.id
    and b.bet_type = 'winner'
);

-- Audit trail for inserted rows.
insert into public.audit_log (
  actor_profile_id,
  action,
  object_type,
  object_id,
  payload_json
)
select
  null as actor_profile_id,
  'historical_backfill' as action,
  'match' as object_type,
  m.id::text as object_id,
  jsonb_build_object(
    'username', t.username,
    'match_external_id', t.match_external_id,
    'selection', t.selection,
    'result_points', t.result_points,
    'source', t.source
  ) as payload_json
from temp_historical_bets t
join public.matches m
  on m.match_id = t.match_external_id;

commit;

-- Optional verification queries:
-- select * from public.match_picks_view order by submitted_at desc limit 50;
-- select * from public.standings_view order by rank asc;
