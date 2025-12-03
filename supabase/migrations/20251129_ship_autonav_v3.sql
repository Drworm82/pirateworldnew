-- ============================================================
-- AUTONAVEGACIÓN V3 — PROCESA TODOS LOS VIAJES VENCIDOS
-- ============================================================

-- Crear función
CREATE OR REPLACE FUNCTION ship_autonav_v3()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR rec IN
        SELECT *
        FROM ship_state
        WHERE status = 'traveling'
          AND arrival_time <= NOW()
    LOOP
        UPDATE ship_state
        SET
            status = 'idle',
            origin_key = rec.destination_key,
            destination_key = NULL,
            travel_started_at = NULL,
            arrival_time = NULL,
            percent = 100,
            speed_kmh = 0,
            last_lat = rec.dest_lat,
            last_lng = rec.dest_lng
        WHERE user_id = rec.user_id;

        updated_count := updated_count + 1;

        INSERT INTO ship_event_log (user_id, event_type, message)
        VALUES (
            rec.user_id,
            'arrived',
            'El barco llegó automáticamente a su destino.'
        );
    END LOOP;

    RETURN json_build_object(
        'ok', true,
        'processed', updated_count
    );
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION ship_autonav_v3() TO anon, authenticated;
