import React from "react";
import { createRoot } from "react-dom/client";
import "./registerSW";
import Splash from "./Splash";

/**
 * - Muestra Splash ~1.2s y luego la pantalla principal.
 * - Botón "Instalar aplicación" si hay beforeinstallprompt.
 * - Mensaje verde "Aplicación instalada correctamente." si:
 *   a) ya está en standalone, o b) se dispara appinstalled.
 */

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSplash: true,
      isStandalone:
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator.standalone === true,
      installedBanner: false,
    };
    this.deferredPrompt = null;
  }

  componentDidMount() {
    // fin del splash
    setTimeout(() => this.setState({ showSplash: false }), 1200);

    // si ya está instalada, mostrar banner
    if (this.state.isStandalone || localStorage.getItem("pw_installed") === "1") {
      this.setState({ installedBanner: true });
    }

    // PWA install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const btn = document.getElementById("install-btn");
      if (btn) btn.style.display = "inline-flex";
    });

    window.addEventListener("appinstalled", () => {
      localStorage.setItem("pw_installed", "1");
      this.setState({ installedBanner: true });
      const btn = document.getElementById("install-btn");
      if (btn) btn.style.display = "none";
    });
  }

  handleInstall = async () => {
    if (!this.deferredPrompt) {
      alert("Si no aparece el diálogo, usa: ⋮ → Agregar a la pantalla principal.");
      return;
    }
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    if (outcome === "accepted") {
      const btn = document.getElementById("install-btn");
      if (btn) btn.style.display = "none";
    }
  };

  renderMain() {
    const { isStandalone, installedBanner } = this.state;
    return (
      <div className="app-root">
        <div className="bg-map" aria-hidden="true"></div>

        <main className="hero">
          <h1>PirateWorld</h1>
          <p className="subtitle">Espéralo pronto…</p>

          {!isStandalone && (
            <button id="install-btn" onClick={this.handleInstall} className="cta" style={{ display: "none" }}>
              ⤓ Instalar aplicación
            </button>
          )}

          <p id="post-install-tip" className="hint" aria-live="polite">
            {installedBanner ? "✅ Aplicación instalada correctamente." : ""}
          </p>
        </main>
      </div>
    );
  }

  render() {
    return this.state.showSplash ? <Splash /> : this.renderMain();
  }
}

createRoot(document.getElementById("root")).render(<Root />);
