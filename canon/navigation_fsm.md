# FSM Secundaria de Navegación — CANON

## Propósito

Definir y congelar la FSM secundaria responsable de la navegación de overlays
de **alto nivel**: PROFILE y EVENT.

Esta FSM evita navegación implícita, conflictos de prioridad y drift semántico
al coexistir con el FSM principal y la overlayFSM.

---

## Alcance

Esta FSM controla exclusivamente:

- Apertura y cierre de PROFILE
- Apertura y cierre de EVENT
- Prioridades entre ambos

No controla:
- CTA central
- FSM principal de juego
- overlayFSM (inventario / tripulación / mapa)

---

## Qué problema resuelve

- Evita que PROFILE y EVENT compitan o se solapen
- Define prioridad clara (EVENT > PROFILE)
- Establece reglas explícitas de retorno
- Elimina navegación implícita o dependiente del routing

---

## Qué NO resuelve (negativos explícitos)

- No define layout ni UI
- No define animaciones
- No introduce nuevas rutas
- No sustituye al FSM principal
- No controla overlays RO
- No decide cuándo ocurre un EVENT (solo cómo se navega)

---

## Estados explícitos

| Estado | Descripción |
|------|-------------|
| IDLE | No hay overlay de navegación abierto |
| OPEN_PROFILE | Overlay PROFILE abierto |
| OPEN_EVENT | Overlay EVENT abierto |

---

## Prioridades CANON

**OPEN_EVENT tiene prioridad absoluta sobre OPEN_PROFILE**

Regla:
- EVENT puede abrirse desde cualquier estado
- EVENT preempte PROFILE si está abierto
- PROFILE nunca puede abrirse si EVENT está activo

---

## Transiciones permitidas

### Desde IDLE

- IDLE → OPEN_PROFILE (acción explícita del usuario)
- IDLE → OPEN_EVENT (condición del sistema)

### Desde OPEN_PROFILE

- OPEN_PROFILE → IDLE (cierre explícito)
- OPEN_PROFILE → OPEN_EVENT (preempción inmediata)

### Desde OPEN_EVENT

- OPEN_EVENT → IDLE (condición explícita de cierre)
- OPEN_EVENT → OPEN_PROFILE ❌ PROHIBIDO

---

## Regla de retorno canónico

- PROFILE:
  - Retorna siempre a IDLE
  - No recuerda rutas previas
  - No dispara CTA

- EVENT:
  - Retorna siempre a IDLE
  - Limpia cualquier overlay previo
  - No restaura PROFILE automáticamente

---

## Interacción con otras FSM

### FSM principal (juego)

- Relación: **observer-only**
- No modifica estados del FSM principal
- FSM principal puede seguir cambiando mientras PROFILE está abierto
- EVENT bloquea interacción visible, pero no reescribe FSM principal

### overlayFSM (inventario / tripulación / mapa)

- Coexiste sin conflicto
- Regla CANON:
  - EVENT fuerza `overlayFSM → CLOSED`
  - PROFILE no abre ni cierra overlays RO
- overlayFSM nunca puede abrir overlays durante OPEN_EVENT

---

## Interacciones prohibidas (negativos)

❌ Navegación implícita por hash  
❌ Reinterpretar CTA como salida de PROFILE  
❌ Abrir PROFILE durante EVENT  
❌ Abrir EVENT y PROFILE simultáneamente  
❌ Retornos automáticos no declarados  
❌ Escrituras a backend  
❌ Lógica de negocio en navegación  

---

## Garantías CANON

- Navegación explícita y predecible
- Prioridades no ambiguas
- Compatible con FSM-first
- Compatible con UI observer-only
- Base estable para futuros sprints

---

**Estado:** CANON  
**Introducido en:** Sprint 64  
**Modificaciones futuras:** Requieren sprint explícito
