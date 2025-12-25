import React from "react";
import { overlayFSM } from "../fsm/overlayFSM";

/**
 * EventOverlay — BLOQUEANTE
 * CANON:
 * - Se renderiza SOLO cuando overlayFSM.current === EVENT
 * - JAMÁS se auto-abre
 */

export default function EventOverlay() {
  return (
    <div style={styles.backdrop}>
      <div style={styles.panel}>
        <h3>Tormenta inesperada</h3>

        <p>
          El cielo se oscurece y el mar comienza a agitarse.
          La tripulación espera órdenes.
        </p>

        <p><strong>Riesgo:</strong> MEDIO</p>

        <div style={styles.options}>
          <button>A — Reducir velocidad</button>
          <button>B — Mantener rumbo</button>
          <button>C — Buscar refugio</button>
        </div>

        <button
          onClick={() => overlayFSM.close()}
          style={styles.continue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 3000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "90%",
    maxWidth: "320px",
    background: "#1f1f1f",
    color: "#fff",
    padding: "16px",
    border: "1px solid #444",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "12px 0",
  },
  continue: {
    marginTop: "8px",
  },
};
