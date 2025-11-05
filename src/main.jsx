import { createRoot } from "react-dom/client";
import "./registerSW";

function App() {
  let deferredPrompt = null;

  // Estado visible para debug en móvil
  let ready = false;
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  function setReady(v) {
    ready = v;
    const el = document.getElementById("pwa-ready");
    if (el) {
      el.textContent = v ? "Listo para instalar" : "No listo";
      el.className = "badge " + (v ? "ok" : "warn");
    }
  }

  function showInstallButton() {
    const btn = document.getElementById("install-btn");
    if (btn) btn.style.display = "inline-flex";
  }

  function hideInstallButton() {
    const btn = document.getElementById("install-btn");
    if (btn) btn.style.display = "none";
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setReady(true);
    // Mostrar botón tras una pequeña interacción/tiempo
    setTimeout(showInstallButton, 300);
  });

  window.addEventListener("appinstalled", () => {
    setReady(false);
    hideInstallButton();
  });

  async function handleInstall() {
    if (!deferredPrompt) {
      alert("Si no aparece el diálogo, usa el menú de Chrome: ⋮ → Instalar aplicación.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    hideInstallButton();
    if (outcome !== "accepted") {
      // Si canceló, puedes re-mostrar el botón más tarde si quieres
      setTimeout(showInstallButton, 2000);
    }
  }

  return (
    <main>
      <h1>PirateWorld</h1>
      <p>Espéralo pronto..</p>
      <span id="pwa-ready" className="badge warn">No listo</span>

      {!isStandalone && (
        <button id="install-btn" onClick={handleInstall}>
          Instalar aplicación
        </button>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
