// src/overlays/Menu.jsx
import React from 'react';
import { overlayFSM } from '../controllers/overlayFSM';
import { fsmController, SCENES } from '../controllers/fsmController';

export default function Menu() {
  const menuItems = [
    { label: 'Tripulación', icon: '👥' },
    { label: 'Banco Mundial', icon: '🏦' },
    { label: 'Misiones', icon: '📜' },
    { label: 'Territorio', icon: '📍' },
    { label: 'Chat Local', icon: '💬' },
    { label: 'Telégrafo', icon: '📠' },
    { label: 'Perfil', icon: '👤' },
  ];

  return (
    <div className="overlay-drawer read_only">
      <div className="drawer-header">
        <h2>Menú</h2>
      </div>
      
      <div className="drawer-content">
        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li key={index} className="menu-item">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="drawer-footer">
        <div className="menu-item logout">
          <span className="menu-icon">↪️</span>
          <span className="menu-label">Logout</span>
        </div>
      </div>
    </div>
  );
}
