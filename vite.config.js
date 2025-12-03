import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "PirateWorld",
        short_name: "PirateWorld",
        description: "Juego geolocalizado pirata (demo web)",

        // 🔥 Browser Router, no hash router
        start_url: "/",
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
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  server: {
    port: 5173,
    hmr: { overlay: false }
  },
  preview: { port: 5173 }
});
