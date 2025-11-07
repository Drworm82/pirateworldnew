// src/lib/supaApi.js
// Cliente + helpers de Supabase para PirateWorld (frontend)

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
  if (!url || !key) return null;
  _supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: window.fetch.bind(window) },
  });
  return _supabase;
}

/* ───────────────────── Usuarios ───────────────────── */
export async function ensureUser(email) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  const clean = (email || '').trim().toLowerCase();

  try { await sb.rpc('ensure_user', { p_email: clean }); } catch {}

  const { data: found, error: e1 } = await sb
    .from('users')
    .select('id,email,soft_coins')
    .eq('email', clean)
    .maybeSingle();
  if (e1 && e1.code !== 'PGRST116') throw e1;
  if (found) return { user: found, created: false };

  const { data, error } = await sb
    .from('users')
    .insert({ email: clean, soft_coins: 0 })
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
  else q = q.eq('email', (email || '').trim().toLowerCase());
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data
    ? { user_id: data.id, email: data.email, soft_coins: data.soft_coins }
    : null;
}

/* ───────────────────── Ads RPC ───────────────────── */
function normalizeRpcOne(rowOrArray) {
  if (Array.isArray(rowOrArray)) return rowOrArray[0] ?? null;
  return rowOrArray ?? null;
}

export async function adsRequestToken(email) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  const { data, error } = await sb.rpc('ads_request_token', { p_email: email });
  if (error) throw error;
  return normalizeRpcOne(data);
}

export async function adsVerifyToken(email, token) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');

  // 1) Preferimos la versión de 3 parámetros (desambiguamos el overload)
  const try3 = await sb.rpc('ads_verify_token', {
    p_email: email,
    p_token: token,      // string; en el BE puede ser TEXT
    p_ip: 'web',         // forzamos firma (p_email text, p_token text, p_ip text)
  });

  if (!try3.error) return normalizeRpcOne(try3.data);

  // 2) Fallback: versión de 2 parámetros (uuid/text)
  const try2 = await sb.rpc('ads_verify_token', {
    p_email: email,
    p_token: token,
  });
  if (try2.error) throw try2.error;
  return normalizeRpcOne(try2.data);
}

/* ───────────────────── Utilidades ───────────────────── */
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
