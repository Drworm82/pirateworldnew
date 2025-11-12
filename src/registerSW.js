// src/registerSW.js

// Solo importa el PWA en producción
if (import.meta.env.MODE === "production") {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        console.log("🔁 Nueva versión disponible. Refresca la app.");
      },
      onOfflineReady() {
        console.log("✅ Aplicación lista para modo offline.");
      },
    });
  });
} else {
  console.log("🧩 PWA deshabilitado en desarrollo.");
}
