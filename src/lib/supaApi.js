// =======================================================
// supaApi.js — BLINDADO (Sprint-safe)
// PirateWorld
// =======================================================

import { supabase } from "./supabaseClient";

// -------------------------------------------------------
// Config
// -------------------------------------------------------

export function isConfigured() {
  return true;
}

export function round4(n = 0) {
  return Math.round(n * 10000) / 10000;
}

// -------------------------------------------------------
// Usuario / Sesión (DEV)
// -------------------------------------------------------

export async function ensureUser() {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    role: "dev",
  };
}

export async function getUserState() {
  return {
    registered: true,
    has_ship: true,
    status: "idle",
  };
}

export async function getLastUserId() {
  return "00000000-0000-0000-0000-000000000001";
}

export async function resetUserAndParcels() {
  return { ok: true };
}

// -------------------------------------------------------
// Economía
// -------------------------------------------------------

export async function getBalance() {
  const { data } = await supabase
    .from("ledger")
    .select("amount_usd, kind")
    .eq("user_id", (await ensureUser()).id);

  if (!data) return 0;

  return data.reduce((sum, r) => {
    return r.kind === "credit" ? sum + Number(r.amount_usd) : sum - Number(r.amount_usd);
  }, 0);
}

export async function creditAd() {
  return { ok: true };
}

export async function getLedgerV5() {
  const user = await ensureUser();
  const { data } = await supabase
    .from("ledger")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

// -------------------------------------------------------
// Inventario / Store
// -------------------------------------------------------

export async function listInventory() {
  return [];
}

export async function listStoreItems() {
  return [];
}

export async function buyItem() {
  return { ok: true };
}

// -------------------------------------------------------
// Parcelas
// -------------------------------------------------------

export async function buyParcel() {
  return { ok: true };
}

export async function listMyParcels() {
  return [];
}

// -------------------------------------------------------
// Barco / Viajes
// -------------------------------------------------------

export async function shipGetState() {
  const user = await ensureUser();

  const { data, error } = await supabase.rpc("ship_get_state", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("[shipGetState]", error);
    return { status: "idle", percent: 0 };
  }

  return data;
}

export async function shipTravelStartV5(from, to) {
  const user = await ensureUser();

  const { error } = await supabase.rpc("ship_travel_start_v5", {
    p_user_id: user.id,
    p_from_island: from,
    p_to_island: to,
  });

  if (error) {
    console.error("[shipTravelStartV5]", error);
    throw error;
  }

  return { ok: true };
}

export async function shipTravelComplete() {
  const { data, error } = await supabase.rpc("ship_travel_complete_v1");
  if (error) {
    console.error("[shipTravelComplete]", error);
    throw error;
  }
  return data;
}


export async function grantTravelReward({ amount, reference }) {
  const user = await ensureUser();

  const { data, error } = await supabase.rpc("grant_travel_reward", {
    p_user_id: user.id,
    p_amount: amount,
    p_reference: reference,
  });

  if (error) {
    console.error("[grantTravelReward]", error);
    return null;
  }

  return data;
}

// -------------------------------------------------------
// Debug / Legacy
// -------------------------------------------------------

export function getSupa() {
  return supabase;
}
// -------------------------------------------------------
// Mapa / Celdas (LEGACY / DEMO)
// -------------------------------------------------------

export async function cellsNear() {
  return [];
}
