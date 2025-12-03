// =======================================================
// SeaEventCard.jsx — Tarjeta compacta para eventos del mar
// =======================================================

import React from "react";

const colors = {
  default: "#4da3ff",
  storm: "#ff4d4d",
  pirates: "#ff914d",
  current: "#4dffb8",
  wind: "#4da3ff",
  whale: "#a1a1ff",
  loot: "#ffe44d",
};

const icons = {
  default: "🌊",
  storm: "🌩",
  pirates: "🏴‍☠️",
  current: "🌊",
  wind: "💨",
  whale: "🐋",
  loot: "🎁",
};

export default function SeaEventCard({ event }) {
  if (!event) return null;

  const type = event.type || "default";

  return (
    <div
      style={{
        marginTop: 10,
        padding: "10px 14px",
        background: "rgba(0,0,0,0.45)",
        borderRadius: 8,
        border: `1px solid ${colors[type] || colors.default}`,
        color: "white",
        maxWidth: 420,
      }}
    >
      <div style={{ fontSize: 22 }}>
        {icons[type] || icons.default}{" "}
        <strong>{event.title || "Evento del mar"}</strong>
      </div>
      <div style={{ marginTop: 5, opacity: 0.9 }}>
        {event.description || ""}
      </div>
    </div>
  );
}
