// src/components/Tabs.jsx
import { useEffect, useState } from "react";

/**
 * Uso:
 * <Tabs
 *   tabs={[
 *     { key: 'mapa', label: 'Mapa', content: <Mapa/> },
 *     { key: 'misiones', label: 'Misiones', content: <MissionsPanel/> },
 *   ]}
 *   initialKey="mapa"
 * />
 */
export default function Tabs({ tabs = [], initialKey }) {
  const firstKey = initialKey || (tabs[0] && tabs[0].key);
  const [active, setActive] = useState(firstKey);

  useEffect(() => {
    if (!tabs.some(t => t.key === active)) {
      const k = tabs[0]?.key;
      if (k) setActive(k);
    }
  }, [tabs]);

  return (
    <div>
      <div style={tabBar}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={t.key === active ? tabBtnActive : tabBtn}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {tabs.find(t => t.key === active)?.content || null}
      </div>
    </div>
  );
}

const tabBar = {
  display: "flex",
  gap: 8,
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 6
};
const baseBtn = {
  padding: "6px 10px",
  border: "1px solid #e5e7eb",
  borderBottom: "none",
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 14
};
const tabBtn = { ...baseBtn, color: "#374151" };
const tabBtnActive = { ...baseBtn, background: "#111827", color: "#fff" };
