# PirateWorld — Mapeo FSM → UI (CANON, UI-only)

**Documento:** `/07_ui_visual_audit.md`  
**Alcance:** UI-only · FSM-first  
**Estado:** CANON  
**Prohibiciones:** sin código · sin backend · sin rediseño · sin nuevas pantallas

---

## Contexto CANON

- FSM definido con **Estados 0–5**
- Routing manual por **hash**
- UI base FSM-first **ya montada** (Sprint 4A cerrado)
- Auditoría visual **cerrada**
- Este documento **solo mapea** lo existente

---

## Convenciones

- **Pantalla base:** una sola por estado
- **Overlay:** capa visual que no reemplaza pantalla
- **RO:** solo lectura (visual)
- **Evento:** siempre modal
- **Viaje:** submodo visual, **no** pantalla nueva

---

## Tabla CANON — FSM → UI

| Estado FSM | Pantalla base (1 sola) | Overlays permitidos | Navegación permitida (desde / hacia) | Notas de restricción |
|-----------|------------------------|---------------------|--------------------------------------|----------------------|
| **Estado 0 — Primera vez / GPS** | **GPS / Mundo Real** | Inventario (vacío, RO), Menú | **Desde:** —  \| **Hacia:** Estado 1, Estado 5 | Pantalla inicial. No acceso a viaje. Overlays solo informativos. |
| **Estado 1 — Puerto / Barco (idle)** | **Puerto / Barco (vista base)** | Inventario, Tripulación, Mapa RPG, Menú | **Desde:** Estado 0, Estado 2, Estado 3  \| **Hacia:** Estado 2, Estado 3, Estado 5 | Vista base compartida con viaje. Overlays completos. |
| **Estado 2 — Viaje activo (submodo)** | **Puerto / Barco (submodo Viaje)** | Evento (prioridad), Inventario (RO), Tripulación (RO), Mapa RPG (RO), Menú | **Desde:** Estado 1  \| **Hacia:** Estado 1, Estado 3, Estado 5 | No es pantalla nueva. Todo overlay es RO. |
| **Estado 3 — Evento (overlay)** | **Overlay modal de Evento** | — | **Desde:** Estado 1 o Estado 2  \| **Hacia:** Retorno al estado previo | Modal exclusivo. Fondo se mantiene. |
| **Estado 4 — GPS / Modo nómada** | **GPS / Mundo Real** | Inventario (RO), Menú | **Desde:** Estado 1  \| **Hacia:** Estado 1, Estado 5 | Misma base visual que Estado 0. Contexto FSM distinto. |
| **Estado 5 — Perfil / Reputación** | **Perfil** | Menú | **Desde:** Cualquier estado  \| **Hacia:** Retorno al estado previo | Fuera del loop principal. Sin impacto FSM. |

---

## Restricciones Globales

- Puerto **idle** y **viaje** comparten **una sola pantalla base**
- Evento **no** es pantalla, es **overlay modal**
- Ningún overlay puede modificar FSM
- No se agregan rutas, estados ni pantallas
- Routing sigue siendo **manual por hash**

---

## Uso del Documento

Este mapeo es la **fuente de verdad UI–FSM** para:
- Auditorías
- Refactors visuales
- Validación de overlays
- QA de navegación

No requiere interpretación adicional.
