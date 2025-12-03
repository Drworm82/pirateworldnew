// =============================================
// SeaEvents.jsx — PirateWorld (Sprint A03)
// Muestra eventos recientes del mar del jugador
// =============================================

import React, { useEffect, useState } from "react";
import { getSeaEvents } from "../lib/supaApi.js";

export default function SeaEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getSeaEvents();
      setEvents(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Cargando eventos del mar...</p>;

  if (events.length === 0)
    return <p>No hay eventos del mar registrados aún.</p>;

  return (
    <div className="page-container">
      <h1 className="big">🌊 Eventos del Mar</h1>

      <section className="card ledger-card">
        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              padding: "12px",
              marginBottom: "10px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p>
              <strong>Evento:</strong> {ev.event_key}
            </p>

            <p>
              <strong>Daño HP:</strong>{" "}
              <span style={{ color: ev.hp_change < 0 ? "#ff5555" : "#aaffaa" }}>
                {ev.hp_change}
              </span>
            </p>

            <p>
              <strong>Oro:</strong>{" "}
              <span
                style={{ color: ev.gold_change > 0 ? "#ffd700" : "#ccc" }}
              >
                {ev.gold_change}
              </span>
            </p>

            {ev.items?.length > 0 && (
              <p>
                <strong>Items:</strong> {ev.items.join(", ")}
              </p>
            )}

            <p>
              <strong>Detectado por:</strong>{" "}
              {ev.detected_by === "vigia" ? "👀 Vigía" : "Normal"}
            </p>

            <p style={{ opacity: 0.6, marginTop: 4 }}>
              {new Date(ev.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
