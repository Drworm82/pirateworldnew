DO $$
BEGIN
    -- Check antes de crear la constraint
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ship_state_status_check_v2'
    ) THEN

        ALTER TABLE ship_state ADD CONSTRAINT ship_state_status_check_v2 CHECK (
            status IN ('idle', 'traveling', 'arrived')

            AND (
                status != 'idle' OR (
                    from_island IS NOT NULL AND
                    to_island IS NULL AND
                    started_at IS NULL AND
                    eta_at IS NULL
                )
            )

            AND (
                status != 'traveling' OR (
                    from_island IS NOT NULL AND
                    to_island IS NOT NULL AND
                    started_at IS NOT NULL AND
                    eta_at IS NOT NULL
                )
            )

            AND (
                status != 'arrived' OR (
                    from_island IS NOT NULL AND
                    to_island IS NOT NULL
                )
            )
        );

    END IF;
END $$;
