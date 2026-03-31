export default function LeaderboardTable({ rows = [] }) {
  if (!rows.length) {
    return <div className="empty-state">No standings yet.</div>;
  }

  return (
    <div className="leaderboard-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Pts</th>
            <th>W</th>
            <th>L</th>
            <th>NB</th>
            <th>Win %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.profile_id}>
              <td>{row.rank}</td>
              <td>
                <div className="leader-name">{row.display_name || row.username}</div>
                <div className="leader-subname">@{row.username}</div>
              </td>
              <td>{row.total_points}</td>
              <td>{row.wins}</td>
              <td>{row.losses}</td>
              <td>{row.no_bets}</td>
              <td>{row.win_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
