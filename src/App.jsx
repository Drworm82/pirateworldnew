// src/App.jsx
import { useEffect, useState } from "react";

import UserDemo from "./pages/UserDemo.jsx";
import Ledger from "./pages/Ledger.jsx";
import StorePage from "./pages/Store.jsx";
import Inventory from "./pages/Inventory.jsx";
import TilesDemo from "./pages/TilesDemo.jsx";
import MapPage from "./pages/Map.jsx";
import Missions from "./pages/Missions.jsx";
import Profile from "./pages/Profile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import ExplorePage from "./pages/Explore.jsx";

import NavBar from "./components/NavBar.jsx";

function getRouteFromHash() {
  const h = window.location.hash || "#/";
  const raw = h.startsWith("#") ? h.slice(1) : h;
  if (!raw || raw === "/") return "/";
  return raw;
}

export default function App() {
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
      case "/":
      case "/demo":
      case "/user":
        return <UserDemo />;

      case "/ledger":
        return <Ledger />;

      case "/store":
        return <StorePage />;

      case "/inventory":
        return <Inventory />;

      case "/tiles":
        return <TilesDemo />;

      case "/map":
        return <MapPage />;

      case "/missions":
        return <Missions />;

      case "/profile":
        return <Profile />;

      case "/explore":
        return <ExplorePage />;

      case "/leaderboard":
        return <Leaderboard />;

      default:
        return <UserDemo />;
    }
  }

  return (
    <div className="app-shell">
      <NavBar currentRoute={route} />
      <main>{renderPage()}</main>
    </div>
  );
}
