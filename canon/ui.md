# UI CANON — PirateWorld

## Principios
- FSM-first
- Observer-only
- Routing manual por hash
- UI nunca muta FSM directamente

## Overlays
- Inventario: RO
- Tripulación: RO
- Mapa RPG: RO
- Menú: RO
- Evento: modal bloqueante

## Estabilidad
- UI validada como null-safe (Sprint 41)
- No crashes por null/undefined
    