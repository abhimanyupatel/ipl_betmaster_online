import { supabase } from "./supabase";

export async function getMatches(season = Number(import.meta.env.VITE_DEFAULT_SEASON || 2026)) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("season", season)
    .order("start_time_utc", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getLeaguePicks(season = Number(import.meta.env.VITE_DEFAULT_SEASON || 2026)) {
  const { data, error } = await supabase
    .from("match_picks_view")
    .select("*")
    .eq("season", season)
    .order("submitted_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStandings() {
  const { data, error } = await supabase
    .from("standings_view")
    .select("*")
    .order("rank", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function submitPick(matchId, selection) {
  console.log("submitPick CALL", { matchId, selection });

  const { data, error } = await supabase.rpc("submit_pick", {
    p_match_id: matchId,
    p_selection: selection,
    p_source: "web_ui",
  });

  console.log("submitPick RESPONSE", { data, error });

  if (error) throw error;
  return data;
}

export async function settleMatch(matchId, winner) {
  const { data, error } = await supabase.rpc("settle_match", {
    p_match_id: matchId,
    p_winner: winner,
  });

  if (error) throw error;
  return data;
}

export async function ensureProfile({ username, displayName }) {
  const { data, error } = await supabase.rpc("ensure_profile", {
    p_username: username,
    p_display_name: displayName,
  });

  if (error) throw error;
  return data;
}

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
