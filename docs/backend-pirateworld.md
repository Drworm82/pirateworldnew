PirateWorld – Backend Supabase (superficie usada por el frontend)

Este documento describe solo la parte del backend que el frontend actual utiliza:
tablas y funciones RPC llamadas desde el código React.

Cuando cambies el esquema en Supabase o añadas nuevas RPC usadas por el frontend,
actualiza este archivo para que OpenCode tenga siempre la “verdad” del backend.

------------------------------------------------------------

1. Stack de backend

- Plataforma: Supabase (PostgreSQL + RLS + RPC)
- Esquema principal: public
- Auth: Supabase Auth (email)

------------------------------------------------------------

2. TABLAS USADAS POR EL FRONTEND

2.1. Tabla users  
Rol: Perfil básico del jugador.  
Campos:  
- id (uuid, PK)  
- email (text)  
- soft_coins (int4)  
- created_at (timestamptz)  
- updated_at (timestamptz)  
- pirate_name (text)  
Usada en: supaApi.js, SetupSupabase.jsx

2.2. Tabla parcels  
Rol: Parcela del mundo / tile.  
Campos:  
- id (uuid, PK)  
- x (float8)  
- y (float8)  
- created_at (timestamptz)  
- owner_id (uuid, FK → users.id)  
- geohash (text)  
Usada en: supaApi.js (múltiples)

2.3. Tabla store_items  
Rol: Ítems de la tienda.  
Campos:  
- id (uuid, PK)  
- name (text)  
- price (int4)  
- rarity (text)  
- created_at (timestamptz)

2.4. Tabla user_inventory  
Rol: Inventario del usuario.  
Campos:  
- id (uuid, PK)  
- user_id (uuid, FK → users.id)  
- item_id (uuid, FK → store_items.id)  
- created_at (timestamptz)  
- acquired_at (timestamptz)

2.5. Tabla user_island_discovery  
Rol: Islas descubiertas por el usuario.  
Campos:  
- user_id (uuid, FK → users.id)  
- island_key (text)  
- first_visited_at (timestamptz)  
- last_visited_at (timestamptz)  
- visits_count (int4)

2.6. Tabla islands  
Rol: Coordenadas reales de las islas del juego.  
Campos:  
- key (text, PK)  
- name (text)  
- lat (double precision)  
- lng (double precision)  
Usada en: ship_distance_between, ship_travel_start_v3

2.7. Tabla config  
Rol: Configuración global del juego.  
Campos:  
- key (text, PK)  
- value (numeric)  
Usada en: ship_travel_start_v3 (velocidad del barco)

2.8. Tabla ship_state  
Rol: Estado actual del barco del usuario.  
Campos:  
- user_id (uuid, PK → users.id)  
- status (text) CHECK IN ('idle','traveling','arrived')  
- from_island (text)  
- to_island (text)  
- started_at (timestamptz)  
- eta_at (timestamptz)  
- updated_at (timestamptz)  
Constraint: ship_state_status_check_v2  
Usada en: ship_get_state_v3, ship_travel_start_v3, ship_travel_progress_v3, ship_arrive_v3, ship_force_arrival_v3

------------------------------------------------------------

3. RPC USADAS POR EL FRONTEND

(add_to_ledger)  
Uso: registrar movimientos económicos.  
Llamada desde: supaApi.js:111

(get_user_ledger)  
Uso: historial económico.  
Llamada desde: supaApi.js:247

(buy_parcel)  
Uso: compra de parcelas.  
Llamada desde: supaApi.js:217

(buy_item)  
Uso: compra de ítems.  
Llamada desde: supaApi.js:284

(ship_travel_ad_reward)  
Uso: recompensa por anuncio.  
Llamada desde: supaApi.js:456

(ad_watch_during_travel)  
Uso: registrar anuncio visto.  
Llamada desde: Explore.jsx:386

------------------------------------------------------------

Exploración y Misiones

(exploration_start)  
(exploration_get_active)  
(exploration_resolve)  
(missions_get_daily_for_user)  
(complete_mission)

------------------------------------------------------------

Barco y viajes - Sistema v3

(ship_get_state_v3)  
Uso: estado unificado del barco con auto-completado, progreso, ubicación actual y posición GPS interpolada.  
Retorna: status, from_island, to_island, from_lat, from_lng, to_lat, to_lng, started_at, eta_at, current_lat, current_lng, progress_percent, time_remaining_seconds, distance_km, speed_kmh  
Llamada desde: supaApi.js:200, Explore.jsx:95, Ship.jsx:42

(ship_travel_start_v3)  
Uso: inicio de viaje con distancia real y ETA dinámico.  
Parámetros: p_user uuid, p_from text, p_to text, p_from_lat double precision, p_from_lng double precision, p_to_lat double precision, p_to_lng double precision  
Retorna: ok boolean, error text, eta_at timestamptz  
Llamada desde: supaApi.js:209, Explore.jsx:196

(ship_travel_progress_v3)  
Uso: obtener progreso detallado del viaje con porcentaje, tiempo restante, posición GPS y corrección automática de inconsistencias.  
Retorna: ok boolean, status text, progress_percent numeric, time_remaining_seconds int, current_lat double precision, current_lng double precision, distance_km numeric, error text  
Llamada desde: supaApi.js:220, Explore.jsx:133

(ship_arrive_v3)  
Uso: completar viaje y transicionar a estado idle. Maneja traveling→arrived→idle.  
Retorna: ok boolean, status text, error text  
Llamada desde: supaApi.js:247, Explore.jsx:168

(ship_force_arrival_v3)  
Uso: forzar llegada del barco.  
Retorna: ok boolean, status text, error text  
Llamada desde: supaApi.js:229, Explore.jsx:221

(ship_distance_between)  
Uso: calcular distancia real entre islas (Haversine).  
Retorna: numeric (distancia en km)  
Llamada desde: ship_travel_start_v3, ship_travel_progress_v3

(ship_autonomous_update)  
Uso: auto-completar viajes expirados y corregir inconsistencias del ciclo completo.  
Llamada desde: ship_get_state_v3, ship_travel_progress_v3, ship_travel_start_v3, ship_force_arrival_v3, ship_arrive_v3

(ad_watch_during_travel)  
Uso: reducir tiempo de viaje al ver anuncio.  
Parámetros: p_user uuid, p_seconds_to_reduce int DEFAULT 30  
Retorna: ok boolean, new_eta timestamptz, error text  
Llamada desde: supaApi.js:259, Explore.jsx:386

(ship_travel_ad_reward)  
Uso: dar recompensa de monedas por ver anuncio durante viaje.  
Parámetros: p_user uuid  
Retorna: ok boolean, coins_awarded int, error text  
Llamada desde: supaApi.js:268, Explore.jsx:386

------------------------------------------------------------

Crews

(crew_get_my_crew)  
(crew_create)  
(crew_join)  
(crew_leave)  
(crew_kick)  
(crew_set_role)  
(crew_set_shares)

------------------------------------------------------------

Perfil y ranking

(leaderboard_top_xp)  
(get_user_state)  
(set_pirate_name)

------------------------------------------------------------
