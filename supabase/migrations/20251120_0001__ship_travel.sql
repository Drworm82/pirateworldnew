-- Ship Travel System Migration
-- Crear tabla ship_state si no existe
CREATE TABLE IF NOT EXISTS ship_state (
    user_id uuid PRIMARY KEY REFERENCES users(id),
    status text CHECK (status IN ('idle','traveling','arrived')) DEFAULT 'idle',
    from_island text,
    to_island text,
    started_at timestamptz,
    eta_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE ship_state ENABLE ROW LEVEL SECURITY;

-- Policy para que usuarios solo vean su propio estado
CREATE POLICY "Users can view their own ship state" ON ship_state
    FOR SELECT USING (auth.uid() = user_id);

-- Policy para que usuarios solo inserten su propio estado
CREATE POLICY "Users can insert their own ship state" ON ship_state
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy para que usuarios solo actualicen su propio estado
CREATE POLICY "Users can update their own ship state" ON ship_state
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para que usuarios solo eliminen su propio estado
CREATE POLICY "Users can delete their own ship state" ON ship_state
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger function (esto sí se queda)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ❌ ELIMINADO: el trigger ya existe en la base real
-- CREATE TRIGGER update_ship_state_updated_at 
--     BEFORE UPDATE ON ship_state 
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC 1: ship_get_state()
CREATE OR REPLACE FUNCTION ship_get_state()
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
    v_user_id uuid := auth.uid();
BEGIN
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

-- RPC 2: ship_travel_start(p_to_island text)
CREATE OR REPLACE FUNCTION ship_travel_start(p_to_island text)
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
    v_user_id uuid := auth.uid();
    v_current_status text;
BEGIN
    SELECT ss.status INTO v_current_status 
    FROM ship_state ss
    WHERE ss.user_id = v_user_id;
    
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
    WHERE user_id = v_user_id;
    
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

-- RPC 3: ship_travel_progress()
CREATE OR REPLACE FUNCTION ship_travel_progress()
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
    v_user_id uuid := auth.uid();
    v_eta_at timestamptz;
    v_status text;
    v_remaining int;
BEGIN
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

-- RPC 4: ship_force_arrival()
CREATE OR REPLACE FUNCTION ship_force_arrival()
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
    v_user_id uuid := auth.uid();
    v_eta timestamptz;
    v_status text;
BEGIN
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
