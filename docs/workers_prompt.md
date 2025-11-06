🎯 PROMPT OFICIAL PARA WORKERS DE “PIRATEWORLD”

Importante: Este proyecto ya está estructurado (frontend, backend, economía, mecánicas) bajo Vite + React + PWA + Supabase + Vercel.
Tu trabajo consiste en entregar módulos listos para integrar en ramas temáticas específicas, sin romper configuración ni dependencias.

🧭 CONTEXTO DEL PROYECTO

Framework: Vite + React

Base de datos y API: Supabase (via RPC)

Deploy: Vercel

PWA lista (Service Worker y manifest configurados)

Ramas de trabajo:

feature-frontend

feature-backend

feature-economy

feature-mechanics

🧱 REGLAS DE ARQUITECTURA
✅ PUEDES EDITAR:

src/** → código React (componentes, hooks, páginas, utils)

src/lib/** → funciones auxiliares (usa supaApi.js como base)

public/** → assets (íconos, imágenes, CSS global)

⚠️ CONSULTAR ANTES:

vite.config.js

package.json / package-lock.json

vercel.json

public/manifest.webmanifest

.env, .env.local

Archivos relacionados con registerSW, serviceWorker, o PWA

.devcontainer/**, .github/**

Si necesitas cambiar algo de esas zonas, explícalo en una sección separada llamada “Cambios de configuración”, con justificación técnica.

🧩 FORMATO DE ENTREGA

Resumen breve (1–2 frases)
Explica qué hace tu módulo o qué corrige.

Lista de archivos creados/modificados con ruta exacta
Ejemplo:

src/pages/MapView.jsx (NUEVO)
src/lib/supaApi.js (MODIFICADO)


Código completo de cada archivo (sin omisiones)

Usa jsx o js según corresponda.

No uses “...” ni pseudo-código.

Incluye imports/export y comentarios si ayudan.

Notas de prueba (cómo verificarlo)
Ejemplo:

1) Ejecutar npm run dev
2) Abrir http://localhost:5173/#/map
3) Ver que las parcelas se dibujan con coordenadas correctas.


Requisitos Supabase (si aplica)
Si tu código usa RPC o tablas, incluye:

Tablas: parcels, users
RPCs: ensure_user(), get_user_parcels()

🧾 CHECKLIST ANTES DE ENTREGAR

 Compila con npm run dev sin errores ni warnings críticos.

 No añadí dependencias nuevas sin avisar.

 No toqué archivos de configuración.

 Todo mi código está en src/** o public/**.

 Probé mi módulo localmente.

 Puedo indicar en qué rama irá mi commit.

🪣 RAMA OBJETIVO

Indica una de las siguientes:

feature-frontend
feature-backend
feature-economy
feature-mechanics

💬 EJEMPLO DE RESPUESTA CORRECTA

Resumen
Implemento la pantalla de mapa con las parcelas del usuario y botones de compra.

Archivos

src/pages/MapView.jsx (NUEVO)
src/lib/parcelsApi.js (NUEVO)


Código – src/pages/MapView.jsx

import { useEffect, useState } from "react";
import { getUserParcels } from "../lib/parcelsApi";

export default function MapView() {
  const [parcels, setParcels] = useState([]);
  useEffect(() => {
    getUserParcels().then(setParcels);
  }, []);
  return (
    <main>
      <h1>Mapa Pirata</h1>
      {parcels.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </main>
  );
}


Código – src/lib/parcelsApi.js

import { getClient } from "./supaApi";

export async function getUserParcels() {
  const supabase = getClient();
  const { data, error } = await supabase.from("parcels").select("*");
  if (error) throw error;
  return data;
}


Notas de prueba

npm run dev

Visitar /#/map

Ver parcelas cargadas desde Supabase.

⚓ COMANDOS QUE USARÁS
Crear y moverte a tu rama
git checkout -b feature-frontend

Agregar y subir tus cambios
git add .
git commit -m "FE: pantalla de mapa interactivo"
git push -u origin feature-frontend

Actualizar rama principal cuando esté aprobado
git checkout feature-pwa-setup
git merge feature-frontend
git push

🚀 DEPLOY (solo para pruebas)
vercel --yes          # preview (para revisión)
vercel --prod --yes   # producción (una vez aprobado)