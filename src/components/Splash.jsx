// src/components/Splash.jsx
import { useEffect } from "react";

export default function Splash({ onDone }) {
  // Auto-cerrar después de 1.2s
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof onDone === "function") onDone();
    }, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #1e293b 0, #020617 45%, #000 100%)",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "24px 32px",
          borderRadius: 20,
          border: "1px solid rgba(148,163,184,.5)",
          boxShadow: "0 18px 60px rgba(15,23,42,.9)",
          background: "linear-gradient(145deg, #020617, #020617, #0f172a)",
          minWidth: 260,
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          PirateWorld
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
          Cargando tablero de pruebas...
        </div>

        {/* “Barra” de carga simple */}
        <div
          style={{
            width: 220,
            height: 6,
            borderRadius: 999,
            background: "rgba(15,23,42,1)",
            overflow: "hidden",
            margin: "0 auto",
            border: "1px solid rgba(51,65,85,1)",
          }}
        >
          <div
            style={{
              width: "60%",
              height: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #22c55e, #3b82f6, #22c55e)",
              animation: "splash-bar 1.1s ease-in-out infinite",
            }}
          />
        </div>

        <style>
          {`
          @keyframes splash-bar {
            0% { transform: translateX(-80%); }
            50% { transform: translateX(10%); }
            100% { transform: translateX(120%); }
          }
        `}
        </style>
      </div>
    </div>
  );
}
