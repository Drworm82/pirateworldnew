import React, { useEffect, useState } from "react";
import LoginDev from "./dev/LoginDev";

/* FSM */
import { fsmController, SCENES } from "./controllers/fsmController";
import { overlayFSM, OVERLAY_TYPES } from "./controllers/overlayFSM";

/* UI */
import NavBar from "./components/NavBar";
import CentralCTA from "./components/CentralCTA";

/* Screens */
import FirstTimeGPS from "./screens/FirstTimeGPS";
import GPSNomad from "./screens/GPSNomad";
import PortIdle from "./screens/PortIdle";
import PortTravel from "./screens/PortTravel";
import EventScreen from "./screens/EventScreen";

/* Overlays */
import Menu from "./overlays/Menu";
import Inventory from "./overlays/Inventory";
import MapRPG from "./overlays/MapRPG";
import Crew from "./overlays/Crew";
import ProfileOverlay from "./overlays/ProfileOverlay";
import EventOverlay from "./overlays/EventOverlay";

export default function App() {
  const [scene, setScene] = useState(fsmController.getState());
  const [overlay, setOverlay] = useState(overlayFSM.getState());

  useEffect(() => {
    const unsubScene = fsmController.subscribe(setScene);
    const unsubOverlay = overlayFSM.subscribe(setOverlay);

    return () => {
      unsubScene();
      unsubOverlay();
    };
  }, []);

  function renderScreen() {
    switch (scene) {
      case SCENES.FIRST_TIME_GPS:
        return <FirstTimeGPS />;
      case SCENES.PORT_IDLE:
        return <PortIdle />;
      case SCENES.PORT_TRAVEL:
        return <PortTravel />;
      case SCENES.GPS_NOMAD:
        return <GPSNomad />;
      case SCENES.EVENT:
        return <EventScreen />;
      default:
        return null;
    }
  }

  function renderOverlay() {
    switch (overlay) {
      case OVERLAY_TYPES.MENU:
        return <Menu />;
      case OVERLAY_TYPES.INVENTORY:
        return <Inventory />;
      case OVERLAY_TYPES.MAP_RPG:
        return <MapRPG />;
      case OVERLAY_TYPES.CREW:
        return <Crew />;
      case OVERLAY_TYPES.PROFILE:
        return <ProfileOverlay />;
      case OVERLAY_TYPES.EVENT:
        return <EventOverlay />;
      default:
        return null;
    }
  }

  return (
    <>
      {renderScreen()}
      <NavBar />
      <CentralCTA />
      {renderOverlay()}

      {/* LOGIN DEV — SOLO LOCAL */}
      {import.meta.env.DEV && <LoginDev />}
    </>
  );
}
