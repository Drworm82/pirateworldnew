import React from "react";

export default function Port({ fsmState }) {
  const isTravel = fsmState === "PORT_TRAVEL";

  const container = {
    minHeight: "100vh",
    background: "var(--color-bg-main)",
    color: "var(--color-text-primary)",
    display: "flex",
    flexDirection: "column",
  };

  const header = {
    padding: "12px 16px 12px 56px", // 👈 RESERVA PARA ☰
    borderBottom: "1px solid var(--color-border-light)",
  };

  const title = {
    fontSize: "16px",
    fontWeight: 600,
  };

  const subtitle = {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
  };

  const section = {
    margin: "16px",
    padding: "12px",
    background: "var(--color-bg-secondary)",
    borderRadius: "var(--radius-base)",
    fontSize: "14px",
  };

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <div style={title}>Puerto · Barco</div>
        <div style={subtitle}>
          {isTravel ? "Viaje en curso" : "Barco en puerto"}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={section}>
        <strong>Barco actual</strong>
        <div>Nombre: La Brisa del Sur</div>
        <div>Capacidad: 12 tripulantes</div>
        <div>Estado del casco: Óptimo</div>
      </div>

      <div style={section}>
        <strong>Tripulación</strong>
        <div>Miembros activos: 6</div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          Todos en condiciones
        </div>
      </div>

      {isTravel && (
        <div style={section}>
          <strong>Ruta</strong>
          <div>Destino: Isla del Viento</div>
          <div>ETA: 12 min</div>
        </div>
      )}
    </div>
  );
}
