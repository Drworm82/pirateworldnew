// Registro del Service Worker (vite-plugin-pwa)
// Opción 1: registro automático por configuración (autoUpdate).
// Opción 2: usar el helper virtual para controlar eventos:
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    // Aquí podrías mostrar un botón para refrescar.
    // Por ahora, recargamos automáticamente:
    location.reload();
  },
  onOfflineReady() {
    // App lista para funcionar offline.
    console.log("PirateWorld PWA offline ready");
  }
});
