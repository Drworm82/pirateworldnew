// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { getSupa, ensureUser } from "../lib/supaApi.js";

// Mismo helper que usamos en Crew.jsx
const FALLBACK_EMAIL = "worm_jim@hotmail.com";

function getCurrentEmail() {
  if (typeof window === "undefined") return FALLBACK_EMAIL;

  const fromDemo = window.localStorage.getItem("demoEmail");
  const fromDemoUser = window.localStorage.getItem("demoUserEmail");
  const fromLegacy = window.localStorage.getItem("userEmail");

  return fromDemo || fromDemoUser || fromLegacy || FALLBACK_EMAIL;
}

function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;

  if (user.length <= 3) {
    return `${user[0]}***@${domain}`;
  }
  return `${user.slice(0, 3)}***@${domain}`;
}

function displayName(row) {
  const pirate = (row?.pirate_name || "").trim();
  if (pirate) return pirate;
  return maskEmail(row?.email || "");
}

function medalForIndex(idx) {
  if (idx === 0) return "🥇";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return "";
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error
  const [errorMsg, setErrorMsg] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const supa = getSupa();

        // 1) Identificar usuario actual (para resaltar su fila)
        let myId = null;
        try {
          const email = getCurrentEmail();
          const { user } = await ensureUser(email);
          myId = user?.id ?? null;
        } catch {
          // si falla, simplemente no resaltamos
          myId = null;
        }
        if (!cancelled) {
          setCurrentUserId(myId);
        }

        // 2) Top 10 por nivel + XP desde la función leaderboard_top_xp()
        const { data, error } = await supa.rpc("leaderboard_top_xp");

        if (error) {
          throw error;
        }

        let list = data || [];

        // Por si Supabase devolviera array con wrapper tipo { leaderboard_top_xp: { ... } }
        if (
          Array.isArray(list) &&
          list.length > 0 &&
          list[0] &&
          list[0].leaderboard_top_xp
        ) {
          list = list.map((row) => row.leaderboard_top_xp);
        }

        if (!list || list.length === 0) {
          if (!cancelled) {
            setRows([]);
            setStatus("empty");
          }
          return;
        }

        if (!cancelled) {
          setRows(list);
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

  return (
    <div className="page-container ledger-page">
      <header className="ledger-header">
        <h1 className="big">Piratas más experimentados</h1>
        <p className="ledger-subtitle">
          Top 10 capitanes ordenados por <strong>nivel y XP</strong>. Los
          doblones se muestran solo como referencia.
        </p>
      </header>

      <div className="card ledger-card">
        {status === "loading" && (
          <p className="muted">Cargando leaderboard…</p>
        )}

        {status === "error" && (
          <p className="ledger-error">
            Ocurrió un error al cargar el leaderboard:
            <br />
            <code>{errorMsg}</code>
          </p>
        )}

        {status === "empty" && (
          <p className="muted">
            Aún no hay piratas con suficiente experiencia para mostrar en el
            ranking. Completa tus primeras misiones para ser el{" "}
            <strong>primer nombre</strong> en esta tabla.
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
                    <th>Nivel</th>
                    <th>XP</th>
                    <th>Rango</th>
                    <th>Doblones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u, idx) => {
                    const medal = medalForIndex(idx);
                    const isMe =
                      currentUserId && u.user_id === currentUserId;

                    const rowStyle = isMe
                      ? {
                          background: "rgba(34,197,94,0.08)",
                          boxShadow:
                            "0 0 0 1px rgba(34,197,94,0.25)",
                        }
                      : undefined;

                    return (
                      <tr key={u.user_id || u.email || idx} style={rowStyle}>
                        <td>
                          {idx + 1} {medal && <span>{medal}</span>}
                        </td>
                        <td>{displayName(u)}</td>
                        <td>{u.level}</td>
                        <td>{u.xp}</td>
                        <td>{u.rank}</td>
                        <td className="ledger-delta-cell">
                          <span className="ledger-delta ledger-delta-positive">
                            {u.soft_coins ?? 0}
                          </span>
                        </td>
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
          Futuro: se pueden dar recompensas semanales a los piratas con más
          experiencia (títulos, cosméticos, misiones especiales, etc.).
        </p>
      )}
    </div>
  );
}
