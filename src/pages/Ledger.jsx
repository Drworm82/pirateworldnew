// ============================
// Ledger.jsx — PirateWorld (V3 Clean)
// ============================

import React, { useEffect, useState } from "react";
import { ensureUser, getUserLedger } from "../lib/supaApi.js";
import { toast } from "react-hot-toast";

export default function LedgerPage() {
  const [user, setUser] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // LOAD USER + LEDGER
  // ============================
  useEffect(() => {
    (async () => {
      try {
        const { user } = await ensureUser("worm_jim@hotmail.com");
        setUser(user);

        await loadLedger(user.id);
      } catch (err) {
        console.error("Error loading ledger:", err);
        toast.error("Error al cargar el historial");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============================
  // LOAD LEDGER RPC
  // ============================
  async function loadLedger(userId) {
    try {
      const rows = await getUserLedger(userId);
      setLedger(rows || []);
    } catch (err) {
      console.error("Ledger RPC error:", err);
      toast.error("No se pudo obtener el historial");
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="page-container">
      <h1 className="big">Historial Económico</h1>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <section className="card ledger-card">
            <h2>Tu historial</h2>

            {ledger.length === 0 && <p>No hay transacciones aún.</p>}

            {ledger.map((row) => (
              <div
                key={row.id}
                className="ledger-entry"
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "8px",
                  backgroundColor: "#f3f3f3",
                }}
              >
                <p><strong>Tipo:</strong> {row.type}</p>
                <p><strong>Monto:</strong> {row.amount > 0 ? `+${row.amount}` : row.amount} monedas</p>
                <p><strong>Descripción:</strong> {row.description}</p>
                <p><strong>Fecha:</strong> {new Date(row.created_at).toLocaleString()}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
