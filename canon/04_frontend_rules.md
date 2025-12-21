📄 canon/04_frontend_rules.md — CONTENIDO CANÓNICO

Copia tal cual este contenido en el archivo indicado.

Frontend Rules — PirateWorld
Rama de referencia

dev-v2

1. Principio general

El frontend es observer-first.

El backend es source of truth.

El frontend NO decide estado de juego.

El frontend NO escribe tablas.

Toda mutación ocurre vía RPCs canónicas.

2. Prohibiciones absolutas

El frontend NO puede:

❌ Consultar tablas directamente (REST o SQL).

❌ Calcular progreso de viaje.

❌ Decidir estados (traveling, arrived, etc.).

❌ Crear lógica paralela al backend.

❌ Simular resultados.

❌ Versionar RPCs por su cuenta.

❌ Introducir estados no definidos en CANON.

3. Regla de llamadas

El frontend solo llama RPCs públicas y canónicas.

El frontend no conoce versiones internas (_v4, _v5, etc.).

El frontend consume contratos, no implementación.

Ejemplo válido:

ship_get_state(...)

Ejemplo prohibido:

select * from ship_state

ship_travel_tick_v5(...)

4. Observer-only files (NO DECIDEN LÓGICA)

Los siguientes archivos solo observan estado y renderizan UI:

src/pages/Viaje.jsx
src/pages/Zarpar.jsx
src/pages/Ship.jsx
src/pages/Explore.jsx


Regla:

No contienen timers de progreso

No calculan ETA

No mutan estado de viaje

No “corrigen” backend

5. API Layer (único punto de acceso)

Toda comunicación con backend pasa por:

src/lib/supaApi.js


Reglas:

Ningún componente llama Supabase directo

Ningún componente importa supabaseClient

El API layer expone funciones semánticas, no SQL

6. Realtime

Realtime solo escucha cambios del backend.

Realtime no activa lógica de juego.

Realtime no corrige estado.

Uso permitido:

actualizar UI

mostrar progreso

refrescar vistas

7. Estados permitidos en frontend

El frontend solo puede representar estos estados canónicos:

idle
traveling
arrived


Cualquier estado nuevo requiere:

Documento CANON

Sprint dedicado

Commit explícito

8. Navegación

El frontend navega en respuesta a estado, no a intención.

No se navega “porque el usuario cree que llegó”.

Se navega cuando backend confirma.

9. Regla de cambios

Cualquier cambio a estas reglas requiere:

Actualizar CANON

Cerrar sprint previo

Crear sprint nuevo

Rama feat/*

Estado del documento:
✅ Congelado
❌ No modificable sin proceso formal