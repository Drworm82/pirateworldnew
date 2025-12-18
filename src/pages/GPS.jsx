import { useEffect, useState } from "react";
import { goTo } from "../utils/navigation";

export default function GPS() {
  const [authStatus, setAuthStatus] = useState("unknown");

  useEffect(() => {
    setAuthStatus("guest");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>GPS</h1>

      {authStatus !== "authed" && (
        <div
          style={{
            padding: 12,
            border: "1px solid #7f1d1d",
            background: "#020617",
            color: "#f87171",
          }}
        >
          Usuario no autenticado (modo UI)
        </div>
      )}

      <div
        style={{
          height: 240,
          border: "2px dashed #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        Mapa GPS (placeholder)
      </div>

      <div style={{ border: "1px solid #334155", padding: 12 }}>
        <strong>Entorno cercano</strong>
        <ul>
          <li>Islas cercanas (placeholder)</li>
          <li>Dungeons (placeholder)</li>
          <li>Niebla de guerra (placeholder)</li>
        </ul>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => goTo("/ui/viaje")}>
          Entrar al dungeon
        </button>

        <button onClick={() => goTo("/ui/viaje")}>
          Ver mi barco
        </button>

        <button onClick={() => goTo("/ui/zarpar")}>
          Modo sedentario
        </button>
      </div>
    </div>
  );
}
