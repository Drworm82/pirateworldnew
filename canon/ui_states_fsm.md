# FSM secundaria — Estados UI (HUD / PROFILE)

## Propósito
Definir y congelar como CANON la FSM secundaria de estados UI que gobierna
la representación visual de datos en superficies read-only como HUD y PROFILE.

Esta FSM no controla navegación ni lógica de juego: únicamente describe
cómo se presenta el estado de los datos al usuario.

---

## Alcance

Superficies cubiertas:
- HUD
- PROFILE

Esta FSM es:
- UI-only
- Read-only
- Observer-only

---

## Qué problema resuelve

- Evita lógica implícita de render (if sueltos por todos lados)
- Centraliza el significado de “loading”, “error”, “vacío”
- Garantiza consistencia visual entre HUD y PROFILE
- Evita cálculos o inferencias en UI

---

## Qué NO resuelve (negativos explícitos)

❌ No controla navegación  
❌ No interactúa con FSM principal  
❌ No dispara transiciones FSM  
❌ No escribe datos  
❌ No calcula valores derivados  
❌ No cambia copy ni UX  

---

## Estados explícitos (CANON)

### LOADING
- Datos solicitados
- Respuesta aún no disponible
- Puede haber latencia de red o RPC

### READY
- Datos disponibles
- Campos válidos o null-safe
- Render normal

### EMPTY
- Respuesta válida pero sin datos relevantes
- Ejemplo: contadores en 0, listas vacías

### ERROR
- Fallo en RPC
- Error de red
- Respuesta inválida

---

## Transiciones permitidas

| Origen   | Destino | Condición |
|--------|--------|----------|
| LOADING | READY  | RPC exitosa con datos |
| LOADING | EMPTY  | RPC exitosa sin datos |
| LOADING | ERROR  | Error de RPC |
| ERROR   | LOADING | Reintento |
| EMPTY   | LOADING | Reintento |
| READY   | LOADING | Refresh explícito |

No existen transiciones implícitas.

---

## Prioridades

- ERROR > EMPTY > READY
- LOADING siempre bloquea READY

---

## Reglas CANON

- Observer-only
- No afecta FSM principal
- No muta estado global
- No dispara side-effects
- No altera copy existente

---

## Ejemplos por superficie

### HUD

- LOADING → placeholders / skeleton
- READY → valores canónicos
- EMPTY → valores en 0 / ocultos
- ERROR → fallback RO (sin CTA nueva)

### PROFILE

- LOADING → “Cargando perfil…”
- READY → bloques de datos
- EMPTY → “Perfil no disponible”
- ERROR → mensaje RO sin acciones

---

## Interacciones prohibidas

❌ Estados implícitos  
❌ Mezclar READY + ERROR  
❌ Cálculos en UI  
❌ Escrituras backend  
❌ Mutar FSM principal  

---

## Estado CANON
Esta FSM secundaria queda congelada como fuente de verdad
para estados UI read-only en PirateWorld.
