import React, { useEffect, useState } from "react";
import { FSM, getState, subscribe } from "./fsm/fsmController";
import { overlayFSM, OVERLAY } from "./fsm/overlayFSM";

import GPS from "./pages/GPS.jsx";
import Port from "./pages/Port.jsx";
import Profile from "./pages/Profile.jsx";
import Misiones from "./pages/Misiones.jsx";

import InventoryOverlay from "./components/InventoryOverlay.jsx";
import CrewOverlay from "./components/CrewOverlay.jsx";
import RpgMapOverlay from "./components/RpgMapOverlay.jsx";
import EventOverlay from "./components/EventOverlay.jsx";

import HamburgerMenu from "./components/HamburgerMenu.jsx";
import HamburgerButton from "./components/HamburgerButton.jsx";
import NavBar from "./components/NavBar.jsx";

import "./theme.css";

function ScreenByState({ fsmState }) {
  switch (fsmState) {
    case FSM.S0:
    case FSM.S1:
      return <GPS fsmState={fsmState} />;
    case FSM.S2:
    case FSM.S3:
      return <Port fsmState={fsmState} />;
    case FSM.S5:
      return <Profile />;
    default:
      return null;
  }
}

export default function App() {
  const [fsmState, setFsmState] = useState(getState().currentState);
  const [currentOverlay, setCurrentOverlay] = useState(overlayFSM.getCurrent());
  const [menuOpen, setMenuOpen] = useState(false);
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setBootReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Suscripción FSM Principal
  useEffect(() => {
    return subscribe((state) => {
      setFsmState(state.currentState);
    });
  }, []);

  // Suscripción Overlay FSM
  useEffect(() => {
    return overlayFSM.subscribe((state) => {
      setCurrentOverlay(state.current);
    });
  }, []);

  return (
    <>
      {/* PANTALLA PRINCIPAL */}
      <ScreenByState fsmState={fsmState} />

      {/* RENDERIZADO DE OVERLAYS (Capa Superior) */}
      {currentOverlay === OVERLAY.INVENTORY && <InventoryOverlay />}
      {currentOverlay === OVERLAY.CREW && <CrewOverlay />}
      {currentOverlay === OVERLAY.MAP_RPG && <RpgMapOverlay />}
      {currentOverlay === OVERLAY.MISSIONS && <Misiones />}

      {/* EVENTO BLOQUEANTE */}
      {bootReady && currentOverlay === OVERLAY.EVENT && <EventOverlay />}

      {/* MENÚ HAMBURGUESA */}
      {menuOpen && <HamburgerMenu onClose={() => setMenuOpen(false)} />}
      <HamburgerButton onClick={() => setMenuOpen(v => !v)} />

      {/* HUD NAVEGACIÓN */}
      <NavBar />
    </>
  );
}