-- ============================================================
-- PirateWorld · BE-06 v0.1.3
-- Tabla daily_revenue + trigger desde ad_events
-- ============================================================

BEGIN;

SET search_path = public;

-- 1) Tabla de ingresos diarios por usuario
CREATE TABLE IF NOT EXISTS public.daily_revenue (
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day             date        NOT NULL,
  ads_count       integer     NOT NULL DEFAULT 0,
  coins_from_ads  integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

CREATE INDEX IF NOT EXISTS daily_revenue_day_idx   ON public.daily_revenue(day);
CREATE INDEX IF NOT EXISTS daily_revenue_user_idx  ON public.daily_revenue(user_id);

-- 2) Trigger: tocar updated_at
CREATE OR REPLACE FUNCTION public.tg_daily_revenue_touch()
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
    WHERE tgname='tr_daily_revenue_touch' AND tgrelid='public.daily_revenue'::regclass
  ) THEN
    CREATE TRIGGER tr_daily_revenue_touch
    BEFORE UPDATE ON public.daily_revenue
    FOR EACH ROW EXECUTE FUNCTION public.tg_daily_revenue_touch();
  END IF;
END $$;

-- 3) Trigger: al insertar en ad_events, sumar a daily_revenue
--    Regla: cualquier fila en ad_events cuenta como 1 anuncio si meta->>'event' = 'ad_claim' (o si no viene, lo contamos igual).
CREATE OR REPLACE FUNCTION public.tg_daily_revenue_from_ad_events()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_day   date := (NEW.created_at AT TIME ZONE 'UTC')::date;
  v_award integer := 1;
  v_is_ad_claim boolean := coalesce(NEW.meta->>'event', 'ad_claim') = 'ad_claim';
BEGIN
  IF NOT v_is_ad_claim THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.daily_revenue (user_id, day, ads_count, coins_from_ads)
  VALUES (NEW.user_id, v_day, 1, v_award)
  ON CONFLICT (user_id, day) DO UPDATE
    SET ads_count      = public.daily_revenue.ads_count + 1,
        coins_from_ads = public.daily_revenue.coins_from_ads + v_award,
        updated_at     = now();

  RETURN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname='tr_daily_revenue_from_ad_events' AND tgrelid='public.ad_events'::regclass
  ) THEN
    CREATE TRIGGER tr_daily_revenue_from_ad_events
    AFTER INSERT ON public.ad_events
    FOR EACH ROW EXECUTE FUNCTION public.tg_daily_revenue_from_ad_events();
  END IF;
END $$;

-- 4) RLS (solo lectura desde FE en STAGE)
ALTER TABLE public.daily_revenue ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_revenue' AND policyname='daily_revenue_select_stage'
  ) THEN
    CREATE POLICY daily_revenue_select_stage
      ON public.daily_revenue FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.daily_revenue TO anon, authenticated;

-- 5) refrescar schema
NOTIFY pgrst, 'reload schema';

COMMIT;

-- 📌 Verificación rápida
-- SELECT * FROM public.daily_revenue ORDER BY day DESC, user_id LIMIT 20;
