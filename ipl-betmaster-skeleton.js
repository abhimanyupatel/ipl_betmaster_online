import { useState, useEffect, useCallback, useRef } from "react";

const MATCHES = [
  { id: 1, date: "2026-03-28", day: "Sat", team1: "RCB", team2: "SRH", venue: "Bengaluru", time: "7:30 PM" },
  { id: 2, date: "2026-03-29", day: "Sun", team1: "MI", team2: "KKR", venue: "Mumbai", time: "7:30 PM" },
  { id: 3, date: "2026-03-30", day: "Mon", team1: "RR", team2: "CSK", venue: "Guwahati", time: "7:30 PM" },
  { id: 4, date: "2026-03-31", day: "Tue", team1: "PBKS", team2: "GT", venue: "New Chandigarh", time: "7:30 PM" },
  { id: 5, date: "2026-04-01", day: "Wed", team1: "LSG", team2: "DC", venue: "Lucknow", time: "7:30 PM" },
  { id: 6, date: "2026-04-02", day: "Thu", team1: "KKR", team2: "SRH", venue: "Kolkata", time: "7:30 PM" },
  { id: 7, date: "2026-04-03", day: "Fri", team1: "CSK", team2: "PBKS", venue: "Chennai", time: "7:30 PM" },
  { id: 8, date: "2026-04-04", day: "Sat", team1: "DC", team2: "MI", venue: "Delhi", time: "3:30 PM" },
  { id: 9, date: "2026-04-04", day: "Sat", team1: "GT", team2: "RR", venue: "Ahmedabad", time: "7:30 PM" },
  { id: 10, date: "2026-04-05", day: "Sun", team1: "SRH", team2: "LSG", venue: "Hyderabad", time: "3:30 PM" },
  { id: 11, date: "2026-04-05", day: "Sun", team1: "RCB", team2: "CSK", venue: "Bengaluru", time: "7:30 PM" },
  { id: 12, date: "2026-04-06", day: "Mon", team1: "KKR", team2: "PBKS", venue: "Kolkata", time: "7:30 PM" },
  { id: 13, date: "2026-04-07", day: "Tue", team1: "RR", team2: "MI", venue: "Guwahati", time: "7:30 PM" },
  { id: 14, date: "2026-04-08", day: "Wed", team1: "DC", team2: "GT", venue: "Delhi", time: "7:30 PM" },
  { id: 15, date: "2026-04-09", day: "Thu", team1: "KKR", team2: "LSG", venue: "Kolkata", time: "7:30 PM" },
  { id: 16, date: "2026-04-10", day: "Fri", team1: "RR", team2: "RCB", venue: "Guwahati", time: "7:30 PM" },
  { id: 17, date: "2026-04-11", day: "Sat", team1: "PBKS", team2: "SRH", venue: "New Chandigarh", time: "3:30 PM" },
  { id: 18, date: "2026-04-11", day: "Sat", team1: "CSK", team2: "DC", venue: "Chennai", time: "7:30 PM" },
  { id: 19, date: "2026-04-12", day: "Sun", team1: "LSG", team2: "GT", venue: "Lucknow", time: "3:30 PM" },
  { id: 20, date: "2026-04-12", day: "Sun", team1: "MI", team2: "RCB", venue: "Mumbai", time: "7:30 PM" },
  { id: 21, date: "2026-04-13", day: "Mon", team1: "SRH", team2: "RR", venue: "Hyderabad", time: "7:30 PM" },
  { id: 22, date: "2026-04-14", day: "Tue", team1: "CSK", team2: "KKR", venue: "Chennai", time: "7:30 PM" },
  { id: 23, date: "2026-04-15", day: "Wed", team1: "RCB", team2: "LSG", venue: "Bengaluru", time: "7:30 PM" },
  { id: 24, date: "2026-04-16", day: "Thu", team1: "MI", team2: "PBKS", venue: "Mumbai", time: "7:30 PM" },
  { id: 25, date: "2026-04-17", day: "Fri", team1: "GT", team2: "KKR", venue: "Ahmedabad", time: "7:30 PM" },
  { id: 26, date: "2026-04-18", day: "Sat", team1: "RCB", team2: "DC", venue: "Bengaluru", time: "3:30 PM" },
  { id: 27, date: "2026-04-18", day: "Sat", team1: "SRH", team2: "CSK", venue: "Hyderabad", time: "7:30 PM" },
  { id: 28, date: "2026-04-19", day: "Sun", team1: "KKR", team2: "RR", venue: "Kolkata", time: "3:30 PM" },
  { id: 29, date: "2026-04-19", day: "Sun", team1: "PBKS", team2: "LSG", venue: "New Chandigarh", time: "7:30 PM" },
  { id: 30, date: "2026-04-20", day: "Mon", team1: "GT", team2: "MI", venue: "Ahmedabad", time: "7:30 PM" },
  { id: 31, date: "2026-04-21", day: "Tue", team1: "SRH", team2: "DC", venue: "Hyderabad", time: "7:30 PM" },
  { id: 32, date: "2026-04-22", day: "Wed", team1: "LSG", team2: "RR", venue: "Lucknow", time: "7:30 PM" },
  { id: 33, date: "2026-04-23", day: "Thu", team1: "MI", team2: "CSK", venue: "Mumbai", time: "7:30 PM" },
  { id: 34, date: "2026-04-24", day: "Fri", team1: "RCB", team2: "GT", venue: "Bengaluru", time: "7:30 PM" },
  { id: 35, date: "2026-04-25", day: "Sat", team1: "DC", team2: "PBKS", venue: "Delhi", time: "3:30 PM" },
  { id: 36, date: "2026-04-25", day: "Sat", team1: "RR", team2: "SRH", venue: "Jaipur", time: "7:30 PM" },
  { id: 37, date: "2026-04-26", day: "Sun", team1: "GT", team2: "CSK", venue: "Ahmedabad", time: "3:30 PM" },
  { id: 38, date: "2026-04-26", day: "Sun", team1: "LSG", team2: "KKR", venue: "Lucknow", time: "7:30 PM" },
  { id: 39, date: "2026-04-27", day: "Mon", team1: "DC", team2: "RCB", venue: "Delhi", time: "7:30 PM" },
  { id: 40, date: "2026-04-28", day: "Tue", team1: "PBKS", team2: "RR", venue: "New Chandigarh", time: "7:30 PM" },
  { id: 41, date: "2026-04-29", day: "Wed", team1: "MI", team2: "SRH", venue: "Mumbai", time: "7:30 PM" },
  { id: 42, date: "2026-04-30", day: "Thu", team1: "GT", team2: "RCB", venue: "Ahmedabad", time: "7:30 PM" },
  { id: 43, date: "2026-05-01", day: "Fri", team1: "RR", team2: "DC", venue: "Jaipur", time: "7:30 PM" },
  { id: 44, date: "2026-05-02", day: "Sat", team1: "CSK", team2: "MI", venue: "Chennai", time: "7:30 PM" },
  { id: 45, date: "2026-05-03", day: "Sun", team1: "SRH", team2: "KKR", venue: "Hyderabad", time: "3:30 PM" },
  { id: 46, date: "2026-05-03", day: "Sun", team1: "GT", team2: "PBKS", venue: "Ahmedabad", time: "7:30 PM" },
  { id: 47, date: "2026-05-04", day: "Mon", team1: "MI", team2: "LSG", venue: "Mumbai", time: "7:30 PM" },
  { id: 48, date: "2026-05-05", day: "Tue", team1: "DC", team2: "CSK", venue: "Delhi", time: "7:30 PM" },
  { id: 49, date: "2026-05-06", day: "Wed", team1: "SRH", team2: "PBKS", venue: "Hyderabad", time: "7:30 PM" },
  { id: 50, date: "2026-05-07", day: "Thu", team1: "LSG", team2: "RCB", venue: "Lucknow", time: "7:30 PM" },
  { id: 51, date: "2026-05-08", day: "Fri", team1: "DC", team2: "KKR", venue: "Delhi", time: "7:30 PM" },
  { id: 52, date: "2026-05-09", day: "Sat", team1: "RR", team2: "GT", venue: "Jaipur", time: "7:30 PM" },
  { id: 53, date: "2026-05-10", day: "Sun", team1: "CSK", team2: "LSG", venue: "Chennai", time: "3:30 PM" },
  { id: 54, date: "2026-05-10", day: "Sun", team1: "RCB", team2: "MI", venue: "Raipur", time: "7:30 PM" },
  { id: 55, date: "2026-05-11", day: "Mon", team1: "PBKS", team2: "DC", venue: "Dharamsala", time: "7:30 PM" },
  { id: 56, date: "2026-05-12", day: "Tue", team1: "GT", team2: "SRH", venue: "Ahmedabad", time: "7:30 PM" },
  { id: 57, date: "2026-05-13", day: "Wed", team1: "RCB", team2: "KKR", venue: "Raipur", time: "7:30 PM" },
  { id: 58, date: "2026-05-14", day: "Thu", team1: "PBKS", team2: "MI", venue: "Dharamsala", time: "7:30 PM" },
  { id: 59, date: "2026-05-15", day: "Fri", team1: "LSG", team2: "CSK", venue: "Lucknow", time: "7:30 PM" },
  { id: 60, date: "2026-05-16", day: "Sat", team1: "KKR", team2: "GT", venue: "Kolkata", time: "7:30 PM" },
  { id: 61, date: "2026-05-17", day: "Sun", team1: "PBKS", team2: "RCB", venue: "Dharamsala", time: "3:30 PM" },
  { id: 62, date: "2026-05-17", day: "Sun", team1: "DC", team2: "RR", venue: "Delhi", time: "7:30 PM" },
  { id: 63, date: "2026-05-18", day: "Mon", team1: "CSK", team2: "SRH", venue: "Chennai", time: "7:30 PM" },
  { id: 64, date: "2026-05-19", day: "Tue", team1: "RR", team2: "LSG", venue: "Jaipur", time: "7:30 PM" },
  { id: 65, date: "2026-05-20", day: "Wed", team1: "KKR", team2: "MI", venue: "Kolkata", time: "7:30 PM" },
  { id: 66, date: "2026-05-21", day: "Thu", team1: "CSK", team2: "GT", venue: "Chennai", time: "7:30 PM" },
  { id: 67, date: "2026-05-22", day: "Fri", team1: "SRH", team2: "RCB", venue: "Hyderabad", time: "7:30 PM" },
  { id: 68, date: "2026-05-23", day: "Sat", team1: "LSG", team2: "PBKS", venue: "Lucknow", time: "7:30 PM" },
  { id: 69, date: "2026-05-24", day: "Sun", team1: "MI", team2: "RR", venue: "Mumbai", time: "3:30 PM" },
  { id: 70, date: "2026-05-24", day: "Sun", team1: "KKR", team2: "DC", venue: "Kolkata", time: "7:30 PM" },
];

const TEAM_COLORS = {
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

const TEAM_FULL = {
  RCB:"Royal Challengers Bengaluru", MI:"Mumbai Indians", CSK:"Chennai Super Kings",
  KKR:"Kolkata Knight Riders", DC:"Delhi Capitals", PBKS:"Punjab Kings",
  RR:"Rajasthan Royals", SRH:"Sunrisers Hyderabad", GT:"Gujarat Titans", LSG:"Lucknow Super Giants",
};

export default function IPLPredictor() {
  const [currentUser, setCurrentUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState("today");
  const [votes, setVotes] = useState({});
  const [results, setResults] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoFetching, setAutoFetching] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const pollRef = useRef(null);
  const autoResultRef = useRef(null);
  const resultsRef = useRef({});

  const today = new Date().toISOString().split("T")[0];

  // Keep resultsRef in sync with state so async callbacks always see latest
  useEffect(() => { resultsRef.current = results; }, [results]);

  // ── Load shared data from storage ──
  const loadData = useCallback(async () => {
    try {
      const [v, r, u] = await Promise.all([
        window.storage.get("votes", true).catch(() => null),
        window.storage.get("results", true).catch(() => null),
        window.storage.get("users", true).catch(() => null),
      ]);
      if (v?.value) setVotes(JSON.parse(v.value));
      if (r?.value) setResults(JSON.parse(r.value));
      if (u?.value) setAllUsers(JSON.parse(u.value));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  // ── Auto-fetch results via Claude AI + web search ──
  const autoFetchResults = useCallback(async () => {
    const now = new Date();
    const currentResults = resultsRef.current;

    // Only check yesterday and today to limit API calls
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];

    const needsResult = MATCHES.filter(m => {
      if (currentResults[m.id]) return false;  // already resolved
      if (m.date > today) return false;         // future match
      if (m.date < yStr) return false;          // too old, skip
      // For today: only check after match is likely over
      if (m.date === today) {
        const hourIST = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 0.5 : 0);
        const matchEndHour = m.time.includes("3:30") ? 18.5 : 22.5;
        if (hourIST < matchEndHour) return false;
      }
      return true;
    });

    if (needsResult.length === 0) return;

    setAutoFetching(true);
    try {
      for (const match of needsResult) {
        // Ask Claude with web search to find the winner
        const prompt = `IPL 2026 match result: ${TEAM_FULL[match.team1]} vs ${TEAM_FULL[match.team2]} on ${match.date} at ${match.venue}. Search the web and tell me which team won. Reply with ONLY the team abbreviation from this list: RCB, MI, CSK, KKR, DC, PBKS, RR, SRH, GT, LSG. If the match has not been played yet or result is unknown, reply with: UNKNOWN`;

        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 50,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await resp.json();
        // Extract text blocks from response (may include tool_use blocks too)
        const text = (data.content || [])
          .filter(b => b.type === "text")
          .map(b => b.text).join("").trim().toUpperCase();

        const validTeams = [match.team1, match.team2];
        const found = validTeams.find(t => text.includes(t));
        if (found) {
          const newResults = { ...resultsRef.current, [match.id]: found };
          resultsRef.current = newResults;  // update ref immediately for next iteration
          setResults(newResults);
          await window.storage.set("results", JSON.stringify(newResults), true);
        }

        // Small delay between calls to avoid rate limits
        await new Promise(res => setTimeout(res, 1500));
      }
    } catch (e) { console.error("Auto result error:", e); }

    setAutoFetching(false);
    setLastChecked(new Date());
  }, [today]);

  // ── Mount: load data, start polling, auto-fetch results ──
  // TODO Abhi
  useEffect(() => {
    loadData();
    window.storage.get("myname", false)
      .then(r => { if (r?.value) setCurrentUser(r.value); })
      .catch(() => {});

    pollRef.current = setInterval(loadData, 10000);           // sync votes/results every 10s
    autoResultRef.current = setInterval(autoFetchResults, 5 * 60 * 1000); // re-check results every 5min
    setTimeout(autoFetchResults, 3000);                       // initial check after 3s

    return () => {
      clearInterval(pollRef.current);
      clearInterval(autoResultRef.current);
    };
  }, [loadData, autoFetchResults]);

  // ── Join group ──
  const joinGroup = async () => {
    const name = nameInput.trim();
    if (!name) return;
    setCurrentUser(name);
    await window.storage.set("myname", name, false);
    const updated = allUsers.includes(name) ? allUsers : [...allUsers, name];
    setAllUsers(updated);
    await window.storage.set("users", JSON.stringify(updated), true);
  };

  // ── Cast vote ──
  const castVote = async (matchId, team) => {
    if (!currentUser) return;
    const newVotes = { ...votes };
    if (!newVotes[matchId]) newVotes[matchId] = {};
    newVotes[matchId][currentUser] = team;
    setVotes(newVotes);
    await window.storage.set("votes", JSON.stringify(newVotes), true);
  };

  // ── Leaderboard calculation ──
  const getLeaderboard = () => {
    const scores = {};
    allUsers.forEach(u => (scores[u] = { correct: 0, total: 0 }));
    Object.keys(results).forEach(matchId => {
      const winner = results[matchId];
      const matchVotes = votes[matchId] || {};
      Object.keys(matchVotes).forEach(user => {
        if (!scores[user]) scores[user] = { correct: 0, total: 0 };
        scores[user].total++;
        if (matchVotes[user] === winner) scores[user].correct++;
      });
    });
    return Object.entries(scores)
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.correct - a.correct || a.name.localeCompare(b.name));
  };

  const todayMatches = MATCHES.filter(m => m.date === today);
  const upcomingMatches = MATCHES.filter(m => m.date > today);
  const pastMatches = MATCHES.filter(m => m.date < today).reverse();
  const formatDate = d => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  // ── Login screen ──
  if (!currentUser) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0a0e1a,#1a1040,#0a0e1a)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"48px 36px", maxWidth:380, width:"100%", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:"#fbbf24", letterSpacing:5, lineHeight:1, marginBottom:4 }}>IPL 2026</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:4, textTransform:"uppercase", marginBottom:36 }}>Prediction League</div>
            <div style={{ width:80, height:80, margin:"0 auto 28px", borderRadius:"50%", background:"linear-gradient(135deg,#fbbf24,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>🏏</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.55)", fontSize:14, marginBottom:28, lineHeight:1.6 }}>Enter your name to join your group's prediction league. Results update automatically!</p>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key==="Enter" && joinGroup()} placeholder="Your name"
              style={{ width:"100%", padding:"14px 18px", borderRadius:12, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:16, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", marginBottom:14 }} />
            <button onClick={joinGroup} style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:"linear-gradient(135deg,#fbbf24,#f59e0b)", color:"#0a0e1a", fontSize:16, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>JOIN</button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0e1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#fbbf24", fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:3 }}>LOADING…</div>
      </div>
    );
  }

  // ── Team badge component ──
  const TeamBadge = ({ team, size="md" }) => {
    const c = TEAM_COLORS[team];
    const s = size==="sm"?28:size==="lg"?52:38;
    const f = size==="sm"?10:size==="lg"?16:12;
    return <div style={{ width:s, height:s, borderRadius:"50%", background:c.bg, border:`2px solid ${c.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:f, color:c.text, letterSpacing:1, flexShrink:0 }}>{team}</div>;
  };

  // ── Match card component ──
  const MatchCard = ({ match, showDate=false }) => {
    const matchVotes = votes[match.id] || {};
    const myVote = matchVotes[currentUser];
    const result = results[match.id];
    const isPast = match.date < today;
    const isToday = match.date === today;
    const t1Voters = Object.entries(matchVotes).filter(([,t]) => t===match.team1);
    const t2Voters = Object.entries(matchVotes).filter(([,t]) => t===match.team2);
    const allVoters = [...t1Voters, ...t2Voters];

    return (
      <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${isToday?"rgba(251,191,36,0.25)":"rgba(255,255,255,0.06)"}`, borderRadius:16, padding:"16px 14px", marginBottom:12, position:"relative", overflow:"hidden" }}>
        {isToday && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#fbbf24,transparent)" }} />}

        {/* Match meta */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, gap:8 }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:1 }}>
            {showDate ? `${formatDate(match.date)} · ` : ""}Match {match.id} · {match.venue}
          </span>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:isToday?"#fbbf24":"rgba(255,255,255,0.3)", fontWeight:600 }}>{match.time}</span>
        </div>

        {/* Vote buttons */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom: allVoters.length>0 ? 12 : 0 }}>
          <button onClick={() => !result && castVote(match.id, match.team1)} disabled={!!result}
            style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 10px", borderRadius:10, border:myVote===match.team1?`2px solid ${TEAM_COLORS[match.team1].accent}`:"2px solid transparent", background:myVote===match.team1?`${TEAM_COLORS[match.team1].bg}44`:"rgba(255,255,255,0.03)", cursor:result?"default":"pointer", opacity:result&&result!==match.team1?0.35:1, transition:"all 0.2s" }}>
            <TeamBadge team={match.team1} />
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:"#fff", letterSpacing:2 }}>{match.team1}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"rgba(255,255,255,0.3)" }}>{t1Voters.length} vote{t1Voters.length!==1?"s":""}</div>
            </div>
            {result===match.team1 && <span style={{ marginLeft:"auto", fontSize:15 }}>✅</span>}
          </button>

          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:"rgba(255,255,255,0.18)", flexShrink:0 }}>VS</div>

          <button onClick={() => !result && castVote(match.id, match.team2)} disabled={!!result}
            style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 10px", borderRadius:10, border:myVote===match.team2?`2px solid ${TEAM_COLORS[match.team2].accent}`:"2px solid transparent", background:myVote===match.team2?`${TEAM_COLORS[match.team2].bg}44`:"rgba(255,255,255,0.03)", cursor:result?"default":"pointer", opacity:result&&result!==match.team2?0.35:1, transition:"all 0.2s", flexDirection:"row-reverse" }}>
            <TeamBadge team={match.team2} />
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:"#fff", letterSpacing:2 }}>{match.team2}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"rgba(255,255,255,0.3)" }}>{t2Voters.length} vote{t2Voters.length!==1?"s":""}</div>
            </div>
            {result===match.team2 && <span style={{ marginRight:"auto", fontSize:15 }}>✅</span>}
          </button>
        </div>

        {/* Who voted for whom */}
        {allVoters.length > 0 && (
          <div style={{ display:"flex", gap:12, padding:"10px 10px", background:"rgba(255,255,255,0.02)", borderRadius:8 }}>
            <div style={{ flex:1 }}>
              {t1Voters.length > 0 && <>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{match.team1}</div>
                {t1Voters.map(([name]) => (
                  <div key={name} style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", color:result===match.team1?"#4ade80":result?"#f87171":"rgba(255,255,255,0.6)", padding:"1px 0" }}>
                    {name===currentUser?`${name} (you)`:name}{result===match.team1?" ✓":""}
                  </div>
                ))}
              </>}
            </div>
            <div style={{ flex:1, textAlign:"right" }}>
              {t2Voters.length > 0 && <>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{match.team2}</div>
                {t2Voters.map(([name]) => (
                  <div key={name} style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", color:result===match.team2?"#4ade80":result?"#f87171":"rgba(255,255,255,0.6)", padding:"1px 0" }}>
                    {name===currentUser?`${name} (you)`:name}{result===match.team2?" ✓":""}
                  </div>
                ))}
              </>}
            </div>
          </div>
        )}

        {/* Pending result indicator */}
        {!result && isPast && (
          <div style={{ marginTop:10, padding:"7px 10px", borderRadius:8, background:"rgba(251,191,36,0.06)", border:"1px dashed rgba(251,191,36,0.2)", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:autoFetching?"#fbbf24":"rgba(251,191,36,0.4)", animation:autoFetching?"pulse 1s infinite":undefined }} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(251,191,36,0.6)" }}>
              {autoFetching ? "Fetching result…" : `Awaiting result${lastChecked ? ` · checked ${lastChecked.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}` : ""}`}
            </span>
          </div>
        )}
      </div>
    );
  };

  const leaderboard = getLeaderboard();
  const tabStyle = t => ({
    flex:1, padding:"10px 0", borderRadius:10, border:"none",
    background:tab===t?"rgba(251,191,36,0.15)":"transparent",
    color:tab===t?"#fbbf24":"rgba(255,255,255,0.4)",
    fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s",
  });

  // ── Main UI ──
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0a0e1a,#1a1040,#0a0e1a)", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"#fbbf24", letterSpacing:4, lineHeight:1 }}>IPL 2026</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:2, textTransform:"uppercase" }}>Prediction League</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>{currentUser}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
              {autoFetching && <span style={{ width:5, height:5, borderRadius:"50%", background:"#fbbf24", display:"inline-block", animation:"pulse 1s infinite" }} />}
              {allUsers.length} player{allUsers.length!==1?"s":""}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, padding:"10px 16px", background:"rgba(0,0,0,0.2)" }}>
          <button style={tabStyle("today")} onClick={() => setTab("today")}>Today ({todayMatches.length})</button>
          <button style={tabStyle("upcoming")} onClick={() => setTab("upcoming")}>Upcoming</button>
          <button style={tabStyle("past")} onClick={() => setTab("past")}>Results</button>
          <button style={tabStyle("leaderboard")} onClick={() => setTab("leaderboard")}>🏆</button>
        </div>

        {/* Tab content */}
        <div style={{ padding:"14px 14px 100px" }}>
          {tab==="today" && (
            todayMatches.length===0
              ? <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40, marginBottom:12 }}>🏏</div><div>No matches today</div></div>
              : todayMatches.map(m => <MatchCard key={m.id} match={m} />)
          )}
          {tab==="upcoming" && (
            upcomingMatches.length===0
              ? <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.3)" }}>No upcoming matches</div>
              : upcomingMatches.slice(0,20).map(m => <MatchCard key={m.id} match={m} showDate />)
          )}
          {tab==="past" && (
            pastMatches.length===0
              ? <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40, marginBottom:12 }}>📅</div><div>No past matches yet</div></div>
              : pastMatches.map(m => <MatchCard key={m.id} match={m} showDate />)
          )}
          {tab==="leaderboard" && (
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"#fbbf24", letterSpacing:3, marginBottom:16, textAlign:"center" }}>LEADERBOARD</div>
              {leaderboard.length===0
                ? <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,0.3)" }}>No players yet</div>
                : leaderboard.map((p, i) => (
                  <div key={p.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:i<3?"rgba(251,191,36,0.04)":"rgba(255,255,255,0.02)", border:`1px solid ${i===0?"rgba(251,191,36,0.2)":"rgba(255,255,255,0.04)"}`, borderRadius:12, marginBottom:8 }}>
                    <div style={{ width:32, textAlign:"center", fontSize:i<3?20:14, color:i<3?undefined:"rgba(255,255,255,0.3)", fontWeight:700 }}>
                      {["🥇","🥈","🥉"][i] || `#${i+1}`}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:600, color:p.name===currentUser?"#fbbf24":"#fff" }}>{p.name}{p.name===currentUser?" (you)":""}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{p.total} prediction{p.total!==1?"s":""} made</div>
                    </div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:p.correct>0?"#4ade80":"rgba(255,255,255,0.2)", letterSpacing:2 }}>{p.correct}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1 }}>pts</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
}