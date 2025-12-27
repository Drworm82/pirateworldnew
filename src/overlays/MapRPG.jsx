// src/overlays/MapRPG.jsx
import React from 'react';
import { overlayFSM } from '../controllers/overlayFSM';

export default function MapRPG() {
  return (
    <div className="overlay-panel stable_reactive">
      <h2>Mapa del Mundo</h2>
      <p>Vista RPG del mundo (Estado Estable Reactivo)</p>
      <div style={{ width: '100%', height: '200px', background: '#333' }}>
        [MAPA]
      </div>
    </div>
  );
}
