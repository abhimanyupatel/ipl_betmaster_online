export const TEAM_COLORS = {
  RCB: { bg: "#1C1C1C", accent: "#EC1C24", text: "#FFD700" },
  MI:  { bg: "#004BA0", accent: "#D4AF37", text: "#FFFFFF" },
  CSK: { bg: "#FCCA06", accent: "#0081E9", text: "#1C1C1C" },
  KKR: { bg: "#3A225D", accent: "#FFD700", text: "#FFFFFF" },
  DC:  { bg: "#004C93", accent: "#EF1B23", text: "#FFFFFF" },
  PBKS:{ bg: "#DD1F2D", accent: "#A7A9AC", text: "#FFFFFF" },
  RR:  { bg: "#EA1A85", accent: "#254AA5", text: "#FFFFFF" },
  SRH: { bg: "#FF822A", accent: "#1C1C1C", text: "#FFFFFF" },
  GT:  { bg: "#1B2133", accent: "#A0E8CF", text: "#FFFFFF" },
  LSG: { bg: "#A72056", accent: "#FFCC00", text: "#FFFFFF" },
};

export const TEAM_FULL = {
  RCB: "Royal Challengers Bengaluru",
  MI: "Mumbai Indians",
  CSK: "Chennai Super Kings",
  KKR: "Kolkata Knight Riders",
  DC: "Delhi Capitals",
  PBKS: "Punjab Kings",
  RR: "Rajasthan Royals",
  SRH: "Sunrisers Hyderabad",
  GT: "Gujarat Titans",
  LSG: "Lucknow Super Giants",
};

export const FULL_TO_CODE = Object.fromEntries(
  Object.entries(TEAM_FULL).map(([code, full]) => [full.toLowerCase(), code])
);

export function codeFromTeamName(name) {
  if (!name) return name;
  const trimmed = String(name).trim();
  if (TEAM_FULL[trimmed]) return trimmed;
  return FULL_TO_CODE[trimmed.toLowerCase()] ?? trimmed;
}

export function fullTeamName(value) {
  if (!value) return value;
  const code = codeFromTeamName(value);
  return TEAM_FULL[code] ?? value;
}

export function displayTeam(value) {
  return codeFromTeamName(value);
}
