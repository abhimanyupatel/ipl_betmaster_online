create or replace function public.ensure_profile(
  p_username text,
  p_display_name text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_row public.profiles;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(trim(p_username), '') = '' then
    raise exception 'Username is required';
  end if;

  if coalesce(trim(p_display_name), '') = '' then
    raise exception 'Display name is required';
  end if;

  insert into public.profiles (
    id,
    username,
    display_name,
    is_active
  )
  values (
    v_user_id,
    lower(trim(p_username)),
    trim(p_display_name),
    true
  )
  on conflict (id)
  do update set
    username = excluded.username,
    display_name = excluded.display_name,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.ensure_profile(text, text) to authenticated;

create or replace function public.submit_pick(
  p_match_id uuid,
  p_selection text,
  p_raw_text text default null,
  p_profile_id uuid default null,
  p_source text default 'manual',
  p_parsed_confidence numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_match public.matches%rowtype;
  v_norm_selection text;
  v_bet_id uuid;
begin
  v_profile_id := coalesce(p_profile_id, auth.uid());

  if v_profile_id is null then
    raise exception 'No profile context available';
  end if;

  if p_profile_id is not null and p_profile_id <> auth.uid() and not public.can_manage_admin() then
    raise exception 'Not allowed to submit for another profile';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if v_match.status in ('settled', 'cancelled') then
    raise exception 'Match is not open for picks';
  end if;

  if now() >= v_match.lock_time_utc then
    raise exception 'Pick rejected: lock time has passed';
  end if;

  if lower(trim(p_selection)) = lower(trim(v_match.team_a)) then
    v_norm_selection := v_match.team_a;
  elsif lower(trim(p_selection)) = lower(trim(v_match.team_b)) then
    v_norm_selection := v_match.team_b;
  else
    raise exception 'Selection must match one of the two teams';
  end if;

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
  values (
    v_profile_id,
    p_match_id,
    'winner',
    v_norm_selection,
    now(),
    'submitted',
    null,
    p_source,
    p_raw_text,
    p_parsed_confidence
  )
  on conflict (profile_id, match_id, bet_type)
  do update set
    selection = excluded.selection,
    submitted_at = now(),
    status = 'submitted',
    result_points = null,
    source = excluded.source,
    raw_text = excluded.raw_text,
    parsed_confidence = excluded.parsed_confidence,
    updated_at = now()
  returning id into v_bet_id;

  insert into public.audit_log (
    actor_profile_id,
    action,
    object_type,
    object_id,
    payload_json
  )
  values (
    v_profile_id,
    'submit_pick',
    'match',
    p_match_id::text,
    jsonb_build_object(
      'bet_id', v_bet_id,
      'selection', v_norm_selection,
      'source', p_source
    )
  );

  return jsonb_build_object(
    'ok', true,
    'bet_id', v_bet_id,
    'selection', v_norm_selection,
    'match_id', p_match_id
  );
end;
$$;

grant execute on function public.submit_pick(uuid, text, text, uuid, text, numeric)
to authenticated, service_role;

create or replace function public.lock_missing_picks(
  p_match_id uuid,
  p_actor_profile_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches%rowtype;
  v_inserted_count int := 0;
begin
  if not public.can_manage_admin() then
    raise exception 'Only admins or service role may lock missing picks';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if now() < v_match.lock_time_utc then
    raise exception 'Cannot lock missing picks before lock time';
  end if;

  insert into public.bets (
    profile_id,
    match_id,
    bet_type,
    selection,
    submitted_at,
    status,
    result_points,
    source
  )
  select
    p.id,
    p_match_id,
    'winner',
    '__NO_BET__',
    now(),
    'auto_no_bet',
    -1,
    'system_lock'
  from public.profiles p
  where p.is_active = true
    and not exists (
      select 1
      from public.bets b
      where b.profile_id = p.id
        and b.match_id = p_match_id
        and b.bet_type = 'winner'
    );

  get diagnostics v_inserted_count = row_count;

  update public.matches
  set status = case when status = 'scheduled' then 'locked' else status end,
      updated_at = now()
  where id = p_match_id;

  insert into public.audit_log (
    actor_profile_id,
    action,
    object_type,
    object_id,
    payload_json
  )
  values (
    p_actor_profile_id,
    'lock_missing_picks',
    'match',
    p_match_id::text,
    jsonb_build_object('inserted_auto_no_bets', v_inserted_count)
  );

  return jsonb_build_object(
    'ok', true,
    'inserted_auto_no_bets', v_inserted_count
  );
end;
$$;

grant execute on function public.lock_missing_picks(uuid, uuid)
to authenticated, service_role;

create or replace function public.settle_match(
  p_match_id uuid,
  p_winner text,
  p_actor_profile_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches%rowtype;
  v_norm_winner text;
  v_submitted_count int := 0;
  v_no_bet_count int := 0;
begin
  if not public.can_manage_admin() then
    raise exception 'Only admins or service role may settle matches';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if lower(trim(p_winner)) = lower(trim(v_match.team_a)) then
    v_norm_winner := v_match.team_a;
  elsif lower(trim(p_winner)) = lower(trim(v_match.team_b)) then
    v_norm_winner := v_match.team_b;
  else
    raise exception 'Winner must match one of the two teams';
  end if;

  if now() >= v_match.lock_time_utc then
    perform public.lock_missing_picks(p_match_id, p_actor_profile_id);
  end if;

  update public.matches
  set winner = v_norm_winner,
      status = 'settled',
      updated_at = now()
  where id = p_match_id;

  update public.bets
  set result_points = case when selection = v_norm_winner then 1 else 0 end,
      status = 'settled',
      updated_at = now()
  where match_id = p_match_id
    and status = 'submitted';

  get diagnostics v_submitted_count = row_count;

  update public.bets
  set status = 'settled',
      updated_at = now()
  where match_id = p_match_id
    and status = 'auto_no_bet';

  get diagnostics v_no_bet_count = row_count;

  insert into public.audit_log (
    actor_profile_id,
    action,
    object_type,
    object_id,
    payload_json
  )
  values (
    p_actor_profile_id,
    'settle_match',
    'match',
    p_match_id::text,
    jsonb_build_object(
      'winner', v_norm_winner,
      'settled_submitted', v_submitted_count,
      'settled_no_bets', v_no_bet_count
    )
  );

  return jsonb_build_object(
    'ok', true,
    'winner', v_norm_winner,
    'settled_submitted', v_submitted_count,
    'settled_no_bets', v_no_bet_count
  );
end;
$$;

grant execute on function public.settle_match(uuid, text, uuid)
to authenticated, service_role;
