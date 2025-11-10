// src/lib/supaApi.js
import { supabase } from "./supaClient.js";

/** Crea o carga usuario por email */
export async function ensureUser(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) throw new Error("Email requerido");

  const { data: existing, error: errSel } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", e)
    .maybeSingle();
  if (errSel) throw errSel;

  if (existing) return { user: existing };

  const { data, error: errIns } = await supabase
    .from("users")
    .insert({ email: e })
    .select("id, email")
    .single();
  if (errIns) throw errIns;

  return { user: data };
}

/** Lee saldo actual sumando ledger */
export async function getUserState({ email, userId } = {}) {
  let uid = userId;

  if (!uid) {
    const e = String(email || "").trim().toLowerCase();
    const { data, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", e)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Usuario no encontrado");
    uid = data.id;
  }

  const { data: rows, error: errL } = await supabase
    .from("ledger")
    .select("qty")
    .eq("user_id", uid);
  if (errL) throw errL;

  const soft_coins = (rows || []).reduce((s, r) => s + Number(r.qty || 0), 0);
  return { user_id: uid, soft_coins };
}

/** Ver anuncio (+1) */
export async function creditAd(userId, reason = "ad_view") {
  const { error } = await supabase.from("ledger").insert({
    user_id: userId,
    kind: "credit",
    qty: 1,
    reason,
    note: "ad reward",
  });
  if (error) throw error;

  const fresh = await getUserState({ userId: userId });
  return { ok: true, balance: fresh.soft_coins };
}

/** Recarga manual (+N) */
export async function topUp(userId, amount = 10) {
  const { error } = await supabase.from("ledger").insert({
    user_id: userId,
    kind: "credit",
    qty: amount,
    reason: "top_up",
    note: "manual",
  });
  if (error) throw error;

  const fresh = await getUserState({ userId: userId });
  return { ok: true, balance: fresh.soft_coins };
}

/** Celdas virtuales cerca (RPC cells_near) */
export async function cellsNear(lat, lng, radius_m = 600, limit = 120) {
  const { data, error } = await supabase.rpc("cells_near", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radius_m,
    p_limit: limit,
  });
  if (error) throw error;
  return { list: data ?? [] };
}

/** (Fallback opcional) tiles_near si lo tienes en DB */
export async function tilesNear(lat, lng, radius_m = 300) {
  const { data, error } = await supabase.rpc("tiles_near", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radius_m,
  });
  if (error) throw error;
  return { list: data ?? [] };
}

/** Comprar celda por qx/qy (si ya tienes buy_cell) */
export async function buyCell(userId, qx, qy) {
  const { data, error } = await supabase.rpc("buy_cell", {
    p_user_id: userId,
    p_qx: qx,
    p_qy: qy,
  });
  if (error) return { ok: false, error: error.message };
  return data ?? { ok: false, error: "unknown_error" };
}
