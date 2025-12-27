// src/overlays/EventOverlay.jsx
import React from 'react';
import { overlayFSM } from '../controllers/overlayFSM';

export default function EventOverlay() {
  return (
    <div className="overlay-drawer blocking-priority" style={{ width: '100%', height: '100%', maxWidth: 'none', backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="drawer-header" style={{ borderBottom: '2px solid var(--danger-color)' }}>
        <h2>¡EVENTO BLOQUEANTE!</h2>
      </div>
      
      <div className="drawer-content flex-center" style={{ color: 'var(--danger-color)', fontSize: '1.5rem', textAlign: 'center' }}>
        <p>El mundo está detenido hasta que resuelvas este evento a través del CTA Central.</p>
      </div>
    </div>
  );
}
