// supabase/functions/autonav-cron/index.ts
// =====================================================
// Ejecuta ship_autonav_v4 cada minuto automáticamente
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2.39.6"
    );

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ejecutar el RPC que mueve los barcos
    const { data, error } = await supabase.rpc("ship_autonav_v4");

    if (error) {
      console.error("❌ autonav_cron RPC ERROR:", error);
      return new Response("RPC error", { status: 500 });
    }

    console.log("⚓ autonav_cron ejecutado:", data);

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ autonav cron ERROR:", err);
    return new Response("Internal error", { status: 500 });
  }
});
