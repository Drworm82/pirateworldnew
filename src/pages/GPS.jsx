// =======================================================
// GPS.jsx — PirateWorld (UI SAFE / MOCK)
// Pantalla principal GPS (wireframe)
// =======================================================

import React, { useEffect, useState } from "react";
import { shipGetStateV5 } from "../lib/supaApi";

export default function GPS() {
  const [shipState, setShipState] = useState(null);
  const [mode, setMode] = useState("sedentario"); // sedentario | nomada

  // ---------------------------------------------------
  // INIT (mock)
  // ---------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      const state = await shipGetStateV5();
      if (mounted) setShipState(state);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div style={styles.page}>
      <h2>GPS</h2>

      {/* MAP PLACEHOLDER */}
      <div style={styles.map}>
        <div style={styles.mapLabel}>MAPA (placeholder)</div>

        {/* Player */}
        <div style={{ ...styles.marker, top: "50%", left: "50%" }}>
          🧍
        </div>

        {/* Island */}
        <div style={{ ...styles.marker, top: "30%", left: "60%" }}>
          🏝️
        </div>

        {/* Dungeon */}
        <div style={{ ...styles.marker, top: "65%", left: "40%" }}>
          🏚️
        </div>

        {/* Fog of war */}
        <div style={styles.fog}>Fog of War</div>
      </div>

      {/* INFO */}
      <div style={styles.card}>
        <strong>Estado del barco:</strong>{" "}
        {shipState?.status ?? "desconocido"}
      </div>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button style={styles.button}>Entrar al dungeon</button>
        <button style={styles.button}>Ver mi barco</button>
      </div>

      {/* MODE SWITCH */}
      <div style={styles.card}>
        <strong>Modo:</strong>{" "}
        <button
          style={styles.link}
          onClick={() =>
            setMode((m) => (m === "sedentario" ? "nomada" : "sedentario"))
          }
        >
          {mode}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------
// STYLES (wireframe only)
// ---------------------------------------------------

const styles = {
  page: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  map: {
    position: "relative",
    height: 260,
    border: "2px dashed #999",
    borderRadius: 8,
    background: "#f4f4f4",
    overflow: "hidden",
  },
  mapLabel: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 12,
    opacity: 0.6,
  },
  marker: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    fontSize: 18,
  },
  fog: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "35%",
    height: "100%",
    background: "rgba(0,0,0,0.15)",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "#fff",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    cursor: "pointer",
  },
  link: {
    marginLeft: 8,
    cursor: "pointer",
  },
};
