-- Ship State v2 Constraint Migration
-- Replace the simple status check with a comprehensive constraint
-- that validates field relationships for each state according to model v2

-- Drop existing constraint if it exists
ALTER TABLE ship_state DROP CONSTRAINT IF EXISTS ship_state_status_check;

-- Add new comprehensive constraint for ship_state v2
ALTER TABLE ship_state ADD CONSTRAINT ship_state_status_check_v2 CHECK (
    -- Status must be one of the valid values
    status IN ('idle', 'traveling', 'arrived')
    
    -- Validation rules for 'idle' state
    AND (
        status != 'idle' OR (
            from_island IS NOT NULL AND
            to_island IS NULL AND
            started_at IS NULL AND
            eta_at IS NULL
        )
    )
    
    -- Validation rules for 'traveling' state
    AND (
        status != 'traveling' OR (
            from_island IS NOT NULL AND
            to_island IS NOT NULL AND
            started_at IS NOT NULL AND
            eta_at IS NOT NULL
        )
    )
    
    -- Validation rules for 'arrived' state
    AND (
        status != 'arrived' OR (
            from_island IS NOT NULL AND
            to_island IS NOT NULL
            -- started_at and eta_at can be NULL (historical data)
        )
    )
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT ship_state_status_check_v2 ON ship_state IS 'Validates ship_state v2 model: ensures proper field relationships for idle, traveling, and arrived states';