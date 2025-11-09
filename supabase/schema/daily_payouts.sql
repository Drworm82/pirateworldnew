-- ============================================================
-- PirateWorld · BE-06 v0.1.3
-- Tabla daily_payouts + trigger desde ledger(daily_close)
-- ============================================================

BEGIN;

SET search_path = public;

-- 1) Tabla de pagos diarios por usuario
CREATE TABLE IF NOT EXISTS public.daily_payouts (
  user_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day            date        NOT NULL,
  coins_earned   integer     NOT NULL DEFAULT 0,  -- referencia a ingresos del día (ej. ads)
  coins_paid     integer     NOT NULL DEFAULT 0,  -- pagado al cerrar el día
  coins_retained integer     NOT NULL DEFAULT 0,  -- earned - paid (no negativo)
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

CREATE INDEX IF NOT EXISTS daily_payouts_day_idx  ON public.daily_payouts(day);
CREATE INDEX IF NOT EXISTS daily_payouts_user_idx ON public.daily_payouts(user_id);

-- 2) Trigger: tocar updated_at
CREATE OR REPLACE FUNCTION public.tg_daily_payouts_touch()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname='tr_daily_payouts_touch' AND tgrelid='public.daily_payouts'::regclass
  ) THEN
    CREATE TRIGGER tr_daily_payouts_touch
    BEFORE UPDATE ON public.daily_payouts
    FOR EACH ROW EXECUTE FUNCTION public.tg_daily_payouts_touch();
  END IF;
END $$;

-- 3) Trigger: al insertar en ledger con reason='daily_close' (debit), actualizar daily_payouts
--    Se intenta usar meta->>'closed_day' si viene; si no, el día de created_at del registro.
CREATE OR REPLACE FUNCTION public.tg_daily_payouts_from_ledger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_day   date;
  v_paid  integer;
  v_earned integer;
BEGIN
  IF NEW.reason <> 'daily_close' THEN
    RETURN NULL;
  END IF;

  -- día a cerrar tomado del meta si existe
  v_day := COALESCE( (NEW.meta->>'closed_day')::date, (NEW.created_at AT TIME ZONE 'UTC')::date );

  -- monto pagado: usamos valor absoluto del amount cuando es débito
  v_paid := abs(NEW.amount);

  -- ingresos del día desde daily_revenue (si no existe, 0)
  SELECT COALESCE(dr.coins_from_ads, 0) INTO v_earned
  FROM public.daily_revenue dr
  WHERE dr.user_id = NEW.user_id AND dr.day = v_day;

  INSERT INTO public.daily_payouts (user_id, day, coins_earned, coins_paid, coins_retained)
  VALUES (NEW.user_id, v_day, v_earned, v_paid, GREATEST(v_earned - v_paid, 0))
  ON CONFLICT (user_id, day) DO UPDATE
    SET coins_earned   = v_earned,
        coins_paid     = public.daily_payouts.coins_paid + v_paid,
        coins_retained = GREATEST(v_earned - (public.daily_payouts.coins_paid + v_paid), 0),
        updated_at     = now();

  RETURN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname='tr_daily_payouts_from_ledger' AND tgrelid='public.ledger'::regclass
  ) THEN
    CREATE TRIGGER tr_daily_payouts_from_ledger
    AFTER INSERT ON public.ledger
    FOR EACH ROW EXECUTE FUNCTION public.tg_daily_payouts_from_ledger();
  END IF;
END $$;

-- 4) RLS (solo lectura desde FE en STAGE)
ALTER TABLE public.daily_payouts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_payouts' AND policyname='daily_payouts_select_stage'
  ) THEN
    CREATE POLICY daily_payouts_select_stage
      ON public.daily_payouts FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.daily_payouts TO anon, authenticated;

-- 5) refrescar schema
NOTIFY pgrst, 'reload schema';

COMMIT;

-- 📌 Verificación rápida
-- SELECT * FROM public.daily_payouts ORDER BY day DESC, user_id LIMIT 20;
