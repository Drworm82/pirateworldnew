// =============================================================
// Explore.jsx — Sistema de Viajes con Costos V5 PRO
// =============================================================

import React, { useEffect, useState } from "react";
import {
  ensureUser,
  loadIslands,
  calculateTravelCost,
  startTravel,
} from "../lib/supaApi.js";

export default function Explore() {
  const [userId, setUserId] = useState(null);
  const [islands, setIslands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cost, setCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // =========================================================
  // INIT — cargar usuario + islas
  // =========================================================
  useEffect(() => {
    async function init() {
      const u = await ensureUser();
      setUserId(u.id);

      const list = await loadIslands();
      setIslands(list || []);

      setLoading(false);
    }
    init();
  }, []);

  // =========================================================
  // Calcular costo cuando seleccionas isla
  // =========================================================
  async function handleSelect(key) {
    setSelected(key);
    setCost(null);
    setErrorMsg(null);
    setCalculating(true);

    const c = await calculateTravelCost(userId, key);
    setCost(c);
    setCalculating(false);
  }

  // =========================================================
  // ZARPAMOS
  // =========================================================
  async function handleStartTravel() {
    if (!selected) return;

    setErrorMsg(null);
    setStarting(true);

    const res = await startTravel(userId, selected);

    if (res?.error) {
      setStarting(false);
      setErrorMsg(res.message || "Error al iniciar viaje");
      return;
    }

    console.log("startTravel:", res);

    // Redirigimos a /ship
    window.location.href = "/ship";
  }

  // =========================================================
  // Render
  // =========================================================
  if (loading) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        <h2>Cargando islas...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🗺️ Explorar Islas</h1>

      {/* Lista de islas */}
      <div style={{ marginTop: 20 }}>
        {islands.map((isl) => (
          <div
            key={isl.key}
            onClick={() => handleSelect(isl.key)}
            style={{
              padding: 12,
              marginBottom: 8,
              background:
                selected === isl.key ? "#1e3b55" : "rgba(0,0,0,0.35)",
              border: "1px solid #4da3ff",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <strong>{isl.name}</strong>
            <div style={{ opacity: 0.7 }}>{isl.key}</div>
          </div>
        ))}
      </div>

      {/* COSTOS */}
      {selected && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid #4da3ff",
            borderRadius: 12,
            maxWidth: 420,
          }}
        >
          <h3>💰 Costo del Viaje</h3>

          {calculating && <p>Calculando...</p>}

          {cost && !cost.error && (
            <div style={{ lineHeight: 1.6 }}>
              <p><strong>Distancia:</strong> {cost.distance_km} km</p>
              <p><strong>Base:</strong> {cost.base_cost} doblones</p>
              <p><strong>Variable:</strong> {cost.variable_cost} doblones</p>
              <p><strong>Modificador barco:</strong> ×{cost.modifier}</p>
              <p><strong>Tarifa mínima:</strong> {cost.min_fee} doblones</p>
              <p><strong>Extras:</strong> {cost.extra_cost} doblones</p>

              <hr style={{ opacity: 0.3 }} />

              <h2 style={{ color: "#4da3ff" }}>
                Total: {cost.total_cost} doblones
              </h2>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: "salmon", marginTop: 10 }}>
              ❌ {errorMsg}
            </div>
          )}

          <button
            onClick={handleStartTravel}
            disabled={starting}
            style={{
              marginTop: 15,
              padding: "10px 15px",
              background: "#4da3ff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              width: "100%",
            }}
          >
            {starting ? "Procesando..." : "Zarpar 🚢"}
          </button>
        </div>
      )}
    </div>
  );
}
