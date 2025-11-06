import { createRoot } from "react-dom/client";
import "./registerSW";

function App() {
  let deferredPrompt = null;

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  function show(btnId, visible) {
    const el = document.getElementById(btnId);
    if (el) el.style.display = visible ? "inline-flex" : "none";
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => show("install-btn", true), 400);
  });

  window.addEventListener("appinstalled", () => {
    show("install-btn", false);
    const tip = document.getElementById("post-install-tip");
    if (tip) tip.textContent = "✅ Aplicación instalada correctamente.";
  });

  async function handleInstall() {
    if (!deferredPrompt) {
      alert("Si no aparece el diálogo, usa: ⋮ → Agregar a la pantalla principal.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === "accepted") show("install-btn", false);
  }

  return (
    <div className="app-root">
      {/* fondo mapa sutil */}
      <div className="bg-map" aria-hidden="true"></div>

      {/* layout más corto y centrado */}
      <main className="hero">
        <h1>PirateWorld</h1>
        <p className="subtitle">Espéralo pronto…</p>

        {!isStandalone && (
          <button id="install-btn" onClick={handleInstall} className="cta" style={{ display: "none" }}>
            ⤓ Instalar aplicación
          </button>
        )}

        <p id="post-install-tip" className="hint" aria-live="polite"></p>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
