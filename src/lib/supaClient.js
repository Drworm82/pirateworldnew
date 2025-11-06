// src/lib/supaClient.js
import { createClient } from '@supabase/supabase-js';

/** Lee credenciales de .env o, si no existen, de localStorage (UI /Diag → Setup) */
function readEnv() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem('VITE_SUPABASE_URL') ||
    (window.__PW_SUPA_URL ?? '');
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('VITE_SUPABASE_ANON_KEY') ||
    (window.__PW_SUPA_KEY ?? '');
  return { url: (url || '').trim(), key: (key || '').trim() };
}

let _supabase = null;

/** ¿Tenemos credenciales válidas? */
export function isConfigured() {
  const { url, key } = readEnv();
  return !!(url && key);
}

/** Guarda credenciales en runtime (localStorage) desde la tarjeta Setup de /Diag */
export function saveRuntimeEnv(url, key) {
  localStorage.setItem('VITE_SUPABASE_URL', url);
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
}

/** Cliente único y estable de Supabase */
export function getClient() {
  if (_supabase) return _supabase;
  const { url, key } = readEnv();
  if (!url || !key) return null;

  _supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: window.fetch.bind(window) },
  });

  return _supabase;
}

export default { getClient, isConfigured, saveRuntimeEnv };
