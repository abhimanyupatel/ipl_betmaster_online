import { useCallback, useEffect, useState } from "react";
import { getStandings } from "../lib/api";

export function useStandings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setError("");
      const data = await getStandings();
      setRows(data);
    } catch (err) {
      setError(err.message || "Failed to load standings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { rows, loading, error, refetch };
}
