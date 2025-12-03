-- Fixed ship_force_arrival_v2 function
-- This function properly handles the v2 ship state model and complies with the new constraint

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
    v_from_island text;
    v_to_island text;
    v_exists boolean;
BEGIN
    -- Use provided user_id or fall back to auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Check if ship_state record exists for this user
    SELECT EXISTS(SELECT 1 FROM ship_state WHERE user_id = v_user_id) INTO v_exists;
    
    -- If no record exists, create one in idle state
    IF NOT v_exists THEN
        INSERT INTO ship_state (user_id, status, from_island, updated_at)
        VALUES (v_user_id, 'idle', 'Océano abierto', now());
        
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
    SELECT ss.status, ss.eta_at, ss.from_island, ss.to_island
    INTO v_status, v_eta, v_from_island, v_to_island
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;

    -- Handle different current states
    IF v_status = 'traveling' AND now() < v_eta THEN
        -- Force arrival even if travel time hasn't completed
        UPDATE ship_state
        SET 
            status = 'idle',
            from_island = COALESCE(v_to_island, v_from_island, 'Océano abierto'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
    ELSIF v_status = 'traveling' AND now() >= v_eta THEN
        -- Travel completed naturally, move to idle
        UPDATE ship_state
        SET 
            status = 'idle',
            from_island = COALESCE(v_to_island, v_from_island, 'Océano abierto'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
    ELSIF v_status = 'arrived' THEN
        -- Already arrived, move to idle keeping current island
        UPDATE ship_state
        SET 
            status = 'idle',
            from_island = COALESCE(v_to_island, v_from_island, 'Océano abierto'),
            to_island = NULL,
            started_at = NULL,
            eta_at = NULL,
            updated_at = now()
        WHERE user_id = v_user_id;
        
    ELSIF v_status = 'idle' THEN
        -- Already idle, ensure it complies with constraint
        UPDATE ship_state
        SET 
            from_island = COALESCE(v_from_island, 'Océano abierto'),
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