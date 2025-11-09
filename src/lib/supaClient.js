// src/lib/supaClient.js
import { createClient } from "@supabase/supabase-js";

// Detecta si estamos en producción (Vercel) o forzado por env
const isProd =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("vercel.app") ||
    import.meta.env.VITE_FORCE_PROD === "1");

// Toma URL/KEY según entorno
const SUPA_URL = isProd
  ? import.meta.env.VITE_SUPABASE_URL_PROD
  : import.meta.env.VITE_SUPABASE_URL;

const SUPA_KEY = isProd
  ? import.meta.env.VITE_SUPABASE_ANON_KEY_PROD
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log limpio para depurar sin filtrar secretos
if (!SUPA_URL || !SUPA_KEY) {
  console.error("❌ Variables de entorno de Supabase no configuradas.");
  console.log("(index)Value", {
    SUPA_URL,
    SUPA_KEY: SUPA_KEY ? `(length: ${String(SUPA_KEY).length})` : undefined,
  });
}

/**
 * Cliente Supabase.
 * - Si faltan envs, queda en null y las APIs deben lanzar error legible.
 */
export const supabase =
  SUPA_URL && SUPA_KEY ? createClient(SUPA_URL, SUPA_KEY) : null;

/** Lanza un error claro si el cliente no está listo. */
export function assertConfigured() {
  if (!supabase) {
    throw new Error(
      "Supabase no está configurado. Revisa .env.local (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) o las variables de Vercel en PROD."
    );
  }
}

export default supabase;
