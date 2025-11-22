-- =====================================================
-- SHIP TRAVEL MODULE COMPLETE CLEANUP & REAL ETA SYSTEM
-- =====================================================
-- This migration cleans up all duplicate functions and implements
-- the real distance-based travel system with proper constraints

-- =====================================================
-- PHASE 1: CLEANUP - REMOVE DUPLICATE FUNCTIONS
-- =====================================================

-- Drop old duplicate functions that conflict with v2/v3 versions
DROP FUNCTION IF EXISTS ship_get_state();
DROP FUNCTION IF EXISTS ship_travel_start(text);
DROP FUNCTION IF EXISTS ship_force_arrival();
DROP FUNCTION IF EXISTS ship_travel_progress();

-- Drop the old ship_force_arrival_v2 (will be recreated as v3)
DROP FUNCTION IF EXISTS ship_force_arrival_v2(uuid);

-- =====================================================
-- PHASE 2: CREATE SUPPORTING TABLES
-- =====================================================

-- Islands table with real coordinates
CREATE TABLE IF NOT EXISTS islands (
    key text PRIMARY KEY,
    name text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL
);

-- Insert the 6 islands from frontend with their real coordinates
INSERT INTO islands (key, name, lat, lng) VALUES
('bahia_ajolote', 'Bahía del Ajolote', 19.411571, -99.16977),
('campanas_blancas', 'Isla de las Campanas Blancas', 19.434789, -99.14137),
('cala_rey_errante', 'Cala del Rey Errante', 19.442997, -99.176166),
('refugio_hermandad', 'Refugio de la Hermandad Kaminari', 19.511338, -99.092822),
('gaviotas_negras', 'Bahía de las Gaviotas Negras', 19.420407, -99.138805),
('mercado_koyo', 'Mercado Coral de Köyō', 19.349901, -99.16237)
ON CONFLICT (key) DO NOTHING;

-- Config table for ship speed
CREATE TABLE IF NOT EXISTS config (
    key text PRIMARY KEY,
    value numeric NOT NULL
);

-- Insert default ship speed (20 km/h)
INSERT INTO config (key, value) VALUES
('ship_speed_kmh', 20)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PHASE 3: CORE UTILITY FUNCTIONS
-- =====================================================

-- Calculate distance between islands using Haversine formula
CREATE OR REPLACE FUNCTION ship_distance_between(p_from text, p_to text)
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
    -- Get coordinates for both islands
    SELECT lat, lng INTO v_from_lat, v_from_lng
    FROM islands
    WHERE key = p_from;
    
    SELECT lat, lng INTO v_to_lat, v_to_lng
    FROM islands
    WHERE key = p_to;
    
    -- Validate islands exist
    IF v_from_lat IS NULL OR v_to_lat IS NULL THEN
        RAISE EXCEPTION 'Una o ambas islas no existen: %, %', p_from, p_to;
    END IF;
    
    -- Haversine formula
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

-- Autonomous ship update (auto-complete expired travels)
CREATE OR REPLACE FUNCTION ship_autonomous_update(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_eta_at timestamptz;
    v_from_island text;
    v_to_island text;
BEGIN
    -- Get current ship state
    SELECT status, eta_at, from_island, to_island
    INTO v_status, v_eta_at, v_from_island, v_to_island
    FROM ship_state
    WHERE user_id = p_user_id;
    
    -- If traveling and ETA has passed, complete the travel
    IF v_status = 'traveling' AND now() >= v_eta_at THEN
        UPDATE ship_state
        SET 
            status = 'arrived',
            from_island = v_to_island,
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- =====================================================
-- PHASE 4: MAIN SHIP TRAVEL FUNCTIONS
-- =====================================================

-- Enhanced ship travel start v3 (real distance & ETA)
CREATE OR REPLACE FUNCTION ship_travel_start_v3(p_user_id uuid, p_from text, p_to text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_status text;
    v_current_from text;
    v_distance_km numeric;
    v_speed_kmh numeric;
    v_travel_hours numeric;
    v_travel_seconds integer;
    v_eta timestamptz;
    v_result json;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    IF p_to IS NULL THEN
        RAISE EXCEPTION 'to_island is required';
    END IF;
    
    -- Get current ship state
    SELECT status, from_island
    INTO v_current_status, v_current_from
    FROM ship_state
    WHERE user_id = p_user_id;
    
    -- Validate not already traveling
    IF v_current_status = 'traveling' THEN
        RAISE EXCEPTION 'Ya hay un viaje en curso';
    END IF;
    
    -- Get ship speed from config
    SELECT value::numeric INTO v_speed_kmh
    FROM config
    WHERE key = 'ship_speed_kmh';
    
    IF v_speed_kmh IS NULL OR v_speed_kmh <= 0 THEN
        v_speed_kmh := 20; -- fallback to 20 km/h
    END IF;
    
    -- Calculate distance if we have a starting island
    IF p_from IS NOT NULL THEN
        v_distance_km := ship_distance_between(p_from, p_to);
        
        -- Calculate travel time
        v_travel_hours := v_distance_km / v_speed_kmh;
        v_travel_seconds := floor(v_travel_hours * 3600);
        
        -- Calculate ETA
        v_eta := now() + (v_travel_seconds || ' seconds')::interval;
        
        -- If distance is very small (< 20 meters), make it instant
        IF v_distance_km < 0.02 THEN
            v_eta := now();
        END IF;
    ELSE
        -- No starting island, set instant arrival
        v_eta := now();
    END IF;
    
    -- Update ship state
    UPDATE ship_state 
    SET 
        status = CASE WHEN v_eta <= now() THEN 'arrived' ELSE 'traveling' END,
        from_island = COALESCE(p_from, v_current_from, 'oceano_abierto'),
        to_island = p_to,
        started_at = now(),
        eta_at = CASE WHEN v_eta > now() THEN v_eta ELSE NULL END,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- If instant arrival, move to idle state
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
    
    -- Build result JSON
    SELECT json_build_object(
        'status', ss.status,
        'from_island', ss.from_island,
        'to_island', ss.to_island,
        'started_at', ss.started_at,
        'eta_at', ss.eta_at,
        'server_now', now(),
        'distance_km', COALESCE(v_distance_km, 0),
        'travel_seconds', COALESCE(v_travel_seconds, 0)
    ) INTO v_result
    FROM ship_state ss
    WHERE ss.user_id = p_user_id;
    
    RETURN v_result;
END;
$$;

-- Fixed ship_force_arrival_v3
CREATE OR REPLACE FUNCTION ship_force_arrival_v3(p_user_id uuid DEFAULT NULL)
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
    v_user_id uuid;
    v_status text;
    v_from_island text;
    v_to_island text;
    v_exists boolean;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Auto-complete any expired travels first
    PERFORM ship_autonomous_update(v_user_id);
    
    -- Check if ship_state record exists for this user
    SELECT EXISTS(SELECT 1 FROM ship_state WHERE user_id = v_user_id) INTO v_exists;
    
    -- If no record exists, create one in idle state
    IF NOT v_exists THEN
        INSERT INTO ship_state (user_id, status, from_island, updated_at)
        VALUES (v_user_id, 'idle', 'oceano_abierto', now());
        
        -- Return the newly created idle state
        RETURN QUERY
        SELECT 
            ss.status,
            ss.from_island,
            ss.to_island,
            ss.started_at,
            ss.eta_at,
            now() AS server_now
        FROM ship_state ss
        WHERE ss.user_id = v_user_id;
        
        RETURN;
    END IF;
    
    -- Get current state
    SELECT ss.status, ss.from_island, ss.to_island
    INTO v_status, v_from_island, v_to_island
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;

    -- Handle different current states
    IF v_status = 'traveling' THEN
        -- Force arrival: move to arrived state first
        UPDATE ship_state
        SET 
            status = 'arrived',
            updated_at = now()
        WHERE user_id = v_user_id;
        
    ELSIF v_status = 'arrived' THEN
        -- Already arrived, move to idle keeping current island
        UPDATE ship_state
        SET 
            status = 'idle',
            from_island = COALESCE(v_to_island, v_from_island, 'oceano_abierto'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
    ELSIF v_status = 'idle' THEN
        -- Already idle, ensure it complies with constraint
        UPDATE ship_state
        SET 
            from_island = COALESCE(v_from_island, 'oceano_abierto'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
    END IF;

    -- Return the updated state
    RETURN QUERY
    SELECT
        ss.status,
        ss.from_island,
        ss.to_island,
        ss.started_at,
        ss.eta_at,
        now() AS server_now
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;
END;
$$;

-- Fixed ship_get_state_v2 with proper constraint compliance
CREATE OR REPLACE FUNCTION ship_get_state_v2(p_user_id uuid DEFAULT NULL)
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
    v_user_id uuid;
    v_exists boolean;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Auto-complete any expired travels first
    PERFORM ship_autonomous_update(v_user_id);
    
    -- Check if ship_state record exists for this user
    SELECT EXISTS(SELECT 1 FROM ship_state WHERE user_id = v_user_id) INTO v_exists;
    
    -- If no record exists, create one in idle state with proper from_island
    IF NOT v_exists THEN
        INSERT INTO ship_state (user_id, status, from_island, updated_at)
        VALUES (v_user_id, 'idle', 'oceano_abierto', now());
    END IF;
    
    -- Return current state
    RETURN QUERY
    SELECT 
        ss.status,
        ss.from_island,
        ss.to_island,
        ss.started_at,
        ss.eta_at,
        now() as server_now
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;
END;
$$;

-- =====================================================
-- PHASE 5: UPDATE LEGACY COMPATIBILITY FUNCTIONS
-- =====================================================

-- Update ship_travel_start_v2 to use proper from_island
CREATE OR REPLACE FUNCTION ship_travel_start_v2(p_user_id uuid, p_to_island text)
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
    v_current_status text;
    v_current_from text;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Auto-complete any expired travels first
    PERFORM ship_autonomous_update(p_user_id);
    
    -- Get current state
    SELECT ss.status, ss.from_island
    INTO v_current_status, v_current_from
    FROM ship_state ss
    WHERE ss.user_id = p_user_id;
    
    IF v_current_status = 'traveling' THEN
        RAISE EXCEPTION 'Ya hay un viaje en curso';
    END IF;
    
    -- Update ship state with fixed 10-minute travel (legacy compatibility)
    UPDATE ship_state 
    SET 
        status = 'traveling',
        from_island = COALESCE(v_current_from, 'oceano_abierto'),
        to_island = p_to_island,
        started_at = now(),
        eta_at = now() + interval '10 minutes',
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Return updated state
    RETURN QUERY
    SELECT 
        ss.status,
        ss.from_island,
        ss.to_island,
        ss.started_at,
        ss.eta_at,
        now() as server_now
    FROM ship_state ss
    WHERE ss.user_id = p_user_id;
END;
$$;

-- =====================================================
-- PHASE 6: CLEANUP & DOCUMENTATION
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE islands IS 'Almacena coordenadas reales de las islas del juego';
COMMENT ON TABLE config IS 'Configuración global del juego (velocidad del barco, etc.)';
COMMENT ON FUNCTION ship_distance_between IS 'Calcula distancia real entre islas usando fórmula Haversine';
COMMENT ON FUNCTION ship_autonomous_update IS 'Auto-completa viajes cuando el ETA ha expirado';
COMMENT ON FUNCTION ship_travel_start_v3 IS 'Inicia viaje con distancia real y ETA dinámico';
COMMENT ON FUNCTION ship_force_arrival_v3 IS 'Fuerza llegada del barco manteniendo estado consistente';
COMMENT ON FUNCTION ship_get_state_v2 IS 'Obtiene estado del barco con auto-completado incluido';

-- Ensure RLS is enabled on new tables
ALTER TABLE islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to islands (needed for distance calculations)
CREATE POLICY "Allow public read access to islands" ON islands
    FOR SELECT USING (true);

-- Allow public read access to config (needed for speed calculations)
CREATE POLICY "Allow public read access to config" ON config
    FOR SELECT USING (true);