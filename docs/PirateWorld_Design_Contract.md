📘 PirateWorld — Design Contract (v1.0)
1. Propósito del documento

Este documento define las reglas inmutables del diseño de PirateWorld.
Cualquier implementación debe respetarlo.

2. Identidad del juego

PirateWorld es un juego de exploración marítima persistente

El tiempo avanza en backend

El jugador decide antes, no durante el viaje

El riesgo es parte central del diseño

3. Core Loop (Punto de verdad)
IDLE
  ↓
Elegir destino (isla conocida o coordenadas)
  ↓
Preview: distancia / riesgo / costo
  ↓
Confirmar viaje
  ↓
TRAVELING (backend autónomo)
  ↓
Eventos / desgaste / riesgo
  ↓
ARRIVED o FAILED
  ↓
IDLE


❗ El frontend NO controla el tiempo
❗ El backend NO pregunta al frontend

4. Estados del barco (canónicos)
Estado	Descripción
idle	En puerto, puede decidir
traveling	Viaje activo, tiempo real
arrived	Viaje completado
stopped	Viaje detenido manualmente
failed	Exploración fallida
disabled	Barco dañado
sunk	Barco hundido (futuro)

⚠️ No se inventan estados fuera de esta lista.

5. Reglas de viaje (contrato)

El viaje continúa aunque el jugador cierre la app

La distancia afecta:

duración

riesgo

desgaste

Detener un viaje:

no castiga extra

conserva desgaste acumulado

Islas desconocidas pueden fallar

El backend es la autoridad final

6. Lo que el frontend PUEDE hacer

Mostrar preview

Mostrar progreso

Reaccionar a eventos

Reproducir feedback visual/sonoro

7. Lo que el frontend NO puede hacer

Avanzar el tiempo

Alterar resultados

Decidir eventos

“Simular” viajes

8. Reglas para workers (obligatorias)

❌ No cambiar el core loop

❌ No eliminar riesgo

❌ No simplificar decisiones

✅ Profundizar sistemas existentes

✅ Preguntar antes de modificar el contrato

9. Cambios al contrato

Cualquier cambio:

se discute

se escribe

se versiona

Ejemplo:

Design Contract v1.1
- Se agrega estado "disabled"

4️⃣ Cómo usar esto con workers (tal cual)

Cuando abras otro chat o uses OpenCode, pega esto:

“Este proyecto se rige por docs/PirateWorld_Design_Contract.md.
No rompas el core loop ni los estados.
Implementa únicamente lo permitido.”

Eso evita el cagadero que viviste.

5️⃣ Próximo paso inmediato (uno solo)

👉 Crear el archivo:

docs/PirateWorld_Design_Contract.md


👉 Pegar el contenido
👉 Commit con mensaje:

docs: add PirateWorld design contract (single source of truth)