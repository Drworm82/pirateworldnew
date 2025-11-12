// src/components/PurchaseOverlay.jsx
import React, { useMemo } from "react";

const STEP = 0.0001;
const GRID_N = 21;
const round4 = (v) => Number(v.toFixed(4));

export default function PurchaseOverlay({
  open,
  onClose,
  center,
  near = [],
  myUserId = "",
  onPick, // (x,y) => void
}) {
  if (!open) return null;

  const ownedIndex = useMemo(() => {
    const m = new Map();
    for (const p of near || []) {
      if (p?.x == null || p?.y == null) continue;
      m.set(`${round4(p.x)},${round4(p.y)}`, p);
    }
    return m;
  }, [near]);

  const tiles = useMemo(() => {
    const half = Math.floor(GRID_N / 2);
    const res = [];
    for (let gy = -half; gy <= half; gy++) {
      for (let gx = -half; gx <= half; gx++) {
        const y = round4(center.lat + gy * STEP);
        const x = round4(center.lng + gx * STEP);
        const key = `${x},${y}`;
        const existing = ownedIndex.get(key);
        const isMine = existing?.owner_id && existing.owner_id === myUserId;
        const isTaken = existing?.owner_id && existing.owner_id !== myUserId;
        res.push({ x, y, key, isMine, isTaken });
      }
    }
    return res;
  }, [center, ownedIndex, myUserId]);

  return (
    <div className="ovl">
      <div className="panel">
        <div className="panel-hd">
          <h3>SELECCIONA UN TERRENO DISPONIBLE PARA COMPRARLO</h3>
          <button className="x" onClick={onClose}>✖</button>
        </div>

        <div className="canvas">
          <div className="grid">
            {tiles.map((t) => {
              let cls = "cell free";
              if (t.isMine) cls = "cell mine";
              else if (t.isTaken) cls = "cell taken";

              const canBuy = !t.isMine && !t.isTaken;
              return (
                <button
                  key={t.key}
                  className={cls}
                  title={`${t.y}, ${t.x}`}
                  disabled={!canBuy}
                  onClick={() => onPick?.(t.x, t.y)}
                />
              );
            })}
          </div>

          <div className="rings">
            <span className="ring r1" />
            <span className="ring r2" />
            <span className="ring r3" />
          </div>
        </div>

        <div className="panel-ft">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>

      {/* estilos scoping */}
      <style>{`
        .ovl {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.55);
          display: grid; place-items: center;
          z-index: 9999;
        }
        .panel {
          width: min(920px, 92vw);
          background: #0e2339;
          border: 1px solid #092031;
          border-radius: 18px;
          box-shadow: 0 10px 50px rgba(0,0,0,.35);
          overflow: hidden;
        }
        .panel-hd {
          display:flex; align-items:center; justify-content:space-between;
          padding: 14px 16px; background:#0b1c2e; border-bottom:1px solid #092031;
        }
        .panel-hd h3 { margin:0; color:#eef5ff; font-weight:800; letter-spacing:.5px; }
        .panel-hd .x { background:#e74c3c; color:#fff; border:none; border-radius:10px; padding:6px 10px; cursor:pointer; }
        .panel-ft {
          display:flex; justify-content:center; padding: 12px; border-top:1px solid #0a2234;
        }
        .btn.ghost { background:#e74c3c; color:#fff; border:none; border-radius:12px; padding:8px 14px; }
        .canvas {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;        /* cuadrado perfecto */
          background: #0f2740;
        }
        .grid {
          position:absolute; inset:6% 6% 6% 6%;
          display:grid;
          grid-template-columns: repeat(${GRID_N}, 1fr);
          grid-auto-rows: 1fr;
          gap: 6px;
          border-radius: 12px;
          padding: 6px;
          background: #0c2034;
          box-shadow: inset 0 0 0 6px #0b1d2f, 0 0 0 3px #0b1d2f;
          overflow:hidden;            /* sin desplazamientos raros */
        }
        .cell {
          width: 100%; height: 100%;
          border-radius: 6px;
          box-shadow: inset 0 0 0 3px #172b3f;
          transition: transform .08s ease, filter .08s ease, background .08s ease;
        }
        .cell.free { background:#2ecc71; }
        .cell.mine { background:#3b82f6; }
        .cell.taken { background:#7f8c8d; }
        .cell:enabled:hover { transform: scale(1.06); filter: brightness(1.05); }
        .cell:disabled { cursor:not-allowed; filter: saturate(.7) brightness(.85); }

        .rings .ring {
          position:absolute; border:3px solid rgba(255,255,255,.15); border-radius:50%;
          left:50%; top:50%; transform: translate(-50%, -50%);
        }
        .rings .r1 { width:70%; height:70%; }
        .rings .r2 { width:52%; height:52%; }
        .rings .r3 { width:35%; height:35%; }
      `}</style>
    </div>
  );
}
