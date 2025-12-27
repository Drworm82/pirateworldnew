// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { fsmController, SCENES } from '../controllers/fsmController';
import { overlayFSM, OVERLAY_TYPES } from '../controllers/overlayFSM';

export default function NavBar() {
  const [fsmState, setFsmState] = useState(fsmController.getState());

  useEffect(() => {
    return fsmController.subscribe(setFsmState);
  }, []);

  const isBlocked = fsmState === SCENES.EVENT;

  return (
    <>
      {/* Top Bar: Hamburger & Profile */}
      <nav className="top-bar">
        <button 
          className="nav-btn hamburger" 
          onClick={() => overlayFSM.toggle(OVERLAY_TYPES.MENU)}
          disabled={isBlocked}
          title="Menú"
        >
          ☰
        </button>

        <div className="top-bar-right">
          <button 
            className="nav-btn"
            onClick={() => {
              if (isBlocked) return;
              fsmController.goProfile();
            }}
            disabled={isBlocked}
            title="Perfil"
          >
            ⚙️
          </button>
        </div>
      </nav>

      {/* Bottom Bar: Inventory & Map */}
      <nav className="bottom-bar">
        <button 
          className="nav-btn bottom-item" 
          onClick={() => overlayFSM.toggle(OVERLAY_TYPES.INVENTORY)}
          disabled={isBlocked}
        >
          <span className="icon">🎒</span>
          <span className="label">Inventario</span>
        </button>
        
        <div className="cta-spacer"></div>

        <button 
          className="nav-btn bottom-item" 
          onClick={() => overlayFSM.toggle(OVERLAY_TYPES.MAP_RPG)}
          disabled={isBlocked}
        >
          <span className="icon">🗺️</span>
          <span className="label">Mapa Mundo</span>
        </button>
      </nav>
    </>
  );
}
