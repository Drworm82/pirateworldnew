// ================================================
// supaApi.js — Versión oficial v4 PRO FINAL
// ================================================

import { supabase } from "./supaClient";

// -----------------------------------------------
// Asegurar usuario anónimo
// -----------------------------------------------
export async function ensureUser() {
  const session = (await supabase.auth.getSession()).data.session;

  if (session?.user) {
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  return data.user;
}

// -----------------------------------------------
// Inicializar barco — ship_init_v4
// -----------------------------------------------
export async function initShip(userId) {
  const { data, error } = await supabase.rpc("ship_init_v4", {
    p_user: userId,
  });

  if (error) {
    console.error("initShip error:", error);
    throw error;
  }

  return data;
}

// -----------------------------------------------
// Progreso del viaje — ship_travel_progress_v4
// -----------------------------------------------
export async function getShipProgress(userId) {
  const { data, error } = await supabase.rpc("ship_travel_progress_v4", {
    p_user: userId,
  });

  if (error) {
    console.error("getShipProgress error:", error);
    return null;
  }

  return data;
}

// -----------------------------------------------
// Autonavegación — ship_autonav_v4
// -----------------------------------------------
export async function autoNav(userId) {
  const { data, error } = await supabase.rpc("ship_autonav_v4", {
    p_user: userId,
  });

  if (error) {
    console.error("autoNav error:", error);
    throw error;
  }

  return data;
}

// -----------------------------------------------
// Evento del mar — ship_trigger_event_v4
// -----------------------------------------------
export async function getLastEvent(userId) {
  const { data, error } = await supabase.rpc("ship_trigger_event_v4", {
    p_user: userId,
  });

  if (error) {
    console.error("getLastEvent error:", error);
    return null;
  }

  return data;
}

// -----------------------------------------------
// Iniciar viaje — ship_travel_start_v4
// -----------------------------------------------
export async function startTravel(userId, islandKey) {
  const { data, error } = await supabase.rpc("ship_travel_start_v4", {
    p_user: userId,
    p_destination: islandKey,
  });

  if (error) {
    console.error("startTravel error:", error);
    return null;
  }

  return data;
}

// -----------------------------------------------
// Cargar islas — tabla islands
// -----------------------------------------------
export async function loadIslands() {
  const { data, error } = await supabase
    .from("islands")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("loadIslands error:", error);
    return [];
  }

  return data;
}

// -----------------------------------------------
// Estado sin procesar — Debug directo a ship_state
// -----------------------------------------------
export async function debugState(userId) {
  const { data, error } = await supabase
    .from("ship_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("debugState error:", error);
    return null;
  }

  return data;
}

// ===============================================================
// 🚢 PRO — Costo del viaje basado en ship_config + distancia real
// ===============================================================

// Distancia haversine (km)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -----------------------------------------------
// PRO: calcular costo basado en distancia + ship_config
// -----------------------------------------------
export async function calculateTravelCost(userId, islandKey) {
  try {
    const { data: state, error: e1 } = await supabase
      .from("ship_state")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (e1 || !state) throw e1 || new Error("NO_SHIP_STATE");

    const { data: island, error: e2 } = await supabase
      .from("islands")
      .select("*")
      .eq("key", islandKey)
      .maybeSingle();
    if (e2 || !island) throw e2 || new Error("NO_ISLAND");

    const boat = state.boat_type ?? state.type ?? "basic";

    const { data: cfg, error: e3 } = await supabase
      .from("ship_config")
      .select("*")
      .eq("boat_type", boat)
      .maybeSingle();
    if (e3 || !cfg) throw e3 || new Error("NO_SHIP_CONFIG");

    const distance_km = haversineDistance(
      state.origin_lat,
      state.origin_lng,
      island.lat,
      island.lng
    );

    const base_cost = Number(cfg.base_cost);
    const variable_cost = Math.round(distance_km * Number(cfg.cost_per_km));
    const total_cost = base_cost + variable_cost;

    return {
      distance_km: Number(distance_km.toFixed(3)),
      base_cost,
      variable_cost,
      total_cost,
      destination: islandKey,
    };
  } catch (err) {
    console.error("calculateTravelCost error:", err);
    return {
      error: true,
      message: err?.message || "unknown_error",
    };
  }
}
