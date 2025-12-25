import React from "react";

export default function GPS({ fsmState }) {
  const isFirstTime = fsmState === "FIRST_TIME_GPS";

  const container = {
    width: "100vw",
    height: "100vh",
    position: "relative",
    background: "var(--color-bg-main)",
    color: "var(--color-text-primary)",
    display: "flex",
    flexDirection: "column",
  };

  const header = {
    padding: "12px 16px 12px 56px", // espacio para ☰
    borderBottom: "1px solid var(--color-border-light)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const title = {
    fontSize: "16px",
    fontWeight: 600,
  };

  const subtitle = {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
  };

  const mapArea = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    color: "var(--color-text-muted)",
    paddingBottom: "200px", // 👈 aire visual extra
  };

  const bottomPanel = {
    position: "absolute",
    left: "16px",
    right: "16px",
    bottom: "112px", // 👈 SUBIDO para no chocar con HUD
    background: "#6b6b6b",
    color: "#fff",
    padding: "12px",
    borderRadius: "var(--radius-base)",
    fontSize: "13px",
  };

  const badge = {
    display: "inline-block",
    marginLeft: "6px",
    padding: "2px 6px",
    border: "1px solid rgba(255,255,255,0.4)",
    fontSize: "11px",
    borderRadius: "4px",
  };

  const cta = {
    padding: "6px 12px",
    fontSize: "13px",
    background: "#fff",
    border: "1px solid var(--color-border-light)",
    borderRadius: "6px",
    cursor: "pointer",
  };

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <div style={title}>GPS · Mundo real</div>
          <div style={subtitle}>Estado: Primera vez</div>
        </div>

        {isFirstTime && <button style={cta}>Plantar isla</button>}
      </div>

      {/* MAPA */}
      <div style={mapArea}>Mapa mundo real (mock visual)</div>

      {/* PANEL INFERIOR */}
      <div style={bottomPanel}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>
          Islas cercanas
        </div>
        <div>• Isla Tortuga <span style={badge}>Cerca</span></div>
        <div>• Isla del Viento <span style={badge}>Nueva</span></div>
        <div>• Atolón Sombrío <span style={badge}>Rara</span></div>

        <div style={{ marginTop: "8px", fontWeight: 600 }}>
          Eventos pasivos cercanos
        </div>
        <div>• Restos de naufragio <span style={badge}>Cerca</span></div>
        <div>• Mercader errante <span style={badge}>Nuevo</span></div>
      </div>
    </div>
  );
}
