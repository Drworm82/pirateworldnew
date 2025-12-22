import React from "react";

export default function HamburgerMenu({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.menu}>
        <div style={styles.header}>
          <span>Menú</span>
          <button onClick={onClose} style={styles.close}>✕</button>
        </div>

        <ul style={styles.list}>
          {MENU_ITEMS.map((label) => (
            <li
              key={label}
              style={styles.item}
              onClick={() => console.log(`[MENU] ${label}`)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const MENU_ITEMS = [
  "Tripulación",
  "Banco Mundial",
  "Misiones",
  "Parcelas / Territorio",
  "Chat Local",
  "Telégrafo",
  "Perfil",
  "Logout",
];

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-start",
  },
  menu: {
    width: "280px",
    height: "100%",
    background: "#1e1e1e",
    color: "#fff",
    padding: "16px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    fontWeight: "bold",
  },
  close: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    padding: "10px 0",
    borderBottom: "1px solid #333",
    cursor: "pointer",
  },
};
