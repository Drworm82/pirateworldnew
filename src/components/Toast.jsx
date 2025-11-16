// src/components/Toast.jsx
import React from "react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div className={`toast-root ${isError ? "toast-error" : "toast-success"}`}>
      <span className="toast-text">{message}</span>

      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
