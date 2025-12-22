import React from "react";

export default function EventOverlay({ onClose }) {
  const backdrop = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modal = {
    width: "90%",
    maxWidth: "360px",
    background: "#1e1e1e",
    color: "#ffffff",
    border: "1px solid #555",
    padding: "16px",
    boxShadow: "0 0 24px rgba(0,0,0,0.7)",
  };

  const title = {
    fontSize: "16px",
    marginBottom: "6px",
  };

  const narrative = {
    fontSize: "13px",
    opacity: 0.85,
    marginBottom: "10px",
  };

  const risk = {
    fontSize: "12px",
    marginBottom: "10px",
    color: "#f0c040",
  };

  const option = {
    padding: "8px",
    marginTop: "6px",
    background: "#2a2a2a",
    border: "1px solid #444",
    fontSize: "13px",
  };

  const actions = {
    marginTop: "14px",
    display: "flex",
    justifyContent: "flex-end",
  };

  const btn = {
    padding: "6px 12px",
    fontSize: "13px",
    background: "#333",
    border: "1px solid #666",
    color: "#fff",
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={title}>Tormenta inesperada</div>
        <div style={narrative}>
          El cielo se oscurece y el mar comienza a agitarse.  
          La tripulación espera órdenes.
        </div>

        <div style={risk}>Riesgo: MEDIO</div>

        <div style={option}>A — Reducir velocidad</div>
        <div style={option}>B — Mantener rumbo</div>
        <div style={option}>C — Buscar refugio</div>

        <div style={actions}>
          <button style={btn} onClick={onClose}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
