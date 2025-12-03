/// <reference lib="dom" />
/// <reference lib="deno.ns" />

// ============================================================
// AUTONAVEGACIÓN V3 — PirateWorld
// Procesa todos los barcos cuyo ETA ya venció
// + Motor de eventos marinos
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.3";

serve(async (_req) => {
  try {
    // ==========================
    // 1. Inicializar cliente
    // ==========================
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(JSON.stringify({ ok: false, error: "Missing env vars" }), {
        status: 500,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // ==========================
    // 2. Buscar barcos cuyo ETA ya venció
    // ==========================
    const { data: ships, error: shipErr } = await supabase
      .from("ship_state")
      .select("*")
      .eq("status", "traveling")
      .lt("arrival_time", new Date().toISOString());

    if (shipErr) throw shipErr;

    // Si no hay barcos, terminar
    if (!ships || ships.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), { status: 200 });
    }

    let processed = 0;

    // ============================================================
    // 3. Motor de eventos marinos
    // ============================================================

    function randomBetween(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Probabilidades:
    // Piratas → 30%
    // Tormenta → 20%
    // Cofre → 10%
    // Sin evento → 40%
    function rollSeaEvent() {
      const r = Math.random() * 100;

      if (r < 30) {
        return {
          type: "pirates",
          message: "¡Piratas detectados! Tu tripulación esquiva el ataque.",
          delta: randomBetween(30, 180), // segundos
        };
      }
      if (r < 50) {
        return {
          type: "storm",
          message: "Una tormenta golpea el barco. Avance lento.",
          delta: randomBetween(60, 300),
        };
      }
      if (r < 60) {
        return {
          type: "treasure",
          message: "Encontraste un cofre flotando en el mar. Avance más rápido.",
          delta: -1, // -10% se calcula abajo
        };
      }

      return null;
    }

    // ============================================================
    // 4. Procesar cada barco
    // ============================================================
    for (const ship of ships) {
      const userId = ship.user_id;

      // Lanzar evento
      const event = rollSeaEvent();

      let newArrival = ship.arrival_time;
      let deltaApplied = 0;

      if (event) {
        if (event.delta === -1) {
          // Bonus: reducir 10% del tiempo restante real
          const now = new Date().getTime();
          const arr = new Date(ship.arrival_time).getTime();
          const remaining = Math.max(arr - now, 0);

          const reduceMs = Math.floor(remaining * 0.1);
          newArrival = new Date(arr - reduceMs).toISOString();
          deltaApplied = -reduceMs / 1000;
        } else {
          // Penalización normal
          const newTime = new Date(ship.arrival_time).getTime() + event.delta * 1000;
          newArrival = new Date(newTime).toISOString();
          deltaApplied = event.delta;
        }

        // Registrar evento
        await supabase.from("ship_event_log").insert({
          user_id: userId,
          event_type: event.type,
          message: event.message,
          delta_seconds: deltaApplied,
        });
      }

      // ============================
      // 5. Finalizar viaje
      // ============================
      const { error: updErr } = await supabase
        .from("ship_state")
        .update({
          status: "idle",
          origin: ship.destination,
          destination: null,
          percent: 100,
          speed_kmh: 0,
          // Ubicar barco en su destino
          lat: ship.destination_lat,
          lng: ship.destination_lng,
          arrival_time: newArrival,
        })
        .eq("id", ship.id);

      if (updErr) throw updErr;

      processed++;
    }

    // ============================
    // 6. Respuesta
    // ============================
    return new Response(
      JSON.stringify({ ok: true, processed, events: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error("AUTONAV ERROR", err);
    return new Response(JSON.stringify({ ok: false, error: err }), { status: 500 });
  }
});
