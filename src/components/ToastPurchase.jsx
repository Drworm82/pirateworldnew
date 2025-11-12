// src/components/ToastPurchase.jsx
import { useEffect } from "react";

export default function ToastPurchase({ show, message = "🏝 Nueva parcela adquirida", onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose?.(), 2200);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes toast-pop {
          0% { transform: translate(-50%, 20px) scale(0.98); opacity: 0; }
          12% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          80% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 0; }
        }
        @keyframes chest-pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: "36px",
          transform: "translateX(-50%)",
          zIndex: 9999,
          animation: "toast-pop 2.2s ease forwards",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(9,20,31,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "12px 16px",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
            color: "#e2e8f0",
            fontWeight: 600,
            backdropFilter: "blur(4px)",
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: 20,
              display: "inline-block",
              animation: "chest-pulse 900ms ease-in-out infinite",
              transformOrigin: "center",
            }}
          >
            🧭
          </span>
          <span>{message}</span>
        </div>
      </div>
    </>
  );
}
