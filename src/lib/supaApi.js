// src/lib/supaApi.js
import { createClient } from "@supabase/supabase-js";

/**
 * Lee credenciales desde:
 * - variables de entorno Vite (build)
 * - localStorage (en runtime / pantalla de setup)
 * - ventana global (inyectadas) si existieran
 */
function readEnv() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem("VITE_SUPABASE_URL") ||
    (window.__PW_SUPA_URL ?? "");
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem("VITE_SUPABASE_ANON_KEY") ||
    (window.__PW_SUPA_KEY ?? "");
  return { url: (url || "").trim(), key: (key || "").trim() };
}

let _supabase = null;

export function isConfigured() {
  const { url, key } = readEnv();
  return Boolean(url && key);
}

export function saveRuntimeEnv(url, key) {
  localStorage.setItem("VITE_SUPABASE_URL", url);
  localStorage.setItem("VITE_SUPABASE_ANON_KEY", key);
  // reset cliente para que vuelva a inicializar con nuevas credenciales
  _supabase = null;
}

export function getClient() {
  if (_supabase) return _supabase;
  const { url, key } = readEnv();
  if (!url || !key) return null;
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

/**
 * FE-01 / BE-01
 * Crea o carga usuario vía RPC en la BD:
 *   public.create_or_load_user(p_email text)
 * Debe existir en tu proyecto de Supabase (ya lo creaste).
 * Retorna { user: { id, email, soft_coins } }
 */
export async function ensureUser(email) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase no configurado.");

  const clean = String(email || "").trim().toLowerCase();
  if (!clean) throw new Error("Email requerido.");

  const { data, error } = await supabase.rpc("create_or_load_user", {
    p_email: clean,
  });
  if (error) throw error;

  // data es la fila devuelta por la función (TABLE: id, email, soft_coins)
  const user = Array.isArray(data) ? data[0] ?? null : data;
  if (!user) throw new Error("Respuesta vacía del RPC.");
  return { user };
}