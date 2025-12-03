// ==============================================
// Store.jsx — Placeholder estable
// ==============================================

import React, { useEffect, useState } from "react";
import { ensureUser, getStoreItems, buyItem } from "../lib/supaApi";

export default function Store() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState([]);

  useEffect(() => {
    async function load() {
      await ensureUser();
      const s = await getStoreItems(); // STUB
      setStore(s);
      setLoading(false);
    }
    load();
  }, []);

  async function handleBuy(id) {
    const res = await buyItem(id); // STUB
    alert(res.message);
  }

  if (loading) return <div>Cargando tienda...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Tienda (placeholder)</h1>
      <p>Este módulo aún no está conectado al backend.</p>

      <ul>
        {store.map((i) => (
          <li key={i.id}>
            {i.name} — {i.price} doblones
            <button
              style={{ marginLeft: 10 }}
              onClick={() => handleBuy(i.id)}
            >
              Comprar
            </button>
          </li>
        ))}
      </ul>

      <p>Pronto podrás comprar objetos reales.</p>
    </div>
  );
}
