import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const [matchId, ...winnerParts] = process.argv.slice(2);
const winner = winnerParts.join(" ");

if (!matchId || !winner) {
  console.log("Usage: npm run settle:match -- <match-uuid> <full winner name>");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRole);
const { data, error } = await supabase.rpc("settle_match", {
  p_match_id: matchId,
  p_winner: winner,
});

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
