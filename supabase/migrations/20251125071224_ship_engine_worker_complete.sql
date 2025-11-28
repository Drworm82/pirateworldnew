-- =====================================================
-- SHIP ENGINE WORKER - Complete Travel Cycle Fix
-- =====================================================
-- This migration implements complete ship travel cycle with:
-- 1. ship_arrive_v3 function for proper arrival handling
-- 2. Enhanced ship_travel_progress_v3 with GPS interpolation
-- 3. Improved ship_autonomous_update with full cycle support
-- 4. Inconsistency detection and auto-correction
-- 5. GPS position interpolation between islands
-- =====================================================

-- =====================================================
-- PHASE 1: CREATE ship_arrive_v3 FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS ship_arrive_v3(uuid);

CREATE FUNCTION ship_arrive_v3(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    success boolean,
    message text,
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
    v_started_at timestamptz;
    v_eta_at timestamptz;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Get current state
    SELECT status, from_island, to_island, started_at, eta_at
    INTO v_status, v_from_island, v_to_island, v_started_at, v_eta_at
    FROM ship_state
    WHERE user_id = v_user_id;
    
    -- Handle different states
    IF v_status = 'traveling' THEN
        -- Complete travel
        UPDATE ship_state
        SET
            status = 'arrived',
            from_island = v_to_island,
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
        RETURN QUERY
        SELECT 
            true as success,
            'Viaje completado exitosamente' as message,
            'arrived' as status,
            v_to_island as from_island,
            NULL as to_island,
            NULL as started_at,
            NULL as eta_at,
            now() as server_now;
            
    ELSIF v_status = 'arrived' THEN
        -- Move to idle
        UPDATE ship_state
        SET
            status = 'idle',
            from_island = COALESCE(v_from_island, 'oceano_abierto'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
        RETURN QUERY
        SELECT 
            true as success,
            'Barco listo para nuevo viaje' as message,
            'idle' as status,
            COALESCE(v_from_island, 'oceano_abierto') as from_island,
            NULL as to_island,
            NULL as started_at,
            NULL as eta_at,
            now() as server_now;
            
    ELSE
        -- Already idle or invalid state
        RETURN QUERY
        SELECT 
            false as success,
            'El barco no está en un estado válido para llegar' as message,
            COALESCE(v_status, 'unknown') as status,
            v_from_island,
            v_to_island,
            v_started_at,
            v_eta_at,
            now() as server_now;
    END IF;
END;
$$;

-- =====================================================
-- PHASE 2: ENHANCED ship_travel_progress_v3 WITH GPS
-- =====================================================

DROP FUNCTION IF EXISTS ship_travel_progress_v3(uuid);

CREATE FUNCTION ship_travel_progress_v3(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    status text,
    origin text,
    destination text,
    departure_time timestamptz,
    arrival_time timestamptz,
    server_now timestamptz,
    progress numeric,
    remaining_seconds int,
    ship_lat double precision,
    ship_lng double precision,
    corrected boolean,
    correction_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_status text;
    v_from_island text;
    v_to_island text;
    v_started_at timestamptz;
    v_eta_at timestamptz;
    v_total_seconds numeric;
    v_elapsed_seconds numeric;
    v_remaining_seconds int;
    v_progress numeric;
    v_ship_lat double precision;
    v_ship_lng double precision;
    v_origin_lat double precision;
    v_origin_lng double precision;
    v_dest_lat double precision;
    v_dest_lng double precision;
    v_corrected boolean := false;
    v_correction_message text := '';
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Auto-complete expired travels first
    PERFORM ship_autonomous_update(v_user_id);
    
    -- Get current state
    SELECT status, from_island, to_island, started_at, eta_at
    INTO v_status, v_from_island, v_to_island, v_started_at, v_eta_at
    FROM ship_state
    WHERE user_id = v_user_id;
    
    -- =====================================================
    -- INCONSISTENCY DETECTION AND CORRECTION
    -- =====================================================
    
    -- Case 1: traveling but missing critical data
    IF v_status = 'traveling' AND (v_from_island IS NULL OR v_to_island IS NULL OR v_started_at IS NULL OR v_eta_at IS NULL) THEN
        -- Correct inconsistency
        UPDATE ship_state
        SET
            status = 'idle',
            from_island = COALESCE(v_from_island, 'bahia_ajolote'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
        v_status := 'idle';
        v_to_island := NULL;
        v_started_at := NULL;
        v_eta_at := NULL;
        v_corrected := true;
        v_correction_message := 'Estado traveling inconsistente corregido a idle';
    END IF;
    
    -- Case 2: arrived but no destination (should be idle)
    IF v_status = 'arrived' AND v_from_island IS NULL THEN
        UPDATE ship_state
        SET
            status = 'idle',
            from_island = 'bahia_ajolote',
            updated_at = now()
        WHERE user_id = v_user_id;
        
        v_status := 'idle';
        v_from_island := 'bahia_ajolote';
        v_corrected := true;
        v_correction_message := 'Estado arrived sin destino corregido a idle';
    END IF;
    
    -- Case 3: traveling with incoherent times
    IF v_status = 'traveling' AND v_started_at IS NOT NULL AND v_eta_at IS NOT NULL THEN
        IF v_started_at > v_eta_at OR v_eta_at < now() - interval '1 hour' THEN
            -- Fix incoherent times
            v_eta_at := now() + interval '30 seconds';
            v_started_at := now();
            
            UPDATE ship_state
            SET
                started_at = v_started_at,
                eta_at = v_eta_at,
                updated_at = now()
            WHERE user_id = v_user_id;
            
            v_corrected := true;
            v_correction_message := 'Tiempos incoherentes corregidos';
        END IF;
    END IF;
    
    -- =====================================================
    -- CALCULATE PROGRESS AND GPS POSITION
    -- =====================================================
    
    IF v_status = 'traveling' AND v_eta_at IS NOT NULL AND v_started_at IS NOT NULL THEN
        -- Calculate time-based progress
        v_total_seconds := EXTRACT(epoch FROM (v_eta_at - v_started_at));
        v_elapsed_seconds := EXTRACT(epoch FROM (now() - v_started_at));
        v_remaining_seconds := GREATEST(0, EXTRACT(epoch FROM (v_eta_at - now())))::int;
        v_progress := LEAST(100, ROUND((v_elapsed_seconds / v_total_seconds) * 100, 2));
        
        -- Get island coordinates for GPS interpolation
        SELECT lat, lng INTO v_origin_lat, v_origin_lng
        FROM islands WHERE key = v_from_island;
        
        SELECT lat, lng INTO v_dest_lat, v_dest_lng
        FROM islands WHERE key = v_to_island;
        
        -- Calculate interpolated GPS position
        IF v_origin_lat IS NOT NULL AND v_dest_lat IS NOT NULL THEN
            v_ship_lat := v_origin_lat + (v_dest_lat - v_origin_lat) * (v_progress / 100);
            v_ship_lng := v_origin_lng + (v_dest_lng - v_origin_lng) * (v_progress / 100);
        ELSE
            -- Fallback to default coordinates
            v_ship_lat := 19.420407; -- bahia_ajolote
            v_ship_lng := -99.138805;
        END IF;
        
        -- Auto-complete if progress >= 100%
        IF v_progress >= 100 THEN
            PERFORM ship_arrive_v3(v_user_id);
            
            -- Get final state
            SELECT status, from_island, to_island, started_at, eta_at
            INTO v_status, v_from_island, v_to_island, v_started_at, v_eta_at
            FROM ship_state
            WHERE user_id = v_user_id;
            
            v_progress := 100;
            v_remaining_seconds := 0;
            v_ship_lat := v_dest_lat;
            v_ship_lng := v_dest_lng;
        END IF;
        
    ELSIF v_status = 'arrived' THEN
        v_progress := 100;
        v_remaining_seconds := 0;
        
        -- Get destination coordinates
        SELECT lat, lng INTO v_ship_lat, v_ship_lng
        FROM islands WHERE key = v_from_island;
        
        IF v_ship_lat IS NULL THEN
            v_ship_lat := 19.420407;
            v_ship_lng := -99.138805;
        END IF;
        
    ELSE -- idle
        v_progress := 0;
        v_remaining_seconds := 0;
        
        -- Get current location coordinates
        SELECT lat, lng INTO v_ship_lat, v_ship_lng
        FROM islands WHERE key = v_from_island;
        
        IF v_ship_lat IS NULL THEN
            v_ship_lat := 19.420407;
            v_ship_lng := -99.138805;
        END IF;
    END IF;
    
    RETURN QUERY
    SELECT 
        v_status,
        v_from_island,
        v_to_island,
        v_started_at,
        v_eta_at,
        now() as server_now,
        v_progress,
        v_remaining_seconds,
        v_ship_lat,
        v_ship_lng,
        v_corrected,
        v_correction_message;
END;
$$;

-- =====================================================
-- PHASE 3: ENHANCED ship_autonomous_update WITH FULL CYCLE
-- =====================================================

CREATE OR REPLACE FUNCTION ship_autonomous_update(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_eta_at timestamptz;
    v_to_island text;
    v_from_island text;
BEGIN
    SELECT status, eta_at, to_island, from_island
    INTO v_status, v_eta_at, v_to_island, v_from_island
    FROM ship_state
    WHERE user_id = p_user_id;

    -- Auto-complete expired travels
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
        
        -- Immediately transition to idle for clean cycle
        UPDATE ship_state
        SET
            status = 'idle',
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
    
    -- Fix arrived states without proper destination
    IF v_status = 'arrived' AND v_from_island IS NULL THEN
        UPDATE ship_state
        SET
            status = 'idle',
            from_island = 'bahia_ajolote',
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- =====================================================
-- PHASE 4: UPDATE ship_get_state_v3 TO USE NEW PROGRESS
-- =====================================================

DROP FUNCTION IF EXISTS ship_get_state_v3(uuid);

CREATE FUNCTION ship_get_state_v3(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    user_id uuid,
    status text,
    origin text,
    destination text,
    departure_time timestamptz,
    arrival_time timestamptz,
    updated_at timestamptz,
    server_now timestamptz,
    progress numeric,
    remaining_seconds int,
    ship_lat double precision,
    ship_lng double precision,
    current_location text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Create initial state if doesn't exist
    INSERT INTO ship_state (user_id, status, from_island)
    VALUES (v_user_id, 'idle', 'bahia_ajolote')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Use enhanced progress function
    RETURN QUERY
    SELECT 
        v_user_id,
        tp.status,
        tp.origin,
        tp.destination,
        tp.departure_time,
        tp.arrival_time,
        now() as updated_at,
        tp.server_now,
        tp.progress,
        tp.remaining_seconds,
        tp.ship_lat,
        tp.ship_lng,
        CASE 
            WHEN tp.status = 'traveling' THEN 'En ruta'
            WHEN tp.status = 'arrived' THEN COALESCE(tp.destination, tp.origin, 'Desconocido')
            ELSE COALESCE(tp.origin, 'Desconocido')
        END as current_location
    FROM ship_travel_progress_v3(v_user_id) tp;
END;
$$;