---------------------------------------------------------
-- MIGRACIÓN CONSOLIDADA — SHIP TRAVEL V3 (LIMPIA)
---------------------------------------------------------

-- Eliminar duplicados previos de start_v3
DROP FUNCTION IF EXISTS public.ship_travel_start_v3(uuid, text, text);
DROP FUNCTION IF EXISTS public.ship_travel_start_v3(
  uuid,
  text,
  text,
  double precision,
  double precision,
  double precision,
  double precision
);
DROP FUNCTION IF EXISTS public.ship_travel_start_v3(
  uuid,
  text,
  text,
  numeric,
  numeric,
  numeric,
  numeric
);

---------------------------------------------------------
-- Función única: ship_travel_start_v3
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ship_travel_start_v3(
  p_user_id uuid,
  p_origin text,
  p_destination text,
  p_origin_lat double precision,
  p_origin_lng double precision,
  p_destination_lat double precision,
  p_destination_lng double precision
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_distance_km double precision;
  v_speed_kmh double precision := 20;
  v_travel_hours double precision;
  v_departure timestamptz := NOW();
  v_arrival timestamptz;
BEGIN
  WITH calc AS (
    SELECT
      6371 * 2 * asin(
        sqrt(
          pow(sin(radians(p_destination_lat - p_origin_lat) / 2), 2) +
          cos(radians(p_origin_lat)) * cos(radians(p_destination_lat)) *
          pow(sin(radians(p_destination_lng - p_origin_lng) / 2), 2)
        )
      ) AS dist
  )
  SELECT dist INTO v_distance_km FROM calc;

  v_travel_hours := v_distance_km / v_speed_kmh;
  v_arrival := v_departure + (v_travel_hours * INTERVAL '1 hour');

  UPDATE ship_state
  SET
    status = 'traveling',
    origin = p_origin,
    destination = p_destination,
    origin_lat = p_origin_lat,
    origin_lng = p_origin_lng,
    destination_lat = p_destination_lat,
    destination_lng = p_destination_lng,
    distance_km = v_distance_km,
    departure_time = v_departure,
    arrival_time = v_arrival,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'distance_km', v_distance_km,
    'speed_kmh', v_speed_kmh,
    'departure_time', v_departure,
    'arrival_time', v_arrival
  );
END;
$$;

---------------------------------------------------------
-- Función única: ship_travel_progress_v3
---------------------------------------------------------
DROP FUNCTION IF EXISTS public.ship_travel_progress_v3(uuid);

CREATE OR REPLACE FUNCTION public.ship_travel_progress_v3(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  s record;
  v_now timestamptz := NOW();
  v_percent double precision;
  v_elapsed double precision;
  v_total double precision;
  v_lat double precision;
  v_lng double precision;
  v_speed_kmh double precision;
BEGIN
  SELECT * INTO s FROM ship_state WHERE user_id = p_user_id LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_ship_state');
  END IF;

  IF s.status = 'idle' OR s.arrival_time IS NULL THEN
    RETURN jsonb_build_object(
      'ok', true,
      'status', 'idle',
      'lat', s.destination_lat,
      'lng', s.destination_lng,
      'percent', 100,
      'speed_kmh', 0,
      'distance_km', s.distance_km,
      'departure_time', s.departure_time,
      'arrival_time', s.arrival_time,
      'now', v_now
    );
  END IF;

  v_elapsed := EXTRACT(EPOCH FROM (v_now - s.departure_time));
  v_total := EXTRACT(EPOCH FROM (s.arrival_time - s.departure_time));

  IF v_total <= 0 THEN
    v_percent := 100;
  ELSE
    v_percent := LEAST(100, GREATEST(0, (v_elapsed / v_total) * 100));
  END IF;

  IF v_now >= s.arrival_time THEN
    UPDATE ship_state
    SET
      status = 'idle',
      origin = s.destination,
      origin_lat = s.destination_lat,
      origin_lng = s.destination_lng,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'ok', true,
      'status', 'idle',
      'lat', s.destination_lat,
      'lng', s.destination_lng,
      'percent', 100,
      'speed_kmh', 0,
      'distance_km', s.distance_km,
      'departure_time', s.departure_time,
      'arrival_time', s.arrival_time,
      'now', v_now
    );
  END IF;

  v_lat := s.origin_lat + (s.destination_lat - s.origin_lat) * (v_percent / 100.0);
  v_lng := s.origin_lng + (s.destination_lng - s.origin_lng) * (v_percent / 100.0);

  v_speed_kmh := s.distance_km / (v_total / 3600.0);

  RETURN jsonb_build_object(
    'ok', true,
    'status', 'traveling',
    'lat', v_lat,
    'lng', v_lng,
    'percent', v_percent,
    'speed_kmh', v_speed_kmh,
    'distance_km', s.distance_km,
    'departure_time', s.departure_time,
    'arrival_time', s.arrival_time,
    'now', v_now
  );
END;
$$;
