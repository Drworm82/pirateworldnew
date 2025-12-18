// src/AppBase44.jsx
import GPS from "./pages/GPS.jsx";
import Zarpar from "./pages/Zarpar.jsx";
import Viaje from "./pages/Viaje.jsx";

import BottomNav from "./navigation/BottomNav.jsx";
import TopBar from "./navigation/TopBar.jsx";
import SideMenu from "./navigation/SideMenu.jsx";

function getRouteFromHash() {
  const h = window.location.hash || "#/ui/gps";
  const raw = h.startsWith("#") ? h.slice(1) : h;
  return raw;
}

export default function AppBase44() {
  const route = getRouteFromHash();

  function renderPage() {
    switch (route) {
      case "/ui/gps":
        return <GPS />;
      case "/ui/zarpar":
        return <Zarpar />;
      case "/ui/viaje":
        return <Viaje />;
      default:
        return <GPS />;
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
