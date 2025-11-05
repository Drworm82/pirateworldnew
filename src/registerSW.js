import { registerSW } from "virtual:pwa-register";

/**
 * Expone un callback para cuando haya update:
 * window.__onSWUpdateReady(() => { ... })
 */
let updateCb = null;
window.__onSWUpdateReady = (cb) => { updateCb = cb; };

registerSW({
  immediate: true,
  onNeedRefresh() {
    // SW nuevo esperando → avisamos a UI
    if (typeof updateCb === "function") updateCb();
  },
  onOfflineReady() {
    console.log("PirateWorld PWA offline ready");
  }
});
