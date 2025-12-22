import React from "react";

function go(path) {
  window.location.hash = path;
}

export default function BaseLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <strong>PirateWorld</strong>
      </header>

      <main className="main-content">
        {children}
      </main>

      {/* Navegación mínima FSM-first */}
      <nav className="bottom-nav">
        <button onClick={() => go("/gps")}>🛰️ GPS</button>
        <button onClick={() => go("/port")}>⚓ Puerto</button>
        <button onClick={() => go("/profile")}>🏴‍☠️ Perfil</button>
      </nav>
    </div>
  );
}
