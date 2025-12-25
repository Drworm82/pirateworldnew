# CTA Central — Contrato CANON

## Visibilidad y copy por estado

- FIRST_TIME_GPS → visible → "Plantar isla"
- PORT_IDLE → visible → "Zarpar"
- PORT_TRAVEL → visible → "Ver anuncio · Reducir ETA"
- GPS_NOMAD → visible → "Volver a puerto"
- PROFILE → oculto
- EVENT → oculto (BLOCKING)

## Reglas
- El CTA es el único disparador de FSM.
- No ejecuta lógica real (UI-only).
- No aparece durante EVENT.
- No cambia copy por lógica local.
