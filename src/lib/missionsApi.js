// src/lib/missionsApi.js
// API de mecánicas para progreso de misiones con Supabase + fallback local.
// - Lee narrativa desde /public/data/narrativa.json
// - Sincroniza progreso en tabla mission_progress (si hay auth y RLS lo permite)
// - Si no hay Supabase o falla, usa localStorage (clave: 'pw_mission_progress_v1')

import { getSupa } from './supaApi';

const NARRATIVE_URL = '/data/narrativa.json';
const LS_KEY = 'pw_mission_progress_v1';

export async function fetchNarrative() {
  try {
    const res = await fetch(NARRATIVE_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      missions: Array.isArray(json?.missions) ? json.missions : [],
      rarities: Array.isArray(json?.rarities) ? json.rarities : [],
    };
  } catch (err) {
    console.error('[missionsApi] narrativa error:', err);
    return { missions: [], rarities: [] };
  }
}

// ---------- Local fallback ----------
function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function lsSave(obj) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj || {}));
  } catch {}
}

// ---------- Supabase helpers ----------
async function getSupaAndUser() {
  const supa = await getSupa();
  if (!supa) return { supa: null, user: null };
  try {
    const { data } = await supa.auth.getUser();
    return { supa, user: data?.user ?? null };
  } catch {
    return { supa, user: null };
  }
}

// Lee progreso desde Supabase; si falla, retorna null para que el caller use local.
export async function fetchProgressSupa() {
  const { supa, user } = await getSupaAndUser();
  if (!supa || !user) return null;

  try {
    const { data, error } = await supa
      .from('mission_progress')
      .select('mission_code, progress, target, done, completed_at');
    if (error) throw error;
    const map = {};
    for (const r of data || []) {
      map[r.mission_code] = {
        progress: Number(r.progress ?? 0),
        target: Number(r.target ?? 1),
        done: !!r.done,
        completed_at: r.completed_at || null,
      };
    }
    return map;
  } catch (e) {
    console.warn('[missionsApi] fetchProgressSupa fallback local:', e?.message || e);
    return null;
  }
}

// Upsert progreso en Supabase; si falla, guarda en local y retorna {mode:'local'}
export async function upsertProgressSupa({ mission_code, done, progress, target }) {
  const { supa, user } = await getSupaAndUser();
  if (!supa || !user) {
    const local = lsLoad();
    local[mission_code] = { done: !!done, progress: Number(progress ?? 0), target: Number(target ?? 1) };
    lsSave(local);
    return { ok: true, mode: 'local', local };
  }

  try {
    const payload = {
      mission_code,
      done: !!done,
      progress: Number(progress ?? 0),
      target: Number(target ?? 1),
    };
    const { error } = await supa.from('mission_progress').upsert(payload).select().maybeSingle();
    if (error) throw error;
    return { ok: true, mode: 'supabase' };
  } catch (e) {
    console.warn('[missionsApi] upsertProgressSupa fallback local:', e?.message || e);
    const local = lsLoad();
    local[mission_code] = { done: !!done, progress: Number(progress ?? 0), target: Number(target ?? 1) };
    lsSave(local);
    return { ok: true, mode: 'local', local };
  }
}

export async function loadMissionsWithProgress() {
  const { missions, rarities } = await fetchNarrative();
  const supaMap = await fetchProgressSupa();
  let progressMap = supaMap;
  let mode = 'supabase';
  if (!progressMap) {
    progressMap = lsLoad();
    mode = 'local';
  }

  const view = missions.map((m) => {
    const code = m.code || m.id || m.title || 'mission';
    const row = progressMap[code] || { progress: 0, target: Number(m.target ?? 1), done: false };
    const target = Number(row.target ?? m.target ?? 1);
    const progress = Math.min(Number(row.progress ?? 0), target);
    const done = !!row.done || progress >= target;
    return { ...m, code, target, progress, done };
  });

  return { missions: view, rarities, mode };
}

export async function markMission(code, done) {
  const next = {
    mission_code: code,
    done: !!done,
    progress: done ? 1 : 0,
    target: 1,
  };
  return await upsertProgressSupa(next);
}
