# FSM CANON v1 — PirateWorld

## Estados FSM
- FIRST_TIME_GPS
- GPS_NOMAD
- PORT_IDLE
- PORT_TRAVEL
- EVENT
- PROFILE

## Transiciones permitidas (CTA)
- FIRST_TIME_GPS → PORT_IDLE
- PORT_IDLE → PORT_TRAVEL
- PORT_TRAVEL → GPS_NOMAD

## Reglas
- FSM es la única fuente de verdad.
- UI no decide ni muta FSM (observer-only).
- No existen estados implícitos.
- EVENT es BLOCKING y no participa en el ciclo del CTA.
