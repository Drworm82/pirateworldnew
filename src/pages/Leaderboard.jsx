// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { getSupa } from "../lib/supaApi.js";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const supa = getSupa();

        // 1) Top 10 por doblones
        const { data: users, error: errU } = await supa
          .from("users")
          .select("id, email, soft_coins, created_at")
          .order("soft_coins", { ascending: false })
          .limit(10);

        if (errU) throw errU;

        if (!users || users.length === 0) {
          if (!cancelled) {
            setRows([]);
            setStatus("empty");
          }
          return;
        }

        const ids = users.map((u) => u.id);

        // 2) Stats de cada usuario (nivel + rango)
        const { data: stats, error: errS } = await supa
          .from("user_stats")
          .select("user_id, level, rank")
          .in("user_id", ids);

        if (errS) throw errS;

        const mapStats = new Map();
        (stats || []).forEach((s) => {
          mapStats.set(s.user_id, {
            level: s.level,
            rank: s.rank,
          });
        });

        const merged = users.map((u) => {
          const st = mapStats.get(u.id) || {};
          return {
            ...u,
            level: st.level ?? 1,
            rank: st.rank ?? "Novato",
          };
        });

        if (!cancelled) {
          setRows(merged);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error cargando leaderboard:", err);
        if (!cancelled) {
          setErrorMsg(err.message || "No se pudo cargar el leaderboard.");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function medalForIndex(idx) {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return "";
  }

  return (
    <div className="page-container ledger-page">
      <header className="ledger-header">
        <h1 className="big">Piratas más peligrosos</h1>
        <p className="ledger-subtitle">
          Top 10 jugadores ordenados por <strong>doblones</strong> en su cuenta.
          No afecta el combate directamente, pero sí deja claro con quién te
          estás metiendo.
        </p>
      </header>

      <div className="card ledger-card">
        {status === "loading" && <p className="muted">Cargando leaderboard…</p>}

        {status === "error" && (
          <p className="ledger-error">
            Ocurrió un error al cargar el leaderboard:
            <br />
            <code>{errorMsg}</code>
          </p>
        )}

        {status === "empty" && (
          <p className="muted">
            Aún no hay jugadores con doblones suficientes para mostrar en el
            ranking.
          </p>
        )}

        {status === "ready" && rows.length > 0 && (
          <div className="ledger-table-wrap">
            <div className="ledger-table-scroll">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Capitán</th>
                    <th>Doblones</th>
                    <th>Nivel</th>
                    <th>Rango</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u, idx) => {
                    const medal = medalForIndex(idx);
                    return (
                      <tr key={u.id}>
                        <td>
                          {idx + 1} {medal && <span>{medal}</span>}
                        </td>
                        <td>{u.email || "(sin email)"}</td>
                        <td className="ledger-delta-cell">
                          <span className="ledger-delta ledger-delta-positive">
                            {u.soft_coins ?? 0}
                          </span>
                        </td>
                        <td>{u.level}</td>
                        <td>{u.rank}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {status === "ready" && rows.length > 0 && (
        <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          Futuro: puedes dar recompensas semanales a los piratas con más
          doblones (títulos, cosméticos, misiones especiales, etc.).
        </p>
      )}
    </div>
  );
}
