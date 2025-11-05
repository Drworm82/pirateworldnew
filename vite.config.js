import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "PirateWorld",
        short_name: "PirateWorld",
        description: "Juego geolocalizado pirata (demo web)",
        start_url: "/?v=2025-11-05-02",
        scope: "/",
        display: "standalone",
        background_color: "#0b132b",
        theme_color: "#0b132b",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        clientsClaim: true,   // SW nuevo toma control al instante
        skipWaiting: true     // no espera cierre de pestañas
      }
    })
  ],
  server: { port: 5173 }
});
