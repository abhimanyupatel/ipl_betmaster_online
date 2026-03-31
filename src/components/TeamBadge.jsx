import { useState } from "react";
import { codeFromTeamName, TEAM_COLORS } from "../lib/teams";

export default function TeamBadge({ team }) {
  const [hasError, setHasError] = useState(false);
  const code = codeFromTeamName(team);
  const theme = TEAM_COLORS[code] || { bg: "#222", accent: "#888", text: "#fff" };

  const logoUrl = `/images/teams/${code}.png`;

  return (
    <div
      className="team-badge"
      style={{
        background: `linear-gradient(135deg, ${theme.bg}, ${theme.accent})`,
        color: theme.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "50px", // Set fixed dimensions for consistency
        height: "50px",
        borderRadius: "50%",
        fontWeight: "bold",
        overflow: "hidden"
      }}
    >
      {!hasError ? (
        <img 
          src={logoUrl} 
          alt={`${team} logo`} 
          onError={() => setHasError(true)} // Triggers when image fails to load
          style={{ width: "80%", height: "auto" }} 
        />
      ) : (
        <span>{code}</span> // Fallback to text if image is missing
      )}
    </div>
  );
}
