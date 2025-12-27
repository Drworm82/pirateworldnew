// src/controllers/overlayFSM.js

export const OVERLAY_TYPES = {
  NONE: "NONE",
  MENU: "MENU",
  INVENTORY: "INVENTORY",
  MAP_RPG: "MAP_RPG",
  CREW: "CREW",
  PROFILE: "PROFILE",
  EVENT: "EVENT",
};

class OverlayFSM {
  constructor() {
    this.state = OVERLAY_TYPES.NONE;
    this.subscribers = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  notify() {
    this.subscribers.forEach((fn) => fn(this.state));
  }

  open(type) {
    if (this.state === type) return;
    this.state = type;
    this.notify();
  }

  close() {
    if (this.state === OVERLAY_TYPES.NONE) return;
    this.state = OVERLAY_TYPES.NONE;
    this.notify();
  }

  toggle(type) {
    if (this.state === type) {
      this.close();
    } else {
      this.open(type);
    }
  }
}

export const overlayFSM = new OverlayFSM();
