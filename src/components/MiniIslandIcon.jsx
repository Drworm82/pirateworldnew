// src/components/MiniIslandIcon.jsx
import React from "react";

export default function MiniIslandIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))"
      }}
    >
      {/* Isla base */}
      <ellipse cx="32" cy="48" rx="18" ry="8" fill="#c2b280" />

      {/* Pastito */}
      <ellipse cx="32" cy="45" rx="14" ry="6" fill="#4caf50" />

      {/* Palmera */}
      <rect
        x="30"
        y="28"
        width="4"
        height="18"
        rx="2"
        fill="#8d6e63"
      />

      {/* Hojas de palmera */}
      <path
        d="M32 28 C38 18, 48 18, 52 26"
        stroke="#2e7d32"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 28 C26 18, 16 18, 12 26"
        stroke="#2e7d32"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 28 C42 22, 46 22, 50 30"
        stroke="#388e3c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 28 C22 22, 18 22, 14 30"
        stroke="#388e3c"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Sombrero pirata minimalista */}
      <path
        d="M20 20 C26 10, 38 10, 44 20"
        fill="#000"
      />
      <circle cx="32" cy="20" r="4" fill="#ffeb3b" />
    </svg>
  );
}
