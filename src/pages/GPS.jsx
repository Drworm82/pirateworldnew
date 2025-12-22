import React from "react";

export default function GPS() {
  // FSM visual (mock)
  const isFirstTime = true; // Estado 0
  // const isNomad = true; // Estado 4 (si quieres probarlo, cambia el flag)

  // ───── MOCK DATA ─────
  const mockIslands = [
    { id: 1, name: "Isla Tortuga", tag: "Cerca" },
    { id: 2, name: "Isla del Viento", tag: "Nueva" },
    { id: 3, name: "Atolón Sombrío", tag: "Rara" },
  ];

  const mockEvents = [
    { id: 1, title: "Restos de naufragio", tag: "Cerca" },
    { id: 2, title: "Mercader errante", tag: "Nuevo" },
  ];

  // ───── ESTILOS BASE (RESPETANDO UI EXISTENTE) ─────
  const container = {
    width: "100vw",
    height: "100vh",
    background: "#1a1f24",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
  };

  const hud = {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    fontSize: "14px",
  };

  const mapArea = {
    flex: 1,
    position: "relative",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    opacity: 0.85,
  };

  const panel = {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    right: "16px",
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "12px",
    fontSize: "13px",
  };

  const badge = (label) => ({
    display: "inline-block",
    marginLeft: "6px",
    padding: "2px 6px",
    fontSize: "11px",
    border: "1px solid #666",
    opacity: 0.9,
  });

  return (
    <div style={container}>
      <div style={hud}>
        <div>GPS · Mundo Real</div>
        <div>
          Estado:{" "}
          {isFirstTime
            ? "Primera vez (Estado 0)"
            : "Modo nómada activo (Estado 4)"}
        </div>
      </div>

      <div style={mapArea}>
        Mapa mundo real (mock visual)
      </div>

      <div style={panel}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Islas cercanas</strong>
        </div>
        {mockIslands.map((isla) => (
          <div key={isla.id}>
            • {isla.name}
            <span style={badge(isla.tag)}>{isla.tag}</span>
          </div>
        ))}

        <div style={{ margin: "10px 0 8px" }}>
          <strong>Eventos pasivos cercanos</strong>
        </div>
        {mockEvents.map((ev) => (
          <div key={ev.id}>
            • {ev.title}
            <span style={badge(ev.tag)}>{ev.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
