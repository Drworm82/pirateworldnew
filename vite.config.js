// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Nota importante:
// - Usamos manifest: false para respetar el archivo /public/manifest.webmanifest que ya creaste.
// - El plugin generará/inyectará el Service Worker, y auto-registrará en producción.

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',         // inyecta el register (no necesitas tocar index.html)
      manifest: false,                // respeta /public/manifest.webmanifest
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'icons/pw-192.png',
        'icons/pw-192-maskable.png',
        'icons/pw-512.png',
        'icons/pw-512-maskable.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
      },
      // Si quieres poder ver el SW en "npm run dev" para pruebas locales:
      // devOptions: { enabled: true }
    })
  ],
  server: {
    port: 5173,
    host: true,
  }
});
