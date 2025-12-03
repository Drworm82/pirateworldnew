-- ============================================================
--  ship_travel_progress_v4
--  Calcula progreso interpolado + posición actual del barco
-- ============================================================

CREATE OR REPLACE FUNCTION ship_travel_progress_v4(
  p_user uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  st          ship_state;
  pct         numeric := 0;
  elapsed     numeric;
  total_sec   numeric;
  now_ts      timestamptz := now();
  cur_lat     numeric;
  cur_lng     numeric;
BEGIN
  -- Leer estado
  SELECT * INTO st
  FROM ship_state
  WHERE user_id = p_user;

  IF st.user_id IS NULL THEN
    RETURN jsonb_build_object('error','NO_STATE');
  END IF;

  -- Si está idle → devolver posición actual
  IF st.status = 'idle' THEN
    RETURN jsonb_build_object(
      'status', 'idle',
      'current_lat', st.current_lat,
      'current_lng', st.current_lng,
      'percent', 0,
      'distance_km', st.distance_km,
      'speed_kmh', st.speed_kmh,
      'origin', st.origin,
      'current_location', st.current_location
    );
  END IF;

  -- Si no hay arrival_time no puede haber viaje
  IF st.arrival_time IS NULL OR st.departure_time IS NULL THEN
    RETURN jsonb_build_object('error','NO_TRAVEL_DATA');
  END IF;

  -- Cálculo de progreso
  total_sec := EXTRACT(EPOCH FROM (st.arrival_time - st.departure_time));
  elapsed   := EXTRACT(EPOCH FROM (now_ts - st.departure_time));

  IF total_sec <= 0 THEN
    pct := 0;
  ELSE
    pct := LEAST(1, GREATEST(0, elapsed / total_sec));
  END IF;

  -- Interpolación lat/lng
  cur_lat := st.origin_lat + (st.destination_lat - st.origin_lat) * pct;
  cur_lng := st.origin_lng + (st.destination_lng - st.origin_lng) * pct;

  -- Respuesta final
  RETURN jsonb_build_object(
    'status', st.status,
    'percent', pct * 100,
    'current_lat', cur_lat,
    'current_lng', cur_lng,
    'origin', st.origin,
    'destination', st.destination,
    'distance_km', st.distance_km,
    'speed_kmh', st.speed_kmh,
    'eta', st.arrival_time,
    'departure_time', st.departure_time
  );
END;
$$;
