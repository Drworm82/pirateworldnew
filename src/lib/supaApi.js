// src/lib/supaApi.js
// Cliente
import supabase from "./supaClient.js";

/** Crea o carga el usuario de pruebas por email.
 * Devuelve: { user: {id, email} }
 */
export async function ensureUser(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) throw new Error("Email requerido");

  let { data: urow, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", e)
    .maybeSingle();

  if (error) throw error;

  if (!urow) {
    const { data: ins, error: errIns } = await supabase
      .from("users")
      .insert({ email: e })
      .select("id, email")
      .single();
    if (errIns) throw errIns;
    urow = ins;
  }

  return { user: { id: urow.id, email: urow.email } };
}

/** Lee saldo desde el backend (RPC wallet_get_balance)
 * getUserState({ email })  ó  getUserState({ userId })
 * → { user_id, email?, soft_coins }
 */
export async function getUserState({ email, userId } = {}) {
  let uid = userId;
  let eml = email;

  if (!uid) {
    const e = String(email || "").trim().toLowerCase();
    if (!e) throw new Error("Falta email o userId");
    const { data, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", e)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Usuario no encontrado");
    uid = data.id;
    eml = data.email;
  }

  const { data: bal, error: errBal } = await supabase.rpc(
    "wallet_get_balance",
    { p_user_id: uid }
  );
  if (errBal) throw errBal;

  return {
    user_id: uid,
    email: eml,
    soft_coins: Number(bal ?? 0),
  };
}

/** Acredita +1 por anuncio (INSERT a ledger como 'credit', reason='ad'). */
export async function creditAd(userId, note = "ad_view") {
  const { error } = await supabase.from("ledger").insert({
    user_id: userId,
    kind: "credit",     // << importante: 'credit' (el constraint no acepta 'ad')
    qty: 1,
    reason: "ad",
    note,
  });
  if (error) throw error;

  const { data: bal, error: errBal } = await supabase.rpc(
    "wallet_get_balance",
    { p_user_id: userId }
  );
  if (errBal) throw errBal;
  return { ok: true, balance: Number(bal ?? 0) };
}

/** Tiles cercanos (usa tiles_near). */
export async function tilesNear(lat, lng, radius_m = 300) {
  const { data, error } = await supabase.rpc("tiles_near", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radius_m,
  });
  if (error) throw error;
  return { list: data ?? [] };
}

/** Comprar tile (buy_tile_by_id). */
export async function buyTileById(userId, tileId, lat, lng, radius_m = 300) {
  const { data, error } = await supabase.rpc("buy_tile_by_id", {
    p_user_id: userId,
    p_tile_id: tileId,
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radius_m,
  });
  if (error) return { ok: false, error: error.message };
  return data ?? { ok: false, error: "unknown_error" };
}

export default {
  ensureUser,
  getUserState,
  creditAd,
  tilesNear,
  buyTileById,
};
