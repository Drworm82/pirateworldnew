/// <reference lib="dom" />
/// <reference lib="deno.ns" />

// ============================================================
// AUTONAVEGACIÓN — PirateWorld (Edge V2 — PUBLIC)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.3";

// === CONFIGURACIÓN DE ACCESO (V2) ===
export const config = {
  runtime: "edge",
  auth: false,       // <-- ESTO HACE LA FUNCIÓN 100% PÚBLICA
};

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing env vars" }),
        { status: 500 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
      global: { headers: { Prefer: "return=minimal" } },
    });

    const nowISO = new Date().toISOString();

    const { data: ships, error: errShips } = await supabase
      .from("ship_state")
      .select("*")
      .eq("status", "traveling")
      .lte("eta_at", nowISO);

    if (errShips) {
      return new Response(JSON.stringify({ ok: false, error: errShips.message }), {
        status: 500,
      });
    }

    if (!ships || ships.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        status: 200,
      });
    }

    let processed = 0;

    for (const ship of ships) {
      const { user_id, to_island } = ship;

      // 1) Marcar ARRIVED
      const { error: errArrived } = await supabase
        .from("ship_state")
        .update({
          status: "arrived",
          started_at: null,
          eta_at: null,
          updated_at: nowISO,
        })
        .eq("user_id", user_id)
        .eq("status", "traveling");

      if (errArrived) continue;

      // 2) Botín
      await supabase.rpc("ship_generate_rewards_v1", {
        p_user_id: user_id,
        p_island: to_island,
      });

      // 3) Pasar a IDLE
      const { error: errIdle } = await supabase
        .from("ship_state")
        .update({
          status: "idle",
          from_island: to_island,
          to_island: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("status", "arrived");

      if (errIdle) continue;

      processed++;
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
    });
  }
});
