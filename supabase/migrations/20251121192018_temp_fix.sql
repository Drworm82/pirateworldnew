-- Temporary fix: Create new ship travel RPCs with user_id parameter
-- This migration allows the functions to work with demo users
-- instead of relying on auth.uid()

-- Create new functions with different names to avoid signature conflicts
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
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    INSERT INTO ship_state (user_id, status)
    VALUES (v_user_id, 'idle')
    ON CONFLICT (user_id) DO NOTHING;
    
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
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    SELECT ss.status INTO v_current_status 
    FROM ship_state ss
    WHERE ss.user_id = p_user_id;
    
    IF v_current_status = 'traveling' THEN
        RAISE EXCEPTION 'Ya hay un viaje en curso';
    END IF;
    
    UPDATE ship_state 
    SET 
        status = 'traveling',
        from_island = COALESCE(from_island, 'Puerto Inicial'),
        to_island = p_to_island,
        started_at = now(),
        eta_at = now() + interval '10 minutes'
    WHERE user_id = p_user_id;
    
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

CREATE OR REPLACE FUNCTION ship_travel_progress_v2(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    status text,
    eta_at timestamptz,
    server_now timestamptz,
    remaining_seconds int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_eta_at timestamptz;
    v_status text;
    v_remaining int;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    SELECT ss.status, ss.eta_at INTO v_status, v_eta_at
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;
    
    v_remaining := GREATEST(0, EXTRACT(epoch FROM (v_eta_at - now())))::int;
    
    RETURN QUERY
    SELECT 
        v_status,
        v_eta_at,
        now() as server_now,
        v_remaining;
END;
$$;

CREATE OR REPLACE FUNCTION ship_force_arrival_v2(p_user_id uuid DEFAULT NULL)
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
    v_eta timestamptz;
    v_status text;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    SELECT ss.status, ss.eta_at
    INTO v_status, v_eta
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;

    IF v_status = 'traveling' AND now() < v_eta THEN
        RAISE EXCEPTION 'El viaje aún no ha terminado';
    END IF;

    IF v_status = 'traveling' AND now() >= v_eta THEN
        UPDATE ship_state
        SET status = 'arrived'
        WHERE user_id = v_user_id;
    END IF;

    IF v_status = 'arrived' THEN
        UPDATE ship_state
        SET 
          status = 'idle',
          from_island = NULL,
          to_island = NULL,
          started_at = NULL,
          eta_at = NULL
        WHERE user_id = v_user_id;
    END IF;

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