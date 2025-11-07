// Utilidades de Economía · ECO-01 v0.1.2
// Requisitos de BD asumidos:
//  - Tabla users(id uuid pk, email text unique)
//  - Tabla ledger(id bigserial, user_id uuid, occurred_at timestamptz, kind text, amount_usd numeric, note text)
//  - Tabla daily_revenue(day date, revenue_usd numeric [, note text] [, user_id uuid opcional])
//  - Tabla daily_payouts(day date, user_id uuid, requested_usd numeric, scaled_usd numeric, paid_usd numeric, global_scale numeric, daily_cap_applied bool, weekly_cap_applied bool)
//  - RPC/Función: cron_daily_close_v2()  (sin argumentos)
// NOTA: Usa getClient() de src/lib/supaApi.js (no duplicar cliente).

import { getClient } from "./supaApi";

const ECO_USERS = [
  "worm_jim@hotmail.com",
  "pirata1@example.com",
  "pirata2@example.com",
  "pirata3@example.com",
  "pirata4@example.com",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function ensureUsers(emails = ECO_USERS) {
  const supabase = getClient();
  // Upsert por email requiere unique constraint en users.email (asumido)
  const rows = emails.map((email) => ({ email }));
  const { error } = await supabase.from("users").upsert(rows, { onConflict: "email", ignoreDuplicates: false });
  if (error) throw error;

  const { data, error: e2 } = await supabase.from("users").select("id,email").in("email", emails);
  if (e2) throw e2;

  const map = new Map();
  (data || []).forEach((u) => map.set(u.email, u.id));
  if (map.size !== emails.length) {
    throw new Error("No pude mapear todos los usuarios por email.");
  }
  return map;
}

async function insertLedgerParcels(emailToId) {
  const supabase = getClient();
  // Distribución: 20 requests total (0.02 c/u)
  const dist = [
    { email: "worm_jim@hotmail.com", n: 6 },
    { email: "pirata1@example.com", n: 4 },
    { email: "pirata2@example.com", n: 4 },
    { email: "pirata3@example.com", n: 3 },
    { email: "pirata4@example.com", n: 3 },
  ];

  const now = new Date().toISOString();
  const rows = [];
  for (const d of dist) {
    const user_id = emailToId.get(d.email);
    for (let i = 0; i < d.n; i++) {
      rows.push({
        user_id,
        occurred_at: now,
        kind: "request_usd",
        amount_usd: 0.02,
        note: "ECO-01 seed",
      });
    }
  }

  const { error } = await supabase.from("ledger").insert(rows);
  if (error) throw error;
}

async function upsertDailyRevenueDeleteInsert(revenueUsd = 20.0) {
  const supabase = getClient();
  const day = todayISO();

  // 1) Delete del día (evita depender de ON CONFLICT/índices únicos)
  {
    const { error } = await supabase.from("daily_revenue").delete().eq("day", day);
    if (error && error.code !== "PGRST116") {
      // PGRST116: No rows deleted, está bien.
      // Continuamos ante cualquier otro error a menos que sea hard.
    }
  }

  // 2) Insert mínimo (day, revenue_usd). Si tu tabla exige user_id, intentamos con "system@pirate.world".
  {
    const insertBase = { day, revenue_usd: revenueUsd };
    let { error } = await supabase.from("daily_revenue").insert(insertBase);
    if (error) {
      // Reintento con user_id si la tabla lo exige
      // Aseguramos usuario "system@pirate.world"
      const { error: e1 } = await supabase
        .from("users")
        .upsert([{ email: "system@pirate.world" }], { onConflict: "email", ignoreDuplicates: false });
      if (e1) throw e1;

      const { data: sys, error: e2 } = await supabase
        .from("users")
        .select("id")
        .eq("email", "system@pirate.world")
        .maybeSingle();
      if (e2 || !sys) throw e2 || new Error("No se pudo encontrar/crear el usuario system@pirate.world");

      const withUser = { ...insertBase, user_id: sys.id };
      const retry = await supabase.from("daily_revenue").insert(withUser);
      if (retry.error) throw retry.error;
    }
  }
}

async function runCron() {
  const supabase = getClient();
  // PostgREST/RPC (función sin args)
  const { error } = await supabase.rpc("cron_daily_close_v2", {});
  if (error) throw error;
}

export async function eco01SeedAndClose({ revenueUsd = 20.0 } = {}) {
  // 1) Asegurar usuarios
  const emailToId = await ensureUsers(ECO_USERS);
  // 2) Revenue del día
  await upsertDailyRevenueDeleteInsert(revenueUsd);
  // 3) 20 requests de 0.02
  await insertLedgerParcels(emailToId);
  // 4) Ejecutar cierre diario
  await runCron();
  // 5) Resultado y verificaciones
  const [todayRows, weeklyByUser, rev] = await Promise.all([
    getDailyPayoutsToday(),
    getWeeklyPaidByUser(),
    getRevenueToday(),
  ]);

  // Mapear email para UI
  const ids = todayRows.map((r) => r.user_id);
  const idToEmail = await getUsersByIds(ids);

  const merged = todayRows.map((p) => ({
    email: idToEmail.get(p.user_id) || p.user_id,
    requested: Number(p.requested_usd || 0),
    scaled: Number(p.scaled_usd || 0),
    paid: Number(p.paid_usd || 0),
    dailyCap: Boolean(p.daily_cap_applied),
    weeklyCap: Boolean(p.weekly_cap_applied),
    globalScale: Number(p.global_scale || 1),
    paid7: Number(weeklyByUser.get(p.user_id) || 0),
  }));

  const revenue = Number(rev?.revenue_usd || 0);
  const cap95 = revenue * 0.95;
  const totalPaid = merged.reduce((acc, r) => acc + r.paid, 0);

  return {
    rows: merged,
    checks: {
      revenue,
      cap95,
      totalPaid,
      ok95: totalPaid <= cap95,
    },
  };
}

export async function getDailyPayoutsToday() {
  const supabase = getClient();
  const day = todayISO();
  const { data, error } = await supabase
    .from("daily_payouts")
    .select("user_id, day, requested_usd, scaled_usd, paid_usd, global_scale, daily_cap_applied, weekly_cap_applied")
    .eq("day", day);
  if (error) throw error;
  return data ?? [];
}

export async function getUsersByIds(ids) {
  const supabase = getClient();
  if (!ids || ids.length === 0) return new Map();
  const { data, error } = await supabase.from("users").select("id,email").in("id", ids);
  if (error) throw error;
  const m = new Map();
  (data || []).forEach((u) => m.set(u.id, u.email));
  return m;
}

export async function getRevenueToday() {
  const supabase = getClient();
  const day = todayISO();
  const { data, error } = await supabase
    .from("daily_revenue")
    .select("day, revenue_usd")
    .eq("day", day)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getWeeklyPaidByUser() {
  const supabase = getClient();
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 6);
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = today.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_payouts")
    .select("user_id, paid_usd, day")
    .gte("day", fromIso)
    .lte("day", toIso);

  if (error) throw error;

  const sum = new Map();
  (data || []).forEach((row) => {
    sum.set(row.user_id, (sum.get(row.user_id) || 0) + Number(row.paid_usd || 0));
  });
  return sum;
}
