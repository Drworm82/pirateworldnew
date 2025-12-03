// ========================================================
// Explore.jsx — Compatible V4 (startTravel + costs + UI)
// ========================================================

import React, { useEffect, useState } from "react";
import {
  ensureUser,
  loadIslands,
  calculateTravelCost,
  startTravel,
  getShipProgress,
} from "../lib/supaApi.js";

export default function Explore() {
  const [userId, setUserId] = useState(null);
  const [islands, setIslands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cost, setCost] = useState(null);
  const [progress, setProgress] = useState(null);

  // Init
  useEffect(() => {
    async function init() {
      const user = await ensureUser();
      setUserId(user.id);

      const isl = await loadIslands();
      setIslands(isl);

      const p = await getShipProgress(user.id);
      setProgress(p);
    }
    init();
  }, []);

  // Seleccionar isla
  async function handleSelect(isl) {
    setSelected(isl);

    if (!userId) return;

    const c = await calculateTravelCost(userId, isl.key);
    if (c?.error) {
      console.error("Cost error:", c);
      return;
    }

    setCost(c);
  }

  // Iniciar viaje
  async function handleStart() {
    if (!userId || !selected) return;

    const res = await startTravel(userId, selected.key);
    console.log("startTravel:", res);
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🌍 Explorar Islas</h1>

      {progress?.status === "traveling" && (
        <div style={{ marginBottom: 20 }}>
          <strong>Viaje en progreso:</strong> {progress.percent?.toFixed(1)}%
        </div>
      )}

      <h2>Selecciona un destino</h2>

      {islands.map((isl) => (
        <div
          key={isl.key}
          onClick={() => handleSelect(isl)}
          style={{
            padding: 10,
            marginBottom: 6,
            background: selected?.key === isl.key ? "#333" : "#222",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {isl.name}
        </div>
      ))}

      {cost && (
        <div style={{ marginTop: 20, padding: 10, background: "#222", borderRadius: 8 }}>
          <h3>Costo del viaje</h3>
          <p>Distancia: {cost.distance_km} km</p>
          <p>Base: {cost.base_cost}</p>
          <p>Variable: {cost.variable_cost}</p>
          <p>
            <strong>Total: {cost.total_cost} doblones</strong>
          </p>
          <button
            onClick={handleStart}
            style={{
              marginTop: 10,
              padding: "10px 15px",
              background: "#4da3ff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Zarpar 🚢
          </button>
        </div>
      )}
    </div>
  );
}
