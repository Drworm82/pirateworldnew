// src/components/Layout.jsx
import React from 'react';

/**
 * Layout CANON
 * - Renderiza la estructura visual global.
 * - Es un componente pasivo y sin estado propio.
 * - Recibe los componentes (Screens, NavBar, CTA, Overlays) como props o los contiene.
 */
export default function Layout({ screen, navbar, cta, overlays }) {
  return (
    <div className="layout-root">
      {/* Layer 1: Pantalla Principal */}
      <main className="main-screen">
        {screen}
      </main>

      {/* Layer 2: Elementos de UI Fijos */}
      {navbar}
      {cta}

      {/* Layer 3: Overlays */}
      <div className="overlays-layer">
        {overlays}
      </div>
    </div>
  );
}
