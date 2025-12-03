// =======================================
// HudPirata.jsx — HUD Pirata global
// =======================================

import React from "react";
import { Link } from "react-router-dom";

export default function HudPirata({ coins = 0, energy = 100, shipStatus = "idle" }) {
  return (
    <>
      {/* === HUD — TOP BAR === */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 5000,
          color: "white",
          fontFamily: "Cinzel, serif",
          letterSpacing: "0.5px",
        }}
      >
        {/* Hora del juego */}
        <div style={{ fontSize: 20, fontWeight: "bold" }}>
          🕓 {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>

        {/* Estado del barco */}
        <div
          style={{
            fontSize: 14,
            opacity: 0.8,
          }}
        >
          🚢 Estado: <strong>{shipStatus}</strong>
        </div>

        {/* Monedas / Energía */}
        <div style={{ display: "flex", gap: 20, fontSize: 18 }}>
          <span>🪙 {coins}</span>
          <span>⚡ {energy}</span>
        </div>
      </div>

      {/* === HUD — BOTTOM MENU BAR === */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          zIndex: 5000,
          color: "white",
          fontSize: 15,
        }}
      >
        <Link to="/" style={iconStyle}>🏠<div style={labelStyle}>Inicio</div></Link>
        <Link to="/explore" style={iconStyle}>🧭<div style={labelStyle}>Explorar</div></Link>
        <Link to="/inventory" style={iconStyle}>🎒<div style={labelStyle}>Inventario</div></Link>
        <Link to="/islands" style={iconStyle}>🏝<div style={labelStyle}>Islas</div></Link>
        <Link to="/quests" style={iconStyle}>📜<div style={labelStyle}>Misiones</div></Link>
      </div>
    </>
  );
}

// Estilos globales reutilizables
const iconStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "white",
  textDecoration: "none",
  fontSize: 26,
  transition: "0.2s",
};

const labelStyle = {
  fontSize: 12,
  marginTop: 2,
  opacity: 0.8,
};
