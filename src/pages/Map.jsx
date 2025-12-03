// src/pages/Map.jsx
import React, { useEffect, useState } from "react";
import { ensureUser, getShipProgress } from "../lib/supaApi.js";

export default function MapPage() {
  const [ship, setShip] = useState(null);

  useEffect(() => {
    async function load() {
      const user = await ensureUser();
      const prog = await getShipProgress(user.id);
      setShip(prog);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Mapa (Versión simple)</h2>

      <p style={{ opacity: 0.7 }}>
        Próximamente: mapa interactivo, movimiento real, zoom, panning y ruta.
      </p>

      <pre
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        {JSON.stringify(ship, null, 2)}
      </pre>
    </div>
  );
}
