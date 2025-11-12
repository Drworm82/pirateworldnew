// src/lib/supaClient.js
import { createClient } from "@supabase/supabase-js";

const SUPA_URL =
  import.meta.env.VITE_SUPABASE_URL_PROD ||
  import.meta.env.VITE_SUPABASE_URL;

const SUPA_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY_PROD ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crea el cliente solo si hay credenciales válidas
export const supabase = (SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null;

export function getClient() {
  if (!supabase) throw new Error("Supabase no configurado.");
  return supabase;
}

// Helpers opcionales
export function isConfigured() {
  return !!supabase;
}

// Guardar pares en localStorage para diagnóstico (no modifica process.env)
export function saveRuntimeEnv(url, key) {
  try {
    if (url) localStorage.setItem("VITE_SUPABASE_URL", url);
    if (key) localStorage.setItem("VITE_SUPABASE_ANON_KEY", key);
  } catch {}
}
