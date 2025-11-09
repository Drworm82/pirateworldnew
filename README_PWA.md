# PWA Setup (PirateWorld)

Este paquete añade soporte PWA (installable) via `vite-plugin-pwa`.

## Pasos
1. `npm install -D vite-plugin-pwa @vitejs/plugin-react`
2. Importa el registro en `src/main.jsx`:
   ```js
   import "./registerSW";
   ```
3. Ejecuta `npm run build` y despliega en Vercel.
4. En Android (Chrome) deberías ver **Instalar app**; en iOS usa **Compartir → Agregar a la pantalla de inicio**.
