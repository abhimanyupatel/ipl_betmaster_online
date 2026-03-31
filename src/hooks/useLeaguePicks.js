import { useCallback, useEffect, useMemo, useState } from "react";
import { getLeaguePicks } from "../lib/api";

export function useLeaguePicks({
  season = Number(import.meta.env.VITE_DEFAULT_SEASON || 2026),
  currentUserId,
  currentUser,
}) {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setError("");
      const rows = await getLeaguePicks(season);
      setPicks(rows);
    } catch (err) {
      setError(err.message || "Failed to load picks");
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const derived = useMemo(() => {
    const byMatch = {};
    const myByMatch = {};

    for (const row of picks) {
      if (!byMatch[row.match_uuid]) byMatch[row.match_uuid] = [];
      byMatch[row.match_uuid].push(row);

      if (row.profile_id === currentUserId) {
        myByMatch[row.match_uuid] = row;
      }
    }

    return { byMatch, myByMatch };
  }, [picks, currentUserId]);

  // Local update after `submit_pick` succeeds:
  // - keeps everyone's votes visible (we only upsert your row)
  // - avoids refetching `match_picks_view` every time you place/replace a pick
  const upsertMyPickLocal = useCallback(
    ({ matchIdUuid, betId, selection }) => {
      if (!currentUserId || !matchIdUuid) return;

      const username = currentUser?.username;
      const displayName = currentUser?.display_name;

      setPicks((prev) => {
        const next = prev.slice();

        const idx = next.findIndex(
          (row) => row.match_uuid === matchIdUuid && row.profile_id === currentUserId
        );

        const baseRow = idx >= 0 ? next[idx] : null;
        const updatedRow = {
          ...(baseRow || {}),
          bet_id: betId,
          profile_id: currentUserId,
          username: username ?? baseRow?.username ?? "user",
          display_name: displayName ?? baseRow?.display_name ?? null,
          match_uuid: matchIdUuid,
          selection,
          status: "submitted",
          submitted_at: baseRow?.submitted_at ?? new Date().toISOString(),
        };

        if (idx >= 0) next[idx] = updatedRow;
        else next.push(updatedRow);

        return next;
      });
    },
    [currentUser, currentUserId]
  );

  return {
    picks,
    loading,
    error,
    refetch,
    upsertMyPickLocal,
    ...derived,
  };
}
