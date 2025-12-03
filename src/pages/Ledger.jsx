// =====================================================
// Leaderboard.jsx — V6 (estable + compatible con supaApi.js v10)
// =====================================================

import React, { useEffect, useState } from "react";
import { ensureUser, getMyShipRow } from "../lib/supaApi.js";

// Debug short alias
const DBG = (...a) => console.log("[Leaderboard.jsx]", ...a);

export default function Leaderboard() {
  const [status, setStatus] = useState("loading");
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        DBG("=== LOAD LEADERBOARD START ===");

        const uid = await ensureUser("anon");
        DBG("User ID:", uid);

        DBG("Fetching ship leaderboard…");
        const res = await fetch(
          "/rest/v1/ships?select=id,user_id,current_island,travel_percent,updated_at&order=travel_percent.desc",
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        const data = await res.json();
        DBG("Leaderboard data:", data);

        setLeaders(data ?? []);
        setStatus("ready");
      } catch (err) {
        console.error("[Leaderboard.jsx] ERROR:", err);
        setStatus("error");
      }
    })();
  }, []);

  // =====================================================
  // UI — Estados
  // =====================================================

  if (status === "loading") {
    return (
      <div style={{ padding: 20, color: "white" }}>
        Cargando leaderboard…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ padding: 20, color: "red" }}>
        Error cargando el leaderboard. Revisa consola.
      </div>
    );
  }

  // =====================================================
  // UI PRINCIPAL
  // =====================================================

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>🏆 Leaderboard</h2>

      {leaders.length === 0 && (
        <p>No hay barcos registrados aún.</p>
      )}

      {leaders.map((row, idx) => (
        <div
          key={row.id}
          style={{
            marginBottom: 14,
            padding: 12,
            border: "1px solid #4da3ff",
            borderRadius: 8,
          }}
        >
          <div>
            <strong># {idx + 1}</strong>
          </div>

          <div><strong>User:</strong> {row.user_id}</div>
          <div><strong>Isla actual:</strong> {row.current_island ?? "Desconocida"}</div>
          <div><strong>Progreso:</strong> {row.travel_percent?.toFixed(2) ?? 0}%</div>

          <div style={{ fontSize: "0.8em", marginTop: 4 }}>
            <i>Actualizado: {row.updated_at}</i>
          </div>
        </div>
      ))}
    </div>
  );
}
