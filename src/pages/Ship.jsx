// =======================================================
// Ship.jsx — PirateWorld (V5 REAL TIME)
// Backend MANDA, Frontend OBSERVA
// =======================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ensureUser,
  ship_travel_progress_v5,
  ship_autonav_v4
} from "../lib/supaApi";

export default function Ship() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | traveling | arrived
  const [progress, setProgress] = useState(null);
  const [destination, setDestination] = useState("");

  // ===================================================
  // INIT + POLLING
  // ===================================================
  useEffect(() => {
    let interval = null;

    async function init() {
      const user = await ensureUser();
      if (!user) return;

      await tick();
      interval = setInterval(tick, 3000);
    }

    async function tick() {
      try {
        await ship_autonav_v4();

        const data = await ship_travel_progress_v5();
        if (!data) return;

        setProgress(data);
        setStatus(data.status);
        setDestination(data.to_island);

        if (data.status === "arrived") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("❌ Ship tick error", err);
      }
    }

    init();

    return () => interval && clearInterval(interval);
  }, []);

  // ===================================================
  // RENDER
  // ===================================================
  if (status === "loading") {
    return (
      <div className="game-content">
        <h2>Cargando viaje…</h2>
      </div>
    );
  }

  if (status === "arrived") {
    return (
      <div className="game-content">
        <h2>Has llegado</h2>
        <p>Destino: {destination}</p>

        <button onClick={() => navigate("/explore")}>
          Volver a explorar
        </button>
      </div>
    );
  }

  return (
    <div className="game-content">
      <h2>Viajando…</h2>

      <p>
        <strong>Destino:</strong> {destination}
      </p>

      {progress && (
        <>
          <p>
            <strong>Progreso:</strong>{" "}
            {progress.percent?.toFixed(2)}%
          </p>

          <progress
            value={progress.percent}
            max={100}
            style={{ width: "100%" }}
          />
        </>
      )}
    </div>
  );
}
