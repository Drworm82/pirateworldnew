// src/components/ShipHUD.jsx
import React from "react";

export default function ShipHUD({ progress }) {
  if (!progress) return null;

  const {
    status,
    percent,
    eta,
    destination,
    origin,
    lat,
    lng,
  } = progress;

  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #30363d",
        padding: 20,
        borderRadius: 12,
        maxWidth: 420,
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        ⚓ Estado del Barco
      </h3>

      <p><b>Estado:</b> {status}</p>
      <p><b>Destino:</b> {destination?.name || "Ninguno"}</p>
      <p><b>Progreso:</b> {percent?.toFixed(1)}%</p>
      {eta && <p><b>ETA:</b> {new Date(eta).toLocaleTimeString()}</p>}

      <p>
        <b>Posición:</b> {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "---"}
      </p>

      <div
        style={{
          marginTop: 10,
          height: 6,
          width: "100%",
          borderRadius: 4,
          background: "#1e293b",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 4,
            background: "#3a6cff",
          }}
        />
      </div>
    </div>
  );
}
