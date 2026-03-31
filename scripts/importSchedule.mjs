import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const csvPath = process.argv[2] || path.resolve("data/seed/ipl_2026_schedule_import_ready.csv");

if (!supabaseUrl || !serviceRole) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!fs.existsSync(csvPath)) {
  throw new Error(`CSV not found at ${csvPath}`);
}

const supabase = createClient(supabaseUrl, serviceRole);

const csv = fs.readFileSync(csvPath, "utf-8");
const rows = parse(csv, { columns: true, skip_empty_lines: true });

const payload = rows.map((row) => ({
  match_id: row.match_id,
  season: Number(row.season),
  tournament: row.tournament,
  stage: row.stage,
  match_no: row.match_no ? Number(row.match_no) : null,
  team_a: row.team_a,
  team_b: row.team_b,
  venue: row.venue || null,
  date_local: row.date_local,
  start_time_local: row.start_time_local,
  start_time_utc: row.start_time_utc,
  lock_time_local: row.lock_time_local,
  lock_time_utc: row.lock_time_utc,
  lock_rule: row.lock_rule,
  status: row.status || "scheduled",
  source: row.source || "csv_import",
}));

const { data, error } = await supabase
  .from("matches")
  .upsert(payload, { onConflict: "match_id" })
  .select("id, match_id");

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Upserted ${data?.length ?? 0} matches from ${csvPath}`);
