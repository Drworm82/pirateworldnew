import { createRoot } from "react-dom/client";
import "./registerSW";

/**
 * PirateWorld — PWA base
 * Actualización:
 * - Muestra “Instalada ✅” una vez que la app se instala.
 * - Mensaje dinámico según el dispositivo.
 * - Botón de instalación solo cuando corresponde.
 */

function App() {
  let deferredPrompt = null;
  let isInstalled = false;

  // Detectar si ya está instalada
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  if (isStandalone) isInstalled = true;

  function showInstallButton() {
    const btn = document.getElementById("install-btn");
    if (btn) btn.style.display = "inline-flex";
  }

  function hideInstallButton() {
    const btn = document.getElementById("install-btn");
    if (btn) btn.style.display = "none";
  }

  // Escuchar evento antes de instalar
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(showInstallButton, 500);
  });

  // Escuchar cuando se instala
  window.addEventListener("appinstalled", () => {
    isInstalled = true;
    hideInstallButton();
    const msg = document.getElementById("install-hint");
    if (msg) {
      msg.innerHTML = "✅ Aplicación instalada correctamente.";
      msg.style.color = "#008000";
    }
  });

  async function handleInstall() {
    if (!deferredPrompt) {
      alert(
        "Si no aparece el diálogo, usa el menú ⋮ → 'Agregar a la pantalla principal'."
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === "accepted") hideInstallButton();
  }

  // Mensaje adaptado según dispositivo
  const userAgent = navigator.userAgent.toLowerCase();
  let installHint = "";

  if (isInstalled) {
    installHint = "✅ Aplicación instalada correctamente.";
  } else if (userAgent.includes("android")) {
    installHint =
      "En Android: abre el menú ⋮ en Chrome y elige “Agregar a la pantalla principal”.";
  } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    installHint =
      "En iPhone/iPad: toca el botón “Compartir” y selecciona “Añadir a pantalla de inicio”.";
  } else {
    installHint =
      "Desde tu navegador, selecciona “Instalar aplicación” o “Agregar a la pantalla principal”.";
  }

  // Render
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        textAlign: "center",
        background: "#fafafa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#0b132b",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>PirateWorld</h1>
      <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Espéralo pronto…</p>

      <p
        id="install-hint"
        style={{
          color: isInstalled ? "#008000" : "#444",
          fontSize: "0.95rem",
          background: "#f5f5f5",
          padding: "0.8rem 1rem",
          borderRadius: "10px",
          maxWidth: "320px",
          lineHeight: 1.5,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        💡 <span>{installHint}</span>
      </p>

      {!isStandalone && (
        <button
          id="install-btn"
          onClick={handleInstall}
          style={{
            display: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#0b132b",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "18px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1c2541")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0b132b")}
        >
          Instalar aplicación
        </button>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
