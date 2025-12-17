// =======================================================
// Explore.jsx — PirateWorld (V5 REAL)
// Flujo: Home → Explore → Ship
// Backend MANDA, Frontend OBSERVA
// =======================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ensureUser,
  ship_travel_start_v4
} from "../lib/supaApi";

export default function Explore() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState("");

  // ===================================================
  // INIT
  // ===================================================
  useEffect(() => {
    async function init() {
      await ensureUser();
      setLoading(false);
    }
    init();
  }, []);

  // ===================================================
  // START TRAVEL (V4 ACTIVO)
  // ===================================================
  async function handleTravel() {
    if (!destination) return;

    await ship_travel_start_v4(destination);
    navigate("/ship");
  }

  // ===================================================
  // RENDER
  // ===================================================
  if (loading) {
    return (
      <div className="game-content">
        <h2>Cargando…</h2>
      </div>
    );
  }

  return (
    <div className="game-content">
      <h2>Explorar</h2>

      <p>Destino (string backend):</p>

      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Bahía del Ajolote"
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 12
        }}
      />

      <button
        onClick={handleTravel}
        style={{
          padding: 12,
          width: "100%",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Zarpar
      </button>
    </div>
  );
}
