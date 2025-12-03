// ========================================================
// TravelStart.jsx — Versión FINAL (UI completa con costos)
// ========================================================
import React, { useEffect, useState } from "react";
import {
  ensureUser,
  loadIslands,
  calculateTravelCost,
  startTravel,
} from "../lib/supaApi.js";
import { useNavigate } from "react-router-dom";

export default function TravelStart() {
  const [userId, setUserId] = useState(null);
  const [islands, setIslands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [costInfo, setCostInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Load user + islands
  useEffect(() => {
    async function init() {
      const user = await ensureUser();
      setUserId(user.id);

      const isl = await loadIslands();
      setIslands(isl);

      setLoading(false);
    }

    init();
  }, []);

  async function handleSelect(key) {
    setSelected(key);
    setCostInfo(null);
  }

  async function handleCalcCost() {
    if (!selected) return;

    const res = await calculateTravelCost(userId, selected);
    setCostInfo(res);
  }

  async function handleStart() {
    if (!selected) return;

    const res = await startTravel(userId, selected);

    if (res.error) {
      alert("Error: " + res.message);
      return;
    }

    navigate("/ship");
  }

  if (loading) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h2>Cargando islas…</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🗺 Selecciona tu Destino</h1>

      <div style={{ marginTop: 20 }}>
        {islands.map((isl) => (
          <div
            key={isl.key}
            onClick={() => handleSelect(isl.key)}
            style={{
              padding: 12,
              marginBottom: 10,
              border: "1px solid #4da3ff",
              borderRadius: 8,
              background:
                selected === isl.key
                  ? "rgba(77,163,255,0.25)"
                  : "rgba(0,0,0,0.4)",
              cursor: "pointer",
            }}
          >
            <strong>{isl.name}</strong>
            <br />
            <small>Lat: {isl.lat} | Lng: {isl.lng}</small>
          </div>
        ))}
      </div>

      {selected && (
        <>
          <button
            onClick={handleCalcCost}
            style={{
              marginTop: 15,
              padding: "10px 15px",
              width: "100%",
              background: "#4da3ff",
              border: "none",
              borderRadius: 8,
            }}
          >
            Calcular costo del viaje 💰
          </button>
        </>
      )}

      {costInfo && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 8,
            border: "1px solid #4da3ff",
          }}
        >
          <h3>💵 Costo del Viaje</h3>
          <p><strong>Distancia:</strong> {costInfo.distance_km} km</p>
          <p><strong>Modificador barco:</strong> {costInfo.modifier}</p>
          <p><strong>Costo total:</strong> {costInfo.total_cost} doblones</p>

          <button
            onClick={handleStart}
            style={{
              marginTop: 15,
              padding: "10px 15px",
              width: "100%",
              background: "#00c853",
              border: "none",
              borderRadius: 8,
            }}
          >
            Confirmar y Zarpar 🚢
          </button>
        </div>
      )}
    </div>
  );
}
