import { supabase } from "../../lib/supaApi";

/**
 * Llama a rpc_get_player_summary (DEV)
 * Read-only. Devuelve un objeto plano compatible con la UI.
 */
export async function apiGetPlayerSummary() {
  const { data, error } = await supabase.rpc("rpc_get_player_summary");

  if (error) {
    console.error("rpc_get_player_summary error:", error);
    return null;
  }

  // rpc devuelve TABLE → array con 1 fila
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const row = data[0];

  return {
    rank: row.rank,
    title: row.title,
    reputation_score: row.reputation_score,
    crew_count: row.crew_count,
    islands_count: row.islands_count,
    travel_count: row.travel_count,
    inventory_counts: row.inventory_counts ?? {},
  };
}
