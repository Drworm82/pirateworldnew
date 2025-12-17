// =======================================================
// supaApi.js — PirateWorld (V5 LIMPIO)
// Fuente de verdad: Supabase STAGE
// Frontend OBSERVA, Backend MANDA
// =======================================================

import { supabase } from "./supaClient";

// =======================================================
// AUTH / USER
// =======================================================

export async function ensureUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("❌ No user session");
    return null;
  }

  return user;
}

// =======================================================
// SHIP — START TRAVEL (V4 ACTIVO)
// =======================================================

export async function ship_travel_start_v4(to_island) {
  const { data, error } = await supabase.rpc(
    "ship_travel_start_v4",
    { to_island }
  );

  if (error) {
    console.error("❌ ship_travel_start_v4", error);
    throw error;
  }

  return data;
}

// =======================================================
// SHIP — GET PROGRESS / STATE (V5 ACTIVO)
// =======================================================

export async function ship_travel_progress_v5() {
  const { data, error } = await supabase.rpc(
    "ship_travel_progress_v5"
  );

  if (error) {
    console.error("❌ ship_travel_progress_v5", error);
    throw error;
  }

  return data;
}

// =======================================================
// SHIP — AUTONAV (V4 ACTIVO)
// =======================================================

export async function ship_autonav_v4() {
  const { data, error } = await supabase.rpc(
    "ship_autonav_v4"
  );

  if (error) {
    console.error("❌ ship_autonav_v4", error);
    throw error;
  }

  return data;
}

// =======================================================
// SHIP — EVENTS (V1 ACTIVO)
// =======================================================

export async function ship_maybe_trigger_event_v1() {
  const { data, error } = await supabase.rpc(
    "ship_maybe_trigger_event_v1"
  );

  if (error) {
    console.error("❌ ship_maybe_trigger_event_v1", error);
    throw error;
  }

  return data;
}
