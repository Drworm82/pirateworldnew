// =======================================================
// Inventario.jsx — PirateWorld (UI SAFE / MOCK)
// Inventario y equipamiento (wireframe)
// =======================================================

import React, { useEffect, useState } from "react";
import { listInventory, getBalance } from "../lib/supaApi";

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [balance, setBalance] = useState(0);

  const [equipment, setEquipment] = useState({
    sombrero: null,
    camisa: null,
    pantalon: null,
    botas: null,
    guantes: null,
    rol1: null,
    rol2: null,
  });

  // ---------------------------------------------------
  // INIT (mock)
  // ---------------------------------------------------
  useEffect(() => {
    async function load() {
      const inv = await listInventory();
      const bal = await getBalance();
      setItems(inv);
      setBalance(bal);
    }
    load();
  }, []);

  // ---------------------------------------------------
  // MOCK ACTIONS
  // ---------------------------------------------------
  function equip(slot) {
    setEquipment((e) => ({
      ...e,
      [slot]: e[slot] ? null : "Ítem equipado",
    }));
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div style={styles.page}>
      <h2>Inventario</h2>

      {/* BALANCE */}
      <div style={styles.card}>
        <strong>Doblones:</strong> {balance}
      </div>

      {/* EQUIPMENT */}
      <div style={styles.card}>
        <strong>Equipamiento</strong>
        <div style={styles.grid}>
          {Object.keys(equipment).map((slot) => (
            <div key={slot} style={styles.slot} onClick={() => equip(slot)}>
              <div style={styles.slotTitle}>{slot}</div>
              <div style={styles.slotItem}>
                {equipment[slot] ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ITEMS */}
      <div style={styles.card}>
        <strong>Objetos</strong>
        {items.length === 0 && <p>Inventario vacío</p>}
        <ul>
          {items.map((it, i) => (
            <li key={i}>{it.name ?? "Objeto desconocido"}</li>
          ))}
        </ul>
      </div>

      {/* ROLE */}
      <div style={styles.card}>
        <button style={styles.button}>Ver rol / sinergias</button>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginTop: 8,
  },
  slot: {
    padding: 8,
    border: "1px dashed #999",
    borderRadius: 6,
    cursor: "pointer",
  },
  slotTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  slotItem: {
    marginTop: 4,
    fontWeight: "bold",
  },
  button: {
    padding: 12,
    cursor: "pointer",
  },
};
