import React, { useEffect, useState } from "react";
import { overlayFSM, OVERLAY } from "../fsm/overlayFSM";
import { getState, subscribe } from "../fsm/fsmController";
import CentralCTA from "./CentralCTA";

/**
 * NavBar — HUD inferior CANON
 * - Siempre visible
 * - Sincronizado con FSM Principal (para modo read-only)
 * - Sincronizado con OverlayFSM (para apertura de menús)
 */

export default function NavBar() {
  // Estado para la FSM de Overlays
  const [currentOverlay, setCurrentOverlay] = useState(overlayFSM.getCurrent());
  // Estado para la FSM Principal (Soluciona el error fsmState is not defined)
  const [fsmState, setFsmState] = useState(getState().currentState);

  useEffect(() => {
    // Suscripción a Overlays
    const unsubOverlay = overlayFSM.subscribe((state) => {
      setCurrentOverlay(state.current);
    });

    // Suscripción a FSM Principal
    const unsubFsm = subscribe((state) => {
      setFsmState(state.currentState);
    });

    return () => {
      unsubOverlay();
      unsubFsm();
    };
  }, []);

  const handleOverlay = (overlay) => {
    if (currentOverlay === overlay) {
      overlayFSM.close();
    } else {
      overlayFSM.open(overlay);
    }
  };

  const isEventActive = overlayFSM.isEventActive();
  
  // Lógica de solo lectura basada en los estados de tu snapshot
  const isReadOnly = fsmState === "PORT_TRAVEL" || fsmState === "GPS_NOMAD";

  return (
    <div style={styles.wrapper}>
      <div style={styles.bar}>
        {/* BOTÓN IZQUIERDA: Inventario */}
        <button
          style={{
            ...styles.sideBtn,
            color: currentOverlay === OVERLAY.INVENTORY ? "#007AFF" : "#374151",
            opacity: isEventActive ? 0.5 : 1
          }}
          onClick={() => handleOverlay(OVERLAY.INVENTORY)}
          disabled={isEventActive}
          className={isReadOnly ? "read-only" : ""}
        >
          🎒
          <div style={styles.label}>Inventario</div>
        </button>

        {/* CENTRO: CentralCTA */}
        <div style={styles.center}>
          <CentralCTA />
        </div>

        {/* BOTÓN DERECHA: Mapa */}
        <button
          style={{
            ...styles.sideBtn,
            color: currentOverlay === OVERLAY.MAP_RPG ? "#007AFF" : "#374151",
            opacity: isEventActive ? 0.5 : 1
          }}
          onClick={() => handleOverlay(OVERLAY.MAP_RPG)}
          disabled={isEventActive}
          className={isReadOnly ? "read-only" : ""}
        >
          🗺️
          <div style={styles.label}>Mapa Mundo</div>
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: "96px",
    zIndex: 1500,
    pointerEvents: "none",
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "72px",
    background: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    pointerEvents: "auto",
  },
  sideBtn: {
    background: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  label: {
    fontSize: "11px",
    marginTop: "4px",
  },
  center: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%) translateY(-24px)",
  },
};