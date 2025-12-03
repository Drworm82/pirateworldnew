// src/components/SeaEventCard.jsx
import React from "react";
import eventsDict from "../config/eventsDict.js";

/**
 * Recibe:
 * event = {
 *   type: "storm" | "wind" | "loot" | "pirates" | "whale" | "current" | ...
 *   message: string (desde backend, opcional)
 *   created_at: timestamp
 * }
 */

export default function SeaEventCard({ event }) {
  if (!event) return null;

  // Tomar datos desde el diccionario
  const info = eventsDict[event.type] || eventsDict.default;

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.75)",
        border: `1px solid ${info.color}`,
        padding: "14px 18px",
        borderRadius: 12,
        width: "260px",
        color: "white",
        fontFamily: "sans-serif",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>{info.icon}</div>

      <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 6 }}>
        {info.title}
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.3 }}>
        {info.message}
      </div>
    </div>
  );
}
