import React, { useEffect, useState } from "react";

import GPS from "./pages/GPS.jsx";
import Port from "./pages/Port.jsx";
import HamburgerButton from "./components/HamburgerButton.jsx";

/* Placeholders CANON (UI-only) */
function Profile() {
  return <div>FSM · PROFILE (placeholder)</div>;
}

function Dev() {
  return <div>FSM · DEV (placeholder)</div>;
}

/* Routing manual por hash (CANON) */
const ROUTES = {
  "/gps": GPS,
  "/port": Port,
  "/profile": Profile,
  "/dev": Dev,
};

function resolveHash() {
  const hash = window.location.hash || "#/gps";

  // Quitar "#" y descartar query (?mode=travel)
  const cleanPath = hash.replace("#", "").split("?")[0];

  return ROUTES[cleanPath] ? cleanPath : "/gps";
}

export default function App() {
  const [route, setRoute] = useState(resolveHash());

  useEffect(() => {
    const onHashChange = () => setRoute(resolveHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Screen = ROUTES[route];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Menú Hamburguesa — Overlay UI-only (CANON) */}
      <HamburgerButton />

      {/* Pantalla FSM base */}
      <Screen />
    </div>
  );
}
