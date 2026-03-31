import { useEffect, useMemo, useState } from "react";
import { formatDateLabel, formatMatchTime, isLocked, isPast } from "../lib/date";
import { codeFromTeamName, TEAM_COLORS } from "../lib/teams";
import TeamBadge from "./TeamBadge";

function VoteList({ title, rows, winningCode, currentUserId }) {
  if (!rows.length) return null;

  return (
    <div className="vote-column">
      <div className="vote-column-title">{title}</div>
      {rows.map((row) => {
        const isWinner = codeFromTeamName(row.selection) === winningCode;
        const isMe = row.profile_id === currentUserId;
        return (
          <div key={row.bet_id} className={`vote-pill ${isWinner ? "vote-pill-win" : ""}`}>
            {row.display_name || row.username}
            {isMe ? " (you)" : ""}
            {isWinner ? " ✓" : ""}
          </div>
        );
      })}
    </div>
  );
}

export default function MatchCard({
  match,
  picks = [],
  myPick,
  onPick,
  onSettle,
  actioning = false,
  isAdmin = false,
  showDate = false,
  currentUserId,
}) {
  const [settleWinner, setSettleWinner] = useState(null);
  const [copied, setCopied] = useState(false);

  const teamA = codeFromTeamName(match.team_a);
  const teamB = codeFromTeamName(match.team_b);
  const winnerCode = match.winner ? codeFromTeamName(match.winner) : null;
  const locked = isLocked(match.lock_time_utc);
  const past = isPast(match.start_time_utc);
  const settled = match.status === "settled";
  const statusText = settled
    ? `Winner: ${winnerCode}`
    : locked
      ? "Locked"
      : "Open";

  const teamAPicks = picks.filter((pick) => codeFromTeamName(pick.selection) === teamA);
  const teamBPicks = picks.filter((pick) => codeFromTeamName(pick.selection) === teamB);
  const mySelectionCode = myPick ? codeFromTeamName(myPick.selection) : null;

  useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const clipboardText = useMemo(() => {
    const name = (row) => row.display_name || row.username || "Unknown";
    const list = (rows) => (rows.length ? rows.map(name).join(", ") : "—");
    return [
      `${match.team_a} vs ${match.team_b}`,
      `Bets ${match.team_a}: ${list(teamAPicks)}`,
      `Bets ${match.team_b}: ${list(teamBPicks)}`,
    ].join("\n");
  }, [match.team_a, match.team_b, teamAPicks, teamBPicks]);

  console.log("match", match.match_id, {
    actioning,
    settled,
    locked,
    disabled: actioning || settled || locked,
    lock_time_utc: match.lock_time_utc,
    now: new Date().toISOString(),
  });

  const renderTeamButton = (teamCode, fullName) => {
    const active = mySelectionCode === teamCode;
    const theme = TEAM_COLORS[teamCode];
    const disabled = actioning || settled || locked;

    return (
      <button
        className={`pick-button ${active ? "pick-button-active" : ""}`}
        style={{
          borderColor: active ? theme.accent : "transparent",
          background: active ? `${theme.bg}66` : "rgba(255,255,255,0.03)",
          opacity: settled && winnerCode !== teamCode ? 0.45 : 1,
        }}
        disabled={disabled}        
        onClick={() => { console.log("clicked", match.id, fullName); onPick(match.id, fullName); }}
      >
        <TeamBadge team={teamCode} />
        <div className="pick-button-copy">
          <div className="pick-button-team">{teamCode}</div>
          <div className="pick-button-full">{fullName}</div>
        </div>
      </button>
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = clipboardText;
        el.setAttribute("readonly", "true");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
      } catch (err) {
        console.error("Copy failed", err);
      }
    }
  };

  return (
    <div className={`match-card ${showDate ? "match-card-with-date" : ""}`}>
      <div className="match-meta">
        <div className="match-meta-left">
          {showDate ? `${formatDateLabel(match.date_local)} · ` : ""}
          Match {match.match_no ?? match.match_id} · {match.venue}
        </div>
        <div className="match-meta-right">
          <button
            type="button"
            className="ghost-btn mini-btn"
            onClick={copyToClipboard}
            title="Copy match bets"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          {formatMatchTime(match.start_time_utc)}
        </div>
      </div>

      <div className="match-status-row">
        <span className={`status-pill ${settled ? "status-pill-win" : locked ? "status-pill-locked" : "status-pill-open"}`}>
          {statusText}
        </span>
        {!settled ? (
          <span className="lock-note">
            Lock: {formatMatchTime(match.lock_time_utc)}
          </span>
        ) : null}
      </div>

      <div className="pick-grid">
        {renderTeamButton(teamA, match.team_a)}
        <div className="versus-pill">VS</div>
        {renderTeamButton(teamB, match.team_b)}
      </div>

      {picks.length ? (
        <div className="votes-box">
          <VoteList
            title={teamA}
            rows={teamAPicks}
            winningCode={winnerCode}
            currentUserId={currentUserId}
          />
          <VoteList
            title={teamB}
            rows={teamBPicks}
            winningCode={winnerCode}
            currentUserId={currentUserId}
          />
        </div>
      ) : null}

      {!settled && past ? (
        <div className="pending-result-box">
          Waiting for result settlement.
        </div>
      ) : null}

      {isAdmin && past && !settled ? (
        <div className="admin-actions">
          <div className="admin-label">Admin settle</div>
          <div className="admin-button-row">
            <button
              className="secondary-btn"
              disabled={actioning}
              onClick={() => setSettleWinner(match.team_a)}
            >
              Settle {teamA}
            </button>
            <button
              className="secondary-btn"
              disabled={actioning}
              onClick={() => setSettleWinner(match.team_b)}
            >
              Settle {teamB}
            </button>
          </div>
        </div>
      ) : null}

      {settleWinner ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-title">Confirm settlement</div>
            <div className="modal-body">
              <div className="modal-line">
                Match {match.match_no ?? match.match_id}: {match.team_a} vs {match.team_b}
              </div>
              <div className="modal-line">
                Winner: <strong>{settleWinner}</strong>
              </div>
              <div className="modal-note">This will update scores for everyone.</div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setSettleWinner(null)}
                disabled={actioning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const winner = settleWinner;
                  setSettleWinner(null);
                  onSettle(match.id, winner);
                }}
                disabled={actioning}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
