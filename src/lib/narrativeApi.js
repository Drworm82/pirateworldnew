// src/lib/narrativeApi.js
// Lee el contenido narrativo estático desde public/data/narrativa.json
// No depende de Supabase. Pensado para que el FE lo use de forma simple.

const NARRATIVE_URL = '/data/narrativa.json';

export async function fetchNarrative() {
  try {
    const res = await fetch(NARRATIVE_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Normalización mínima
    return {
      missions: Array.isArray(json?.missions) ? json.missions : [],
      rarities: Array.isArray(json?.rarities) ? json.rarities : [],
    };
  } catch (err) {
    console.error('[narrativeApi] Error leyendo narrativa:', err);
    return { missions: [], rarities: [] };
  }
}
