import { registerSW } from "virtual:pwa-register";

/**
 * Expone un callback global para cuando haya una actualización lista.
 * main.jsx escucha con: window.__onSWUpdateReady(cb)
 */
let updateCb = null;
window.__onSWUpdateReady = (cb) => { updateCb = cb; };

// Registro del SW con modo auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Hay un SW nuevo esperando → avisamos a la UI
    if (typeof updateCb === "function") updateCb();
  },
  onOfflineReady() {
    // Primer cache listo para offline
    console.log("PirateWorld PWA offline ready");
  }
});
