Misiones — Contrato de backend CANON (Read-Only)

Estado: CANON
Tipo: Contrato de backend (RPCs RO)
Alcance: Backend / Frontend / QA (referencial)
No incluye: SQL, código, FSM, UX, navegación
Dependencias:

/canon/missions_contract.md (75A)

/canon/missions_data_contract.md (76A)

1. Principios CANON

Read-only estricto: ninguna RPC escribe, muta ni dispara side-effects.

Identidad: auth.uid() es la única fuente de identidad (conceptual).

Shape: todas las respuestas usan exactamente la entidad Mission definida en 76A.

Determinismo: mismas entradas → mismas salidas (ordenamiento incluido).

Observacional: no interactúa con FSM, EVENT ni navegación.

2. RPCs CANON permitidas
2.1 rpc_get_missions_list

Propósito
Devuelve una lista paginada de misiones visibles para el usuario.

NO resuelve

No acepta, completa ni falla misiones.

No decide visibilidad UI.

No deriva campos.

Firma (declarativa)
rpc_get_missions_list(
  p_state?: mission_state,
  p_type?: mission_type,
  p_limit?: number,
  p_offset?: number,
  p_order_by?: "created_at" | "updated_at"
) → Mission[]

Parámetros
Parámetro	Tipo	Opcional	Descripción
p_state	mission_state	✅	Filtra por estado funcional.
p_type	mission_type	✅	Filtra por tipo funcional.
p_limit	number	✅	Tamaño de página.
p_offset	number	✅	Offset de paginación.
p_order_by	enum	✅	Campo de ordenamiento.
Paginación

Modelo: limit / offset (declarativo).

Default CANON: limit = 20, offset = 0.

Límites: no declarados aquí (implementación futura).

Ordenamiento

Campos permitidos: created_at, updated_at.

Default CANON: created_at DESC.

Prohibido ordenar por: state, type, title, campos derivados o metadata.

Respuesta

Lista de Mission[].

Puede ser lista vacía (válido).

2.2 rpc_get_mission_by_id

Propósito
Devuelve una misión específica por id.

NO resuelve

No cambia estado.

No valida progresos.

No dispara EVENT.

Firma (declarativa)
rpc_get_mission_by_id(
  p_mission_id: string
) → Mission | null

Parámetros
Parámetro	Tipo	Opcional	Descripción
p_mission_id	string	❌	Identificador único de misión.
Respuesta

Mission si existe y es visible.

null si no existe o no es accesible.

3. Filtros CANON
Por estado (mission_state)

Valores permitidos: exactamente los definidos en 75A / 76A.

No se permiten combinaciones implícitas (ej. “active”).

Por tipo (mission_type)

Valores permitidos: exactamente los definidos en 75A / 76A.

Prohibido

Filtros por metadata.

Filtros por texto libre.

Filtros por campos derivados.

4. Errores y vacíos (comportamiento declarativo)
Listas vacías

Devuelve [].

No es error.

Misión inexistente

rpc_get_mission_by_id devuelve null.

No lanza error.

Autorización

Si el usuario no está autorizado conceptualmente:

Lista: [].

Por id: null.

No se define manejo de errores técnicos (fuera de alcance).

5. Seguridad (declarativa)

Todas las RPCs usan identidad implícita (auth.uid()).

Read-only: no existen efectos secundarios.

No se expone PII.

No se consulta ni deriva desde otros sistemas.

6. Ejemplos CANON
6.1 Request válido — lista filtrada
{
  "rpc": "rpc_get_missions_list",
  "params": {
    "p_state": "available",
    "p_limit": 10,
    "p_offset": 0,
    "p_order_by": "created_at"
  }
}


Response

[
  {
    "id": "mission_001",
    "type": "exploration",
    "state": "available",
    "title": "Explorar el Mar Interior",
    "description": "Descubre una nueva zona del mar.",
    "visibility": "public",
    "created_at": "2025-03-01T10:00:00Z",
    "updated_at": "2025-03-01T10:00:00Z",
    "metadata": null
  }
]

6.2 Request válido — misión por id
{
  "rpc": "rpc_get_mission_by_id",
  "params": {
    "p_mission_id": "mission_014"
  }
}


Response

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

6.3 Ejemplo inválido — explicación
{
  "rpc": "rpc_get_missions_list",
  "params": {
    "p_order_by": "state"
  }
}


Inválido porque:

state no es un campo permitido para ordenamiento.

Viola reglas CANON (§2.1).

7. Negativos explícitos (críticos)
RPCs prohibidas

rpc_create_mission

rpc_update_mission

rpc_accept_mission

rpc_complete_mission

Cualquier RPC con efectos secundarios.

Lógica prohibida en backend

Cálculo de progreso.

Cambios automáticos de estado.

Disparar EVENT.

Derivar campos no definidos en 76A.

8. Garantías del contrato

Este contrato garantiza que:

Backend implemente sin interpretación.

Frontend consuma sin lógica derivada.

QA valide con criterios objetivos.

No se rompa FSM, EVENT, HUD ni PROFILE.

✅ Confirmación del Worker 77B-DOC

Documento doc-only

RPCs read-only claramente definidas

Firmas completas y nullability explícita

Filtros, paginación y ordenamiento declarativos

Ejemplos válidos e inválidos incluidos

Negativos claros y exhaustivos

Sin impacto en FSM, UI ni backend