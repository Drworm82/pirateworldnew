// src/components/HamburgerMenu.jsx
import React from "react";
import { overlayFSM, OVERLAY } from "../fsm/overlayFSM";
import { navigationFSM } from "../fsm/navigationFSM";

export default function HamburgerMenu({ onClose }) {
  const items = [
    {
      label: "GPS / Mundo real",
      icon: "🧭",
      action: () => {
        navigationFSM.closeToIdle();
        overlayFSM.close();
      },
    },
    { label: "Tripulación", icon: "👥", action: () => overlayFSM.open(OVERLAY.CREW) },
    { label: "Misiones", icon: "📜", action: () => overlayFSM.open(OVERLAY.MISSIONS) },  // Línea corregida
    { label: "Banco Mundial", icon: "🏦", action: () => {} },
    { label: "Territorio", icon: "📍", action: () => {} },
    { label: "Chat Local", icon: "💬", action: () => {} },
    { label: "Telégrafo", icon: "📨", action: () => {} },
    { label: "Perfil", icon: "👤", action: () => navigationFSM.openProfile() },
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
        onClick={onClose}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          background: "#ffffff",
          zIndex: 1001,
          boxShadow: "2px 0 12px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 56,
            paddingLeft: 56,
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--color-border-light)",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Menú
        </div>
        <nav style={{ padding: 8, overflowY: "auto" }}>
          {items.map((i) => (
            <button
              key={i.label}
              onClick={() => {
                i.action();
                onClose();
              }}
              style={{
                width: "100%",
                display: "flex",
                gap: 12,
                padding: 12,
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <span style={{ width: 20 }}>{i.icon}</span>
              {i.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
