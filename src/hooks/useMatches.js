import { useCallback, useEffect, useMemo, useState } from "react";
import { getMatches } from "../lib/api";
import { getTodayInTimeZone } from "../lib/date";

export function useMatches(season = Number(import.meta.env.VITE_DEFAULT_SEASON || 2026)) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setError("");
      const rows = await getMatches(season);
      setMatches(rows);
    } catch (err) {
      setError(err.message || "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const derived = useMemo(() => {
    const today = getTodayInTimeZone();
    return {
      allMatches: matches,
      todayMatches: matches.filter((m) => m.date_local === today),
      upcomingMatches: matches.filter((m) => m.date_local > today),
      pastMatches: matches.filter((m) => m.date_local < today).slice().reverse(),
    };
  }, [matches]);

  return {
    ...derived,
    loading,
    error,
    refetch,
  };
}
