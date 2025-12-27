// overlayFSM.js
// Responsabilidad: Manejar qué overlay se muestra encima de la pantalla.
// Mutua exclusión: Solo un overlay a la vez.

const OVERLAYS = {
  NONE: 'NONE',
  INVENTORY: 'INVENTORY', // Read-Only
  CREW: 'CREW',           // Read-Only
  MAP_RPG: 'MAP_RPG',     // Read-Only
  MENU: 'MENU',           // Read-Only
  EVENT: 'EVENT',         // BLOCKING (Overlay especial para eventos si se prefiere overlay a pantalla completa)
};

class OverlayFSM {
  constructor() {
    this.state = OVERLAYS.NONE;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  open(overlayName) {
    if (!OVERLAYS[overlayName]) {
      console.error(`[OverlayFSM] Invalid overlay: ${overlayName}`);
      return;
    }
    this._transitionTo(overlayName);
  }

  close() {
    this._transitionTo(OVERLAYS.NONE);
  }

  toggle(overlayName) {
    if (this.state === overlayName) {
      this.close();
    } else {
      this.open(overlayName);
    }
  }

  _transitionTo(newState) {
    if (this.state === newState) return;
    console.log(`[OverlayFSM] ${this.state} -> ${newState}`);
    this.state = newState;
    this._notify();
  }

  _notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const overlayFSM = new OverlayFSM();
export const OVERLAY_TYPES = OVERLAYS;
