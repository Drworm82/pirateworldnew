import React from "react";

export default function RpgMapOverlay({ onClose, readOnly }) {
  const backdrop = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const panel = {
    width: "90%",
    height: "85%",
    maxWidth: "420px",
    background: "#1b1b1b",
    color: "#ffffff",
    border: "1px solid #444",
    boxShadow: "0 0 30px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
  };

  const header = {
    padding: "10px 12px",
    borderBottom: "1px solid #333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  };

  const mapArea = {
    flex: 1,
    background:
      "repeating-linear-gradient(45deg, #2a2a2a, #2a2a2a 10px, #242424 10px, #242424 20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    opacity: 0.9,
  };

  const footer = {
    padding: "8px 12px",
    borderTop: "1px solid #333",
    fontSize: "12px",
    opacity: 0.85,
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>Mapa del Mundo (RPG)</div>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={mapArea}>
          {readOnly
            ? "Mapa RPG — Vista de solo lectura (en viaje)"
            : "Mapa RPG — Vista libre (en puerto)"}
        </div>

        <div style={footer}>
          {readOnly ? "Modo: Solo lectura" : "Modo: Exploración visual"}
        </div>
      </div>
    </div>
  );
}
