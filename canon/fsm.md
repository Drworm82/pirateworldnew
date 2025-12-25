# FSM CANON — PirateWorld

El FSM es la única fuente de verdad del estado del juego.

## Estados
- FIRST_TIME_GPS
- GPS_NOMAD
- PORT_IDLE
- PORT_TRAVEL
- EVENT
- PROFILE

## Reglas
- La UI no decide estados.
- La UI solo observa el FSM.
- Las transiciones solo ocurren vía CTA.
- EVENT bloquea CTAs y overlays.
    