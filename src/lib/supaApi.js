import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client — DEV
 * READ-ONLY
 * No writes allowed in Sprint 72
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * rpc_get_player_summary
 * CANON READ-ONLY
 */
export async function getPlayerSummary() {
  const { data, error } = await supabase
    .rpc("rpc_get_player_summary");

  if (error) {
    console.error("rpc_get_player_summary error:", error);
    throw error;
  }

  return data;
}
