/**
 * navigationFSM — CANON
 * Navegación secundaria (PROFILE)
 *
 * API pública preservada:
 * - NAV
 * - getState()
 * - subscribe()
 * - closeToIdle()
 *
 * Sprint 68:
 * - Cierre correcto de PROFILE
 * - Re-render correcto de pantalla base
 * - Solo wiring
 */

// ===============================
// Export histórico
// ===============================
export const NAV = {
  PROFILE: "PROFILE",
};

// ===============================
// Estado interno
// ===============================
let state = {
  profileOpen: false,
  previousFSMState: null,
};

// ===============================
// Observers
// ===============================
const listeners = new Set();

function notify() {
  const snapshot = navigationFSM.getState();
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {
      console.error("[navigationFSM] subscriber error", e);
    }
  });
}

// ===============================
// FSM pública
// ===============================
export const navigationFSM = {
  // -------- API HISTÓRICA --------
  getState() {
    return {
      profileOpen: state.profileOpen,
      previousFSMState: state.previousFSMState,
    };
  },

  subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);

    // Emitir estado inicial
    fn(this.getState());

    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Llamado históricamente por App.jsx / fsmController
   * NO decide FSM principal
   * SOLO garantiza que navegación secundaria quede cerrada
   */
  closeToIdle() {
    let changed = false;

    if (state.profileOpen) {
      state.profileOpen = false;
      changed = true;
    }

    if (changed) notify();
  },

  // -------- PROFILE --------
  openProfile(currentFSMState) {
    state.previousFSMState = currentFSMState ?? null;
    state.profileOpen = true;
    notify();
  },

  closeProfile() {
    if (!state.profileOpen) return;

    state.profileOpen = false;

    // 🔑 CLAVE: notificar SIEMPRE
    // para que App.jsx re-evalúe FSM principal
    notify();
  },

  // -------- OBSERVERS --------
  isProfileOpen() {
    return state.profileOpen === true;
  },

  getPreviousFSMState() {
    return state.previousFSMState;
  },
};
