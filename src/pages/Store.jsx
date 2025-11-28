// ============================
// Store.jsx — PirateWorld (V3 Clean)
// ============================

import React, { useEffect, useState } from "react";
import { ensureUser, getStoreItems, buyItem } from "../lib/supaApi.js";
import { toast } from "react-hot-toast";

export default function StorePage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  // ============================
  // LOAD USER + STORE ITEMS
  // ============================
  useEffect(() => {
    (async () => {
      try {
        const { user } = await ensureUser("worm_jim@hotmail.com");
        setUser(user);

        await loadItems();
      } catch (err) {
        console.error(err);
        toast.error("Error cargando la tienda");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============================
  // LOAD ITEMS
  // ============================
  async function loadItems() {
    try {
      const data = await getStoreItems();
      setItems(data || []);
    } catch (err) {
      console.error("Error loading store items:", err);
      toast.error("No se pudo cargar la tienda");
    }
  }

  // ============================
  // BUY ITEM
  // ============================
  async function handleBuy(itemId) {
    if (!user) return;
    setBuyingId(itemId);

    try {
      const result = await buyItem(user.id, itemId);

      if (!result?.ok) {
        toast.error(result?.error || "No se pudo comprar");
      } else {
        toast.success(`Comprado: ${result.item_name}`);
      }

      await loadItems();
    } catch (err) {
      console.error("Error buying item:", err);
      toast.error("Error al comprar el item");
    } finally {
      setBuyingId(null);
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="page-container">
      <h1 className="big">Tienda del Puerto</h1>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <section className="card ledger-card">
          <h2>Artículos disponibles</h2>

          {items.length === 0 && <p>No hay artículos en la tienda.</p>}

          {items.map((item) => (
            <div
              key={item.id}
              className="store-item"
              style={{
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
                backgroundColor: "#f4f4f4",
              }}
            >
              <h3>{item.name}</h3>
              <p>{item.description || "Sin descripción"}</p>

              <p>
                <strong>Precio:</strong> {item.price} monedas
              </p>
              <p>
                <strong>Categoría:</strong> {item.category}
              </p>
              <p>
                <strong>Rareza:</strong> {item.rarity}
              </p>

              <button
                className="btn btn-primary"
                disabled={buyingId === item.id}
                onClick={() => handleBuy(item.id)}
              >
                {buyingId === item.id ? "Comprando…" : "Comprar"}
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
