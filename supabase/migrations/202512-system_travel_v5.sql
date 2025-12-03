-- ====================================================================================
-- SISTEMA DE VIAJE DEL BARCO V5 (FINAL)
-- Costos, preview, inicio, progreso, autonav con eventos
-- ====================================================================================

-- ============================================================
-- TABLA PRINCIPAL DEL BARCO
-- ============================================================
create table if not exists ship_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    status text default 'idle', -- idle | traveling
    origin text,
    destination text,
    distance_km numeric,
    percent numeric default 0,
    started_at timestamptz,
    eta timestamptz,
    base_speed_kmh numeric default 12,
    current_lat numeric,
    current_lng numeric,
    final_lat numeric,
    final_lng numeric,
    last_event text,
    last_event_at timestamptz
);

-- ============================================================
-- TABLA DE BARCOS — tipos con modificadores
-- ============================================================
create table if not exists ships (
    user_id uuid primary key references auth.users(id),
    ship_type text default 'basic', 
    speed_mod numeric default 1.0, 
    cost_mod numeric default 1.0
);

-- Valores sugeridos por tipo:
-- basic: speed 1.0  cost 1.0
-- light: speed 1.2  cost 1.0
-- heavy: speed 0.8  cost 1.4
-- scout: speed 1.4  cost 0.7


-- ============================================================
-- VISTA DE ISLAS — ya debes tenerla
-- ============================================================


-- ============================================================
-- FUNCIÓN HELPERS: distancia geodésica
-- ============================================================
create or replace function geo_distance_km(
    lat1 numeric,
    lon1 numeric,
    lat2 numeric,
    lon2 numeric
)
returns numeric
language plpgsql
as $$
declare
    r constant numeric := 6371;
    dlat numeric := radians(lat2 - lat1);
    dlon numeric := radians(lon2 - lon1);
    a numeric;
    c numeric;
begin
    a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    return r * c;
end;
$$;


-- ====================================================================================
-- FUNCIÓN V5A — PREVIEW DE COSTO ANTES DE ZARPAR
-- ====================================================================================
create or replace function ship_travel_cost_preview_v5(
    p_user uuid,
    p_destination text
)
returns json
language plpgsql
as $$
declare
    st ship_state;
    isl record;
    distance numeric;
    base_km_cost constant numeric := 4;  -- costo por km
    base_fee constant numeric := 10;     -- tarifa base
    cost_mod numeric := 1.0;
    total_cost numeric;
begin
    -- Leer estado actual
    select * into st from ship_state where user_id = p_user;

    if st.status = 'traveling' then
        return json_build_object(
            'error', true,
            'message', 'El barco está viajando.'
        );
    end if;

    -- Leer isla destino
    select * into isl from islands where key = p_destination;
    if not found then
        return json_build_object('error', true, 'message', 'Isla no existe');
    end if;

    -- Distancia
    distance := geo_distance_km(st.current_lat, st.current_lng, isl.lat, isl.lng);

    -- Modificador del barco
    select cost_mod into cost_mod from ships where user_id = p_user;

    if cost_mod is null then
        cost_mod := 1.0;
    end if;

    total_cost := (distance * base_km_cost * cost_mod) + base_fee;

    return json_build_object(
        'ok', true,
        'distance_km', distance,
        'base_fee', base_fee,
        'cost_mod', cost_mod,
        'total_cost', round(total_cost, 2)
    );
end;
$$;


-- ====================================================================================
-- FUNCIÓN V5B — INICIAR VIAJE (cobra + arranca)
-- ====================================================================================
create or replace function ship_travel_start_v5(
    p_user uuid,
    p_destination text
)
returns json
language plpgsql
as $$
declare
    st ship_state;
    isl record;
    distance numeric;
    speed_mod numeric := 1.0;
    cost_info json;
    total_cost numeric;
    new_eta timestamptz;
    base_speed numeric := 12;
begin
    select * into st from ship_state where user_id = p_user;

    if st.status = 'traveling' then
        return json_build_object('error', true, 'message', 'Ya estás viajando');
    end if;

    select * into isl from islands where key = p_destination;
    if not found then
        return json_build_object('error', true, 'message', 'Destino inválido');
    end if;

    -- Distancia
    distance := geo_distance_km(st.current_lat, st.current_lng, isl.lat, isl.lng);

    -- Costos (usamos la función preview)
    cost_info := ship_travel_cost_preview_v5(p_user, p_destination);
    total_cost := (cost_info->>'total_cost')::numeric;

    -- Descontar dinero (opcional si tienes tabla de wallet)
    -- update wallets set balance = balance - total_cost where user_id = p_user;

    -- Modificador de velocidad
    select speed_mod into speed_mod from ships where user_id = p_user;
    if speed_mod is null then speed_mod := 1.0; end if;

    new_eta := now() + (distance / (base_speed * speed_mod)) * interval '1 hour';

    update ship_state
    set
        status = 'traveling',
        origin = st.origin,
        destination = p_destination,
        distance_km = distance,
        percent = 0,
        started_at = now(),
        eta = new_eta,
        final_lat = isl.lat,
        final_lng = isl.lng
    where user_id = p_user;

    return json_build_object(
        'ok', true,
        'distance_km', distance,
        'speed_kmh', base_speed * speed_mod,
        'eta', new_eta,
        'cost', total_cost
    );
end;
$$;


-- ====================================================================================
-- FUNCIÓN V4 — PROGRESO DEL VIAJE
-- ====================================================================================
create or replace function ship_travel_progress_v4(
    p_user uuid
)
returns json
language plpgsql
as $$
declare
    st ship_state;
    elapsed_hours numeric;
    total_hours numeric;
    pct numeric;
    cur_lat numeric;
    cur_lng numeric;
begin
    select * into st from ship_state where user_id = p_user;

    if st.status = 'idle' then
        return json_build_object(
            'status', 'idle',
            'origin', st.origin,
            'current_lat', st.current_lat,
            'current_lng', st.current_lng
        );
    end if;

    elapsed_hours := extract(epoch from (now() - st.started_at)) / 3600;
    total_hours := extract(epoch from (st.eta - st.started_at)) / 3600;

    pct := least(100, (elapsed_hours / total_hours) * 100);

    cur_lat := st.current_lat + (st.final_lat - st.current_lat) * (pct / 100);
    cur_lng := st.current_lng + (st.final_lng - st.current_lng) * (pct / 100);

    if pct >= 100 then
        update ship_state
        set
            status = 'idle',
            current_lat = st.final_lat,
            current_lng = st.final_lng,
            destination = null,
            origin = st.origin
        where user_id = p_user;
    end if;

    return json_build_object(
        'status', st.status,
        'origin', st.origin,
        'destination', st.destination,
        'distance_km', st.distance_km,
        'percent', pct,
        'current_lat', cur_lat,
        'current_lng', cur_lng
    );
end;
$$;


-- ====================================================================================
-- FUNCIÓN V4 — AUTONAV + EVENTOS
-- ====================================================================================
create or replace function ship_autonav_v4(
    p_user uuid
)
returns json
language plpgsql
as $$
declare
    ev_type text;
    event json;
begin
    -- RNG
    case floor(random() * 4)
        when 0 then ev_type := 'storm';
        when 1 then ev_type := 'pirates';
        when 2 then ev_type := 'loot';
        else ev_type := 'waves';
    end case;

    event := case ev_type
        when 'storm' then json_build_object('type','storm','title','Tormenta','description','Fuertes vientos frenan el barco.')
        when 'pirates' then json_build_object('type','pirates','title','Piratas','description','Un grupo hostil intenta acercarse.')
        when 'loot' then json_build_object('type','loot','title','Tesoro','description','Encuentras un cofre flotando.')
        else json_build_object('type','waves','title','Olas','description','Olas fuertes golpean el casco.')
    end;

    update ship_state
    set last_event = event::text, last_event_at = now()
    where user_id = p_user;

    return json_build_object(
        'ok', true,
        'event', event
    );
end;
$$;
