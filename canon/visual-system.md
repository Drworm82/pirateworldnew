# PirateWorld — Visual System CANON
Sprint 72.1 · Documentación

Este documento define y congela el sistema visual CANON de PirateWorld.
No propone mejoras ni rediseño. Describe reglas obligatorias para que la UI
sea consistente, predecible y FSM-first.

---

## 1️⃣ CTA Central (Botón principal)

### Descripción
Elemento de acción principal que conduce transiciones FSM.
Visualmente dominante, flotante y siempre visible salvo bloqueo explícito.

### Posición
- Flotante, centrado horizontalmente.
- Sale parcialmente por encima del HUD inferior.
- Nunca está completamente contenido dentro del HUD.

### Copy (por estado FSM)
- FIRST_TIME_GPS → **“Plantar isla”**
- PORT_IDLE → **“Zarpar”**
- PORT_TRAVEL → **Visible (estado activo), sin disparar transición**
- GPS_NOMAD → **No visible**

### Jerarquía visual
- Prioridad visual mayor que HUD y menú.
- Menor prioridad que EVENT (bloqueante).

### Bloqueos
- Bajo EVENT:
  - ❌ No visible
  - ❌ No interactivo
  - ❌ No renderizado

### Z-index (relativo)
EVENT > CTA > HUD > Menú > Pantalla base

### Negativos explícitos
- ❌ El CTA no debe quedar oculto bajo el HUD.
- ❌ El CTA no debe disparar lógica fuera del FSM.
- ❌ El CTA no debe mutar estado si EVENT está activo.

---

## 2️⃣ HUD Inferior

### Descripción
Barra inferior persistente que muestra estado contextual y accesos RO.

### Campos visibles
- GPS:
  - Inventario
  - CTA central (flotante)
  - Mapa Mundo
- Puerto / Viaje:
  - Inventario
  - CTA central (flotante)
  - Mapa Mundo

### Reglas RO vs BLOCKING
- HUD es **read-only**.
- No dispara FSM.
- Bajo EVENT:
  - HUD permanece visible
  - HUD queda **bloqueado** (sin interacción)

### Relación con CTA
- CTA flota sobre el HUD.
- HUD nunca tapa el CTA.

### Consistencia
- Misma altura, espaciado y jerarquía en:
  - GPS
  - Puerto
  - Viaje

### Z-index
EVENT > CTA > HUD > Menú

### Negativos explícitos
- ❌ El HUD no debe cambiar por estado sin FSM.
- ❌ El HUD no debe desaparecer salvo pantalla EVENT.

---

## 3️⃣ Menú Global (Hamburguesa)

### Descripción
Menú lateral global de navegación secundaria.
No es navegación FSM principal.

### Acciones
- GPS / Mundo real:
  - Cierre explícito de PROFILE
  - Retorno a estado GPS correspondiente
- Perfil:
  - Entrada explícita a PROFILE

### Reglas
- Se abre y cierra con el mismo botón hamburguesa.
- No tiene botón “X” separado.
- El texto “Menú” respeta el espacio del botón hamburguesa.

### Prioridad bajo EVENT
- Bajo EVENT:
  - ❌ No se abre
  - ❌ Si está abierto, se cierra

### Relación con CTA y HUD
- No solapa CTA
- No tapa HUD
- Z-index inferior a CTA

### Negativos explícitos
- ❌ El menú no debe disparar FSM directa.
- ❌ El menú no debe quedar accesible durante EVENT.

---

## 4️⃣ Overlays Read-Only (RO)

### Tipos
- Inventario
- Tripulación
- Mapa RPG
- Menú

### Reglas
- Exclusión mutua: solo uno a la vez.
- Apertura y cierre explícitos.
- No mutan FSM.

### Bajo EVENT
- ❌ No pueden abrirse
- ❌ Si están abiertos, se cierran

### Jerarquía visual
EVENT > CTA > HUD > Overlay RO > Pantalla base

### Negativos explícitos
- ❌ Overlays RO no deben coexistir.
- ❌ No deben bloquear FSM salvo EVENT.

---

## 5️⃣ Sistema visual base (Tokens mínimos)

### Colores base
- Fondo principal: claro (pantallas base)
- Fondo secundario: gris suave (cards, HUD)
- Texto primario: oscuro
- Texto secundario: gris medio
- Acento: color único (CTA y foco)

### Tipografía
- Font-family:
  - system-ui / sans-serif del sistema
- Weights:
  - Regular
  - Semibold (headers / CTA)

### Jerarquía textual
- Header: títulos de pantalla
- Subheader: estado FSM / contexto
- Texto base: contenido principal
- Hint / secundario: metadata, etiquetas

### Contraste y legibilidad
- Texto siempre legible sobre su fondo.
- CTA siempre destaca frente al HUD.

### Negativos explícitos
- ❌ No introducir nuevas fuentes.
- ❌ No usar colores fuera de los tokens definidos.
- ❌ No variar tamaños sin FSM o contrato visual.

---

## Estado CANON
Este sistema visual queda congelado como fuente única de verdad visual.
Cualquier implementación futura debe seguir este documento sin reinterpretar.
