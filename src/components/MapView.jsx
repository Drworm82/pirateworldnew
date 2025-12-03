// src/components/MapView.jsx
import React from "react";

export default function MapView({ lat, lng, status }) {
  const valid = lat !== null && lng !== null && lat !== undefined;

  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: 12,
        padding: 20,
        width: 420,
        height: 300,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <h3 style={{ marginTop: 0 }}>🗺️ Mapa</h3>

      {!valid && (
        <p style={{ color: "#aaa" }}>El barco no tiene posición todavía…</p>
      )}

      {valid && (
        <div
          style={{
            position: "absolute",
            left: `${200 + (lng * 2)}px`,
            top: `${150 - (lat * 2)}px`,
            width: 12,
            height: 12,
            background: status === "travelling" ? "#3a6cff" : "#22c55e",
            borderRadius: "50%",
            transition: "left 1.4s linear, top 1.4s linear",
          }}
        />
      )}
    </div>
  );
}
