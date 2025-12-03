// ==============================================
// Missions.jsx — Placeholder estable
// ==============================================

import React, { useEffect, useState } from "react";
import { ensureUser, getUserState } from "../lib/supaApi";

export default function Missions() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);

  useEffect(() => {
    async function load() {
      const user = await ensureUser();
      const s = await getUserState(); // STUB
      setState(s);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Cargando misiones...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Misiones (placeholder)</h1>
      <p>Este módulo aún no está conectado al backend.</p>

      <pre style={{ background: "#222", padding: 12, borderRadius: 8 }}>
{JSON.stringify(state, null, 2)}
      </pre>

      <p>Más misiones pronto.</p>
    </div>
  );
}
