// ======================================================================
// SeaEventsBox.jsx — HUD ULTRA (evento actual)
// ======================================================================

import React from "react";
import "./SeaEventsBox.css";

export default function SeaEventsBox({ events }) {
  if (!events || events.length === 0) return null;

  const last = events[events.length - 1];

  if (last.expired) return null;

  const typeClass = {
    storm: "sev-storm",
    pirates: "sev-pirates",
    loot: "sev-loot",
    waves: "sev-waves",
    default: "sev-default",
  }[last.type || "default"];

  const icon = {
    storm: "⛈️",
    pirates: "🏴‍☠️",
    loot: "💰",
    waves: "🌊",
    default: "✨",
  }[last.type || "default"];

  return (
    <div className={`sea-event-box ${typeClass}`}>
      <div className="sev-icon">{icon}</div>

      <div className="sev-content">
        <div className="sev-title">{last.title}</div>
        <div className="sev-desc">{last.description}</div>
        <div className="sev-time">{last.time}</div>
      </div>
    </div>
  );
}
