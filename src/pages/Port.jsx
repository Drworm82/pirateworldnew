import React from "react";

/**
 * Puerto / Barco — Vista base compartida
 * UI-only · FSM-first
 * Estado 1 (Idle) / Estado 2 (Viaje)
 *
 * ⚠️ Mock visual solamente
 * ⚠️ Sin backend, sin timers, sin navegación
 */

// FLAGS LOCALES (mock FSM)
const isTraveling = false; // ← cambia a true para ver Viaje (Estado 2)
const isIdle = !isTraveling;

export default function Port() {
  return (
    <div style={styles.screen}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>Puerto / Barco</div>
        <div style={styles.state}>
          {isIdle && "Estado: En puerto (Idle)"}
          {isTraveling && "Estado: Viaje activo (Estado 2)"}
        </div>
      </div>

      {/* HUD SUPERIOR */}
      <div style={styles.hud}>
        {isIdle && (
          <>
            <div>Tripulación: 3 miembros</div>
            <button style={styles.button}>Zarpar</button>
          </>
        )}

        {isTraveling && (
          <>
            <div>ETA: 12 min</div>
            <div>Riesgo: MEDIO</div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: "45%" }} />
            </div>
          </>
        )}
      </div>

      {/* ESCENA PRINCIPAL */}
      <div style={styles.scene}>
        {isIdle && (
          <div style={styles.idleScene}>
            <div style={styles.shipBox}>Barco (Idle)</div>
            <div style={styles.waterIdle}>Agua en calma</div>
            <div style={styles.pier}>Muelle visible</div>
          </div>
        )}

        {isTraveling && (
          <div style={styles.travelScene}>
            <div style={styles.shipBox}>Barco (Viaje)</div>
            <div style={styles.waterTravel}>Agua en movimiento ~~~</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   ESTILOS (mock visual)
   ========================= */

const styles = {
  screen: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(#0e2a3a, #08161f)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.4)",
  },
  title: {
    fontWeight: "bold",
  },
  state: {
    fontSize: "13px",
    opacity: 0.85,
  },
  hud: {
    padding: "12px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    background: "rgba(0,0,0,0.25)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontSize: "14px",
  },
  button: {
    padding: "6px 12px",
    background: "#1e1e1e",
    color: "#fff",
    border: "1px solid #555",
    cursor: "default",
  },
  progressBar: {
    width: "120px",
    height: "8px",
    background: "#222",
    border: "1px solid #444",
  },
  progressFill: {
    height: "100%",
    background: "#4caf50",
  },
  scene: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    opacity: 0.9,
  },
  idleScene: {
    textAlign: "center",
  },
  travelScene: {
    textAlign: "center",
  },
  shipBox: {
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.3)",
    marginBottom: "12px",
    background: "rgba(0,0,0,0.3)",
  },
  waterIdle: {
    opacity: 0.6,
  },
  waterTravel: {
    opacity: 0.8,
    fontStyle: "italic",
  },
  pier: {
    marginTop: "8px",
    opacity: 0.6,
  },
};
