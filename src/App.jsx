import { useEffect, useMemo, useRef, useState } from "react";
import AuthGate from "./components/AuthGate";
import Header from "./components/Header";
import MatchCard from "./components/MatchCard";
import LeaderboardTable from "./components/LeaderboardTable";
import { useAuth } from "./hooks/useAuth";
import { useLeaguePicks } from "./hooks/useLeaguePicks";
import { useMatches } from "./hooks/useMatches";
import { useStandings } from "./hooks/useStandings";
import { submitPick, settleMatch } from "./lib/api";

function tabClass(active) {
  return active ? "tab-btn tab-btn-active" : "tab-btn";
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isNonRetryablePickError(message) {
  const msg = String(message || "").toLowerCase();
  return (
    msg.includes("lock time has passed") ||
    msg.includes("match is not open for picks") ||
    msg.includes("selection must match one of the two teams") ||
    msg.includes("no profile context") ||
    msg.includes("not authenticated") ||
    msg.includes("not allowed to submit for another profile")
  );
}

async function submitPickWithRetry(matchId, selection, { maxAttempts = 3, timeoutMs = 12_000 } = {}) {
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await Promise.race([
        submitPick(matchId, selection),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("submit_pick timed out")), timeoutMs);
        }),
      ]);
      return res;
    } catch (err) {
      lastErr = err;

      const message = err?.message || err;
      if (isNonRetryablePickError(message) || attempt === maxAttempts) break;

      // Exponential backoff with jitter.
      const baseBackoffMs = 350;
      const backoffMs = baseBackoffMs * Math.pow(2, attempt - 1);
      const jitterMs = Math.floor(Math.random() * 250);
      await sleep(backoffMs + jitterMs);
    }
  }

  throw lastErr;
}

function LoadingStrip({ label }) {
  return <div className="panel-note">{label}</div>;
}

function LeagueApp({ auth }) {
  const [tab, setTab] = useState("today");
  const [actioningMatchId, setActioningMatchId] = useState(null);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");
  const didMountRef = useRef(false);

  const matches = useMatches();
  const picks = useLeaguePicks({
    currentUserId: auth.user?.id,
    currentUser: auth.profile,
  });
  const standings = useStandings();
  const [copyAllBusy, setCopyAllBusy] = useState(false);

  useEffect(() => {
    if (!flash) return undefined;
    const id = window.setTimeout(() => setFlash(""), 3_000);
    return () => window.clearTimeout(id);
  }, [flash]);

  const handleRefresh = async () => {
    setError("");
    await Promise.all([matches.refetch(), picks.refetch(), standings.refetch(), auth.refreshProfile()]);
  };

  const copyTodayMatches = async () => {
    const rows = matches.todayMatches || [];
    if (!rows.length) return;
    const name = (row) => row.display_name || row.username || "Unknown";
    const list = (arr) => (arr.length ? arr.map(name).join(", ") : "—");

    const blocks = rows.map((m) => {
      const mp = picks.byMatch[m.id] || [];
      const teamAPicks = mp.filter((p) => String(p.selection || "").toLowerCase().trim() === String(m.team_a).toLowerCase().trim());
      const teamBPicks = mp.filter((p) => String(p.selection || "").toLowerCase().trim() === String(m.team_b).toLowerCase().trim());
      return [
        `${m.team_a} vs ${m.team_b}`,
        `Bets ${m.team_a}: ${list(teamAPicks)}`,
        `Bets ${m.team_b}: ${list(teamBPicks)}`,
      ].join("\n");
    });

    const text = blocks.join("\n\n");

    setCopyAllBusy(true);
    try {
      await navigator.clipboard.writeText(text);
      setFlash(`Copied ${rows.length} match${rows.length === 1 ? "" : "es"} to clipboard`);
    } catch (err) {
      console.error("Copy all failed", err);
      setError("Could not copy to clipboard. Please try again.");
    } finally {
      setCopyAllBusy(false);
    }
  };

  useEffect(() => {
    // Initial fetches happen inside the hooks; only refetch when the user changes tabs.
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const run = async () => {
      setError("");
      try {
        if (tab === "leaderboard") {
          await standings.refetch();
        } else {
          await Promise.all([matches.refetch(), picks.refetch()]);
        }
      } catch (err) {
        // Hooks already surface their own `error`, but this keeps UX consistent.
        setError(err?.message || "Could not load tab data");
      }
    };

    run();
    // Depend only on stable callbacks to avoid refetch loops.
  }, [tab, matches.refetch, picks.refetch, standings.refetch]);

  const handlePick = async (matchId, selection) => {
    console.log("handlePick START", { matchId, selection });
    setError("");
    setFlash("");
    setActioningMatchId(matchId);

    try {
      const result = await submitPickWithRetry(matchId, selection);
      console.log("handlePick SUCCESS", result);
      setFlash(`Saved your pick: ${selection}`);

      // Update UI locally (upsert current user's row in match_picks_view).
      picks.upsertMyPickLocal({
        matchIdUuid: matchId,
        betId: result?.bet_id,
        selection: result?.selection ?? selection,
      });
    } catch (err) {
      console.error("handlePick ERROR", err);
      setError(`${err.message || "Could not save pick"}. Please try again.`);
    } finally {
      console.log("handlePick END");
      setActioningMatchId(null);
    }
  };

  const handleSettle = async (matchId, winner) => {
    setError("");
    setFlash("");
    setActioningMatchId(matchId);

    try {
      await settleMatch(matchId, winner);
      setFlash(`Settled match with winner ${winner}`);
      await Promise.all([matches.refetch(), picks.refetch(), standings.refetch()]);
    } catch (err) {
      setError(err.message || "Could not settle match");
    } finally {
      setActioningMatchId(null);
    }
  };

  const tabContent = useMemo(() => {
    if (tab === "leaderboard") {
      return standings.loading ? (
        <LoadingStrip label="Loading standings…" />
      ) : (
        <LeaderboardTable rows={standings.rows} />
      );
    }

    const lookup = {
      today: matches.todayMatches,
      upcoming: matches.upcomingMatches,
      results: matches.pastMatches,
    };

    const rows = lookup[tab] ?? [];

    if (matches.loading || picks.loading) {
      return <LoadingStrip label="Loading league…" />;
    }

    if (!rows.length) {
      return <div className="empty-state">Nothing to show here yet.</div>;
    }

    return rows.map((match) => (
      <MatchCard
        key={match.id}
        match={match}
        picks={picks.byMatch[match.id] || []}
        myPick={picks.myByMatch[match.id]}
        currentUserId={auth.user?.id}
        onPick={handlePick}
        onSettle={handleSettle}
        actioning={actioningMatchId === match.id}
        isAdmin={Boolean(auth.profile?.is_admin)}
        showDate={tab !== "today"}
      />
    ));
  }, [
    actioningMatchId,
    auth.profile?.is_admin,
    auth.user?.id,
    matches.loading,
    matches.todayMatches,
    matches.upcomingMatches,
    matches.pastMatches,
    picks.loading,
    picks.byMatch,
    picks.myByMatch,
    standings.loading,
    standings.rows,
    tab,
  ]);

  return (
    <div className="app-shell">
      <Header
        profile={auth.profile}
        onSignOut={auth.signOut}
        onRefresh={handleRefresh}
      />

      <div className="tab-row">
        <button className={tabClass(tab === "today")} onClick={() => setTab("today")}>Today</button>
        <button className={tabClass(tab === "upcoming")} onClick={() => setTab("upcoming")}>Upcoming</button>
        <button className={tabClass(tab === "results")} onClick={() => setTab("results")}>Results</button>
        <button className={tabClass(tab === "leaderboard")} onClick={() => setTab("leaderboard")}>Leaderboard</button>
      </div>

      {tab === "today" && (matches.todayMatches?.length || 0) > 0 ? (
        <div style={{ margin: "0 16px 6px", display: "flex", justifyContent: "flex-end" }}>
          <button className="ghost-btn" onClick={copyTodayMatches} disabled={copyAllBusy || matches.loading || picks.loading}>
            {copyAllBusy ? "Copying…" : "Copy Today"}
          </button>
        </div>
      ) : null}

      {flash ? <div className="success-box">{flash}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}
      {matches.error ? <div className="error-box">{matches.error}</div> : null}
      {picks.error ? <div className="error-box">{picks.error}</div> : null}
      {standings.error ? <div className="error-box">{standings.error}</div> : null}

      <div className="content-wrap">
        {tabContent}
      </div>
    </div>
  );
}

export default function App() {
  const auth = useAuth();

  return (
    <AuthGate auth={auth}>
      <LeagueApp auth={auth} />
    </AuthGate>
  );
}
