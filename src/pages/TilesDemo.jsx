// src/pages/TilesDemo.jsx
import { useEffect, useMemo, useState } from "react";
import { cellsNear, buyParcel, round4, getLastUserId } from "../lib/supaApi.js";
import HoverHUD from "../components/HoverHUD.jsx";
import ToastPurchase from "../components/ToastPurchase.jsx";

export default function TilesDemo() {
  const userId = getLastUserId();
  const [center, setCenter] = useState({ lat: 19.4326, lng: -99.1332 });
  const [occupied, setOccupied] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const GRID_SIZE = 20;     // 20x20 = 400 celdas
  const STEP_LAT  = 0.0012; // ~133 m
  const RADIUS_M  = 5000;   // 5 km

  async function reload() {
    setLoading(true);
    try {
      const data = await cellsNear({
        x: center.lng,
        y: center.lat,
        radiusM: RADIUS_M,
      });
      setOccupied(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("Error al cargar parcelas cercanas: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [center.lat, center.lng]);

  const occMap = useMemo(() => {
    const m = new Map();
    for (const r of occupied) {
      m.set(`${round4(r.y)},${round4(r.x)}`, r);
    }
    return m;
  }, [occupied]);

  const gridCells = useMemo(() => {
    const cells = [];
    const mid = Math.floor(GRID_SIZE / 2);
    for (let gy = -mid; gy < GRID_SIZE - mid; gy++) {
      const stepLon = STEP_LAT / Math.max(0.2, Math.cos((center.lat * Math.PI) / 180));
      for (let gx = -mid; gx < GRID_SIZE - mid; gx++) {
        const lat = round4(center.lat + gy * STEP_LAT);
        const lng = round4(center.lng + gx * stepLon);
        const key = `${lat},${lng}`;
        const occ = occMap.get(key);
        let status = "free";
        if (occ) status = occ.owner_id === userId ? "mine" : "taken";
        cells.push({ id: key, lat, lng, status });
      }
    }
    return cells;
  }, [center, occMap, userId]);

  async function onBuy(cell) {
    if (!userId) return alert("Primero crea/carga un usuario en Demo usuario.");
    if (cell.status !== "free") return;

    if (!window.confirm(`¿Comprar por 100 doblones en:\nlat=${cell.lat}, lng=${cell.lng}?`)) return;

    try {
      const r = await buyParcel({ userId, cost: 100, x: cell.lng, y: cell.lat });
      if (r?.ok) {
        setToast({
          show: true,
          msg: `🏝 Nueva parcela en lat=${cell.lat}, lng=${cell.lng}`,
        });
        await reload();
      } else {
        alert("❌ Compra rechazada: " + (r?.error || "desconocido"));
      }
    } catch (err) {
      alert("Error al comprar: " + err.message);
    }
  }

  // Estilos inline (sin Tailwind)
  const styles = {
    legendDot: (color) => ({
      display: "inline-block",
      width: 12, height: 12, borderRadius: 4, backgroundColor: color,
      marginRight: 6, verticalAlign: "middle"
    }),
    gridWrap: {
      display: "grid",
      gridTemplateColumns: `repeat(${GRID_SIZE}, 18px)`,
      gap: "6px",
      padding: "12px",
      borderRadius: "12px",
      background: "#071522",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      width: "fit-content"
    },
    cell: (status) => {
      const color =
        status === "free"  ? "#22c55e" : // verde
        status === "mine"  ? "#38bdf8" : // azul
                              "#52525b";  // gris
      return {
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: color,
        border: "none",
        cursor: status === "free" ? "pointer" : "default",
      };
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Mapa de parcelas</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={reload} disabled={loading} style={{ marginRight: 8 }}>
          {loading ? "Cargando..." : "Recargar"}
        </button>
        <button onClick={() => setCenter({ lat: 19.4326, lng: -99.1332 })}>
          Centrar CDMX
        </button>
      </div>

      {/* Leyenda */}
      <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.85 }}>
        <span style={{ marginRight: 16 }}>
          <span style={styles.legendDot("#22c55e")} /> Libres
        </span>
        <span style={{ marginRight: 16 }}>
          <span style={styles.legendDot("#38bdf8")} /> Tuyas
        </span>
        <span>
          <span style={styles.legendDot("#52525b")} /> Ocupadas
        </span>
      </div>

      {/* Grid */}
      <div style={styles.gridWrap} onMouseLeave={() => setHover(null)}>
        {gridCells.map((c) => (
          <button
            key={c.id}
            title={`lat=${c.lat}, lng=${c.lng}`}
            onClick={() => onBuy(c)}
            disabled={c.status !== "free"}
            onMouseEnter={() =>
              setHover({
                x: c.lng,
                y: c.lat,
                state: c.status === "mine" ? "tuya" : c.status === "taken" ? "ocupada" : "libre",
              })
            }
            onMouseLeave={() => setHover(null)}
            style={styles.cell(c.status)}
          />
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 14, opacity: 0.85 }}>
        Parcelas visibles: {gridCells.length} · Ocupadas cerca: {occupied.length}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
        (El grid muestra posibles celdas. Las ocupadas provienen de la BD y se “pintan” encima.
        Haz click en una libre para comprar.)
      </div>

      {/* HUD flotante */}
      <HoverHUD hover={hover} />

      {/* Toast compra */}
      <ToastPurchase
        show={toast.show}
        message={toast.msg}
        onClose={() => setToast({ show: false, msg: "" })}
      />
    </div>
  );
}
