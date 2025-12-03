// =============================================================
// Ship.jsx — Vista del barco en tiempo real (V4 PRO FINAL)
// =============================================================

import React, { useEffect, useState } from "react";
import {
  ensureUser,
  getShipProgress,
  autoNav,
} from "../lib/supaApi.js";

export default function Ship() {
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------
  // Init + Polling
  // ---------------------------------------------
  useEffect(() => {
    async function init() {
      const user = await ensureUser();
      setUserId(user.id);

      // Primera carga
      const p = await getShipProgress(user.id);
      setProgress(p);
      setLoading(false);

      // Polling cada 1.5 s
      const interval = setInterval(async () => {
        const p2 = await getShipProgress(user.id);
        setProgress(p2);
      }, 1500);

      return () => clearInterval(interval);
    }

    init();
  }, []);

  // ---------------------------------------------
  // Autonav: fuerza un tick de eventos del mar
  // ---------------------------------------------
  async function handleAutoNav() {
    if (!userId) return;

    const res = await autoNav(userId);
    console.log("AutoNav:", res);

    const updated = await getShipProgress(userId);
    setProgress(updated);
  }

  // ---------------------------------------------
  // Render cargando
  // ---------------------------------------------
  if (loading || !progress) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h2>⏳ Cargando estado del barco…</h2>
      </div>
    );
  }

  // ---------------------------------------------
  // Render UI
  // ---------------------------------------------
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🚢 Tu Barco</h1>

      <div
        style={{
          padding: 15,
          background: "rgba(0,0,0,0.50)",
          borderRadius: 10,
          border: "1px solid #4da3ff",
          maxWidth: 420,
        }}
      >
        <h3>Estado</h3>
        <p>
          <strong>{progress.status === "traveling" ? "Viajando" : "En puerto"}</strong>
        </p>

        <p>
          <strong>Origen:</strong> {progress.origin}
        </p>

        <p>
          <strong>Destino:</strong>{" "}
          {progress.destination ? progress.destination : "—"}
        </p>

        <p>
          <strong>Distancia total:</strong> {progress.distance_km} km
        </p>

        <p>
          <strong>Avance:</strong> {progress.percent?.toFixed(1)}%
        </p>

        {/* Barra de progreso */}
        <div
          style={{
            marginTop: 10,
            width: "100%",
            height: 10,
            background: "#333",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress.percent}%`,
              background: "#4da3ff",
            }}
          ></div>
        </div>

        {/* Posición actual */}
        <div style={{ marginTop: 15 }}>
          <p>
            <strong>Lat:</strong> {Number(progress.current_lat).toFixed(5)}
          </p>
          <p>
            <strong>Lng:</strong> {Number(progress.current_lng).toFixed(5)}
          </p>
        </div>

        {/* Botón de autonav */}
        {progress.status === "traveling" && (
          <button
            onClick={handleAutoNav}
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
            Forzar evento / Autonav ⚡
          </button>
        )}
      </div>
    </div>
  );
}
