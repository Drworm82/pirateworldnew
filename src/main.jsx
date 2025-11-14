// src/main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import Home from "./pages/Home.jsx";
import SetupSupabase from "./pages/SetupSupabase.jsx";
import UserDemo from "./pages/UserDemo.jsx";
import TilesDemo from "./pages/TilesDemo.jsx";
import DebugEnv from "./pages/DebugEnv.jsx";
import MyParcels from "./pages/MyParcels.jsx";
import MiniMap from "./pages/MiniMap.jsx";
import Ledger from "./pages/Ledger.jsx";
import Store from "./pages/Store.jsx";  // ⬅️ NUEVO

import Splash from "./components/Splash.jsx";

import "./index.css";

function useHashRoute() {
  const [route, setRoute] = useState(location.hash || "#/");

  useEffect(() => {
    const onHash = () => setRoute(location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // limpia el "#/":
  return route.replace("#", "");
}

function NavBar({ route }) {
  return (
    <nav className="nav">
      <a href="#/" className={route === "/" ? "active" : ""}>
        Inicio
      </a>
      <a href="#/setup" className={route === "/setup" ? "active" : ""}>
        Setup Supabase
      </a>
      <a href="#/user" className={route === "/user" ? "active" : ""}>
        Demo usuario
      </a>
      <a href="#/tiles" className={route === "/tiles" ? "active" : ""}>
        Demo parcelas
      </a>
      <a href="#/mine" className={route === "/mine" ? "active" : ""}>
        Mis parcelas
      </a>
      <a href="#/map" className={route === "/map" ? "active" : ""}>
        Mapa
      </a>
      <a href="#/ledger" className={route === "/ledger" ? "active" : ""}>
        Movimientos
      </a>
      <a href="#/store" className={route === "/store" ? "active" : ""}>
        Tienda
      </a>
    </nav>
  );
}

function App() {
  const route = useHashRoute();
  const [showSplash, setShowSplash] = useState(true);

  let page = <Home />;

  if (route === "/setup") page = <SetupSupabase />;
  else if (route === "/user") page = <UserDemo />;
  else if (route === "/tiles") page = <TilesDemo />;
  else if (route === "/mine") page = <MyParcels />;
  else if (route === "/map") page = <MiniMap />;
  else if (route === "/ledger") page = <Ledger />;
  else if (route === "/store") page = <Store />;   // ⬅️ NUEVO
  else if (route === "/debug") page = <DebugEnv />;

  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}

      <main className={`app-shell ${showSplash ? "blurred" : ""}`}>
        <NavBar route={route} />
        <div className="page-container">{page}</div>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
