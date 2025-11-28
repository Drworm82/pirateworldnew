// ===================================
// supaApi.js — PirateWorld (V3 DEFINITIVO)
// ===================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _client = null;
export function _getClient() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnon);
  }
  return _client;
}

// ===================================
// USERS — crear usuario si no existe
// ===================================
export async function ensureUser(email) {
  const sb = _getClient();

  // Buscar usuario
  const { data: userData, error: selectError } = await sb
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (selectError) {
    console.error("ensureUser SELECT error:", selectError);
    throw selectError;
  }

  if (userData) return { user: userData };

  // Crear si no existe
  const { data, error } = await sb
    .from("users")
    .insert({ email })
    .select()
    .single();

  if (error) {
    console.error("ensureUser INSERT error:", error);
    throw error;
  }

  return { user: data };
}

// ===================================
// SHIP SYSTEM — V3 (BACKEND DEFINITIVO)
// ===================================

// Obtener progreso del barco (jsonb, no array)
export async function getShipProgress(userId) {
  const sb = _getClient();

  const { data, error } = await sb.rpc("ship_travel_progress_v3", {
    p_user_id: userId,
  });

  if (error) {
    console.error("RPC ship_travel_progress_v3 ERROR:", error);
    return null;
  }

  return data;
}

// Iniciar viaje
export async function startShipTravelV3(
  userId,
  originKey,
  destKey,
  originLat,
  originLng,
  destLat,
  destLng
) {
  const sb = _getClient();

  const { data, error } = await sb.rpc("ship_travel_start_v3", {
    p_user_id: userId,
    p_origin: originKey,
    p_destination: destKey,
    p_origin_lat: originLat,
    p_origin_lng: originLng,
    p_destination_lat: destLat,
    p_destination_lng: destLng,
  });

  if (error) {
    console.error("RPC ship_travel_start_v3 ERROR:", error);
    throw error;
  }

  return data;
}

// Llegada automática
export async function shipArrive(userId) {
  const sb = _getClient();
  const { data, error } = await sb.rpc("ship_arrive_v3", {
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}

// Forzar llegada (solo dev)
export async function forceShipArrival(userId) {
  const sb = _getClient();
  const { data, error } = await sb.rpc("ship_force_arrival_v3", {
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}

// Ver anuncio durante viaje
export async function watchAdDuringTravel(userId, seconds) {
  const sb = _getClient();
  const { data, error } = await sb.rpc("ad_watch_during_travel", {
    p_user_id: userId,
    p_seconds: seconds,
  });
  if (error) throw error;
  return data;
}

// Recompensa por ver anuncio
export async function getShipTravelAdReward(userId) {
  const sb = _getClient();
  const { data, error } = await sb.rpc("ship_travel_ad_reward", {
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}
