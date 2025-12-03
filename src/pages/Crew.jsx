// ==============================================
// Crew.jsx — Placeholder estable
// ==============================================

import React, { useEffect, useState } from "react";
import { ensureUser, getCrew } from "../lib/supaApi";

export default function Crew() {
  const [loading, setLoading] = useState(true);
  const [crew, setCrew] = useState([]);

  useEffect(() => {
    async function load() {
      await ensureUser();
      const c = await getCrew(); // STUB
      setCrew(c);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Cargando tripulación...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Tripulación (placeholder)</h1>
      <p>Este módulo aún no está conectado al backend.</p>

      <ul>
        {crew.map((c) => (
          <li key={c.id}>
            {c.role}: {c.name}
          </li>
        ))}
      </ul>

      <p>Sistema de tripulación llegará pronto.</p>
    </div>
  );
}
