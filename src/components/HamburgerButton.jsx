// src/components/HamburgerButton.jsx
import React from "react";

export default function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Menú"
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 3000,
        width: 32,
        height: 32,
        borderRadius: "8px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        fontSize: "18px",
        cursor: "pointer",
      }}
    >
      ☰
    </button>
  );
}
