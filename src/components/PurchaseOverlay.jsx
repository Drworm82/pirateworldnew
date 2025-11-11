// src/components/PurchaseOverlay.jsx
import React, { useMemo } from "react";

const COLS = 16;
const ROWS = 24;
const STEP_DEG = 0.001; // ~111 m (aprox lat). Ajusta a tu malla
const MATCH_EPS = STEP_DEG / 2;

export default function PurchaseOverlay({
  center,        // {lat, lng}
  tilesDB,       // [{id,x,y,owner_id,...}] ya cargados cerca
  userId,        // uuid del usuario
  onBuy,         // (lat,lng) => Promise
  onClose,       // () => void
}) {

  // Prepara grilla "fantasma" (todo el canvas) y marca ocupadas
  const grid = useMemo(() => {
    const db = tilesDB || [];
    const lat0 = center.lat + (ROWS / 2 - 0.5) * STEP_DEG;
    const lng0 = center.lng - (COLS / 2 - 0.5) * STEP_DEG;

    function findMatch(lat, lng) {
      return db.find(
        (t) =>
          t.y != null && t.x != null &&
          Math.abs(t.y - lat) <= MATCH_EPS &&
          Math.abs(t.x - lng) <= MATCH_EPS
      );
    }

    const out = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const lat = lat0 - r * STEP_DEG;
        const lng = lng0 + c * STEP_DEG;
        const match = findMatch(lat, lng);
        out.push({
          key: `${r}-${c}`,
          lat, lng,
          occupied: Boolean(match?.owner_id),
          mine: match?.owner_id && match.owner_id === userId,
        });
      }
    }
    return out;
  }, [center, tilesDB, userId]);

  async function handleTap(cell) {
    if (cell.occupied) return;               // bloqueada (rojo)
    await onBuy(cell.lat, cell.lng);         // delega al padre
  }

  return (
    <div className="pw-overlay">
      <div className="pw-panel">
        <div className="pw-header">
          <div className="pw-title">SELECCIONA UN TERRENO DISPONIBLE PARA COMPRARLO</div>
          <button className="pw-close" onClick={onClose}>✕</button>
        </div>

        <div className="pw-canvas">
          {/* líneas verdes */}
          <div className="pw-gridlines" />
          {/* anillos */}
          <div className="pw-rings">
            <div className="ring r1" />
            <div className="ring r2" />
            <div className="ring r3" />
          </div>

          {/* celdas ocupadas = rojo (click deshabilitado) / libres = tap compra */}
          <div className="pw-cells">
            {grid.map((cell) => (
              <div
                key={cell.key}
                className={
                  cell.occupied
                    ? "cell occupied"
                    : "cell free"
                }
                onClick={() => !cell.occupied && handleTap(cell)}
                title={
                  cell.occupied
                    ? (cell.mine ? "Tu parcela" : "Ocupada")
                    : "Disponible"
                }
              />
            ))}
          </div>

          {/* botón “Cancelar” */}
          <div className="pw-footer">
            <button className="pw-cancel" onClick={onClose}>CANCELAR</button>
          </div>
        </div>
      </div>
    </div>
  );
}
