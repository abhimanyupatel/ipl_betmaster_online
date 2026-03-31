export default function Header({ profile, onSignOut, onRefresh }) {
  return (
    <div className="app-header">
      <div>
        <div className="header-title">IPL BETMASTER</div>
        <div className="header-subtitle">
          Signed in as {profile.display_name} · @{profile.username}
        </div>
      </div>
      <div className="header-actions">
        <button className="ghost-btn" onClick={onRefresh}>Refresh</button>
        <button className="ghost-btn" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}
