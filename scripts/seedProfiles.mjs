import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRole);

const usernames = process.argv.slice(2);

if (!usernames.length) {
  console.log("Usage: npm run seed:profiles -- vivek rahul sid");
  process.exit(0);
}

const payload = usernames.map((username, index) => ({
  username,
  display_name: username.charAt(0).toUpperCase() + username.slice(1),
  is_admin: index === 0,
  is_active: true,
}));

const { data, error } = await supabase
  .from("profiles")
  .upsert(payload, { onConflict: "username" })
  .select("id, username, display_name, is_admin");

if (error) {
  console.error(error);
  process.exit(1);
}

console.table(data);
