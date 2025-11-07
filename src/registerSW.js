// src/registerSW.js
// Registro del Service Worker con UX básica de actualización.

if ('serviceWorker' in navigator) {
  // En VitePWA con injectRegister:'auto' esto suele no ser necesario,
  // pero mantenerlo no hace daño y ayuda en algunos entornos.
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      // Auto-update cada vez que haya una nueva build
      setInterval(() => {
        reg.update().catch(() => {});
      }, 1000 * 60 * 30); // cada 30 min

      // Mensaje cuando hay actualización lista
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una versión nueva lista. Puedes mostrar un toast aquí si quieres.
            console.log('Nueva versión disponible. Recarga para actualizar.');
          }
        });
      });
    } catch (e) {
      console.warn('SW register failed', e);
    }
  });
}
