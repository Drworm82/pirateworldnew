// src/lib/supaApi.js
import { createClient } from '@supabase/supabase-js';

// —— dónde guardamos URL y KEY al hacer setup en runtime ——
const URL_KEY = 'VITE_SUPABASE_URL';
const KEY_KEY = 'VITE_SUPABASE_ANON_KEY';

// Guardar credenciales en localStorage desde /#/setup
export function saveRuntimeEnv(url, anonKey) {
  if (url) localStorage.setItem(URL_KEY, url);
  if (anonKey) localStorage.setItem(KEY_KEY, anonKey);
}

// Comprobar si ya hay URL/KEY
export function isConfigured() {
  return Boolean(localStorage.getItem(URL_KEY) && localStorage.getItem(KEY_KEY));
}

// Cliente singleton
let _client = null;
export function getSupa() {
  if (_client) return _client;
  const url = localStorage.getItem(URL_KEY);
  const key = localStorage.getItem(KEY_KEY);
  if (!url || !key) return null; // deja que el caller maneje “no configurado”
  _client = createClient(url, key);
  return _client;
}
// Alias para compatibilidad con código anterior
export const getClient = getSupa;

// 🔐 Sesión anónima opcional (útil para demos con RLS)
export async function ensureAnonSession() {
  const sb = getSupa();
  if (!sb) return { ok: false, reason: 'not_configured' };
  const { data: s } = await sb.auth.getSession();
  if (!s?.session) {
    // requiere “Allow anonymous sign-ins” activado en Supabase
    const { error } = await sb.auth.signInAnonymously();
    if (error) return { ok: false, reason: error.message };
  }
  return { ok: true };
}

/* =========================
   Utilidades “parcels” para Index.jsx
   ========================= */

// Lee parcels (ajusta el nombre/columns si difiere en tu BD)
export async function fetchParcels() {
  const sb = getSupa();
  if (!sb) return { data: [], error: new Error('Supabase no configurado') };
  return await sb
    .from('parcels')
    .select('id, geohash, rarity, base_yield_per_hour, influence, owner_user_id, created_at')
    .order('created_at', { ascending: false });
}

// Suscripción realtime (Postgres Changes)
export async function subscribeParcels({ onInsert, onUpdate, onDelete } = {}) {
  const sb = getSupa();
  if (!sb) return null;
  const channel = sb
    .channel('realtime:parcels')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'parcels' }, (p) =>
      onInsert && onInsert(p.new)
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parcels' }, (p) =>
      onUpdate && onUpdate(p.new)
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'parcels' }, (p) =>
      onDelete && onDelete(p.old)
    )
    .subscribe();
  return channel;
}

export async function unsubscribe(channel) {
  const sb = getSupa();
  if (!sb || !channel) return;
  await sb.removeChannel(channel);
}
