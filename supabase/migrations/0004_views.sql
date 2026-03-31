create or replace view public.standings_view
with (security_invoker = on)
as
select
  dense_rank() over (
    order by
      coalesce(sum(case when b.result_points is not null then b.result_points else 0 end), 0) desc,
      coalesce(sum(case when b.result_points = 1 then 1 else 0 end), 0) desc,
      p.username asc
  ) as rank,
  p.id as profile_id,
  p.username,
  p.display_name,
  coalesce(sum(case when b.result_points is not null then b.result_points else 0 end), 0)::int as total_points,
  coalesce(sum(case when b.result_points = 1 then 1 else 0 end), 0)::int as wins,
  coalesce(sum(case when b.result_points = 0 then 1 else 0 end), 0)::int as losses,
  coalesce(sum(case when b.result_points = -1 then 1 else 0 end), 0)::int as no_bets,
  coalesce(sum(case when b.result_points in (1, 0) then 1 else 0 end), 0)::int as decision_count,
  case
    when coalesce(sum(case when b.result_points in (1, 0) then 1 else 0 end), 0) = 0 then 0
    else round(
      (
        coalesce(sum(case when b.result_points = 1 then 1 else 0 end), 0)::numeric
        / nullif(coalesce(sum(case when b.result_points in (1, 0) then 1 else 0 end), 0), 0)::numeric
      ) * 100,
      1
    )
  end as win_percentage
from public.profiles p
left join public.bets b
  on b.profile_id = p.id
where p.is_active = true
group by p.id, p.username, p.display_name;

create or replace view public.match_picks_view
with (security_invoker = on)
as
select
  b.id as bet_id,
  b.profile_id,
  p.username,
  p.display_name,
  b.match_id as match_uuid,
  m.match_id,
  m.season,
  m.match_no,
  m.date_local,
  m.start_time_utc,
  m.lock_time_utc,
  m.team_a,
  m.team_b,
  b.selection,
  b.status,
  b.result_points,
  b.source,
  b.submitted_at
from public.bets b
join public.profiles p on p.id = b.profile_id
join public.matches m on m.id = b.match_id;
