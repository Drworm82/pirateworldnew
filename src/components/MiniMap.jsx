// src/components/MiniMap.jsx
// Mini-mapa simple para visualizar rápidamente tus parcels.
// No depende de libs externas. Si no hay parcels, muestra un hint.

export default function MiniMap({ parcels = [] }) {
  if (!Array.isArray(parcels) || parcels.length === 0) {
    return (
      <div style={wrap}>
        <div style={title}>Mini Mapa</div>
        <div style={empty}>
          Aún no hay parcelas para mostrar.
        </div>
      </div>
    );
  }

  // Grid fijo (8x4) solo para demo
  const WIDTH = 8;
  const HEIGHT = 4;
  const cells = new Array(WIDTH * HEIGHT).fill(null);

  // Pinta primeras N parcels en el grid
  parcels.slice(0, cells.length).forEach((p, i) => {
    cells[i] = p;
  });

  return (
    <div style={wrap}>
      <div style={title}>Mini Mapa</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${WIDTH}, 1fr)`, gap: 4 }}>
        {cells.map((p, i) => (
          <div key={i} style={{ ...cell, background: colorFor(p?.rarity) }} title={tooltip(p)} />
        ))}
      </div>
      <div style={legendWrap}>
        <Legend label="common" color={colorFor("common")} />
        <Legend label="rare" color={colorFor("rare")} />
        <Legend label="epic" color={colorFor("epic")} />
        <Legend label="legendary" color={colorFor("legendary")} />
      </div>
    </div>
  );
}

function colorFor(rarity) {
  switch ((rarity || "").toLowerCase()) {
    case "legendary": return "#f59e0b"; // ámbar
    case "epic":      return "#8b5cf6"; // violeta
    case "rare":      return "#3b82f6"; // azul
    case "common":    return "#10b981"; // verde
    default:          return "#e5e7eb"; // gris
  }
}

function tooltip(p) {
  if (!p) return "vacío";
  return `geohash: ${p.geohash || "-"} | rarity: ${p.rarity || "-"} | yield/h: ${p.base_yield_per_hour ?? "-"}`;
}

/* —— estilos —— */
const wrap = { display: "grid", gap: 8, border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, background: "#fff" };
const title = { fontWeight: 700, fontSize: 14 };
const empty = { fontSize: 12, color: "#6b7280" };
const cell = { width: 20, height: 20, borderRadius: 4, border: "1px solid #ffffff" };
const legendWrap = { display: "flex", gap: 10, marginTop: 8 };

function Legend({ label, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: "1px solid #fff" }} />
      {label}
    </span>
  );
}
