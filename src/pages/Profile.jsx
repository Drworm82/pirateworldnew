// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { getSupa } from "../lib/supaApi.js";

// Usuario DEMO fijo
const DEMO_USER_ID = "b54196c8-0fd3-4e7a-be91-9c8c72e35cbd";
const DEMO_EMAIL = "worm_jim@hotmail.com";

export default function Profile() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [state, setState] = useState(null);

  const [pirateInput, setPirateInput] = useState("");
  const [savingPirate, setSavingPirate] = useState(false);
  const [pirateMessage, setPirateMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");
      setPirateMessage("");

      try {
        const supa = getSupa();

        const { data, error } = await supa.rpc("get_user_state", {
          p_user_id: DEMO_USER_ID,
        });

        if (error) {
          throw error;
        }

        // data viene como jsonb plano en RPC,
        // pero dejamos compatibilidad por si viniera envuelto
        let payload;
        if (Array.isArray(data)) {
          const first = data[0] || {};
          payload = first.get_user_state || first || {};
        } else {
          payload = data && data.get_user_state ? data.get_user_state : data || {};
        }

        // Si la función devuelve { ok:false, ... }
        if (payload && payload.ok === false) {
          throw new Error(payload.error || "user_not_found");
        }

        const merged = {
          userId: payload.user_id || DEMO_USER_ID,
          email: payload.email || DEMO_EMAIL,
          pirate_name: payload.pirate_name || null,

          level: payload.level ?? 1,
          rank: payload.rank || "Grumete",
          soft_coins: payload.soft_coins ?? 0,

          // 👇 OJO: aquí usamos LOS NOMBRES REALES del JSON
          xpCurrent: payload.xp ?? 0,
          xpNext:
            payload.xp_next ??
            ((payload.level || 1) * 100),

          influence: payload.influence_score ?? 0,
          missionsCompleted: payload.missions_completed_total ?? 0,
        };

        if (!cancelled) {
          setState(merged);
          setPirateInput(merged.pirate_name || "");
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

  // ----------------- guardar nombre pirata -----------------

  async function handleSavePirateName() {
    if (!state) return;
    const raw = pirateInput.trim();

    setPirateMessage("");

    if (raw.length < 3 || raw.length > 24) {
      setPirateMessage("El nombre debe tener entre 3 y 24 caracteres.");
      return;
    }

    setSavingPirate(true);
    try {
      const supa = getSupa();
      const { data, error } = await supa.rpc("set_pirate_name", {
        p_user_id: state.userId,
        p_pirate_name: raw,
      });

      if (error) {
        throw error;
      }

      let resp = data;
      if (Array.isArray(data)) {
        const first = data[0] || {};
        resp = first.set_pirate_name || first || {};
      }

      if (resp && resp.ok === false) {
        const code = resp.error || "error";
        if (code === "invalid_chars") {
          setPirateMessage(
            "Nombre inválido. Usa letras, números, espacios y acentos comunes."
          );
        } else if (code === "too_short") {
          setPirateMessage("El nombre es demasiado corto.");
        } else if (code === "too_long") {
          setPirateMessage("El nombre es demasiado largo.");
        } else {
          setPirateMessage("No se pudo guardar el nombre pirata.");
        }
        return;
      }

      setState((prev) =>
        prev
          ? {
              ...prev,
              pirate_name: raw,
            }
          : prev
      );
      setPirateMessage("Nombre pirata guardado.");
    } catch (err) {
      console.error("Error set_pirate_name:", err);
      setPirateMessage(err.message || "No se pudo guardar el nombre pirata.");
    } finally {
      setSavingPirate(false);
    }
  }

  // ----------------- estados intermedios -----------------

  if (status === "loading") {
    return (
      <div className="page-container ledger-page">
        <p className="muted">Cargando perfil…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Perfil de capitán</h1>
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
        <h1 className="big">Perfil de capitán</h1>
        <p className="muted">
          No se encontró información de usuario. Revisa que exista el usuario
          demo en la base de datos.
        </p>
      </div>
    );
  }

  // ----------------- render normal -----------------

  const {
    email,
    pirate_name,
    level,
    rank,
    soft_coins,
    xpCurrent,
    xpNext,
    influence,
    missionsCompleted,
  } = state;

  const safeNext = xpNext > 0 ? xpNext : 1;
  const progress = Math.max(
    0,
    Math.min(100, Math.round((xpCurrent / safeNext) * 100))
  );

  const displayPirateName = pirate_name || "Sin nombre pirata";

  return (
    <div className="page-container ledger-page">
      <header className="ledger-header">
        <h1 className="big">Perfil de capitán</h1>
        <p className="ledger-subtitle">
          Aquí ves tu <strong>nombre pirata, nivel, experiencia e influencia</strong>.
          Esta pantalla está pensada para crecer con logros, títulos y más
          estadísticas sociales de PirateWorld.
        </p>
      </header>

      <div className="card ledger-card">
        {/* Nombre pirata + email */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#888" }}>Nombre pirata</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            {displayPirateName}
          </div>

          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
            Email (solo tú lo ves)
          </div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{email}</div>
        </div>

        {/* Cambiar nombre pirata */}
        <div
          style={{
            marginBottom: 24,
            padding: 12,
            borderRadius: 12,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 6 }}>
            Cambiar nombre pirata
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <input
              type="text"
              placeholder="Ej. Capitán Shiro"
              value={pirateInput}
              onChange={(e) => setPirateInput(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                background: "#020617",
                color: "#e5e7eb",
                borderRadius: 999,
                border: "1px solid #1f2937",
                padding: "8px 12px",
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={handleSavePirateName}
              disabled={savingPirate}
            >
              {savingPirate ? "Guardando…" : "Guardar nombre"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            3–24 caracteres. Se permiten acentos, ñ, números y espacios.
          </div>
          {pirateMessage && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: pirateMessage.includes("guardado")
                  ? "#4ade80"
                  : "#fca5a5",
              }}
            >
              {pirateMessage}
            </div>
          )}
        </div>

        {/* Tarjetas: Nivel / Doblones / XP */}
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

        {/* Barra de progreso */}
        <div style={{ marginBottom: 20 }}>
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

        {/* Influencia + Misiones completadas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Influencia</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{influence}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Sube al participar en misiones y acciones clave de tripulación.
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Misiones completadas</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {missionsCompleted}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Cuenta total de misiones que has terminado en Pirate World.
            </div>
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
        Futuro: desde aquí se podrán ver logros, tiempo jugado, banderas
        personalizadas y estadísticas sociales avanzadas.
      </p>
    </div>
  );
}
