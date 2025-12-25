import React, { useEffect, useState } from "react";
import * as supaApi from "../lib/supaApi";
import { UI_STATE, resolveUIState } from "../fsm/uiStateFSM";

/**
 * HUD — Read-Only · Datos reales
 * FSM UI States aplicada (Sprint 67)
 *
 * - Usa rpc_get_player_summary()
 * - No calcula nada
 * - No toca FSM principal
 * - No routing
 * - UX sin cambios
 */

export default function HUD() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadHUD() {
      setLoading(true);
      setError(false);

      try {
        const summary = await supaApi.getPlayerSummary();
        if (!alive) return;
        setData(summary ?? null);
      } catch (err) {
        console.error("[HUD] RPC error:", err);
        if (!alive) return;
        setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadHUD();
    return () => {
      alive = false;
    };
  }, []);

  /* -------------------------
     FSM UI STATE (CANON)
  ------------------------- */

  const uiState = resolveUIState({
    loading,
    error,
    data,
    isEmpty: !data,
  });

  /* -------------------------
     RENDER POR ESTADO UI
  ------------------------- */

  if (uiState === UI_STATE.LOADING) {
    return (
      <div style={styles.hud}>
        <span style={styles.muted}>Cargando…</span>
      </div>
    );
  }

  if (uiState === UI_STATE.ERROR || uiState === UI_STATE.EMPTY) {
    return (
      <div style={styles.hud}>
        <span style={styles.muted}>HUD no disponible</span>
      </div>
    );
  }

  /* -------------------------
     READY (sin cambios UX)
  ------------------------- */

  return (
    <div style={styles.hud}>
      <div style={styles.left}>
        <div style={styles.rank}>{data.rank ?? "—"}</div>
        <div style={styles.title}>{data.title ?? ""}</div>
      </div>

      <div style={styles.right}>
        <Stat label="Rep" value={data.reputation_score ?? 0} />
        <Stat label="Trip" value={data.crew_count ?? 0} />
        <Stat label="Islas" value={data.islands_count ?? 0} />
      </div>
    </div>
  );
}

/* -------------------------
   COMPONENTES RO
------------------------- */

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

/* -------------------------
   ESTILOS LOCALES (HUD)
------------------------- */

const styles = {
  hud: {
    width: "100%",
    height: "48px",
    padding: "0 12px",
    background: "#0f0f0f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  rank: {
    fontSize: "13px",
    fontWeight: "bold",
  },
  title: {
    fontSize: "11px",
    opacity: 0.7,
  },
  right: {
    display: "flex",
    gap: "12px",
  },
  stat: {
    textAlign: "center",
    minWidth: "40px",
  },
  statValue: {
    fontSize: "13px",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: "10px",
    opacity: 0.6,
  },
  muted: {
    fontSize: "12px",
    opacity: 0.6,
  },
};
