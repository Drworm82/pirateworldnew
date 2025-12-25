import React from "react";
import { overlayFSM } from "../fsm/overlayFSM";

export default function RpgMapOverlay() {
  const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const panel = {
    width: "90%",
    height: "80%",
    background: "#1e1e1e",
    color: "#fff",
    padding: "12px",
    border: "1px solid #444",
  };

  const handleBackdropClick = () => {
    overlayFSM.close();
  };

  return (
    <div style={backdrop} onClick={handleBackdropClick}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <strong>Mapa del Mundo (RPG)</strong>
        <div style={{ marginTop: "20px", opacity: 0.7 }}>
          Vista RPG — solo lectura
        </div>
      </div>
    </div>
  );
}
