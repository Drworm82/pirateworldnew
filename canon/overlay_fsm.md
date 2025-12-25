# overlayFSM — FSM Secundaria de Overlays RO (CANON)

## Propósito

`overlayFSM` es una FSM secundaria encargada de controlar **exclusivamente** los overlays
read-only del sistema PirateWorld (Inventario, Tripulación, Mapa).

Su objetivo es eliminar lógica implícita (flags sueltos, condicionales dispersos)
y garantizar un comportamiento **predecible, verificable y FSM-safe**, sin afectar
al FSM principal del juego.

---

## Qué problema resuelve

- Centraliza el control de overlays RO.
- Garantiza **mutua exclusión** (solo un overlay abierto a la vez).
- Define reglas claras de apertura y cierre.
- Permite **bloqueo total** durante EVENT.
- Evita fugas visuales o estados inconsistentes.

---

## Qué NO resuelve (negativos explícitos)

- ❌ No maneja lógica de gameplay.
- ❌ No escribe ni lee backend.
- ❌ No decide navegación principal.
- ❌ No sustituye ni modifica el FSM principal.
- ❌ No controla CTA ni HUD.
- ❌ No introduce UX nueva ni copy nuevo.

---

## Estados explícitos

La FSM secundaria tiene **un solo estado activo a la vez**:

- `CLOSED`
- `OPEN_INVENTORY`
- `OPEN_CREW`
- `OPEN_MAP`

No existen estados implícitos ni combinados.

---

## Eventos y transiciones permitidas

### Apertura (acción explícita del usuario)

- `CLOSED → OPEN_INVENTORY`
- `CLOSED → OPEN_CREW`
- `CLOSED → OPEN_MAP`
- `OPEN_* → OPEN_*` (cambio directo, con cierre implícito del anterior)

### Cierre explícito

- `OPEN_* → CLOSED`
  - Mediante acción del usuario (mismo botón que abre o acción equivalente).

### Cierre forzado por EVENT

- Cualquier estado `OPEN_* → CLOSED` cuando el FSM principal entra en `EVENT`.

---

## Reglas CANON

1. **Mutua exclusión**
   - Nunca puede haber más de un overlay abierto al mismo tiempo.

2. **EVENT = BLOCKING**
   - Durante `EVENT`:
     - No se puede abrir ningún overlay.
     - Cualquier overlay abierto se cierra de forma forzada.

3. **Observer-only**
   - `overlayFSM` **observa** al FSM principal.
   - Nunca lo modifica ni dispara transiciones en él.

4. **Cierre explícito**
   - No hay autocierres silenciosos fuera de EVENT.
   - El usuario siempre ejecuta una acción clara de cierre.

---

## Interacciones prohibidas

- ❌ Overlays simultáneos.
- ❌ Apertura de overlays durante EVENT.
- ❌ Escrituras de estado global fuera de `overlayFSM`.
- ❌ Acceso a backend.
- ❌ Dependencias con CTA o routing principal.

---

## Estado CANON

`overlayFSM` queda declarada como **FSM secundaria CANON**, congelada
según lo implementado en Sprint 62.

No debe modificarse sin sprint explícito de arquitectura.
