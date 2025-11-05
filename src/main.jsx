import { createRoot } from "react-dom/client";
import "./registerSW";
import Splash from "./Splash.jsx";
import UpdateToast from "./UpdateToast.jsx";

// detectar si ya corre como app instalada
const isStandalone =
  (window.matchMedia?.("(display-mode: standalone)")?.matches) ||
  (window.navigator.standalone === true);

function App() {
  let splashHidden = false;
  let toastVisible = false;

  function hideSplashSoon() {
    // simulación de carga corta; en tu juego: cuando el mapa esté listo
    setTimeout(() => {
      splashHidden = true;
      const el = document.getElementById("splash");
      if (el) el.classList.add("hide");
    }, 300);
  }

  // SW update → mostrar toast
  window.__onSWUpdateReady(() => {
    toastVisible = true;
    const t = document.getElementById("update-toast");
    if (t) t.style.display = "flex";
  });

  function reloadNow() {
    // recarga fuerte para tomar el SW nuevo
    location.reload();
  }

  // arranque
  hideSplashSoon();

  return (
    <main className="safe" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div id="splash"><Splash hide={splashHidden} /></div>

      <h1 style={{ marginTop: 0 }}>PirateWorld</h1>
      <p>Espéralo pronto..</p>

      {!isStandalone && (
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Para instalar: menú ⋮ en Chrome → <b>Instalar aplicación</b>.
        </p>
      )}

      <div id="update-toast" style={{ display: "none" }}>
        <UpdateToast onReload={reloadNow} />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
