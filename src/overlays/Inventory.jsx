// src/overlays/Inventory.jsx
import React from 'react';
import { overlayFSM } from '../controllers/overlayFSM';

export default function Inventory() {
  return (
    <div className="overlay-panel stable_reactive">
      <h2>Inventario</h2>
      <p>Lista de ítems (Estado Estable Reactivo)</p>
      <ul>
        <li>Ron x10</li>
        <li>Madera x5</li>
        <li>Mapa del Tesoro</li>
      </ul>
    </div>
  );
}
