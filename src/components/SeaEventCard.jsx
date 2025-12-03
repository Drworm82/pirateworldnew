import React from "react";

export default function SeaEventCard({ event, onClose }) {
  if (!event) return null;

  const styles = {
    card: {
      background: "rgba(0,0,0,0.55)",
      border: "1px solid #4da3ff",
      borderRadius: 12,
      padding: "18px 20px",
      marginTop: 20,
      maxWidth: 420,
      color: "white",
      animation: "fadeIn 0.4s ease",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: 10,
    },
    text: {
      fontSize: "15px",
      lineHeight: 1.6,
      opacity: 0.9,
    },
    button: {
      marginTop: 15,
      padding: "10px 16px",
      background: "#4da3ff",
      border: "none",
      borderRadius: 8,
      color: "#000",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>⚓ Evento en el mar</div>

      <div style={styles.text}>
        {event.description || "Has encontrado algo inesperado en el mar."}
      </div>

      {event.effect && (
        <div style={{ marginTop: 10, opacity: 0.8 }}>
          <b>Efecto:</b> {event.effect}
        </div>
      )}

      <button style={styles.button} onClick={onClose}>
        Entendido
      </button>
    </div>
  );
}
