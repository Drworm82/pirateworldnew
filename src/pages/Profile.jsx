import React, { useEffect, useState } from "react";
import * as supaApi from "../lib/supaApi";
import { UI_STATE, resolveUIState } from "../fsm/uiStateFSM";

/**
 * PROFILE — UI Read-Only
 * FSM UI States (Sprint 67)
 */

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(false);
        const result = await supaApi.getPlayerSummary();
        if (!alive) return;
        setData(result ?? null);
      } catch (e) {
        console.error("[PROFILE]", e);
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  const uiState = resolveUIState({
    loading,
    error,
    data,
    isEmpty: !data,
  });

  // ----------------------------
  // RENDER POR ESTADO UI (CANON)
  // ----------------------------

  if (uiState === UI_STATE.LOADING) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.center}>Cargando perfil…</div>
      </div>
    );
  }

  if (uiState === UI_STATE.ERROR || uiState === UI_STATE.EMPTY) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.center}>Perfil no disponible</div>
      </div>
    );
  }

  // READY
  return (
    <div style={styles.container}>
      <Header />

      <Block label="Rango" value={data.rank} />
      <Block label="Título" value={data.title} />
      <Block label="Reputación" value={data.reputation_score} />

      <div style={styles.divider} />

      <div style={styles.stats}>
        <Stat label="Tripulación" value={data.crew_count} />
        <Stat label="Islas" value={data.islands_count} />
        <Stat label="Viajes" value={data.travel_count} />
      </div>
    </div>
  );
}

/* ───────────────────────────── */

function Header() {
  return (
    <div style={styles.header}>
      <span>Perfil</span>
    </div>
  );
}

function Block({ label, value }) {
  return (
    <div style={styles.block}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value ?? "—"}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statValue}>{value ?? 0}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ───────────────────────────── */

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#111",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    fontSize: "15px",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
    fontSize: "14px",
  },
  block: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  label: {
    fontSize: "12px",
    opacity: 0.7,
  },
  value: {
    fontSize: "16px",
    marginTop: "2px",
  },
  divider: {
    height: "12px",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0",
  },
  stat: {
    textAlign: "center",
  },
  statValue: {
    fontSize: "18px",
  },
  statLabel: {
    fontSize: "11px",
    opacity: 0.7,
  },
};
