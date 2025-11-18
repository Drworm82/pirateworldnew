// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { getSupa, ensureUser, getUserState } from "../lib/supaApi.js";

const FALLBACK_EMAIL = "worm_jim@hotmail.com";

function getCurrentEmail() {
  if (typeof window === "undefined") return FALLBACK_EMAIL;

  const fromDemo = window.localStorage.getItem("demoEmail");
  const fromDemoUser = window.localStorage.getItem("demoUserEmail");
  const fromLegacy = window.localStorage.getItem("userEmail");

  const email = fromDemo || fromDemoUser || fromLegacy || FALLBACK_EMAIL;
  return email;
}

export default function Profile() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [state, setState] = useState(null);        // get_user_state result
  const [userMeta, setUserMeta] = useState(null);  // { id, email }

  // Form de nombre pirata
  const [pirateForm, setPirateForm] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");
      setNameError("");
      setNameSuccess("");

      try {
        const supa = getSupa();

        // 1) Aseguramos usuario a partir de email (mismo patrón que Missions.jsx)
        const email = getCurrentEmail();
        const { user: u } = await ensureUser(email);

        if (!u?.id) {
          throw new Error("No se pudo obtener el usuario actual.");
        }

        // 2) Cargamos estado completo vía RPC get_user_state
        const freshState = await getUserState({ userId: u.id });

        if (!cancelled) {
          setUserMeta({ id: u.id, email: freshState?.email || email });
          setState(freshState || null);
          setPirateForm(freshState?.pirate_name || "");
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

  // ------------------------------------------------------------
  // Guardar nombre pirata → llama RPC set_pirate_name
  // ------------------------------------------------------------
  async function handleSavePirateName(e) {
    e.preventDefault();
    if (!userMeta?.id) return;

    const raw = pirateForm || "";
    const trimmed = raw.trim();

    setNameError("");
    setNameSuccess("");

    // Validación rápida del lado del cliente
    if (trimmed.length < 3) {
      setNameError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (trimmed.length > 24) {
      setNameError("El nombre no puede tener más de 24 caracteres.");
      return;
    }

    // Misma expresión que en el backend: letras (con acentos y ñ),
    // números, espacio, guion bajo y guion medio.
    const regex = /^[0-9A-Za-zÁÉÍÓÚáéíóúÑñÜü _-]+$/;
    if (!regex.test(trimmed)) {
      setNameError(
        "Solo se permiten letras (incluyendo acentos y ñ), números, espacios, guion y guion bajo."
      );
      return;
    }

    try {
      setSavingName(true);
      const supa = getSupa();

      const { data, error } = await supa.rpc("set_pirate_name", {
        p_user_id: userMeta.id,
        p_pirate_name: trimmed,
      });

      if (error) {
        console.error("Error RPC set_pirate_name:", error);
        setNameError("No se pudo guardar el nombre pirata.");
        return;
      }

      if (data?.error) {
        // Mapear errores del backend a mensajes amigables
        switch (data.error) {
          case "too_short":
            setNameError("El nombre es demasiado corto (mínimo 3 caracteres).");
            break;
          case "too_long":
            setNameError(
              "El nombre es demasiado largo (máximo 24 caracteres)."
            );
            break;
          case "invalid_chars":
            setNameError(
              "Caracteres no permitidos. Usa letras (con acentos y ñ), números, espacios, guion y guion bajo."
            );
            break;
          case "name_taken":
            setNameError("Ese nombre pirata ya está en uso. Prueba otro.");
            break;
          default:
            setNameError("No se pudo guardar el nombre pirata.");
            break;
        }
        return;
      }

      const newName = data?.pirate_name || trimmed;

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        pirate_name: newName,
      }));
      setPirateForm(newName);
      setNameSuccess("Nombre pirata actualizado correctamente.");
    } catch (err) {
      console.error("Error al guardar nombre pirata:", err);
      setNameError("No se pudo guardar el nombre pirata.");
    } finally {
      setSavingName(false);
    }
  }

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
          en la base de datos.
        </p>
      </div>
    );
  }

  // ---- Render normal ----

  const {
    email,
    pirate_name,
    level = 1,
    rank = "Grumete",
    soft_coins = 0,
    influence_score = 0,
    missions_completed_total = 0,
  } = state;

  const xpCurrent = state.xp ?? state.xp_current ?? 0;
  const xpNext = state.xp_next ?? level * 100;
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
          Aquí ves tu <strong>nombre pirata, nivel, experiencia e influencia</strong>.
          Esta pantalla está pensada para crecer con logros, títulos y más
          estadísticas sociales de PirateWorld.
        </p>
      </header>

      <div className="card ledger-card">
        {/* Identidad: nombre pirata + email (el email solo lo ves tú) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#888" }}>Nombre pirata</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {pirate_name || "Sin nombre pirata"}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#888" }}>Email (solo tú lo ves)</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{email}</div>
        </div>

        {/* Editor de nombre pirata */}
        <form
          onSubmit={handleSavePirateName}
          style={{
            marginBottom: 24,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            Cambiar nombre pirata
          </div>
          <input
            type="text"
            value={pirateForm}
            onChange={(e) => {
              setPirateForm(e.target.value);
              setNameError("");
              setNameSuccess("");
            }}
            placeholder="Ej. Capitán Shiro"
            maxLength={32}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.3)",
              color: "white",
              fontSize: 14,
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="submit"
              disabled={savingName}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                background: savingName ? "#4b5563" : "#22c55e",
                color: "#020617",
                fontSize: 14,
                fontWeight: 600,
                cursor: savingName ? "default" : "pointer",
              }}
            >
              {savingName ? "Guardando…" : "Guardar nombre"}
            </button>
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              3–24 caracteres. Se permiten acentos, ñ, números y espacios.
            </span>
          </div>
          {nameError && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#fecaca" }}>
              {nameError}
            </div>
          )}
          {nameSuccess && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#bbf7d0" }}>
              {nameSuccess}
            </div>
          )}
        </form>

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

        {/* Prestigio social */}
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
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {influence_score ?? 0}
            </div>
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
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Misiones completadas
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {missions_completed_total ?? 0}
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
