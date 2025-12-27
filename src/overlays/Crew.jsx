// src/overlays/Crew.jsx
import React from 'react';
import { overlayFSM } from '../controllers/overlayFSM';

export default function Crew() {
  return (
    <div className="overlay-panel read_only">
      <h2>Tripulación</h2>
      <p>Gestión de tripulación (Solo Lectura)</p>
      <ul>
        <li>Contramaestre Gibbs</li>
        <li>Artillero Pintel</li>
      </ul>
    </div>
  );
}
