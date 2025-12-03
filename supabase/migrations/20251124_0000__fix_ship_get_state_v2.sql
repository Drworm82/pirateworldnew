-- Fix: Recreate ship_get_state_v2 with autonomous update
-- This migration restores ship_get_state_v2 functionality with proper auto-completion

-- Drop existing function first to avoid return type conflict
DROP FUNCTION IF EXISTS ship_get_state_v2(uuid);

CREATE FUNCTION ship_get_state_v2(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    user_id uuid,
    status text,
    from_island text,
    to_island text,
    started_at timestamptz,
    eta_at timestamptz,
    updated_at timestamptz,
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
    
    -- Create initial state if doesn't exist
    INSERT INTO ship_state (user_id, status)
    VALUES (v_user_id, 'idle')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Auto-complete expired travels
    PERFORM ship_autonomous_update(v_user_id);
    
    RETURN QUERY
    SELECT 
        ss.user_id,
        ss.status,
        ss.from_island,
        ss.to_island,
        ss.started_at,
        ss.eta_at,
        ss.updated_at,
        now() as server_now
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;
END;
$$;