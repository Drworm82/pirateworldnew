import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import NavBar from "./components/NavBar";

import { fsmController, SCENES } from "./controllers/fsmController";
import { overlayFSM, OVERLAY_TYPES } from "./controllers/overlayFSM";

// Screens (NOMBRES REALES)
import FirstTimeGPS from "./screens/FirstTimeGPS";
import GPSNomad from "./screens/GPSNomad";
import PortIdle from "./screens/PortIdle";
import PortTravel from "./screens/PortTravel";
import Profile from "./screens/Profile";
import EventScreen from "./screens/EventScreen";

// Overlays
import MenuOverlay from "./overlays/Menu";
import InventoryOverlay from "./overlays/Inventory";
import MapRPGOverlay from "./overlays/MapRPG";
import CrewOverlay from "./overlays/Crew";

export default function App() {
  const [scene, setScene] = useState(fsmController.getState());
  const [overlay, setOverlay] = useState(overlayFSM.getState());

  useEffect(() => {
    const unsubFSM = fsmController.subscribe(setScene);
    const unsubOverlay = overlayFSM.subscribe(setOverlay);
    return () => {
      unsubFSM();
      unsubOverlay();
    };
  }, []);

  function renderScreen() {
    switch (scene) {
      case SCENES.FIRST_TIME_GPS:
        return <FirstTimeGPS />;

      case SCENES.GPS_NOMAD:
        return <GPSNomad />;

      case SCENES.PORT_IDLE:
        return <PortIdle />;

      case SCENES.PORT_TRAVEL:
        return <PortTravel />;

      case SCENES.PROFILE:
        return <Profile />;

      case SCENES.EVENT:
        return <EventScreen />;

      default:
        return null;
    }
  }

  function renderOverlays() {
    return (
      <>
        {overlay === OVERLAY_TYPES.MENU && <MenuOverlay />}
        {overlay === OVERLAY_TYPES.INVENTORY && <InventoryOverlay />}
        {overlay === OVERLAY_TYPES.MAP_RPG && <MapRPGOverlay />}
        {overlay === OVERLAY_TYPES.CREW && <CrewOverlay />}
      </>
    );
  }

  return (
    <Layout
      screen={renderScreen()}
      navbar={<NavBar />}
      cta={null}
      overlays={renderOverlays()}
    />
  );
}
