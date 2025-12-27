// uiStateFSM.js
// Helpers para manejar estados de UI (loading, error, empty, ready)
// Garantiza consistencia en HUD y Profile.

export const UI_STATES = {
  LOADING: 'LOADING',
  ERROR: 'ERROR',
  EMPTY: 'EMPTY',
  READY: 'READY',
};

// Helper simple para determinar estado basado en datos
export function deriveUiState(data, error, isLoading) {
  if (isLoading) return UI_STATES.LOADING;
  if (error) return UI_STATES.ERROR;
  if (!data || (Array.isArray(data) && data.length === 0)) return UI_STATES.EMPTY;
  return UI_STATES.READY;
}

// Clase opcional si se requiere manejo más complejo, pero el helper suele bastar para "Observer-only"
// donde el componente recibe props y calcula su estado visual.
