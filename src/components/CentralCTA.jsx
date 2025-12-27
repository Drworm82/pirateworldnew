// src/components/CentralCTA.jsx
import React, { useState, useEffect } from 'react';
import { fsmController, SCENES } from '../controllers/fsmController';

export default function CentralCTA() {
  const [fsmState, setFsmState] = useState(fsmController.getState());

  useEffect(() => {
    return fsmController.subscribe(setFsmState);
  }, []);

  // Determinar texto y visibilidad basado en estado
  const getCtaConfig = (state) => {
    switch (state) {
      case SCENES.FIRST_TIME_GPS:
        return { text: 'INICIAR AVENTURA', visible: true };
      case SCENES.PORT_IDLE:
        return { text: 'ZARPAR', visible: true };
      case SCENES.PORT_TRAVEL:
        return { text: 'LLEGAR AL DESTINO', visible: true };
      case SCENES.GPS_NOMAD:
        return { text: 'BUSCAR PUERTO', visible: true };
      case SCENES.EVENT:
        return { text: 'RESOLVER', visible: true };
      default:
        return { text: 'ACCION', visible: false };
    }
  };

  const config = getCtaConfig(fsmState);

  if (!config.visible) return null;

  return (
    <div className="central-cta-container">
        <button 
        className="central-cta" 
        onClick={() => fsmController.cta()}
        >
        ⚓
        </button>
        <span className="cta-label">{config.text}</span>
    </div>
  );
}
