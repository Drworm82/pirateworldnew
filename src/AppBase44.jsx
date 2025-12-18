// src/AppBase44.jsx
import { useEffect, useState } from "react";

import GPS from "./pages/GPS.jsx";
import Zarpar from "./pages/Zarpar.jsx";
import Viaje from "./pages/Viaje.jsx";
import SetupSupabase from "./pages/SetupSupabase.jsx";

import BottomNav from "./navigation/BottomNav.jsx";
import TopBar from "./navigation/TopBar.jsx";
import SideMenu from "./navigation/SideMenu.jsx";

function getRouteFromHash() {
  const h = window.location.hash || "#/ui/setup";
  const raw = h.startsWith("#") ? h.slice(1) : h;
  return raw;
}

export default function AppBase44() {
  const [route, setRoute] = useState(() => getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function renderPage() {
    switch (route) {
      case "/ui/setup":
        return <SetupSupabase />;

      case "/ui/gps":
        return <GPS />;

      case "/ui/zarpar":
        return <Zarpar />;

      case "/ui/viaje":
        return <Viaje />;

      default:
        return <SetupSupabase />;
    }
  }

  return (
    <div className="app-shell base44">
      <TopBar />
      <SideMenu />
      <main>{renderPage()}</main>
      <BottomNav />
    </div>
  );
}
