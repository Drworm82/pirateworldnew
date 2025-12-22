import React from "react";

export default function InventoryOverlay({ onClose }) {
  const backdrop = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 30,
    display: "flex",
    justifyContent: "flex-end",
  };

  const panel = {
    width: "260px",
    height: "100%",
    background: "#1e1e1e",
    color: "#fff",
    padding: "12px",
    borderLeft: "1px solid #444",
  };

  const header = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  };

  const item = {
    fontSize: "13px",
    padding: "6px 0",
    borderBottom: "1px solid #333",
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>Inventario (RO)</div>
          <button onClick={onClose}>X</button>
        </div>

        <div style={item}>🍞 Provisiones ×12</div>
        <div style={item}>⚓ Piezas de barco ×4</div>
        <div style={item}>🧭 Mapas viejos ×2</div>
        <div style={item}>💰 Doblones ×145</div>
      </div>
    </div>
  );
}
