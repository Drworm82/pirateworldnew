// src/main.jsx
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Splash from "./Splash";
import SetupSupabase from "./pages/SetupSupabase.jsx";
import UserDemo from "./pages/UserDemo.jsx";
import Diag from "./pages/Diag.jsx";               // 👈 NUEVO
import "./registerSW";

function useHashRoute() {
  const [route, setRoute] = useState(location.hash || "#/");
  useEffect(() => {
    const onHash = () => setRoute(location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route.replace(/^#/, "");
}

function App() {
  const route = useHashRoute();
  const [showSplash, setShowSplash] = useState(true);

  // --- PWA Install UX ---
  const deferred = useRef(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true ||
      localStorage.getItem("pw_installed") === "1"
  );
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
      localStorage.setItem("pw_installed", "1");
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
    if (!deferred.current) {
      alert("Si no aparece el diálogo: menú ⋮ → Instalar aplicación.");
      return;
    }
    deferred.current.prompt();
    const { outcome } = await deferred.current.userChoice;
    deferred.current = null;
    setCanInstall(false);
    if (outcome === "accepted") setInstalled(true);
  }

  function Nav() {
    return (
      <nav className="nav">
        <a href="#/" className={route === "/" ? "active" : ""}>Inicio</a>
        <a href="#/setup" className={route === "/setup" ? "active" : ""}>Setup Supabase</a>
        <a href="#/user" className={route === "/user" ? "active" : ""}>Demo usuario</a>
        <a href="#/diag" className={route === "/diag" ? "active" : ""}>Diag</a> {/* 👈 NUEVO */}
      </nav>
    );
  }

  function Home() {
    return (
      <section className="hero">
        <h1>PirateWorld</h1>
        <p>Espéralo pronto…</p>
        {!isStandalone && canInstall && (
          <button className="btn" onClick={handleInstall}>⤓ Instalar aplicación</button>
        )}
        {!isStandalone && installed && (
          <div className="hint ok">✅ Aplicación instalada correctamente.</div>
        )}
      </section>
    );
  }

  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}

      <main className={`app-shell ${showSplash ? "blurred" : ""}`}>
        {/* fondo tipo mapa */}
        <div className="bg-grid">
          <div className="bg-wave a" />
          <div className="bg-wave b" />
        </div>

        <div className="container">
          <Nav />
          {route === "/" && <Home />}
          {route === "/setup" && <SetupSupabase />}
          {route === "/user" && <UserDemo />}
          {route === "/diag" && <Diag />}             {/* 👈 NUEVO */}
        </div>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
