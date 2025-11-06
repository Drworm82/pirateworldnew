import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "./registerSW";
import Splash from "./Splash.jsx";
import UpdateToast from "./UpdateToast.jsx";

/**
 * Mejoras clave:
 * - Splash GRANDE y visible ~1.4s mínimo (SPLASH_MIN_MS).
 * - Desvanecido suave y responsivo.
 * - Mensaje de instalación dinámico; cambia a ✅ cuando se instala.
 * - Toast de actualización si hay nuevo SW.
 */

const SPLASH_MIN_MS = 1400;

function App() {
  const [splashHidden, setSplashHidden] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [installed, setInstalled] = useState(
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true
  );

  // Mostrar splash al menos SPLASH_MIN_MS
  useEffect(() => {
    const t = setTimeout(() => setSplashHidden(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  // SW update → mostrar toast
  useEffect(() => {
    window.__onSWUpdateReady?.(() => setShowUpdate(true));
  }, []);

  // Evento cuando el usuario instala la PWA
  useEffect(() => {
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const reloadNow = () => location.reload();

  // Mensaje adaptado
  const ua = navigator.userAgent.toLowerCase();
  let installHint = "";
  if (installed) {
    installHint = "✅ Aplicación instalada correctamente.";
  } else if (ua.includes("android")) {
    installHint =
      "En Android: abre el menú ⋮ en Chrome y elige “Agregar a la pantalla principal”.";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    installHint =
      "En iPhone/iPad: toca “Compartir” y selecciona “Añadir a pantalla de inicio”.";
  } else {
    installHint =
      "Desde tu navegador, selecciona “Instalar aplicación” o “Agregar a la pantalla principal”.";
  }

  return (
    <main
      className="safe"
      style={{
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        background: "#fafafa",
        color: "#0b132b",
        display: "grid",
        placeItems: "center",
        padding: "2rem"
      }}
    >
      <Splash hidden={splashHidden} />

      <div style={{ textAlign: "center", maxWidth: 560 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: ".5rem" }}>PirateWorld</h1>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Espéralo pronto…</p>

        <p
          id="install-hint"
          style={{
            color: installed ? "#008000" : "#444",
            fontSize: "0.95rem",
            background: "#f5f5f5",
            padding: "0.8rem 1rem",
            borderRadius: "10px",
            lineHeight: 1.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            display: "inline-block"
          }}
        >
          💡 <span>{installHint}</span>
        </p>
      </div>

      {showUpdate && (
        <div id="update-toast">
          <UpdateToast onReload={reloadNow} />
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
