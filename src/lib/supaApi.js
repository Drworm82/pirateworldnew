// src/lib/supaApi.js
import { createClient } from '@supabase/supabase-js';

// Si VITE_ALLOW_RUNTIME_SUPA === "1", permitimos que localStorage
// sobrescriba lo que venga del .env. Si no, priorizamos el .env.
const ALLOW_RUNTIME = (import.meta.env.VITE_ALLOW_RUNTIME_SUPA || "").trim() === "1";

function readEnv() {
  const lsUrl  = localStorage.getItem('VITE_SUPABASE_URL') || (window.__PW_SUPA_URL ?? '');
  const lsKey  = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || (window.__PW_SUPA_KEY ?? '');
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Orden de precedencia:
  // - Con override habilitado: localStorage > .env
  // - Sin override: .env > localStorage
  const url = (ALLOW_RUNTIME ? (lsUrl || envUrl) : (envUrl || lsUrl)).trim();
  const key = (ALLOW_RUNTIME ? (lsKey || envKey) : (envKey || lsKey)).trim();
  return { url, key };
}

let _supabase = null;

export function isConfigured() {
  const { url, key } = readEnv();
  return !!(url && key);
}

export function saveRuntimeEnv(url, key) {
  // Guarda en localStorage (solo tomará efecto si ALLOW_RUNTIME = true)
  localStorage.setItem('VITE_SUPABASE_URL', (url || '').trim());
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', (key || '').trim());
  _supabase = null; // resetea el cliente para que coja la nueva config
}

export function clearRuntimeEnv() {
  localStorage.removeItem('VITE_SUPABASE_URL');
  localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
  _supabase = null;
}

export function getClient() {
  if (_supabase) return _supabase;
  const { url, key } = readEnv();
  if (!url || !key) return null;
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

/** FE-01: cargar o crear usuario **por RPC** */
export async function ensureUser(email) {
  const supabase = getClient();
  if (!supabase) throw new Error('Supabase no configurado.');
  const { data, error } = await supabase.rpc('ensure_user', { p_email: email });
  if (error) throw error;
  // data es jsonb del RPC -> { id, email, soft_coins }
  return { user: data, created: undefined };
}
