// src/components/MissionsPanel.jsx
// Panel de Misiones con progreso sincronizado a Supabase (si hay sesión/RLS)
// y fallback a localStorage si no. Lee textos desde /public/data/narrativa.json
// Si narrativa.json no existe o viene vacío, usa el fallback local src/data/missions.js

import { useEffect, useState } from 'react';
import { loadMissionsWithProgress, markMission } from '../lib/missionsApi.js';
import { missions as staticMissions, rarities as staticRarities } from '../data/missions';

export default function MissionsPanel() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('local');
  const [missions, setMissions] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [msg, setMsg] = useState('');

  async function refresh() {
    setLoading(true);
    const { missions, rarities, mode } = await loadMissionsWithProgress();

    // Fallback: si narrativa.json no está o viene vacío, usa el paquete local
    const useMissions = missions?.length ? missions : staticMissions.map(m => ({
      ...m, progress: 0, done: false
    }));
    const useRarities = rarities?.length ? rarities : staticRarities;

    setMissions(useMissions);
    setRarities(useRarities);
    setMode(mode);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleDone(m) {
    setMsg('');
    const res = await markMission(m.code, !m.done);
    if (!res?.ok) {
      setMsg('No se pudo actualizar el progreso.');
      return;
    }
    setMsg(res.mode === 'supabase' ? '✅ Guardado en Supabase.' : '💾 Guardado local (sin sesión).');
    refresh();
  }

  if (loading) {
    return (
      <div style={wrap}>
        <Banner mode="loading" />
        <div>Cargando misiones…</div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <Banner mode={mode} />
      <div style={{ display: 'grid', gap: 10 }}>
        {missions.map((m) => (
          <MissionCard key={m.code} mission={m} onToggle={() => toggleDone(m)} />
        ))}
      </div>

      <h3 style={{ ...title, marginTop: 24 }}>Rarezas</h3>
      {!rarities.length ? (
        <div>No hay rarezas para mostrar.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Nombre</th>
                <th style={th}>Descripción</th>
                <th style={th}>Multiplicador</th>
              </tr>
            </thead>
            <tbody>
              {rarities.map((r) => (
                <tr key={r.id}>
                  <td style={tdMono}>{r.id}</td>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.desc}</td>
                  <td style={tdNum}>{r.mult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ fontSize: 12, color: '#374151', marginTop: 10 }}>{msg}</div>

      <p style={hint}>
        *Este panel intenta guardar en Supabase. Si no hay sesión o permisos, guarda localmente. 
        (Si no existe <code>/public/data/narrativa.json</code>, usa el fallback local embebido).
      </p>
    </div>
  );
}

function Banner({ mode }) {
  if (mode === 'loading') {
    return <div style={banner('#f8fafc', '#111827')}>Sincronizando…</div>;
  }
  if (mode === 'supabase') {
    return <div style={banner('#e6ffed', '#065f46')}>Conectado a Supabase (progreso en la nube).</div>;
  }
  return <div style={banner('#fff7ed', '#9a3412')}>Modo local (sin sesión o sin permisos RLS).</div>;
}

function MissionCard({ mission, onToggle }) {
  const pct = Math.round(((mission.progress ?? 0) / (mission.target ?? 1)) * 100);

  return (
    <div style={card}>
      <div style={row}>
        <div style={{ fontWeight: 600 }}>{mission.title}</div>
        <span style={{ fontSize: 12, color: mission.done ? '#065f46' : '#6b7280' }}>
          {mission.done ? '✅ Completada' : `${mission.progress ?? 0}/${mission.target ?? 1}`}
        </span>
      </div>
      <div style={{ color: '#374151', marginTop: 4 }}>{mission.description}</div>
      {(mission.reward || mission.lore_unlock) && (
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
          {mission.reward ? `Recompensa: ${mission.reward}` : null}
          {mission.reward && mission.lore_unlock ? ' · ' : null}
          {mission.lore_unlock ? `Desbloqueo: ${mission.lore_unlock}` : null}
        </div>
      )}
      <div style={bar}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: '#10b981' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={onToggle} style={mission.done ? btnSecondary : btnPrimary}>
          {mission.done ? 'Marcar como pendiente' : 'Marcar como completada'}
        </button>
      </div>
    </div>
  );
}

/* —— estilos inline —— */
const wrap = { display: 'grid', gap: 12 };
const title = { fontSize: 18, fontWeight: 700 };
const card = { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, background: '#fff' };
const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 };
const bar = { marginTop: 8, height: 8, background: '#f3f4f6', borderRadius: 6 };
const btnPrimary = { padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#111827', color: '#fff', cursor: 'pointer' };
const btnSecondary = { padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#111827', cursor: 'pointer' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: 600 };
const th = { textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#374151', padding: '8px 6px', borderBottom: '1px solid #e5e7eb' };
const td = { fontSize: 14, color: '#111827', padding: '8px 6px', borderBottom: '1px solid #f3f4f6' };
const tdMono = { ...td, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' };
const tdNum = { ...td, textAlign: 'right' };

function banner(bg, fg) {
  return {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: bg,
    color: fg,
  };
}

const hint = { fontSize: 12, color: '#6b7280', marginTop: 12 };
