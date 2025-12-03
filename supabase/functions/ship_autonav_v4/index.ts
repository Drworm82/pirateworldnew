// ============================================================
// AUTONAV V4 — PirateWorld
// Procesa viajes + genera eventos cada 0.5 km avanzados
// ============================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.3";

serve(async (_req) => {
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
    });

    // ============================================================
    // 1) Obtener barcos viajando
    // ============================================================
    const { data: ships, error: shipsErr } = await supabase
      .from("ship_state")
      .select("*");

    if (shipsErr) {
      console.error(shipsErr);
      return new Response(
        JSON.stringify({ ok: false, error: shipsErr }),
        { status: 500 },
      );
    }

    const now = Date.now();
    const eventsTriggered: any[] = [];

    // ============================================================
    // 2) Procesar cada barco
    // ============================================================
    for (const s of ships) {
      if (s.status !== "traveling") continue;

      const departure = new Date(s.departure_time).getTime();
      const arrival = new Date(s.arrival_time).getTime();
      const total = arrival - departure;
      const elapsed = now - departure;

      // Clamp
      const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

      // Posición interpolada
      const newLat =
        s.origin_lat +
        (s.destination_lat - s.origin_lat) * (pct / 100);

      const newLng =
        s.origin_lng +
        (s.destination_lng - s.origin_lng) * (pct / 100);

      // Avance desde estado anterior
      const dy = newLat - (s.current_lat ?? s.origin_lat);
      const dx = newLng - (s.current_lng ?? s.origin_lng);
      const deltaKm = Math.sqrt(dx * dx + dy * dy) * 111.32; // aproximación

      // ============================================================
      // 2A) Actualizar distancia desde último evento
      // ============================================================
      const { data: needEv } = await supabase.rpc("ship_update_distance_v1", {
        p_user_id: s.user_id,
        p_delta_km: deltaKm,
      });

      // ============================================================
      // 2B) Si toca evento → dispararlo
      // ============================================================
      if (needEv?.need_event === true) {
        const { data: ev } = await supabase.rpc("ship_trigger_event_v1", {
          p_user_id: s.user_id,
        });
        eventsTriggered.push(ev);
      }

      // ============================================================
      // 2C) Actualizar interpolación
      // ============================================================
      await supabase
        .from("ship_state")
        .update({
          percent: pct,
          current_lat: newLat,
          current_lng: newLng,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", s.user_id);

      // ============================================================
      // 2D) Si llegó → finalizar
      // ============================================================
      if (pct >= 100) {
        await supabase.rpc("ship_arrive_v3", { p_user_id: s.user_id });
      }
    }

    // ============================================================
    // Salida final
    // ============================================================
    return new Response(
      JSON.stringify({
        ok: true,
        processed: ships.length,
        events: eventsTriggered,
      }),
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500 },
    );
  }
});
