import { registerSW } from "virtual:pwa-register";

// Fuerza que el nuevo SW tome control sin esperar
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Forzamos refresco para tomar el SW nuevo
    location.reload();
  },
  onOfflineReady() {
    console.log("PirateWorld PWA offline ready");
  }
});
