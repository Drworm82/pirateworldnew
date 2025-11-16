// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { getSupa } from "../lib/supaApi.js";

// Usuario DEMO fijo (el que ya viste en tu query de get_user_state)
const DEMO_USER_ID = "b54196c8-0fd3-4e7a-be91-9c8c72e35cbd";
const DEMO_EMAIL = "worm_jim@hotmail.com";

export default function Profile() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [state, setState] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const supa = getSupa();

        // Llamamos directo al RPC get_user_state(p_user_id uuid)
        const { data, error } = await supa.rpc("get_user_state", {
          p_user_id: DEMO_USER_ID,
        });

        if (error) {
          throw error;
        }

        // Según cómo lo definiste, puede venir:
        // 1) como objeto plano { ok, user_id, email, ... } o
        // 2) como array [{ get_user_state: { ... } }]
        let payload;
        if (Array.isArray(data)) {
          const first = data[0] || {};
          payload = first.get_user_state || first || {};
        } else {
          payload = data && data.get_user_state ? data.get_user_state : data || {};
        }

        const merged = {
          userId: payload.user_id || DEMO_USER_ID,
          email: payload.email || DEMO_EMAIL,
          level: payload.level ?? 1,
          rank: payload.rank || "Novato",
          soft_coins: payload.soft_coins ?? 0,
          // XP: de momento tu función no lo devuelve, metemos fallback
          xpCurrent: payload.xp_current ?? payload.xp ?? 0,
          xpNext:
            payload.xp_next ??
            ((payload.level || 1) * 100), // 100 XP por nivel como demo
        };

        if (!cancelled) {
          setState(merged);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
        if (!cancelled) {
          setErrorMsg(err.message || "No se pudo cargar el perfil.");
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Estados intermedios / error ----

  if (status === "loading") {
    return (
      <div className="page-container">
        <p className="muted">Cargando perfil…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Perfil</h1>
        <p className="ledger-error">
          Ocurrió un error al cargar tu perfil:
          <br />
          <code>{errorMsg}</code>
        </p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Perfil</h1>
        <p className="muted">
          No se encontró información de usuario. Revisa que exista el usuario
          demo en la base de datos.
        </p>
      </div>
    );
  }

  // ---- Render normal ----

  const { email, level, rank, soft_coins, xpCurrent, xpNext } = state;
  const safeNext = xpNext > 0 ? xpNext : 1;
  const progress = Math.max(
    0,
    Math.min(100, Math.round((xpCurrent / safeNext) * 100))
  );

  return (
    <div className="page-container ledger-page">
      <header className="ledger-header">
        <h1 className="big">Perfil de capitán</h1>
        <p className="ledger-subtitle">
          Aquí ves tu <strong>nivel, experiencia y doblones acumulados</strong>.
          Esta pantalla está pensada para crecer con logros, títulos y más
          estadísticas de PirateWorld.
        </p>
      </header>

      <div className="card ledger-card">
        {/* Email / identificador */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#888" }}>Email</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{email}</div>
        </div>

        {/* Tres tarjetas: Nivel, Doblones, XP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Nivel / Rango */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Nivel</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Lv. {level}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Rango: {rank}</div>
          </div>

          {/* Doblones */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Doblones</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {soft_coins ?? 0}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Moneda blanda para compras normales en la tienda.
            </div>
          </div>

          {/* XP */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>XP</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {xpCurrent} / {safeNext}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Ganas XP al completar misiones y otros eventos del juego.
            </div>
          </div>
        </div>

        {/* Barra de progreso hacia siguiente nivel */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            <span>Progreso hacia el siguiente nivel</span>
            <span>{progress}%</span>
          </div>

          <div
            style={{
              width: "100%",
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #22c55e, #a3e635, #facc15)",
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
        Futuro: desde aquí se pueden ver logros, tiempo jugado, barcos
        desbloqueados y estadísticas de combate PvP/PvE.
      </p>
    </div>
  );
}
