// src/pages/Ledger.jsx
import React, { useEffect, useState } from "react";
import { getLastUserId, getUserLedger } from "../lib/supaApi.js";

export default function Ledger() {
  const [userId, setUserId] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | no-user | loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const id = getLastUserId();
    if (!id) {
      setStatus("no-user");
      return;
    }
    setUserId(id);

    (async () => {
      setStatus("loading");
      try {
        const data = await getUserLedger(id);
        setRows(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setErrorMsg(err?.message || "Error al cargar movimientos.");
        setStatus("error");
      }
    })();
  }, []);

  return (
    <section className="ledger-page">
      <header className="ledger-header">
        <h1 className="big">Ledger de usuario</h1>

        {userId && (
          <p className="ledger-subtitle">
            Mostrando los últimos movimientos de:{" "}
            <code className="ledger-user-id">{userId}</code>
          </p>
        )}

        {status === "no-user" && (
          <p className="ledger-subtitle">
            No hay usuario cargado todavía. Primero use la pestaña{" "}
            <strong>“Demo usuario”</strong> para crear o cargar uno.
          </p>
        )}
      </header>

      <div className="card ledger-card">
        {status === "loading" && (
          <p className="muted">Cargando movimientos…</p>
        )}

        {status === "error" && (
          <p className="ledger-error">
            Ocurrió un error al cargar el ledger:
            <br />
            <code>{errorMsg}</code>
          </p>
        )}

        {status === "ready" && rows.length === 0 && (
          <p className="muted">No hay movimientos todavía.</p>
        )}

        {status === "ready" && rows.length > 0 && (
          <div className="ledger-table-wrap">
            <div className="ledger-table-scroll">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Δ Doblones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => {
                    const delta = Number(m.delta ?? 0);
                    const isPositive = delta >= 0;
                    const formattedDate = new Date(
                      m.created_at
                    ).toLocaleString();

                    return (
                      <tr key={m.id}>
                        <td className="ledger-date">{formattedDate}</td>
                        <td className="ledger-type">{m.type}</td>
                        <td className="ledger-delta-cell">
                          <span
                            className={
                              "ledger-delta " +
                              (isPositive ? "ledger-delta-positive" : "ledger-delta-negative")
                            }
                          >
                            {isPositive ? `+${delta}` : delta}
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
    </section>
  );
}
