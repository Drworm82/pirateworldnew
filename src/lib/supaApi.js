// src/lib/supaApi.js
// Cliente + helpers de Supabase para PirateWorld (frontend)
// - Lee credenciales desde .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
//   o desde localStorage (guardadas con la tarjeta Setup de /Diag)

import { createClient } from '@supabase/supabase-js';

/* ───────────────────── Runtime ENV ───────────────────── */
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

export function isConfigured() {
  const { url, key } = readEnv();
  return !!(url && key);
}

export function saveRuntimeEnv(url, key) {
  localStorage.setItem('VITE_SUPABASE_URL', url);
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
}

export function getClient() {
  if (_supabase) return _supabase;
  const { url, key } = readEnv();
  if (!url || !key) return null; // la UI de /Diag mostrará Setup
  _supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: window.fetch.bind(window) },
  });
  return _supabase;
}

/* ───────────────────── Usuarios ───────────────────── */
// Prefiere RPC ensure_user(p_email text) si existe; si no, fallback a select/insert
export async function ensureUser(email) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');

  // Intento 1: RPC ensure_user
  const tryRpc = await sb.rpc('ensure_user', { p_email: email });
  if (!tryRpc.error && tryRpc.data) {
    // RPC devuelve jsonb { id, email, soft_coins }
    return { user: tryRpc.data, created: undefined };
  }

  // Intento 2: fallback tabla users
  const { data: found, error: e1 } = await sb
    .from('users')
    .select('id,email,soft_coins')
    .eq('email', email)
    .maybeSingle();

  if (e1 && e1.code !== 'PGRST116') throw e1;
  if (found) return { user: found, created: false };

  const { data, error } = await sb
    .from('users')
    .insert({ email, soft_coins: 0 })
    .select('id,email,soft_coins')
    .single();

  if (error) throw error;
  return { user: data, created: true };
}

export async function getUserState({ userId, email }) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  let q = sb.from('users').select('id,email,soft_coins').limit(1);
  if (userId) q = q.eq('id', userId);
  else q = q.eq('email', email);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data
    ? { user_id: data.id, email: data.email, soft_coins: data.soft_coins }
    : null;
}

/* ───────────────────── Ads RPC ─────────────────────
   Back-end esperado (según tus definiciones actuales):
   - ads_request_token(p_email text) returns jsonb -> { token, expires }  // SECURITY DEFINER + GRANT EXECUTE TO anon
   - ads_verify_token(p_email text, p_token text) returns jsonb -> { ok:bool, coins_added?:int, error?:text }
*/
export async function adsRequestToken(email) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  const { data, error } = await sb.rpc('ads_request_token', { p_email: email });
  if (error) throw error;
  return data; // { token, expires } (jsonb)
}

export async function adsVerifyToken(email, token) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  const { data, error } = await sb.rpc('ads_verify_token', {
    p_email: email,
    p_token: token,
  });
  if (error) throw error;
  return data; // { ok, coins_added?, error? } (jsonb)
}

/* ───────────────────── Utilidades (opcional) ───────────────────── */
export async function pingSupabase() {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  const { error } = await sb.from('users').select('id').limit(1);
  if (error) throw error;
  return { ok: true };
}

export default {
  isConfigured,
  saveRuntimeEnv,
  getClient,
  ensureUser,
  getUserState,
  adsRequestToken,
  adsVerifyToken,
  pingSupabase,
};
