// src/lib/supaApi.js
import { createClient } from "@supabase/supabase-js";

const URL_KEY = "VITE_SUPABASE_URL";
const KEY_KEY = "VITE_SUPABASE_ANON_KEY";

// 1) .env.local primero
const ENV_URL = import.meta.env.VITE_SUPABASE_URL;
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2) helpers opcionales
export function saveRuntimeEnv(url, anonKey) {
  if (url) localStorage.setItem(URL_KEY, url);
  if (anonKey) localStorage.setItem(KEY_KEY, anonKey);
}
export function isConfigured() {
  const hasEnv = Boolean(ENV_URL && ENV_KEY);
  const hasStorage =
    Boolean(localStorage.getItem(URL_KEY)) &&
    Boolean(localStorage.getItem(KEY_KEY));
  return hasEnv || hasStorage;
}

// 3) cliente singleton
let _client = null;
export function getSupa() {
  if (_client) return _client;
  const url = ENV_URL || localStorage.getItem(URL_KEY);
  const key = ENV_KEY || localStorage.getItem(KEY_KEY);
  if (!url || !key) {
    console.warn("⚠️ Supabase no configurado.");
    return null;
  }
  _client = createClient(url, key);
  return _client;
}

// -------- API --------
export async function ensureUser(email) {
  const supa = getSupa();
  if (!supa) throw new Error("Supabase no configurado");

  const { data, error } = await supa
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  if (!data) {
    const { data: ins, error: err2 } = await supa
      .from("users")
      .insert({ email })
      .select()
      .single();
    if (err2) throw err2;
    return { user: ins };
  }
  return { user: data };
}

export async function getUserState({ email, userId }) {
  const supa = getSupa();
  if (!supa) throw new Error("Supabase no configurado");

  if (userId) {
    const { data, error } = await supa
      .from("users")
      .select("id, soft_coins")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { user_id: data.id, soft_coins: data.soft_coins };
  }

  if (email) {
    const { data, error } = await supa
      .from("users")
      .select("id, soft_coins")
      .eq("email", email)
      .single();
    if (error) throw error;
    return { user_id: data.id, soft_coins: data.soft_coins };
  }

  throw new Error("Falta email o userId");
}

export async function creditAd(user_id, reason = "ad_view") {
  const supa = getSupa();
  if (!supa) throw new Error("Supabase no configurado");

  const { data, error } = await supa.rpc("credit_ad", {
    p_user_id: user_id,
    p_reason: reason,
  });
  if (error) throw error;
  return data;
}

// --- Cercanas (para TilesDemo) ---
export async function cellsNear(lat, lng, radius_m = 2000, limit = 100) {
  const supa = getSupa();
  if (!supa) throw new Error("Supabase no configurado");

  const { data, error } = await supa.rpc("cells_near", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radius_m,
    p_limit: limit,
  });
  if (error) throw error;
  return data ?? [];
}

// --- Comprar parcela (RPC buy_parcel) ---
export async function buyParcel(userId, x, y, cost = 100) {
  const supa = getSupa();
  if (!supa) throw new Error("Supabase no configurado");

  const { data, error } = await supa.rpc("buy_parcel", {
    p_user_id: userId,
    p_cost: cost,
    p_x: x,
    p_y: y,
  });
  if (error) throw error;
  return data;
}
