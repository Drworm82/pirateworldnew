// src/main.jsx
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Splash from "./Splash";
import "./registerSW";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // ---- PWA install UX ----
  const deferred = useRef(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    const onBIP = (e) => {
      e.preventDefault();
      deferred.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferred.current) return alert("Si no aparece el diálogo: menú ⋮ → Instalar aplicación.");
    deferred.current.prompt();
    const { outcome } = await deferred.current.userChoice;
    deferred.current = null;
    if (outcome === "accepted") setInstalled(true);
    setCanInstall(false);
  }

  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}

      {/* capa app */}
      <main className={`app-shell ${showSplash ? "blurred" : ""}`}>
        {/* fondo tipo mapa con rejilla y olas muy sutiles */}
        <div className="bg-grid">
          <div className="bg-wave a" />
          <div className="bg-wave b" />
        </div>

        <section className="hero">
          <h1>PirateWorld</h1>
          <p>Espéralo pronto…</p>

          {!isStandalone && canInstall && (
            <button className="btn" onClick={handleInstall}>
              ⤓ Instalar aplicación
            </button>
          )}

          {!isStandalone && installed && (
            <div className="hint ok">✅ Aplicación instalada correctamente.</div>
          )}
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
