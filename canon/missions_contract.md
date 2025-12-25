Misiones — Contrato funcional CANON

Estado: CANON
Alcance: Funcional (semántico)
No incluye: UI, UX, backend, FSM, navegación, implementación
Propósito: Fijar la fuente de verdad funcional de Misiones para todos los sprints futuros.

1. Qué es una Misión

Una Misión es una unidad funcional de intención asignable a un jugador, diseñada para estructurar progreso, narrativa o actividad dentro del mundo de PirateWorld.

Una misión:

Existe independientemente de la UI.

Tiene identidad funcional propia.

Posee un ciclo de vida definido.

Puede producir consecuencias declarativas (recompensas, progreso, desbloqueos), pero no las ejecuta por sí misma.

2. Qué NO es una Misión (negativos explícitos)

Una misión NO ES:

Un botón, pantalla o flujo de navegación.

Un EVENT.

Una animación o secuencia UI.

Una acción inmediata del jugador.

Un cálculo en frontend.

Un temporizador autónomo.

Una misión NO HACE:

Escrituras directas.

Transiciones de FSM.

Decisiones de UI.

Bloqueos de EVENT.

Navegación entre pantallas.

3. Tipos de Misiones (CANON)

Los tipos definen intención funcional, no implementación.

3.1 Exploración

Objetivo: descubrir, alcanzar o visitar.

No implica combate ni entrega obligatoria.

3.2 Entrega

Objetivo: transportar o entregar algo.

Puede depender de inventario existente.

3.3 Evento

Objetivo: responder a una situación puntual.

Puede estar relacionado conceptualmente con EVENT, pero no lo controla.

3.4 Narrativa

Objetivo: avanzar historia o lore.

Puede no tener acción mecánica directa.

3.5 Progresión

Objetivo: alcanzar un estado (nivel, reputación, hitos).

No ejecuta cálculos; solo declara condiciones.

Regla CANON:
El tipo de misión no cambia su ciclo de vida funcional.

4. Estados funcionales de una Misión

Los estados describen situación funcional, no UI.

Estados permitidos

DISPONIBLE
La misión existe y puede ser aceptada.

ACEPTADA
El jugador ha aceptado la misión.

EN_PROGRESO
El jugador cumple condiciones activas.

COMPLETADA
Las condiciones se cumplieron.

FALLIDA
La misión ya no puede completarse.

Estados NO permitidos (negativos)

Pausada

Cancelada

Oculta

Expirada automática

Reintentable implícita

Si un estado no está aquí, no existe.

5. Transiciones funcionales permitidas

Las transiciones son conceptuales, no técnicas.

Transiciones válidas

DISPONIBLE → ACEPTADA

ACEPTADA → EN_PROGRESO

EN_PROGRESO → COMPLETADA

EN_PROGRESO → FALLIDA

Transiciones NO permitidas (negativos)

DISPONIBLE → COMPLETADA

COMPLETADA → cualquier otro estado

FALLIDA → cualquier otro estado

ACEPTADA → DISPONIBLE

Cualquier transición automática sin condición declarada

6. Relación con otros sistemas
6.1 FSM principal

La misión no modifica FSM.

FSM no depende de una misión.

La relación es observacional.

6.2 EVENT

EVENT puede coexistir con misiones.

EVENT puede bloquear UI, no estados de misión.

Una misión no abre ni cierra EVENT.

6.3 PROFILE / HUD

PROFILE y HUD pueden mostrar estado de misión.

Nunca deciden transiciones.

Nunca ejecutan efectos.

7. Reglas CANON críticas

Las misiones son declarativas.

La UI no decide estados de misión.

No hay lógica implícita.

No hay efectos secundarios automáticos.

No existe “misión activa” global fuera de su estado funcional.

8. Garantías del contrato

Este contrato garantiza que:

UX puede diseñar sin ambigüedad.

Backend puede implementarse sin reinterpretar intención.

FSM y EVENT permanecen intactos.

No existe dependencia circular con UI.

9. Alcance congelado

Cualquier cambio a:

estados,

transiciones,

tipos,

negativos,

requiere nuevo sprint CANON explícito.

✅ Confirmación del Worker 75A-DOC

Documento doc-only

Sin código

Sin backend

Sin FSM

Sin UX

Lenguaje declarativo

Negativos explícitos incluidos

Congelable como CANON