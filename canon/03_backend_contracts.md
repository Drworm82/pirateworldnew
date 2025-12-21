📄 /canon/03_backend_contracts.md
Backend Contracts — PirateWorld
Entorno de referencia

STAGE (fuente de verdad)

DEV es entorno de prueba

1. Principios generales

El backend es la fuente de verdad

El frontend no escribe estado

El frontend no accede tablas directamente

Toda mutación ocurre vía RPCs / funciones controladas

ship_state es la tabla central del core loop

2. Tablas CORE (activas)

Estas tablas forman parte del backend activo:

Viaje / Barco
ship_state
ship_travel
ship_travel_logs
ship_locations
ship_event_log
ship_logs

Usuario / Economía
users
ledger
user_ledger
user_wallet
daily_payouts
daily_revenue

Mundo
world_tiles
islands
island_resources
parcels

3. Tablas de sistemas activos (no core loop)

Estas tablas existen y se usan, pero no pueden alterar el core loop sin CANON nuevo:

Tripulación
crews
crew_members
crew_roles
crew_share_history
crew_kick_votes

Misiones / Exploración
missions
mission_progress
exploration_runs
event_pool
sea_events
sea_event_logs

Inventario / Loot
user_inventory
store_items
loot_pools
loot_distributions

Progresión
user_stats
user_resources
user_island_discovery

4. Tablas de configuración (solo backend)
game_config
config
ship_config
ship_models
ship_types
ship_roles
ship_modules
ship_speed_profiles
ship_cost_modifiers
ship_stats
ship_upgrades
wallets
wallet_ledger


Estas tablas:

no se consultan desde frontend

no se modifican sin migración explícita

5. Tablas prohibidas para gameplay

migraciones

auth / oauth / mfa

logs internos

jobs

storage

secrets

spatial_ref_sys

6. Regla de cambio

Cualquier cambio al backend requiere:

Actualizar CANON

Crear sprint dedicado

Rama feat/*

Revisión explícita

Estado del documento:
✅ Congelado
❌ No modificable sin proceso formal