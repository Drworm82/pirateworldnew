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

Barco y viajes

(ship_get_state)  
Uso: estado del barco.  

(ship_travel_start)  
(ship_travel_progress)  
(ship_force_arrival)  
(ship_travel_simple)

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
