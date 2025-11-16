// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import {
  isConfigured,
  getLastUserId,
  getUserState,
  listInventory,
} from "../lib/supaApi.js";

const RARITY_LABEL = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
};

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function Inventory() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    user: null,
    rows: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) Supabase configurado
      if (!isConfigured()) {
        if (!cancelled) {
          setState({
            loading: false,
            error:
              "Supabase no está configurado. Primero vaya a la pestaña 'Setup Supabase'.",
            user: null,
            rows: [],
          });
        }
        return;
      }

      // 2) Usuario activo (last_user_id)
      const userId = getLastUserId();
      if (!userId) {
        if (!cancelled) {
          setState({
            loading: false,
            error:
              "No hay jugador activo. Primero cree o cargue un usuario en la pantalla 'Demo usuario'.",
            user: null,
            rows: [],
          });
        }
        return;
      }

      try {
        const [user, inv] = await Promise.all([
          getUserState({ userId }),
          listInventory(userId),
        ]);

        if (cancelled) return;

        if (!inv.ok) {
          setState({
            loading: false,
            error: inv.error || "Error al cargar el inventario.",
            user,
            rows: [],
          });
          return;
        }

        setState({
          loading: false,
          error: "",
          user,
          rows: inv.rows || [],
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          error: err.message || "Error al cargar el inventario.",
          user: null,
          rows: [],
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { loading, error, user, rows } = state;

  return (
    <div className="page-container store-page">
      <h1>Inventario del jugador</h1>
      <p className="muted">
        Objetos cosméticos y especiales que se han comprado en la tienda.
      </p>

      <div className="card store-header">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="store-user">
            Usuario:{" "}
            {user ? (
              <strong>{user.email}</strong>
            ) : (
              <span className="muted">(sin usuario activo)</span>
            )}
          </div>
          {loading && <span className="muted">Cargando…</span>}
        </div>
      </div>

      {error && (
        <div className="card">
          <div className="ledger-error">{error}</div>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="card">
          <p className="muted">
            Aún no hay ítems en el inventario. Se pueden comprar objetos en la
            pestaña <strong>Tienda</strong>.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="card ledger-card">
          <h3>Objetos obtenidos</h3>
          <div className="ledger-table-wrap">
            <div className="ledger-table-scroll">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Ítem</th>
                    <th>Rareza</th>
                    <th>Precio (doblones)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="ledger-date">
                        {formatDate(row.acquired_at || row.created_at)}
                      </td>
                      <td>{row.item?.name ?? "(ítem desconocido)"}</td>
                      <td>
                        {RARITY_LABEL[row.item?.rarity] ??
                          row.item?.rarity ??
                          "-"}
                      </td>
                      <td>{row.item?.price ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
