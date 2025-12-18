// =======================================================
// Zarpar.jsx — PirateWorld (UI SAFE / MOCK)
// Pantalla previa al viaje (wireframe)
// =======================================================

import React, { useEffect, useState } from "react";
import { shipTravelCostPreviewV5, shipTravelStartV5 } from "../lib/supaApi";

export default function Zarpar() {
  const [destination, setDestination] = useState("");
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------
  // PREVIEW (mock)
  // ---------------------------------------------------
  async function handlePreview() {
    setLoading(true);
    const p = await shipTravelCostPreviewV5({
      destination,
      lat: coords.lat,
      lng: coords.lng,
    });
    setPreview(p);
    setLoading(false);
  }

  // ---------------------------------------------------
  // START TRAVEL (mock)
  // ---------------------------------------------------
  async function handleZarpar() {
    await shipTravelStartV5();
    window.location.hash = "#/ui/viaje";
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div style={styles.page}>
      <h2>Zarpar</h2>

      {/* DESTINATION */}
      <div style={styles.card}>
        <strong>Destino</strong>
        <input
          style={styles.input}
          placeholder="Nombre de isla"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {/* COORDS */}
      <div style={styles.card}>
        <strong>Coordenadas (opcional)</strong>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Latitud"
            value={coords.lat}
            onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Longitud"
            value={coords.lng}
            onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
          />
        </div>
      </div>

      {/* PREVIEW */}
      <button style={styles.button} onClick={handlePreview} disabled={loading}>
        {loading ? "Calculando…" : "Ver costo y tiempo"}
      </button>

      {preview && (
        <div style={styles.card}>
          <p>
            <strong>Distancia:</strong> {preview.distance_km} km
          </p>
          <p>
            <strong>Tiempo estimado:</strong> {preview.eta_minutes} min
          </p>
          <p>
            <strong>Costo:</strong> {preview.cost_doblones} doblones
          </p>
          <p>
            <strong>Riesgo:</strong> {preview.risk}
          </p>
        </div>
      )}

      {/* CONFIRM */}
      <button
        style={{ ...styles.button, marginTop: 8 }}
        onClick={handleZarpar}
      >
        Zarpar
      </button>
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
  row: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    padding: 8,
  },
  button: {
    padding: 12,
    cursor: "pointer",
  },
};
