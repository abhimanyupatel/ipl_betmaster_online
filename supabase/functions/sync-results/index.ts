import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (request) => {
  try {
    const body = await request.json();

    if (!Array.isArray(body?.results)) {
      return new Response(
        JSON.stringify({
          error: "Expected body.results to be an array of { matchId, winner }",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const settled: unknown[] = [];

    for (const row of body.results) {
      const { data, error } = await supabase.rpc("settle_match", {
        p_match_id: row.matchId,
        p_winner: row.winner,
      });

      if (error) {
        settled.push({ matchId: row.matchId, ok: false, error: error.message });
      } else {
        settled.push({ matchId: row.matchId, ok: true, data });
      }
    }

    return new Response(JSON.stringify({ ok: true, settled }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
