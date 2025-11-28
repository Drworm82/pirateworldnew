// ============================
// Inventory.jsx — PirateWorld (V3 Clean)
// ============================

import React, { useEffect, useState } from "react";
import { ensureUser, getUserInventory } from "../lib/supaApi.js";
import { toast } from "react-hot-toast";

export default function InventoryPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // LOAD USER + INVENTORY
  // ============================
  useEffect(() => {
    (async () => {
      try {
        const { user } = await ensureUser("worm_jim@hotmail.com");
        setUser(user);

        await loadInventory(user.id);
      } catch (err) {
        console.error(err);
        toast.error("Error cargando inventario");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============================
  // LOAD INVENTORY
  // ============================
  async function loadInventory(userId) {
    try {
      const data = await getUserInventory(userId);
      setItems(data || []);
    } catch (err) {
      console.error("Error loading inventory:", err);
      toast.error("No se pudo cargar el inventario");
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="page-container">
      <h1 className="big">Inventario</h1>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <section className="card ledger-card">
          <h2>Objetos del jugador</h2>

          {items.length === 0 && <p>No tienes objetos todavía.</p>}

          {items.map((item) => (
            <div
              key={item.id}
              className="inv-item"
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
                <strong>Categoría:</strong> {item.category}
              </p>

              <p>
                <strong>Rareza:</strong> {item.rarity}
              </p>

              <p>
                <strong>Cantidad:</strong> {item.quantity}
              </p>

              <p>
                <strong>Obtenido:</strong>{" "}
                {new Date(item.acquired_at).toLocaleString()}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
