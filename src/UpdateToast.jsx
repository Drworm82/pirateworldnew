/**
 * PirateWorld - Update Toast Component
 * ------------------------------------
 * Muestra un aviso cuando hay una nueva versión disponible del Service Worker.
 * Incluye un botón para recargar la app e instalar la nueva versión.
 */

export default function UpdateToast({ onReload }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0b132b",
        color: "white",
        padding: "10px 14px",
        borderRadius: 8,
        boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
        maxWidth: 280,
        fontSize: 14,
        gap: 10,
      }}
    >
      <span style={{ flex: 1 }}>
        Nueva versión disponible ⚓  
      </span>
      <button
        onClick={onReload}
        style={{
          background: "#fcd5b8",
          border: "none",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: "pointer",
          fontWeight: 600,
          color: "#0b132b",
        }}
      >
        Actualizar
      </button>
    </div>
  );
}
