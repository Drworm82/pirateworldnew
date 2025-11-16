// src/lib/supaApi.js
// -----------------------------------------------
// Cliente Supabase + helpers de runtime
import {
  getClient as _getClient,
  isConfigured as _isConfigured,
  saveRuntimeEnv as _saveRuntimeEnv,
} from "./supaClient.js";

export const getSupa = _getClient; // alias compatibilidad
export { _getClient as getClient };

// Re-export de helpers de configuración (los usa main.jsx, Inventory, etc.)
export const isConfigured = _isConfigured;
export const saveRuntimeEnv = _saveRuntimeEnv;

// -----------------------------------------------
// Utils
export function round4(n) {
  return Number(Number(n).toFixed(4));
}

// -----------------------------------------------
// “Sesión” local (recordar último usuario)
export function getLastUserId() {
  try {
    return localStorage.getItem("last_user_id") || null;
  } catch {
    return null;
  }
}

export function setLastUserId(id) {
  if (!id) return;
  try {
    localStorage.setItem("last_user_id", id);
  } catch {
    // ignore
  }
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

  // Registrar en user_ledger (si existe función add_to_ledger)
  try {
    await sb.rpc("add_to_ledger", {
      p_user_id: userId,
      p_type: "ad_view",
      p_delta: 1,
    });
  } catch (err) {
    console.warn("add_to_ledger falló en creditAd:", err?.message);
  }

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
    x = Number(arg1.x);
    y = Number(arg1.y);
    radiusM = Number(arg1.radiusM ?? 500);
  } else {
    x = Number(arg1);
    y = Number(arg2);
    radiusM = Number(arg3 ?? 500);
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error("cellsNear: coordenadas inválidas");
  }

  const metersPerDegLat = 111_320;
  const metersPerDegLon = 111_320 * Math.cos((y * Math.PI) / 180);
  const dLat = radiusM / metersPerDegLat;
  const dLon = radiusM / metersPerDegLon;

  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb
    .from("parcels")
    .select("id,x,y,owner_id,created_at")
    .gte("x", x - dLon)
    .lte("x", x + dLon)
    .gte("y", y - dLat)
    .lte("y", y + dLat)
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

// -----------------------------------------------
// Ledger
export async function getUserLedger(userId) {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb.rpc("get_user_ledger", {
    p_user_id: userId,
  });
  if (error) throw error;

  // Devuelve siempre un array
  return data || [];
}

// -----------------------------------------------
// Store (tienda de ítems)
// -----------------------------------------------
export async function listStoreItems() {
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb
    .from("store_items")
    .select("id,name,price,rarity,created_at")
    .order("price", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * buyItem({ userId, itemId })
 * Llama a la RPC buy_item y devuelve el payload:
 * { ok, item_id, soft_coins, inventory_id, error? }
 */
export async function buyItem({ userId, itemId }) {
  if (!userId) throw new Error("userId requerido");
  if (!itemId) throw new Error("itemId requerido");

  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb.rpc("buy_item", {
    p_user_id: userId,
    p_item_id: itemId,
  });
  if (error) throw error;
  return data;
}

// -----------------------------------------------
// Missions (cliente → RPC complete_mission)
// -----------------------------------------------
export async function completeMission({ userId, missionCode }) {
  if (!userId) throw new Error("userId requerido");
  if (!missionCode) throw new Error("missionCode requerido");

  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb.rpc("complete_mission", {
    p_user_id: userId,
    p_mission_code: missionCode,
  });
  if (error) throw error;
  return data; // { ok, mission_code, reward_soft_coins, soft_coins, ledger? }
}

// -----------------------------------------------
// Inventory (cliente)
// -----------------------------------------------
export async function listInventory(userId) {
  const supa = getSupa();
  if (!supa || !userId) {
    return { ok: false, error: "not_configured_or_no_user" };
  }

  // 1) filas de inventario
  const { data: inv, error: errInv } = await supa
    .from("user_inventory")
    .select("id, user_id, item_id, acquired_at, created_at")
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });

  if (errInv) {
    console.error("listInventory inv error", errInv);
    return { ok: false, error: errInv.message || "inventory_query_failed" };
  }

  if (!inv || inv.length === 0) {
    return { ok: true, rows: [] };
  }

  // 2) catálogo de ítems
  const { data: items, error: errItems } = await supa
    .from("store_items")
    .select("id, name, price, rarity");

  if (errItems) {
    console.error("listInventory items error", errItems);
    // devolvemos inventario sin metadata de ítem
    return { ok: true, rows: inv.map((row) => ({ ...row, item: null })) };
  }

  const map = new Map(items.map((it) => [it.id, it]));

  const rows = inv.map((row) => ({
    ...row,
    item: map.get(row.item_id) || null,
  }));

  return { ok: true, rows };
}

// -----------------------------------------------
// Exploration (cliente → RPC exploration_*)
// -----------------------------------------------
export async function startExploration({ userId, durationMin }) {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb.rpc("exploration_start", {
    p_user_id: userId,
    p_duration_min: durationMin,
  });
  if (error) throw error;
  return data; // { ok, cost, soft_coins, run_id, status, ship_name, started_at, eta_at, error? }
}

export async function getActiveExploration(userId) {
  if (!userId) throw new Error("userId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb.rpc("exploration_get_active", {
    p_user_id: userId,
  });
  if (error) throw error;
  return data; // { ok, ... } o { ok:false, error:"no_active_run" }
}

export async function resolveExploration({ userId, runId, depositTo = "wallet" }) {
  if (!userId) throw new Error("userId requerido");
  if (!runId) throw new Error("runId requerido");
  const sb = _getClient();
  if (!sb) throw new Error("Supabase no configurado.");

  const { data, error } = await sb.rpc("exploration_resolve", {
    p_user_id: userId,
    p_run_id: runId,
    p_deposit_to: depositTo,
  });
  if (error) throw error;
  return data; // { ok, coins, soft_coins, loot_json, status, ... }
}
