import React from "react";
import { FSM, getState, requestTransition } from "../fsm/fsmController";

/**
 * CentralCTA — CANON
 * - Observa FSM
 * - Dispara SOLO transiciones explícitas
 * - No hooks inexistentes
 * - No lógica implícita
 */

export default function CentralCTA() {
  const state = getState().currentState;

  let label = "";
  let next = null;

  // CANON CTA cycle
  switch (state) {
    case FSM.S0: // FIRST_TIME_GPS
      label = "Plantar isla";
      next = FSM.S2; // PORT_IDLE
      break;

    case FSM.S2: // PORT_IDLE
      label = "Zarpar";
      next = FSM.S3; // PORT_TRAVEL
      break;

    case FSM.S3: // PORT_TRAVEL
      label = "Explorar";
      next = FSM.S1; // GPS_NOMAD
      break;

    default:
      return null; // CTA no visible
  }

  return (
    <button
      onClick={() => next && requestTransition(next)}
      style={styles.cta}
    >
      {label}
    </button>
  );
}

const styles = {
  cta: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "var(--color-accent-cta)",
    color: "#fff",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  },
};
