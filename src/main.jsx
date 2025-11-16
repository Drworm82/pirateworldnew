// src/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import UserDemo from "./pages/UserDemo.jsx";
import Ledger from "./pages/Ledger.jsx";
import Store from "./pages/Store.jsx";
import Inventory from "./pages/Inventory.jsx";
import TilesDemo from "./pages/TilesDemo.jsx";
import MapPage from "./pages/Map.jsx";
import Missions from "./pages/Missions.jsx";
import Profile from "./pages/Profile.jsx";
import ExplorePage from "./pages/Explore.jsx"; // ⭐ NUEVO

// Router súper simple basado en window.location.hash
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/user");

  useEffect(() => {
    const handle = () => {
      setHash(window.location.hash || "#/user");
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);

  return hash;
}

function App() {
  const hash = useHashRoute();

  let page;
  switch (hash) {
    case "#/user":
    case "#/demo":
      page = <UserDemo />;
      break;
    case "#/ledger":
      page = <Ledger />;
      break;
    case "#/store":
      page = <Store />;
      break;
    case "#/inventory":
      page = <Inventory />;
      break;
    case "#/tiles":
      page = <TilesDemo />;
      break;
    case "#/map":
      page = <MapPage />;
      break;
    case "#/missions":
      page = <Missions />;
      break;
    case "#/profile":
      page = <Profile />;
      break;
    case "#/explore":                 // ⭐ RUTA DE EXPLORACIÓN
      page = <ExplorePage />;
      break;
    default:
      page = <UserDemo />;
      break;
  }

  return (
    <div className="app-shell">
      <nav className="nav">
        <a href="#/user" className={hash === "#/user" ? "active" : ""}>
          Usuario demo
        </a>
        <a href="#/ledger" className={hash === "#/ledger" ? "active" : ""}>
          Ledger
        </a>
        <a href="#/store" className={hash === "#/store" ? "active" : ""}>
          Tienda
        </a>
        <a
          href="#/inventory"
          className={hash === "#/inventory" ? "active" : ""}
        >
          Inventario
        </a>
        <a href="#/tiles" className={hash === "#/tiles" ? "active" : ""}>
          Tiles
        </a>
        <a href="#/map" className={hash === "#/map" ? "active" : ""}>
          Mapa
        </a>
        <a
          href="#/missions"
          className={hash === "#/missions" ? "active" : ""}
        >
          Misiones
        </a>
        <a
          href="#/profile"
          className={hash === "#/profile" ? "active" : ""}
        >
          Perfil
        </a>
        <a
          href="#/explore"
          className={hash === "#/explore" ? "active" : ""} // ⭐ BOTÓN NUEVO
        >
          Explorar
        </a>
      </nav>

      {page}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
