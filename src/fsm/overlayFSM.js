/**
 * overlayFSM — FSM Secundaria de Overlays RO (CANON)
 * 
 * Control exclusivo de overlays read-only:
 * - Inventario
 * - Tripulación  
 * - Mapa
 * - Misiones
 * - Eventos (bloqueante)
 *
 * API pública:
 * - OVERLAY (constants)
 * - getState()
 * - subscribe()
 * - open(overlayType)
 * - close()
 * - isEventActive()
 */

// ===============================
// Export constants (OVERLAY)
// ===============================
export const OVERLAY = {
  CLOSED: "CLOSED",
  INVENTORY: "OPEN_INVENTORY",
  CREW: "OPEN_CREW", 
  MAP_RPG: "OPEN_MAP",
  MISSIONS: "OPEN_MISSIONS",
  EVENT: "OPEN_EVENT",
};

// ===============================
// Estado interno
// ===============================
let state = {
  current: OVERLAY.CLOSED,
  previous: null,
};

// ===============================
// Observers
// ===============================
const listeners = new Set();

function notify() {
  const snapshot = overlayFSM.getState();
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {
      console.error("[overlayFSM] subscriber error", e);
    }
  });
}

// ===============================
// FSM pública
// ===============================
export const overlayFSM = {
  // -------- API BÁSICA --------
  getState() {
    return {
      current: state.current,
      previous: state.previous,
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

  // -------- CONTROL DE OVERLAYS --------
  
  /**
   * Abre un overlay específico
   * - Cierra cualquier overlay abierto previamente (mutua exclusión)
   * - Verifica bloqueo por EVENT
   */
  open(overlayType) {
    // Validar que sea un overlay válido
    if (!Object.values(OVERLAY).includes(overlayType)) {
      console.error(`[overlayFSM] Invalid overlay type: ${overlayType}`);
      return;
    }

    // EVENT es especial - manejado por openEvent()
    if (overlayType === OVERLAY.EVENT) {
      return this.openEvent();
    }

    // No abrir overlays si ya está en CLOSED (ya está cerrado)
    if (state.current === OVERLAY.CLOSED && overlayType === OVERLAY.CLOSED) {
      return;
    }

    // Si el mismo overlay ya está abierto, no hacer nada
    if (state.current === overlayType) {
      return;
    }

    // Actualizar estado con mutua exclusión
    state.previous = state.current;
    state.current = overlayType;
    notify();
  },

  /**
   * Cierra el overlay actual
   */
  close() {
    if (state.current === OVERLAY.CLOSED) return;

    state.previous = state.current;
    state.current = OVERLAY.CLOSED;
    notify();
  },

  /**
   * Manejo especial de EVENT (bloqueante)
   * - Cierra cualquier overlay abierto
   * - Bloquea apertura de otros overlays
   */
  openEvent() {
    if (state.current === OVERLAY.EVENT) return;

    state.previous = state.current;
    state.current = OVERLAY.EVENT;
    notify();
  },

  closeEvent() {
    if (state.current !== OVERLAY.EVENT) return;

    state.previous = state.current;
    state.current = OVERLAY.CLOSED;
    notify();
  },

  // -------- OBSERVERS --------
  isEventActive() {
    return state.current === OVERLAY.EVENT;
  },

  isOverlayOpen(overlayType) {
    return state.current === overlayType;
  },

  isOpen() {
    return state.current !== OVERLAY.CLOSED;
  },

  getCurrent() {
    return state.current;
  },

  // -------- UTILIDADES --------
  
  /**
   * Cierra todos los overlays (usado por fsmController cuando entra a EVENT)
   */
  closeAll() {
    if (state.current === OVERLAY.CLOSED) return;

    state.previous = state.current;
    state.current = OVERLAY.CLOSED;
    notify();
  },

  /**
   * Verifica si se puede abrir overlays (no está en EVENT)
   */
  canOpenOverlays() {
    return state.current !== OVERLAY.EVENT;
  },
};

// ===============================
// Compatibilidad con código existente
// ===============================
// Para compatibilidad con código que usa overlayFSM.current directamente
Object.defineProperty(overlayFSM, 'current', {
  get() {
    return state.current;
  },
  enumerable: true,
  configurable: false
});