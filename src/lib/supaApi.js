// src/lib/supaApi.js
// -----------------------------------------------
// Cliente Supabase
import { getClient as _getClient } from "./supaClient.js";
export const getSupa = _getClient;     // alias compatibilidad
export { _getClient as getClient };    // re-export explícito

// -----------------------------------------------
// Utils
export function round4(n) {
  return Number(Number(n).toFixed(4));
}

// -----------------------------------------------
// “Sesión” local (recordar último usuario)
export function getLastUserId() {
  try { return localStorage.getItem("last_user_id") || null; } catch { return null; }
}
export function setLastUserId(id) {
  if (!id) return;
  try { localStorage.setItem("last_user_id", id); } catch {}
}

// -----------------------------------------------
// Usuarios
export async function ensureUser(email) {
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");
  const e = String(email || "").trim().toLowerCase();
  if (!e) throw new Error("Email requerido");

  // Buscar por email
  const sel = await sb
    .from("users")
    .select("id,email,soft_coins")
    .eq("email", e)
    .maybeSingle();
  if (sel.error) throw sel.error;

  if (sel.data) {
    setLastUserId(sel.data.id);
    return { user: sel.data, created: false };
  }

  // Crear
  const ins = await sb
    .from("users")
    .insert({ email: e })
    .select("id,email,soft_coins")
    .single();
  if (ins.error) throw ins.error;

  setLastUserId(ins.data.id);
  return { user: ins.data, created: true };
}

export async function getUserState({ userId, email } = {}) {
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  if (!userId && email) {
    const e = String(email || "").trim().toLowerCase();
    const r = await sb.from("users").select("id").eq("email", e).maybeSingle();
    if (r.error) throw r.error;
    if (!r.data) throw new Error("Usuario no encontrado");
    userId = r.data.id;
  }
  if (!userId) throw new Error("userId requerido");

  const { data, error } = await sb
    .from("users")
    .select("id,email,soft_coins")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getBalance(userId) {
  if (!userId) throw new Error("userId requerido");
  const u = await getUserState({ userId });
  return Number(u?.soft_coins ?? 0);
}

/** +1 por anuncio y devuelve { ok, balance } */
export async function creditAd(userId, note = "ad_view") {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  // (opcional) si tienes tabla ledger, intenta registrar; ignora si no existe
  const ins = await sb.from("ledger").insert({
    user_id: userId, kind: "credit", qty: 1, reason: "ad", note
  });
  if (ins.error && ins.error.code !== "42P01") throw ins.error;

  // Incremento simple: lee, suma y guarda
  const u = await getUserState({ userId });
  const next = Number(u?.soft_coins ?? 0) + 1;

  const upd = await sb
    .from("users")
    .update({ soft_coins: next })
    .eq("id", userId)
    .select("soft_coins")
    .single();
  if (upd.error) throw upd.error;

  return { ok: true, balance: Number(upd.data?.soft_coins ?? next) };
}

export async function pingSupabase() {
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");
  const { error } = await sb.from("users").select("id").limit(1);
  if (error) throw error;
  return { ok: true };
}

// -----------------------------------------------
// Parcels
export async function listMyParcels(userId) {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb
    .from("parcels")
    .select("id,x,y,owner_id,created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * cellsNear({ x, y, radiusM }) o cellsNear(x, y, radiusM)
 * x=lon, y=lat
 */
export async function cellsNear(arg1, arg2, arg3) {
  let x, y, radiusM;
  if (typeof arg1 === "object" && arg1 !== null) {
    x = Number(arg1.x); y = Number(arg1.y); radiusM = Number(arg1.radiusM ?? 500);
  } else {
    x = Number(arg1); y = Number(arg2); radiusM = Number(arg3 ?? 500);
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error("cellsNear: coordenadas inválidas");
  }

  // Bounding box aproximado
  const metersPerDegLat = 111_320;
  const metersPerDegLon = 111_320 * Math.cos((y * Math.PI) / 180);
  const dLat = radiusM / metersPerDegLat;
  const dLon = radiusM / metersPerDegLon;

  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb
    .from("parcels")
    .select("id,x,y,owner_id,created_at")
    .gte("x", x - dLon).lte("x", x + dLon)
    .gte("y", y - dLat).lte("y", y + dLat)
    .limit(1000);
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    x: Number(r.x),
    y: Number(r.y),
    owner_id: r.owner_id,
    created_at: r.created_at,
  }));
}

/** Comprar parcela vía RPC buy_parcel (coords opcionales) */
export async function buyParcel({ userId, cost = 100, x = null, y = null }) {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const args = { p_user_id: userId, p_cost: cost };
  if (x != null && y != null) {
    args.p_x = round4(x);
    args.p_y = round4(y);
  }

  const { data, error } = await sb.rpc("buy_parcel", args);
  if (error) throw error;
  return data; // { ok, parcel_id, soft_coins, error? }
}

/** 🔄 Reset: borra parcelas del usuario y pone soft_coins en 0 */
export async function resetUserAndParcels(userId) {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const del = await sb.from("parcels").delete().eq("owner_id", userId);
  if (del.error) throw del.error;

  const upd = await sb
    .from("users")
    .update({ soft_coins: 0 })
    .eq("id", userId);
  if (upd.error) throw upd.error;

  return { ok: true };
}
