// src/fsm/fsmController.js

export const FSM = {
  S0: "FIRST_TIME_GPS",
  S1: "PORT_IDLE",
  S2: "PORT_TRAVEL",
  S3: "EVENT",
  S4: "GPS_NOMAD",
  S5: "PROFILE",
};

let state = {
  currentState: FSM.S0,
  previousState: null,
  mode: "idle", // 'idle' | 'travel'
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(getState());
  return () => listeners.delete(fn);
}

function emit() {
  const snapshot = getState();
  listeners.forEach((fn) => fn(snapshot));
}

function normalizeMode(nextState) {
  // Regla CANON: travel SOLO en PORT_TRAVEL
  if (nextState === FSM.S2) return "travel";
  return "idle";
}

function isOverlay(s) {
  return s === FSM.S3 || s === FSM.S5;
}

export function requestTransition(next) {
  const prev = state.currentState;

  // ── Entrar a overlay ─────────────────────────────────────
  if (isOverlay(next)) {
    state = {
      currentState: next,
      previousState: prev,          // CONSERVAR
      mode: state.mode,              // NO cambiar modo al abrir overlay
    };
    emit();
    return true;
  }

  // ── Salir de overlay (volver al previo) ──────────────────
  if (isOverlay(prev) && state.previousState) {
    const backTo = state.previousState;
    state = {
      currentState: backTo,
      previousState: null,           // LIMPIAR
      mode: normalizeMode(backTo),   // NORMALIZAR
    };
    emit();
    return true;
  }

  // ── Transiciones normales ─────────────────────────────────
  state = {
    currentState: next,
    previousState: null,
    mode: normalizeMode(next),
  };
  emit();
  return true;
}
