// src/router.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import Ship from "./pages/Ship.jsx";
import Profile from "./pages/Profile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

import MissionsPlaceholder from "./pages/MissionsPlaceholder.jsx";
import InventoryPlaceholder from "./pages/InventoryPlaceholder.jsx";
import StorePlaceholder from "./pages/StorePlaceholder.jsx";
import CrewPlaceholder from "./pages/CrewPlaceholder.jsx";

// ⬅️ IMPORTAMOS EL MAPA REAL
import MapPage from "./pages/Map.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/ship" element={<Ship />} />

      {/* PLACEHOLDERS */}
      <Route path="/missions" element={<MissionsPlaceholder />} />
      <Route path="/inventory" element={<InventoryPlaceholder />} />
      <Route path="/store" element={<StorePlaceholder />} />
      <Route path="/crew" element={<CrewPlaceholder />} />

      {/* MAPA REAL */}
      <Route path="/map" element={<MapPage />} />

      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
