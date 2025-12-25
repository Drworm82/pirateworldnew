import React, { useEffect, useState } from "react";
import { getSupa } from "../lib/supaApi";

/**
 * Misiones — Overlay RO
 * Sprint 79
 *
 * ✔ UI-only
 * ✔ Read-only real
 * ✔ Overlay-safe
 * ✔ Sin FSM
 * ✔ Sin CTA
 * ✔ Sin backend writes
 */

export default function Misiones() {
  const UI = {
    LOADING: "LOADING",
    EMPTY: "EMPTY",
    READY: "READY",
    ERROR: "ERROR",
  };

  const [uiState, setUiState] = useState(UI.LOADING);
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadMissions() {
      setUiState(UI.LOADING);

      try {
        const supa = getSupa();

        const { data, error } = await supa.rpc("rpc_get_missions_ro");

        if (!mounted) return;

        if (error) {
          console.error("Misiones RPC error:", error);
          setUiState(UI.ERROR);
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          setMissions([]);
          setUiState(UI.EMPTY);
          return;
        }

        setMissions(data);
        setUiState(UI.READY);
      } catch (err) {
        console.error("Misiones load error:", err);
        setUiState(UI.ERROR);
      }
    }

    loadMissions();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Misiones</h1>

      {uiState === UI.LOADING && (
        <p className="text-sm opacity-70">Cargando misiones…</p>
      )}

      {uiState === UI.ERROR && (
        <p className="text-sm text-red-500">
          Error al cargar las misiones.
        </p>
      )}

      {uiState === UI.EMPTY && (
        <p className="text-sm opacity-70">
          No hay misiones disponibles por ahora.
        </p>
      )}

      {uiState === UI.READY && (
        <ul className="space-y-3 text-sm">
          {missions.map((m) => (
            <li
              key={m.id}
              className="border border-dashed border-gray-600 p-3 rounded"
            >
              <div className="font-semibold">{m.title}</div>
              {m.description && (
                <p className="opacity-70 mt-1">{m.description}</p>
              )}
              {m.status && (
                <div className="mt-2 opacity-60">
                  Estado: {m.status}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
