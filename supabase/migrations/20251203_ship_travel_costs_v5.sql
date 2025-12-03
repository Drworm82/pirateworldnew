-- ============================================================
--  V5 — SISTEMA DE COSTOS POR VIAJE + COBRO AUTOMÁTICO
--  Fórmula oficial:
--      costo_total =
--          (distancia_km * 4 * modificador_barco)
--        + 10
--        + extra_eventos
-- ============================================================


-- ------------------------------------------------------------
-- 1) Tabla de modificadores por tipo de barco
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ship_cost_modifiers (
    boat_type text PRIMARY KEY,
    modifier numeric NOT NULL
);

INSERT INTO ship_cost_modifiers (boat_type, modifier)
VALUES 
    ('basic', 0.7),
    ('normal', 1.0),
    ('medium', 1.2),
    ('advanced', 1.4)
ON CONFLICT (boat_type) DO NOTHING;


-- ------------------------------------------------------------
-- 2) Nueva columna costo_total en ship_state
-- ------------------------------------------------------------
ALTER TABLE ship_state
ADD COLUMN IF NOT EXISTS last_travel_cost numeric DEFAULT 0;


-- ------------------------------------------------------------
-- 3) Función helper: haversine para distancia en km
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION haversine_km(
    lat1 float, lng1 float,
    lat2 float, lng2 float
)
RETURNS float AS $$
DECLARE
    r float := 6371;
    dlat float := radians(lat2 - lat1);
    dlng float := radians(lng2 - lng1);
    a float;
    c float;
BEGIN
    a := sin(dlat/2)^2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;

    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ------------------------------------------------------------
-- 4) RPC — ship_travel_start_v5
--  Con cálculo de costo y cobro automático
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION ship_travel_start_v5(
    p_user uuid,
    p_destination text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    st ship_state;
    isl islands;
    mod_row record;
    distance_km numeric;
    costo_base numeric := 10;
    costo_total numeric;
    wallet numeric;
BEGIN
    -- 1) Obtener estado del barco
    SELECT * INTO st
    FROM ship_state
    WHERE user_id = p_user
    LIMIT 1;

    IF st.user_id IS NULL THEN
        RAISE EXCEPTION 'SHIP_NOT_INITIALIZED';
    END IF;

    IF st.status = 'traveling' THEN
        RAISE EXCEPTION 'SHIP_ALREADY_TRAVELING';
    END IF;

    -- 2) Obtener destino
    SELECT * INTO isl
    FROM islands
    WHERE key = p_destination;

    IF isl.key IS NULL THEN
        RAISE EXCEPTION 'INVALID_DESTINATION';
    END IF;

    -- 3) Distancia real
    distance_km := haversine_km(
        st.current_lat, st.current_lng,
        isl.lat, isl.lng
    );

    -- 4) Modificador por barco
    SELECT modifier INTO mod_row
    FROM ship_cost_modifiers
    WHERE boat_type = st.boat_type;

    IF mod_row.modifier IS NULL THEN
        mod_row.modifier := 1.0;  -- fallback
    END IF;

    -- 5) Calcular costo final
    costo_total :=
          (distance_km * 4 * mod_row.modifier)
        + costo_base
        + COALESCE(st.extra_costs_pending, 0);

    costo_total := ROUND(costo_total, 2);

    -- 6) Checar saldo del usuario
    SELECT balance INTO wallet
    FROM wallet
    WHERE user_id = p_user;

    IF wallet < costo_total THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- 7) Cobro automático
    UPDATE wallet
    SET balance = balance - costo_total
    WHERE user_id = p_user;

    -- 8) Iniciar viaje
    UPDATE ship_state
    SET
        status = 'traveling',
        origin = st.current_location,
        origin_lat = st.current_lat,
        origin_lng = st.current_lng,
        destination = isl.key,
        destination_lat = isl.lat,
        destination_lng = isl.lng,
        departure_time = NOW(),
        last_event_time = NOW(),
        distance_km = distance_km,
        last_travel_cost = costo_total
    WHERE user_id = p_user;

    -- 9) ETA según velocidad del barco
    RETURN jsonb_build_object(
        'ok', true,
        'distance_km', distance_km,
        'speed_kmh', st.speed_kmh,
        'eta', (NOW() + (distance_km / st.speed_kmh) * INTERVAL '1 hour'),
        'costo_total', costo_total,
        'modifier', mod_row.modifier
    );
END;
$$;


-- ------------------------------------------------------------
-- 5) Exponer RPC
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION ship_travel_start_v5(uuid,text) TO anon, authenticated;
