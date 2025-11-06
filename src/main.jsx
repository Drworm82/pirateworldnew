import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "./registerSW";
import Splash from "./Splash.jsx";
import UpdateToast from "./UpdateToast.jsx";

const SPLASH_MIN_MS = 1400;

function App() {
  const [splashHidden, setSplashHidden] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [installed, setInstalled] = useState(
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );

  useEffect(() => {
    const t = setTimeout(() => setSplashHidden(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { window.__onSWUpdateReady?.(() => setShowUpdate(true)); }, []);
  useEffect(() => {
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const reloadNow = () => location.reload();

  const ua = navigator.userAgent.toLowerCase();
  const installHint = installed
    ? "✅ Aplicación instalada correctamente."
    : ua.includes("android")
      ? "En Android: abre el menú ⋮ en Chrome y elige “Agregar a la pantalla principal”."
      : (ua.includes("iphone") || ua.includes("ipad"))
        ? "En iPhone/iPad: toca “Compartir” y selecciona “Añadir a pantalla de inicio”."
        : "Desde tu navegador, selecciona “Instalar aplicación” o “Agregar a la pantalla principal”.";

  return (
    <>
      {/* FONDO ANIMADO DE LA APP (cielo + nubes + gaviota + mar) */}
      <div className="app-bg" aria-hidden="true">
        <div className="sky-main"></div>

        <div className="clouds-main">
          <div className="layer back"></div>
          <div className="layer front"></div>
        </div>

        {/* gaviota lejana cruzando el cielo */}
        <svg className="gull-main" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
          <path d="M52 33c4 2 9 2 12 0 2-2 4-4 6-4 3 0 4 3 1 5-5 5-14 7-21 4-2-1-1-4 2-5z" fill="#f1f5f9"/>
          <path d="M52 32c-12-8-20-10-32-12 16 0 28 3 37 10l-5 2z" fill="#e2e8f0"/>
          <path d="M64 32c12-8 20-10 32-12-16 0-28 3-37 10l5 2z" fill="#e2e8f0"/>
          <circle cx="66" cy="31" r="1.1" fill="#0b132b"/>
          <path d="M69 31l5 1-5 1z" fill="#fbbf24"/>
        </svg>

        <div className="sea-main">
          <div className="layer back"></div>
          <div className="layer front"></div>
        </div>
      </div>

      {/* CONTENIDO */}
      <main
        className="safe"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          textAlign: "center"
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
              background: "rgba(255,255,255,.85)",
              padding: "0.8rem 1rem",
              borderRadius: "10px",
              lineHeight: 1.5,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              display: "inline-block",
              backdropFilter: "blur(4px)"
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
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
