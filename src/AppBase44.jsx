// src/AppBase44.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

import GPS from "./pages/GPS.jsx";
import Zarpar from "./pages/Zarpar.jsx";
import Viaje from "./pages/Viaje.jsx";
import Inventario from "./pages/Inventario.jsx";
import Tienda from "./pages/Tienda.jsx";
import Misiones from "./pages/Misiones.jsx";
import Tripulacion from "./pages/Tripulacion.jsx";
import Perfil from "./pages/Perfil.jsx";
import MapaMundo from "./pages/MapaMundo.jsx";
import BancoMundial from "./pages/BancoMundial.jsx";
import Territorio from "./pages/Territorio.jsx";
import ChatLocal from "./pages/ChatLocal.jsx";
import Telegrafo from "./pages/Telegrafo.jsx";
import Settings from "./pages/Settings.jsx";

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

      case "/ui/inventario":
        return <Inventario />;

      case "/ui/tienda":
        return <Tienda />;

      case "/ui/misiones":
        return <Misiones />;

      case "/ui/tripulacion":
        return <Tripulacion />;

      case "/ui/perfil":
        return <Perfil />;

      case "/ui/mapa":
        return <MapaMundo />;

      case "/ui/banco":
        return <BancoMundial />;

      case "/ui/territorio":
        return <Territorio />;

      case "/ui/chat":
        return <ChatLocal />;

      case "/ui/telegrafo":
        return <Telegrafo />;

      case "/ui/settings":
        return <Settings />;

      default:
        return <GPS />;
    }
  }

  return (
    <div className="app-shell base44">
      <TopBar />
      <SideMenu />
      <main style={{ paddingBottom: 80 }}>
        {renderPage()}
      </main>
      <BottomNav />
    </div>
  );
}
