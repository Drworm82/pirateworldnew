// =====================================================================
// CostHUD.jsx — Panel de Costos del Viaje (HUD PRO)
// =====================================================================
import React from "react";

export default function CostHUD({ progress }) {
  if (!progress || progress.status !== "traveling") return null;

  return (
    <div
      style={{
        marginTop: 20,
        padding: "14px 20px",
        background: "rgba(0,20,40,0.55)",
        borderRadius: 12,
        border: "1px solid #4da3ff",
        width: "100%",
        maxWidth: 420,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8, color: "#4da3ff" }}>
        💰 Costos del Viaje
      </div>

      <p style={{ marginBottom: 4 }}>
        <strong>Distancia total:</strong> {progress.distance_km?.toFixed(2)} km
      </p>

      <p style={{ marginBottom: 4 }}>
        <strong>Modificador del barco:</strong> {progress.modifier || 1.0}x
      </p>

      <p style={{ marginBottom: 4 }}>
        <strong>Costo base por km:</strong> 4
      </p>

      <p style={{ marginBottom: 4 }}>
        <strong>Costo por distancia:</strong>{" "}
        {progress.cost_distance
          ? progress.cost_distance.toFixed(2)
          : "—"}
      </p>

      <p style={{ marginBottom: 4 }}>
        <strong>Tarifa fija:</strong> {progress.cost_flat || 10} doblones
      </p>

      {progress.extra_costs > 0 && (
        <p style={{ marginBottom: 4 }}>
          <strong>Costos de eventos:</strong> +{progress.extra_costs} doblones
        </p>
      )}

      <hr
        style={{
          marginTop: 10,
          marginBottom: 10,
          borderColor: "rgba(255,255,255,0.15)",
        }}
      />

      <p style={{ marginBottom: 6, fontSize: 17 }}>
        <strong>Total:</strong> {progress.cost_total} doblones
      </p>

      <p style={{ marginTop: 4, opacity: 0.7 }}>
        (Se cobró al iniciar el viaje)
      </p>
    </div>
  );
}
