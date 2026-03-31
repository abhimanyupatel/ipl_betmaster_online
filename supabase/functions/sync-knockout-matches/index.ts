import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (request) => {
  try {
    const body = await request.json();

    if (!Array.isArray(body?.rows)) {
      return new Response(JSON.stringify({ error: "Expected body.rows array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = body.rows.map((row: Record<string, unknown>) => ({
      ...row,
      stage: row.stage ?? "knockout",
      source: row.source ?? "manual_knockout_sync",
    }));

    const { data, error } = await supabase
      .from("matches")
      .upsert(rows, { onConflict: "match_id" })
      .select("id, match_id, stage");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, count: data?.length ?? 0, rows: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
