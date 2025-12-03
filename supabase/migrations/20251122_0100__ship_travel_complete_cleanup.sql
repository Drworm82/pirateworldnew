-- =====================================================
-- SHIP TRAVEL MODULE — CLEAN VERSION (Opción B)
-- =====================================================
-- Limpieza total del módulo de viaje + recreación de funciones v3
-- Todas las funciones viejas se eliminan y se recrean desde cero.
-- Idempotente: seguro para múltiples ejecuciones y para db push.
-- =====================================================

-- =====================================================
-- PHASE 1: REMOVE OLD/LEGACY FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS ship_get_state();
DROP FUNCTION IF EXISTS ship_get_state_v2(uuid);
DROP FUNCTION IF EXISTS ship_travel_start(uuid, text);
DROP FUNCTION IF EXISTS ship_travel_start_v2(uuid, text);
DROP FUNCTION IF EXISTS ship_travel_progress();
DROP FUNCTION IF EXISTS ship_force_arrival();
DROP FUNCTION IF EXISTS ship_force_arrival_v2(uuid);
DROP FUNCTION IF EXISTS ship_force_arrival_v3(uuid);
DROP FUNCTION IF EXISTS ship_autonomous_update(uuid);
DROP FUNCTION IF EXISTS ship_distance_between(text, text);
DROP FUNCTION IF EXISTS ship_travel_start_v3(uuid, text, text);

-- =====================================================
-- PHASE 2: CORE TABLES (SAFE)
-- =====================================================

CREATE TABLE IF NOT EXISTS islands (
    key text PRIMARY KEY,
    name text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL
);

INSERT INTO islands (key, name, lat, lng) VALUES
('bahia_ajolote', 'Bahía del Ajolote', 19.420407, -99.138805),
('campanas_blancas', 'Isla de las Campanas Blancas', 19.434789, -99.14137),
('cala_rey_errante', 'Cala del Rey Errante', 19.442997, -99.176166),
('refugio_hermandad', 'Refugio de la Hermandad', 19.511338, -99.092822),
('bahia_gaviotas', 'Bahía de las Gaviotas Negras', 19.411571, -99.16977),
('mercado_koyo', 'Mercado Coral de Köyō', 19.349901, -99.16237)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS config (
    key text PRIMARY KEY,
    value numeric NOT NULL
);

INSERT INTO config (key, value) VALUES
('ship_speed_kmh', 20)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PHASE 3: CORE FUNCTIONS (fresh recreate)
-- =====================================================

-- 1) Distancia real entre islas
CREATE FUNCTION ship_distance_between(p_from text, p_to text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_from_lat double precision;
    v_from_lng double precision;
    v_to_lat double precision;
    v_to_lng double precision;
    v_distance_km numeric;
BEGIN
    SELECT lat, lng INTO v_from_lat, v_from_lng
    FROM islands WHERE key = p_from;

    SELECT lat, lng INTO v_to_lat, v_to_lng
    FROM islands WHERE key = p_to;

    IF v_from_lat IS NULL OR v_to_lat IS NULL THEN
        RAISE EXCEPTION 'Isla inválida: %, %', p_from, p_to;
    END IF;

    v_distance_km := 6371 * acos(
        cos(radians(v_to_lat)) *
        cos(radians(v_from_lat)) *
        cos(radians(v_from_lng) - radians(v_to_lng)) +
        sin(radians(v_to_lat)) *
        sin(radians(v_from_lat))
    );

    RETURN v_distance_km;
END;
$$;

-- 2) Autocompletar viajes expirados
CREATE FUNCTION ship_autonomous_update(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_eta_at timestamptz;
    v_to text;
BEGIN
    SELECT status, eta_at, to_island
    INTO v_status, v_eta_at, v_to
    FROM ship_state
    WHERE user_id = p_user_id;

    IF v_status = 'traveling' AND now() >= v_eta_at THEN
        UPDATE ship_state
        SET
            status = 'arrived',
            from_island = v_to,
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- 3) Viaje v3 (ETA real)
CREATE FUNCTION ship_travel_start_v3(p_user_id uuid, p_from text, p_to text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_distance numeric;
    v_speed numeric;
    v_seconds int;
    v_eta timestamptz;
    v_result json;
BEGIN
    IF p_user_id IS NULL THEN RAISE EXCEPTION 'user_id required'; END IF;
    IF p_to IS NULL THEN RAISE EXCEPTION 'to_island required'; END IF;

    -- Completar viajes viejos
    PERFORM ship_autonomous_update(p_user_id);

    SELECT status INTO v_status
    FROM ship_state WHERE user_id = p_user_id;

    IF v_status = 'traveling' THEN
        RAISE EXCEPTION 'Ya hay un viaje en curso';
    END IF;

    SELECT value INTO v_speed
    FROM config WHERE key = 'ship_speed_kmh';
    IF v_speed IS NULL THEN v_speed := 20; END IF;

    IF p_from IS NOT NULL THEN
        v_distance := ship_distance_between(p_from, p_to);
        v_seconds := floor((v_distance / v_speed) * 3600);
        v_eta := now() + (v_seconds || ' seconds')::interval;
        IF v_distance < 0.02 THEN
            v_eta := now();
        END IF;
    ELSE
        v_eta := now();
    END IF;

    UPDATE ship_state
    SET
        status = CASE WHEN v_eta <= now() THEN 'arrived' ELSE 'traveling' END,
        from_island = COALESCE(p_from, from_island, 'oceano_abierto'),
        to_island = p_to,
        started_at = now(),
        eta_at = CASE WHEN v_eta > now() THEN v_eta ELSE NULL END,
        updated_at = now()
    WHERE user_id = p_user_id;

    IF v_eta <= now() THEN
        UPDATE ship_state
        SET
            status = 'idle',
            from_island = p_to,
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;

    SELECT json_build_object(
        'status', ss.status,
        'from_island', ss.from_island,
        'to_island', ss.to_island,
        'started_at', ss.started_at,
        'eta_at', ss.eta_at,
        'server_now', now()
    ) INTO v_result
    FROM ship_state ss
    WHERE ss.user_id = p_user_id;

    RETURN v_result;
END;
$$;

-- 4) Forzar llegada v3
CREATE FUNCTION ship_force_arrival_v3(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    status text,
    from_island text,
    to_island text,
    started_at timestamptz,
    eta_at timestamptz,
    server_now timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user uuid;
    v_status text;
    v_from text;
    v_to text;
BEGIN
    v_user := COALESCE(p_user_id, auth.uid());
    IF v_user IS NULL THEN RAISE EXCEPTION 'user_id required'; END IF;

    PERFORM ship_autonomous_update(v_user);

    SELECT status, from_island, to_island
    INTO v_status, v_from, v_to
    FROM ship_state WHERE user_id = v_user;

    UPDATE ship_state
    SET
        status = 'idle',
        from_island = COALESCE(v_to, v_from, 'oceano_abierto'),
        to_island = NULL,
        started_at = NULL,
        eta_at = NULL,
        updated_at = now()
    WHERE user_id = v_user;

    RETURN QUERY
    SELECT
        ss.status,
        ss.from_island,
        ss.to_island,
        ss.started_at,
        ss.eta_at,
        now()
    FROM ship_state ss
    WHERE ss.user_id = v_user;
END;
$$;

-- 5) Get state (versión final)
CREATE FUNCTION ship_get_state()
RETURNS TABLE (
    status text,
    from_island text,
    to_island text,
    started_at timestamptz,
    eta_at timestamptz,
    server_now timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        ss.status,
        ss.from_island,
        ss.to_island,
        ss.started_at,
        ss.eta_at,
        now() AS server_now
    FROM ship_state ss
    WHERE ss.user_id = auth.uid();
$$;

-- =====================================================
-- PHASE 4: POLICIES
-- =====================================================

ALTER TABLE islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read islands" ON islands FOR SELECT USING (true);
CREATE POLICY "Allow public read config" ON config FOR SELECT USING (true);
