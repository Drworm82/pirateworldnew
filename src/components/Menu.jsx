import React from "react";
import { navigationFSM } from "../fsm/navigationFSM";
import { overlayFSM } from "../fsm/overlayFSM";

/**
 * Menú Hamburguesa — CANON
 * Sprint 68 — fix definitivo
 *
 * Regla clave:
 * - GPS no es un item
 * - Cerrar PROFILE equivale a volver a GPS
 * - "Perfil" es toggle (open / close)
 */

export default function Menu() {
  const handlePerfil = () => {
    // EVENT bloquea todo
    if (overlayFSM.isEventActive()) return;

    // TOGGLE CANON
    if (navigationFSM.isProfileOpen()) {
      navigationFSM.closeProfile();
    } else {
      navigationFSM.openProfile();
    }
  };

  return (
    <div className="menu">
      <div className="menu-title">
        Menú
      </div>

      <button>Tripulación</button>
      <button>Banco</button>
      <button>Misiones</button>
      <button>Parcelas</button>

      {/* PERFIL: toggle */}
      <button onClick={handlePerfil}>
        Perfil
      </button>
    </div>
  );
}
