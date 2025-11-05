import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "./registerSW";
import Splash from "./Splash.jsx";
import UpdateToast from "./UpdateToast.jsx";

// Detectar si está en modo standalone (instalada)
const isStandalone =
  (window.matchMedia?.("(display-mode: standalone)")?.matches) ||
  (window.navigator.standalone === true);

function App() {
  const [splashHidden, setSplashHidden] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  // Ocultar splash después de breve retardo
  useEffect(() => {
    const t = setTimeout(() => setSplashHidden(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Escuchar si hay actualización lista
  useEffect(() => {
    window.__onSWUpdateReady?.(() => setShowUpdate(true));
  }, []);

  const reloadNow = () => location.reload();

  return (
    <main className="safe" style={{ fontFamily: "system-ui, sans-serif" }}>
      <Splash hidden={splashHidden} />

      <h1 style={{ marginTop: 0 }}>PirateWorld</h1>
      <p>Espéralo pronto..</p>

      {!isStandalone && (
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Para instalar: menú ⋮ en Chrome → <b>Instalar aplicación</b>.
        </p>
      )}

      {showUpdate && (
        <div id="update-toast">
          <UpdateToast onReload={reloadNow} />
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
