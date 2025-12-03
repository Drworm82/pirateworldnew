// ==============================================
// Inventory.jsx — Placeholder estable
// ==============================================

import React, { useEffect, useState } from "react";
import { ensureUser, getUserInventory } from "../lib/supaApi";

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [inv, setInv] = useState([]);

  useEffect(() => {
    async function load() {
      await ensureUser();
      const items = await getUserInventory(); // STUB
      setInv(items);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Cargando inventario...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Inventario (placeholder)</h1>
      <p>Este módulo aún no está conectado al backend.</p>

      <ul>
        {inv.map((i) => (
          <li key={i.id}>
            {i.name} — {i.qty}
          </li>
        ))}
      </ul>

      <p>Más funcionalidades próximamente.</p>
    </div>
  );
}
