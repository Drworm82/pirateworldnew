// =======================================================
// supaApi.js — API CONTRACT CERRADO (DEV / UI SAFE)
// PirateWorld
// =======================================================
//
// Este archivo garantiza que TODOS los imports legacy existen.
// No implementa backend real todavía.
// El backend real se conectará después.
//
// =======================================================

import { supabase } from "./supabaseClient";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function notImplemented(name) {
  console.warn(`[supaApi] ${name} not implemented (DEV stub)`);
  return null;
}

// -------------------------------------------------------
// Config / Infra
// -------------------------------------------------------

export function isConfigured() {
  return true;
}

export function getClient() {
  return supabase;
}

export function getSupa() {
  return supabase;
}

export function saveRuntimeEnv() {
  return true;
}

// -------------------------------------------------------
// Usuario / Sesión (LEGACY CRÍTICO)
// -------------------------------------------------------

export async function ensureUser() {
  return {
    id: "dev-user",
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

export async function resetUserAndParcels() {
  return { ok: true };
}

export async function getLastUserId() {
  return null;
}

// -------------------------------------------------------
// Demo / Matemática legacy
// -------------------------------------------------------

export function round4(n = 0) {
  return Math.round(n * 10000) / 10000;
}

// -------------------------------------------------------
// Economía / Ads
// -------------------------------------------------------

export async function getBalance() {
  return 0;
}

export async function creditAd() {
  return { ok: true };
}

// -------------------------------------------------------
// Inventario / Tienda
// -------------------------------------------------------

export async function listInventory() {
  return [];
}

export async function listStoreItems() {
  return [];
}

export async function buyItem() {
  return { ok: false, reason: "DEV stub" };
}

// -------------------------------------------------------
// Parcelas / Mapa / Tiles
// -------------------------------------------------------

export async function buyParcel() {
  return { ok: false, reason: "DEV stub" };
}

export async function listMyParcels() {
  return [];
}

export async function cellsNear() {
  return [];
}

// -------------------------------------------------------
// Ledger / Banco
// -------------------------------------------------------

export async function getUserLedger() {
  return [];
}

// -------------------------------------------------------
// Barco / Viajes (UI SAFE)
// -------------------------------------------------------

export async function shipTravelCostPreviewV5({
  origin,
  destination,
} = {}) {
  return {
    distance_km: 0,
    eta_minutes: 0,
    cost_doblones: 0,
    risk: "low",
    mock: true,
  };
}

export async function shipTravelStartV5() {
  return { ok: true, mock: true };
}

export async function shipGetStateV5() {
  return {
    status: "idle",
    percent: 0,
  };
}

export async function shipTravelProgressV5() {
  return {
    percent: 0,
    eta_minutes: 0,
  };
}

// -------------------------------------------------------
// Debug
// -------------------------------------------------------

export async function debugState() {
  return {};
}
