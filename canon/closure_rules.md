# PirateWorld — Reglas CANON de cierre y retorno
## EVENT y PROFILE (FSM-first · observer-only)

Este documento congela las reglas CANON de cierre y retorno
para los overlays EVENT y PROFILE.

No introduce comportamiento nuevo.
Documenta el funcionamiento ya validado en producción.

---

## 1. Principio general (CANON)

EVENT y PROFILE son **overlays FSM**.

- No son pantallas base.
- No introducen estados intermedios.
- No deciden navegación.
- No mutan FSM salvo mediante reglas explícitas.

El FSM conserva siempre el `previousState` al entrar a un overlay.

---

## 2. PROFILE — Regla de cierre

### Naturaleza
- PROFILE es un **overlay no bloqueante**.
- UI **read-only**.
- No participa en el ciclo del CTA central.

### Acción explícita de cierre
- El usuario ejecuta una acción dedicada de salida (ej. botón “Volver”).
- La acción **no navega por hash**.
- La acción **no dispara transiciones nuevas**.

### Regla FSM
- El cierre de PROFILE se realiza llamando a:
  - `requestTransition(null)`
- El FSM:
  - Sale del overlay
  - Retorna **exactamente** al `previousState`
  - Normaliza el modo si aplica

### Estado de retorno permitido
- El retorno es siempre al **estado FSM previo válido**:
  - FIRST_TIME_GPS
  - GPS_NOMAD
  - PORT_IDLE
  - PORT_TRAVEL

### Negativos explícitos (NO ocurre)
- PROFILE **NO**:
  - Cambia el FSM por sí mismo
  - Dispara CTA
  - Navega manualmente por hash
  - Recalcula estado destino
  - Introduce lógica de fallback propia

---

## 3. EVENT — Regla de cierre

### Naturaleza
- EVENT es un **overlay BLOCKING**.
- Durante EVENT:
  - CTA central está bloqueado
  - Menú está bloqueado
  - Overlays secundarios están bloqueados

### Condición de cierre
- EVENT se cierra únicamente cuando:
  - La condición interna del evento se cumple
  - O el sistema autoriza explícitamente su cierre

### Regla FSM
- Al cerrar EVENT:
  - El FSM retorna al `previousState` almacenado
  - No se evalúan rutas alternativas
  - No se dispara CTA

### Garantías BLOCKING
Mientras EVENT está activo:
- ❌ No CTA
- ❌ No navegación secundaria
- ❌ No PROFILE
- ❌ No overlays RO
- ❌ No transiciones implícitas

---

## 4. Simetría EVENT ↔ PROFILE

### Lo que comparten
- Ambos son overlays FSM
- Ambos preservan `previousState`
- Ambos retornan **al estado previo exacto**
- Ambos usan `requestTransition(null)` para cerrar
- Ambos respetan FSM-first y observer-only

### Lo que NO comparten
| Aspecto | PROFILE | EVENT |
|------|-------|-------|
| Bloqueo total | No | Sí |
| CTA disponible | No aplica | Bloqueado |
| Menú accesible | Sí | No |
| Cierre por usuario | Sí | No |
| Cierre por sistema | No | Sí |

---

## 5. Interacciones prohibidas (CANON)

### Durante EVENT
- CTA central
- Navegación manual
- Menú
- PROFILE
- Overlays RO

### Durante PROFILE
- Reinterpretar CTA
- Navegar por hash
- Decidir estado destino
- Mutar FSM directamente

---

## 6. Garantía CANON

Estas reglas:
- No introducen UX nueva
- No modifican FSM
- No cambian backend
- No alteran contratos existentes

Este documento congela el comportamiento actual como **CANON**.
