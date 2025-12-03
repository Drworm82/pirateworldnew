// =============================================================
// supaApi.js — Versión FINAL V6 con costos + initShip
// =============================================================
import { supabase } from "./supaClient";

// -----------------------------------------------
// Asegurar usuario anónimo
// -----------------------------------------------
export async function ensureUser() {
  const session = (await supabase.auth.getSession()).data.session;
  if (session?.user) return session.user;

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
// COSTO PREVIO — Calculado antes de zarpar
// -----------------------------------------------
export async function calculateTravelCost(userId, islandKey) {
  const { data, error } = await supabase.rpc("ship_travel_cost_preview_v5", {
    p_user: userId,
    p_destination: islandKey,
  });

  if (error) {
    console.error("calculateTravelCost error:", error);
    return { error: true, message: error.message };
  }

  return data;
}

// -----------------------------------------------
// INICIAR VIAJE (cobra y arranca)
// -----------------------------------------------
export async function startTravel(userId, islandKey) {
  const { data, error } = await supabase.rpc("ship_travel_start_v5", {
    p_user: userId,
    p_destination: islandKey,
  });

  if (error) {
    console.error("startTravel error:", error);
    return { error: true, message: error.message };
  }

  return data;
}

// -----------------------------------------------
// Progreso del viaje
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
// Autonav + eventos
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
// Cargar islas
// -----------------------------------------------
export async function loadIslands() {
  const { data, error } = await supabase
    .from("islands")
    .select("*")
    .order("name", { ascending: true });

  if (error) return [];
  return data;
}

// -----------------------------------------------
// Debug — leer ship_state directamente
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
