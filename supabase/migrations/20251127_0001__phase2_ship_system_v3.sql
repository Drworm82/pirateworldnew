-- Phase 2: Ship System v3 - Complete Reset
-- Migration: 20251127_0001__phase2_ship_system_v3.sql

-- =====================================================
-- CLEANUP: Remove all existing v2 ship functions
-- =====================================================

DROP FUNCTION IF EXISTS ship_get_state() CASCADE;
DROP FUNCTION IF EXISTS ship_get_state_v2(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_travel_start(p_user uuid, p_from text, p_to text) CASCADE;
DROP FUNCTION IF EXISTS ship_travel_start_v2(p_user uuid, p_from text, p_to text) CASCADE;
DROP FUNCTION IF EXISTS ship_travel_progress(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_travel_progress_v2(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_arrive(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_arrive_v2(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_force_arrival(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_force_arrival_v2(p_user uuid) CASCADE;
DROP FUNCTION IF EXISTS ship_force_arrival_v3(p_user uuid) CASCADE;

-- =====================================================
-- CORE UTILITY FUNCTIONS
-- =====================================================

-- 1) Real distance between islands using Haversine formula
CREATE OR REPLACE FUNCTION ship_distance_between(p_from text, p_to text)
RETURNS numeric
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_from_lat double precision;
    v_from_lng double precision;
    v_to_lat double precision;
    v_to_lng double precision;
    v_distance_km numeric;
BEGIN
    -- Get island coordinates
    SELECT lat, lng INTO v_from_lat, v_from_lng
    FROM islands
    WHERE key = p_from;
    
    SELECT lat, lng INTO v_to_lat, v_to_lng
    FROM islands
    WHERE key = p_to;
    
    IF v_from_lat IS NULL OR v_to_lat IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Haversine formula
    v_distance_km := 6371 * acos(
        cos(radians(v_from_lat)) * cos(radians(v_to_lat)) * 
        cos(radians(v_to_lng) - radians(v_from_lng)) + 
        sin(radians(v_from_lat)) * sin(radians(v_to_lat))
    );
    
    RETURN v_distance_km;
END;
$$;

-- 2) Autonomous update function - auto-complete expired travels and fix inconsistencies
CREATE OR REPLACE FUNCTION ship_autonomous_update(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_current_time timestamptz := now();
    v_status text;
    v_eta timestamptz;
BEGIN
    -- Get current ship state
    SELECT status, eta_at INTO v_status, v_eta
    FROM ship_state
    WHERE user_id = p_user_id;
    
    -- Auto-complete expired travels
    IF v_status = 'traveling' AND v_eta <= v_current_time THEN
        UPDATE ship_state
        SET status = 'arrived',
            updated_at = v_current_time
        WHERE user_id = p_user_id;
    END IF;
    
    -- Fix inconsistencies: arrived ships should become idle after a delay
    IF v_status = 'arrived' AND (
        SELECT updated_at FROM ship_state WHERE user_id = p_user_id
    ) < v_current_time - interval '5 minutes' THEN
        UPDATE ship_state
        SET status = 'idle',
            from_island = NULL,
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = v_current_time
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- =====================================================
-- SHIP SYSTEM V3 RPC FUNCTIONS
-- =====================================================

-- 1) Get unified ship state with auto-completion, progress, GPS position
CREATE OR REPLACE FUNCTION ship_get_state_v3(p_user uuid)
RETURNS TABLE(
    status text,
    from_island text,
    to_island text,
    from_lat double precision,
    from_lng double precision,
    to_lat double precision,
    to_lng double precision,
    started_at timestamptz,
    eta_at timestamptz,
    current_lat double precision,
    current_lng double precision,
    progress_percent numeric,
    time_remaining_seconds int,
    distance_km numeric,
    speed_kmh numeric
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_from_lat double precision;
    v_from_lng double precision;
    v_to_lat double precision;
    v_to_lng double precision;
    v_distance_km numeric;
    v_speed_kmh numeric;
    v_elapsed_seconds int;
    v_total_seconds int;
    v_progress_percent numeric;
    v_time_remaining_seconds int;
    v_current_lat double precision;
    v_current_lng double precision;
    v_fraction numeric;
BEGIN
    -- Auto-update state first
    PERFORM ship_autonomous_update(p_user);
    
    -- Get basic ship state
    RETURN QUERY
    SELECT 
        ss.status,
        ss.from_island,
        ss.to_island,
        NULL::double precision, -- from_lat (filled below)
        NULL::double precision, -- from_lng (filled below)
        NULL::double precision, -- to_lat (filled below)
        NULL::double precision, -- to_lng (filled below)
        ss.started_at,
        ss.eta_at,
        NULL::double precision, -- current_lat (filled below)
        NULL::double precision, -- current_lng (filled below)
        NULL::numeric,          -- progress_percent (filled below)
        NULL::int,              -- time_remaining_seconds (filled below)
        NULL::numeric,          -- distance_km (filled below)
        NULL::numeric           -- speed_kmh (filled below)
    FROM ship_state ss
    WHERE ss.user_id = p_user;
    
    -- If no ship state, return empty result
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Get coordinates for traveling/arrived ships
    IF EXISTS(SELECT 1 FROM ship_state WHERE user_id = p_user AND status IN ('traveling', 'arrived')) THEN
        SELECT i.lat, i.lng INTO v_from_lat, v_from_lng
        FROM islands i
        WHERE i.key = (SELECT from_island FROM ship_state WHERE user_id = p_user);
        
        SELECT i.lat, i.lng INTO v_to_lat, v_to_lng
        FROM islands i
        WHERE i.key = (SELECT to_island FROM ship_state WHERE user_id = p_user);
        
        -- Calculate distance and speed
        v_distance_km := ship_distance_between(
            (SELECT from_island FROM ship_state WHERE user_id = p_user),
            (SELECT to_island FROM ship_state WHERE user_id = p_user)
        );
        
        v_speed_kmh := (SELECT value FROM config WHERE key = 'ship_speed_kmh')::numeric;
        IF v_speed_kmh IS NULL THEN v_speed_kmh := 20; END IF;
        
        -- Calculate progress for traveling ships
        IF (SELECT status FROM ship_state WHERE user_id = p_user) = 'traveling' THEN
            v_elapsed_seconds := EXTRACT(epoch FROM (now() - (SELECT started_at FROM ship_state WHERE user_id = p_user)))::int;
            v_total_seconds := EXTRACT(epoch FROM ((SELECT eta_at FROM ship_state WHERE user_id = p_user) - (SELECT started_at FROM ship_state WHERE user_id = p_user)))::int;
            
            IF v_total_seconds > 0 THEN
                v_progress_percent := LEAST(100, (v_elapsed_seconds::numeric / v_total_seconds::numeric) * 100);
                v_time_remaining_seconds := GREATEST(0, (SELECT eta_at FROM ship_state WHERE user_id = p_user) - now());
                
                -- Interpolate current GPS position
                v_fraction := v_progress_percent / 100;
                v_current_lat := v_from_lat + (v_to_lat - v_from_lat) * v_fraction;
                v_current_lng := v_from_lng + (v_to_lng - v_from_lng) * v_fraction;
            ELSE
                v_progress_percent := 0;
                v_time_remaining_seconds := 0;
                v_current_lat := v_from_lat;
                v_current_lng := v_from_lng;
            END IF;
        ELSIF (SELECT status FROM ship_state WHERE user_id = p_user) = 'arrived' THEN
            v_progress_percent := 100;
            v_time_remaining_seconds := 0;
            v_current_lat := v_to_lat;
            v_current_lng := v_to_lng;
        END IF;
        
        -- Update the result with calculated values
        RETURN QUERY
        SELECT 
            ss.status,
            ss.from_island,
            ss.to_island,
            v_from_lat,
            v_from_lng,
            v_to_lat,
            v_to_lng,
            ss.started_at,
            ss.eta_at,
            v_current_lat,
            v_current_lng,
            v_progress_percent,
            v_time_remaining_seconds::int,
            v_distance_km,
            v_speed_kmh
        FROM ship_state ss
        WHERE ss.user_id = p_user;
    END IF;
END;
$$;

-- 2) Start travel with real distance and dynamic ETA
CREATE OR REPLACE FUNCTION ship_travel_start_v3(
    p_user uuid,
    p_from text,
    p_to text,
    p_from_lat double precision,
    p_from_lng double precision,
    p_to_lat double precision,
    p_to_lng double precision
)
RETURNS TABLE(ok boolean, error text, eta_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_distance_km numeric;
    v_speed_kmh numeric;
    v_travel_hours numeric;
    v_eta timestamptz;
    v_current_status text;
BEGIN
    -- Auto-update state first
    PERFORM ship_autonomous_update(p_user);
    
    -- Check current ship status
    SELECT status INTO v_current_status
    FROM ship_state
    WHERE user_id = p_user;
    
    IF v_current_status = 'traveling' THEN
        RETURN QUERY SELECT false, 'already_traveling', NULL::timestamptz;
        RETURN;
    END IF;
    
    -- Calculate distance using provided coordinates
    v_distance_km := ship_distance_between(p_from, p_to);
    IF v_distance_km IS NULL THEN
        RETURN QUERY SELECT false, 'invalid_islands', NULL::timestamptz;
        RETURN;
    END IF;
    
    -- Get ship speed from config
    v_speed_kmh := (SELECT value FROM config WHERE key = 'ship_speed_kmh')::numeric;
    IF v_speed_kmh IS NULL THEN v_speed_kmh := 20; END IF;
    
    -- Calculate travel time and ETA
    v_travel_hours := v_distance_km / v_speed_kmh;
    v_eta := now() + (v_travel_hours || ' hours')::interval;
    
    -- Update or insert ship state
    INSERT INTO ship_state (user_id, status, from_island, to_island, started_at, eta_at)
    VALUES (p_user, 'traveling', p_from, p_to, now(), v_eta)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        status = 'traveling',
        from_island = p_from,
        to_island = p_to,
        started_at = now(),
        eta_at = v_eta,
        updated_at = now();
    
    RETURN QUERY SELECT true, NULL::text, v_eta;
END;
$$;

-- 3) Get detailed travel progress with percentage, time remaining, GPS position
CREATE OR REPLACE FUNCTION ship_travel_progress_v3(p_user uuid)
RETURNS TABLE(
    ok boolean,
    status text,
    progress_percent numeric,
    time_remaining_seconds int,
    current_lat double precision,
    current_lng double precision,
    distance_km numeric,
    error text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_status text;
    v_from_island text;
    v_to_island text;
    v_started_at timestamptz;
    v_eta_at timestamptz;
    v_from_lat double precision;
    v_from_lng double precision;
    v_to_lat double precision;
    v_to_lng double precision;
    v_distance_km numeric;
    v_elapsed_seconds int;
    v_total_seconds int;
    v_progress_percent numeric;
    v_time_remaining_seconds int;
    v_current_lat double precision;
    v_current_lng double precision;
    v_fraction numeric;
BEGIN
    -- Auto-update state first
    PERFORM ship_autonomous_update(p_user);
    
    -- Get current ship state
    SELECT status, from_island, to_island, started_at, eta_at
    INTO v_status, v_from_island, v_to_island, v_started_at, v_eta_at
    FROM ship_state
    WHERE user_id = p_user;
    
    IF v_status IS NULL THEN
        RETURN QUERY SELECT false, 'idle', 0, 0, NULL, NULL, NULL, 'no_ship_state';
        RETURN;
    END IF;
    
    IF v_status = 'idle' THEN
        RETURN QUERY SELECT true, 'idle', 0, 0, NULL, NULL, NULL, NULL::text;
        RETURN;
    END IF;
    
    -- Get island coordinates
    SELECT lat, lng INTO v_from_lat, v_from_lng
    FROM islands
    WHERE key = v_from_island;
    
    SELECT lat, lng INTO v_to_lat, v_to_lng
    FROM islands
    WHERE key = v_to_island;
    
    IF v_from_lat IS NULL OR v_to_lat IS NULL THEN
        RETURN QUERY SELECT false, v_status, 0, 0, NULL, NULL, NULL, 'invalid_island_coordinates';
        RETURN;
    END IF;
    
    -- Calculate distance
    v_distance_km := ship_distance_between(v_from_island, v_to_island);
    
    -- Calculate progress for traveling ships
    IF v_status = 'traveling' THEN
        v_elapsed_seconds := EXTRACT(epoch FROM (now() - v_started_at))::int;
        v_total_seconds := EXTRACT(epoch FROM (v_eta_at - v_started_at))::int;
        
        IF v_total_seconds > 0 THEN
            v_progress_percent := LEAST(100, (v_elapsed_seconds::numeric / v_total_seconds::numeric) * 100);
            v_time_remaining_seconds := GREATEST(0, v_eta_at - now());
            
            -- Interpolate current GPS position
            v_fraction := v_progress_percent / 100;
            v_current_lat := v_from_lat + (v_to_lat - v_from_lat) * v_fraction;
            v_current_lng := v_from_lng + (v_to_lng - v_from_lng) * v_fraction;
        ELSE
            v_progress_percent := 0;
            v_time_remaining_seconds := 0;
            v_current_lat := v_from_lat;
            v_current_lng := v_from_lng;
        END IF;
    ELSIF v_status = 'arrived' THEN
        v_progress_percent := 100;
        v_time_remaining_seconds := 0;
        v_current_lat := v_to_lat;
        v_current_lng := v_to_lng;
    END IF;
    
    RETURN QUERY SELECT true, v_status, v_progress_percent, v_time_remaining_seconds::int, 
                        v_current_lat, v_current_lng, v_distance_km, NULL::text;
END;
$$;

-- 4) Complete travel and transition to idle (traveling→arrived→idle)
CREATE OR REPLACE FUNCTION ship_arrive_v3(p_user uuid)
RETURNS TABLE(ok boolean, status text, error text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_current_status text;
BEGIN
    -- Auto-update state first
    PERFORM ship_autonomous_update(p_user);
    
    -- Get current status
    SELECT status INTO v_current_status
    FROM ship_state
    WHERE user_id = p_user;
    
    IF v_current_status IS NULL THEN
        RETURN QUERY SELECT false, 'idle', 'no_ship_state';
        RETURN;
    END IF;
    
    IF v_current_status = 'idle' THEN
        RETURN QUERY SELECT false, 'idle', 'ship_not_traveling';
        RETURN;
    END IF;
    
    -- If traveling, mark as arrived
    IF v_current_status = 'traveling' THEN
        UPDATE ship_state
        SET status = 'arrived',
            updated_at = now()
        WHERE user_id = p_user;
        
        RETURN QUERY SELECT true, 'arrived', NULL::text;
        RETURN;
    END IF;
    
    -- If arrived, transition to idle
    IF v_current_status = 'arrived' THEN
        UPDATE ship_state
        SET status = 'idle',
            from_island = NULL,
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = p_user;
        
        RETURN QUERY SELECT true, 'idle', NULL::text;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT false, v_current_status, 'unknown_status';
END;
$$;

-- 5) Force ship arrival
CREATE OR REPLACE FUNCTION ship_force_arrival_v3(p_user uuid)
RETURNS TABLE(ok boolean, status text, error text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_current_status text;
BEGIN
    -- Get current status
    SELECT status INTO v_current_status
    FROM ship_state
    WHERE user_id = p_user;
    
    IF v_current_status IS NULL THEN
        -- Create idle state if none exists
        INSERT INTO ship_state (user_id, status, updated_at)
        VALUES (p_user, 'idle', now())
        ON CONFLICT (user_id) DO NOTHING;
        
        RETURN QUERY SELECT true, 'idle', NULL::text;
        RETURN;
    END IF;
    
    IF v_current_status = 'idle' THEN
        RETURN QUERY SELECT true, 'idle', NULL::text;
        RETURN;
    END IF;
    
    -- Force completion of travel
    UPDATE ship_state
    SET status = 'idle',
        from_island = NULL,
        to_island = NULL,
        started_at = NULL,
        eta_at = NULL,
        updated_at = now()
    WHERE user_id = p_user;
    
    RETURN QUERY SELECT true, 'idle', NULL::text;
END;
$$;

-- =====================================================
-- AD REWARD SYSTEM
-- =====================================================

-- 1) Reduce travel time when watching ads
CREATE OR REPLACE FUNCTION ad_watch_during_travel(p_user uuid, p_seconds_to_reduce int DEFAULT 30)
RETURNS TABLE(ok boolean, new_eta timestamptz, error text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_current_status text;
    v_current_eta timestamptz;
    v_new_eta timestamptz;
    v_min_eta timestamptz;
BEGIN
    -- Auto-update state first
    PERFORM ship_autonomous_update(p_user);
    
    -- Get current ship state
    SELECT status, eta_at INTO v_current_status, v_current_eta
    FROM ship_state
    WHERE user_id = p_user;
    
    IF v_current_status != 'traveling' THEN
        RETURN QUERY SELECT false, NULL::timestamptz, 'ship_not_traveling';
        RETURN;
    END IF;
    
    -- Calculate new ETA (but not earlier than now + 1 minute)
    v_new_eta := v_current_eta - (p_seconds_to_reduce || ' seconds')::interval;
    v_min_eta := now() + '1 minute'::interval;
    
    IF v_new_eta < v_min_eta THEN
        v_new_eta := v_min_eta;
    END IF;
    
    -- Update ETA
    UPDATE ship_state
    SET eta_at = v_new_eta,
        updated_at = now()
    WHERE user_id = p_user;
    
    RETURN QUERY SELECT true, v_new_eta, NULL::text;
END;
$$;

-- 2) Reward for watching ads during travel
CREATE OR REPLACE FUNCTION ship_travel_ad_reward(p_user uuid)
RETURNS TABLE(ok boolean, coins_awarded int, error text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_current_status text;
    v_reward_coins int := 5; -- Default reward
BEGIN
    -- Auto-update state first
    PERFORM ship_autonomous_update(p_user);
    
    -- Get current ship status
    SELECT status INTO v_current_status
    FROM ship_state
    WHERE user_id = p_user;
    
    IF v_current_status != 'traveling' THEN
        RETURN QUERY SELECT false, 0, 'ship_not_traveling';
        RETURN;
    END IF;
    
    -- Award coins to user
    UPDATE users
    SET soft_coins = soft_coins + v_reward_coins,
        updated_at = now()
    WHERE id = p_user;
    
    -- Record in ledger
    INSERT INTO ledger (user_id, amount, type, description, created_at)
    VALUES (p_user, v_reward_coins, 'ad_reward', 'Travel ad reward', now());
    
    RETURN QUERY SELECT true, v_reward_coins, NULL::text;
END;
$$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ship_state_user_id ON ship_state(user_id);
CREATE INDEX IF NOT EXISTS idx_ship_state_status ON ship_state(status);
CREATE INDEX IF NOT EXISTS idx_ship_state_eta_at ON ship_state(eta_at) WHERE status = 'traveling';
CREATE INDEX IF NOT EXISTS idx_islands_coordinates ON islands(lat, lng);
CREATE INDEX IF NOT EXISTS idx_config_key ON config(key);

-- =====================================================
-- RLS POLICIES (if not already exists)
-- =====================================================

-- Ensure ship_state has proper RLS
ALTER TABLE ship_state ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own ship state" ON ship_state;
DROP POLICY IF EXISTS "Users can insert their own ship state" ON ship_state;
DROP POLICY IF EXISTS "Users can update their own ship state" ON ship_state;
DROP POLICY IF EXISTS "Users can delete their own ship state" ON ship_state;

-- Create fresh policies
CREATE POLICY "Users can view their own ship state" ON ship_state
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ship state" ON ship_state
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ship state" ON ship_state
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ship state" ON ship_state
    FOR DELETE USING (auth.uid() = user_id);