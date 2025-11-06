// src/Splash.jsx
import React, { useEffect, useState } from "react";

export default function Splash({ onDone }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Ocultar splash ~1.4s con fade
    const t = setTimeout(() => setHide(true), 1400);
    const t2 = setTimeout(() => onDone?.(), 2000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className={`splash-wrap ${hide ? "hide" : ""}`}>
      {/* cielo */}
      <div className="sky">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* mar */}
      <div className="ocean">
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
      </div>

      {/* brújula */}
      <div className="compass">
        <svg viewBox="0 0 120 120" className="compass-svg" aria-hidden>
          <defs>
            <radialGradient id="compassGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <linearGradient id="compassFace" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e9eef6" />
              <stop offset="100%" stopColor="#cfd8e6" />
            </linearGradient>
          </defs>

          <circle cx="60" cy="60" r="58" fill="url(#compassGlow)"></circle>
          <circle cx="60" cy="60" r="46" fill="url(#compassFace)" stroke="#0b132b" strokeWidth="2" />
          <circle cx="60" cy="60" r="38" fill="#0b132b" opacity=".12"></circle>

          {/* marcas NESW */}
          <g fill="#0b132b" fontSize="9" fontFamily="system-ui, sans-serif" textAnchor="middle">
            <text x="60" y="18">N</text>
            <text x="60" y="110">S</text>
            <text x="12" y="64">W</text>
            <text x="108" y="64">E</text>
          </g>

          {/* aguja */}
          <g className="needle">
            <polygon points="60,14 66,62 60,64 54,62" fill="#2b6cb0"></polygon>
            <polygon points="60,106 54,58 60,56 66,58" fill="#1a202c"></polygon>
            <circle cx="60" cy="60" r="4" fill="#ffcf4a"></circle>
          </g>

          {/* aro */}
          <circle cx="60" cy="60" r="46" fill="none" stroke="#0b132b" strokeWidth="2" />
        </svg>
      </div>

      {/* texto */}
      <div className="splash-title">
        <h1>PirateWorld</h1>
        <p>Próximamente.</p>
        <div className="splash-pill">Cargando…</div>
      </div>
    </div>
  );
}
