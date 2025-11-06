import { createRoot } from "react-dom/client";
import "./registerSW";

// Pantalla principal con fondo de “mapa” suave y botón Instalar
function App() {
  let deferredPrompt = null;

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  function show(btnId, show) {
    const el = document.getElementById(btnId);
    if (el) el.style.display = show ? "inline-flex" : "none";
  }

  // Manejo del prompt de instalación
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // mostrar botón tras un pequeño delay
    setTimeout(() => show("install-btn", true), 400);
  });

  window.addEventListener("appinstalled", () => {
    show("install-btn", false);
    const tip = document.getElementById("post-install-tip");
    if (tip) tip.textContent = "✅ Aplicación instalada correctamente.";
  });

  async function handleInstall() {
    if (!deferredPrompt) {
      alert(
        "Si no aparece el diálogo, usa: ⋮ → Agregar a la pantalla principal."
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === "accepted") show("install-btn", false);
  }

  return (
    <div className="app-root">
      {/* Fondo tipo mapa náutico */}
      <div className="bg-map" aria-hidden="true"></div>

      {/* Contenido */}
      <main className="hero">
        <h1>PirateWorld</h1>
        <p className="subtitle">Espéralo pronto…</p>

        {!isStandalone && (
          <button
            id="install-btn"
            onClick={handleInstall}
            className="cta"
            style={{ display: "none" }}
          >
            ⤓ Instalar aplicación
          </button>
        )}

        <p id="post-install-tip" className="hint" aria-live="polite"></p>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
