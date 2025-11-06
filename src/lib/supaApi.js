export async function ensureUser(email) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase no configurado.');

  // 1) RPC ensure_user (puede devolver jsonb o TABLE -> array)
  const r1 = await sb.rpc('ensure_user', { p_email: email }).catch(() => null);
  if (r1 && !r1.error && r1.data != null) {
    const row = Array.isArray(r1.data) ? r1.data[0] : r1.data;
    if (row && (row.id || row.email)) {
      return {
        user: { id: row.id, email: row.email, soft_coins: row.soft_coins ?? 0 },
        created: undefined,
      };
    }
  }

  // 2) Alternativa: create_or_load_user (TABLE -> array)
  const r2 = await sb.rpc('create_or_load_user', { p_email: email }).catch(() => null);
  if (r2 && !r2.error && r2.data != null) {
    const row = Array.isArray(r2.data) ? r2.data[0] : r2.data;
    if (row && (row.id || row.email)) {
      return {
        user: { id: row.id, email: row.email, soft_coins: row.soft_coins ?? 0 },
        created: undefined,
      };
    }
  }

  // 3) Fallback directo a la tabla (por si fallan los RPC)
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
