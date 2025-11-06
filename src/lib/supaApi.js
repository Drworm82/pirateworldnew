// src/lib/supaApi.js
import supa from './supaClient';
export const { getClient, isConfigured, saveRuntimeEnv } = supa;

/** Salud de conexión: hace un select trivial para confirmar credenciales/ACL */
export async function pingSupabase() {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');
  // Intenta leer 1 fila de una tabla pública segura (ajústala si quieres)
  const { error } = await sb.from('users').select('id').limit(1);
  if (error) throw error;
  return { ok: true };
}
