import React from "react";
import { overlayFSM, OVERLAY } from "../fsm/overlayFSM";

export default function CrewOverlay() {
  const backdrop = {
    position: "fixed", // Cambiar a fixed para alinearlo con los otros overlays
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

  const member = {
    fontSize: "13px",
    padding: "6px 0",
    borderBottom: "1px solid #333",
  };

  function handleBackdropClick() {
    overlayFSM.close(); // Cierra el overlay al hacer clic fuera
  }

  return (
    <div style={backdrop} onClick={handleBackdropClick}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
          Tripulación (RO)
        </div>

        <div style={member}>Capitán — Moral: 😊</div>
        <div style={member}>Navegante — Moral: 🙂</div>
        <div style={member}>Artillero — Moral: 😐</div>
        <div style={member}>Cocinero — Moral: 😄</div>
      </div>
    </div>
  );
}
