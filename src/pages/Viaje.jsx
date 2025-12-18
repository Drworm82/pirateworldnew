// =======================================================
// Viaje.jsx — PirateWorld (UI SAFE / MOCK)
// Pantalla de viaje en curso (wireframe)
// =======================================================

import React, { useEffect, useState } from "react";
import { shipTravelProgressV5 } from "../lib/supaApi";

export default function Viaje() {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const [events, setEvents] = useState([]);

  // ---------------------------------------------------
  // MOCK PROGRESS LOOP
  // ---------------------------------------------------
  useEffect(() => {
    let pct = 0;

    const interval = setInterval(async () => {
      pct = Math.min(pct + 5, 100);

      const p = await shipTravelProgressV5();
      setProgress(pct);
      setEta(Math.max(0, 60 - pct));

      if (pct % 25 === 0 && pct !== 0) {
        setEvents((e) => [
          ...e,
          `Evento ocurrido al ${pct}% del viaje`,
        ]);
      }

      if (pct === 100) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div style={styles.page}>
      <h2>Viaje en curso</h2>

      {/* PROGRESS */}
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>
        <p>{progress}% completado</p>
      </div>

      {/* STATS */}
      <div style={styles.card}>
        <p>
          <strong>ETA:</strong> {eta} min
        </p>
        <p>
          <strong>Velocidad:</strong> normal
        </p>
        <p>
          <strong>Clima:</strong> estable
        </p>
        <p>
          <strong>Riesgo:</strong> bajo
        </p>
        <p>
          <strong>HP del barco:</strong> 100%
        </p>
      </div>

      {/* EVENTS */}
      <div style={styles.card}>
        <strong>Eventos</strong>
        {events.length === 0 && <p>Sin eventos aún</p>}
        <ul>
          {events.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button style={styles.button}>Acelerar (ver anuncio)</button>
        <button
          style={styles.button}
          onClick={() => (window.location.hash = "#/ui/gps")}
        >
          Volver al GPS
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------
// STYLES (wireframe only)
// ---------------------------------------------------

const styles = {
  page: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "#fff",
  },
  progressBar: {
    height: 16,
    background: "#eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#999",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    cursor: "pointer",
  },
};
