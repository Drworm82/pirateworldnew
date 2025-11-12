// src/components/HoverHUD.jsx
export default function HoverHUD({ hover }) {
  if (!hover) return null;
  const { x, y, state } = hover;
  const color =
    state === "tuya"
      ? "#38bdf8"
      : state === "ocupada"
      ? "#52525b"
      : "#22c55e";

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "8px 12px",
        color: "white",
        fontFamily: "monospace",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8 }}>Celda:</div>
      <div>
        {x.toFixed(4)}, {y.toFixed(4)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
        <span style={{ fontSize: 13, textTransform: "capitalize" }}>{state}</span>
      </div>
    </div>
  );
}
