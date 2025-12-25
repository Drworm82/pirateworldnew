Misiones — Contrato de datos CANON

Estado: CANON
Tipo: Contrato de datos (shape)
Alcance: Backend / UI / QA (referencial)
No incluye: SQL, RPC, lógica, FSM, UX, navegación
Dependencia: Alineado estrictamente con /canon/missions_contract.md (Sprint 75A)

1. Entidad Mission — Shape base

La entidad Mission representa una misión individual como objeto de datos declarativo.

Mission

Campos
Campo	Tipo	Nullable	Descripción
id	string	❌	Identificador único e inmutable de la misión.
type	enum mission_type	❌	Tipo funcional de la misión (ver §2).
state	enum mission_state	❌	Estado funcional actual (ver §3).
title	string	❌	Título declarativo de la misión.
description	string	✅	Descripción funcional. Puede ser null.
visibility	enum mission_visibility	❌	Regla declarativa de visibilidad (ver §4).
created_at	string (ISO-8601)	❌	Timestamp de creación.
updated_at	string (ISO-8601)	❌	Timestamp del último cambio de estado.
metadata	object	✅	Metadatos declarativos, no interpretados.
2. Enum mission_type (CANON)

Alineado con Sprint 75A.

mission_type =
  | "exploration"
  | "delivery"
  | "event"
  | "narrative"
  | "progression";


Reglas:

El tipo no altera el ciclo de vida.

El tipo no implica UI, EVENT ni FSM.

3. Enum mission_state (CANON)

Alineado con Sprint 75A.

mission_state =
  | "available"
  | "accepted"
  | "in_progress"
  | "completed"
  | "failed";


Reglas:

No existen estados fuera de esta lista.

No existen estados implícitos (ej. paused, hidden, expired).

4. Enum mission_visibility (declarativo)
mission_visibility =
  | "public"
  | "private";


Semántica:

public: puede mostrarse en superficies RO.

private: existe pero no se lista públicamente.

Nota: visibility no decide navegación ni bloqueo.

5. Nullability — reglas explícitas

Nunca null: id, type, state, title, visibility, created_at, updated_at.

Puede ser null: description, metadata.

No existen defaults implícitos fuera del backend.

6. Campos derivados — negativos explícitos

Los siguientes NO SON campos del contrato:

progress_percentage

time_remaining

reward_total

is_active

is_selected

is_visible (derivado de UI)

Prohibido:

Calcular derivados en frontend.

Inferir estado a partir de otros campos.

Añadir campos computados al objeto Mission.

7. Relación con otros sistemas (solo referencia)
PROFILE / HUD

Pueden mostrar: title, state, type.

No interpretan transiciones.

EVENT / FSM

No dependencia directa.

Observacional únicamente.

8. Versionado y compatibilidad

El contrato es forward-compatible.

Se permiten nuevos campos opcionales.

Se permiten nuevos valores de enum solo mediante sprint CANON.

Nunca eliminar ni cambiar semántica de campos existentes.

9. Ejemplos CANON
9.1 Ejemplo válido — misión de exploración
{
  "id": "mission_001",
  "type": "exploration",
  "state": "available",
  "title": "Explorar el Mar Interior",
  "description": "Descubre una nueva zona del mar.",
  "visibility": "public",
  "created_at": "2025-03-01T10:00:00Z",
  "updated_at": "2025-03-01T10:00:00Z",
  "metadata": {
    "zone": "inner_sea"
  }
}

9.2 Ejemplo válido — misión narrativa
{
  "id": "mission_014",
  "type": "narrative",
  "state": "in_progress",
  "title": "El origen de la bandera",
  "description": null,
  "visibility": "private",
  "created_at": "2025-03-02T09:30:00Z",
  "updated_at": "2025-03-05T18:20:00Z",
  "metadata": null
}

9.3 Ejemplo inválido — explicación
{
  "id": "mission_bad",
  "type": "combat",
  "state": "paused",
  "title": "Derrota enemigos",
  "visibility": "public",
  "created_at": "2025-03-01T10:00:00Z",
  "updated_at": "2025-03-01T10:00:00Z"
}


Inválido porque:

type: "combat" no existe en mission_type.

state: "paused" no existe en mission_state.

Falta alineación con Sprint 75A.

10. Garantías del contrato

Este contrato garantiza que:

Backend implemente sin interpretación.

UI renderice sin lógica derivada.

QA valide con criterios objetivos.

No se rompa FSM ni EVENT.