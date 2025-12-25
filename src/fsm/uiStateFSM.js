// src/fsm/uiStateFSM.js
// FSM secundaria — Estados UI (CANON)

export const UI_STATE = {
  LOADING: "LOADING",
  READY: "READY",
  EMPTY: "EMPTY",
  ERROR: "ERROR",
};

export function resolveUIState({ loading, error, data, isEmpty }) {
  if (loading) return UI_STATE.LOADING;
  if (error) return UI_STATE.ERROR;
  if (isEmpty) return UI_STATE.EMPTY;
  return UI_STATE.READY;
}
