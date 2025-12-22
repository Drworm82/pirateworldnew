# CANON — UI Canonical Files

## Principio
La UI trabajada existente de PirateWorld es la fuente de verdad visual.
No se reemplaza ni se reescribe. La lógica se adapta a la UI.

---

## Navegación (INTOCABLE)
src/navigation/
- TopBar.jsx
- BottomNav.jsx (si existe)

Define navegación, estado activo y jerarquía principal.

---

## Layout General (INTOCABLE)
- src/AppBase44.jsx

Controla estructura, fondo, spacing, cards y tipografía base.

---

## Páginas Canónicas (UI TRABAJADA)
Estas páginas definen estilo, ritmo y experiencia visual.
No se reescriben ni se simplifican.

- src/pages/UserDemo.jsx
- src/pages/Tienda.jsx
- src/pages/Inventory.jsx
- src/pages/MapaMundo.jsx
- src/pages/Misiones.jsx
- src/pages/Perfil.jsx
- src/pages/Explore.jsx
- src/pages/Tripulacion.jsx
- src/pages/Leaderboard.jsx
- src/pages/Ledger.jsx

---

## Páginas Observables
Estas páginas pueden ajustarse funcionalmente,
pero deben respetar el layout canónico.

- src/pages/GPS.jsx
- src/pages/Zarpar.jsx
- src/pages/Viaje.jsx

---

## Reglas para Workers Frontend
- ❌ Prohibido reemplazar JSX de archivos canónicos
- ❌ Prohibido cambiar estilos base
- ✅ Solo se permite conectar datos o corregir bugs
- ❓ Cualquier duda requiere validación CANON
