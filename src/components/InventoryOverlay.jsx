import React from "react";
import { overlayFSM } from "../fsm/overlayFSM";

export default function InventoryOverlay({ readOnly }) {
  const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 40,
    display: "flex",
    justifyContent: "flex-end",
  };

  const panel = {
    width: "280px",
    background: "#1e1e1e",
    padding: "12px",
  };

  const handleBackdropClick = () => {
    overlayFSM.close();
  };

  return (
    <div style={backdrop} onClick={handleBackdropClick}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <strong>Inventario {readOnly && "(solo lectura)"}</strong>
        <div>Madera — 12</div>
        <div>Comida — 8</div>
        <div>Oro — 3</div>
      </div>
    </div>
  );
}
