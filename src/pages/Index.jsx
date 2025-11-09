// src/pages/Index.jsx
import { useEffect, useRef, useState } from 'react';
import Tabs from '../components/Tabs.jsx';
import MiniMap from '../components/MiniMap.jsx';
import MissionsPanel from '../components/MissionsPanel.jsx';
import {
  fetchParcels,
  subscribeParcels,
  unsubscribe,
  ensureAnonSession,   // ← añadido
} from '../lib/supaApi.js';

function ParcelsList({ parcels }) {
  if (!parcels?.length) return <div>No hay parcelas aún.</div>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {parcels.map((p) => (
        <div
          key={p.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>
            <b>Geohash:</b> {p.geohash}
          </div>
          <div>
            <b>Rareza:</b> {p.rarity} · <b>Yield/h:</b> {p.base_yield_per_hour}
          </div>
          <div>
            <b>Influence:</b> {p.influence} · <b>Owner:</b>{' '}
            {p.owner_user_id ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{p.created_at}</div>
        </div>
      ))}
    </div>
  );
}

export default function Index() {
  const [parcels, setParcels] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [realtimeOn, setRealtimeOn] = useState(true);
  const pollTimer = useRef(null);
  const channelRef = useRef(null);

  // ← NUEVO: asegura sesión anónima al entrar a Inicio/Misiones
  useEffect(() => {
    ensureAnonSession().catch(() => {});
  }, []);

  const loadParcels = async () => {
    const { data, error } = await fetchParcels();
    if (!error) {
      setParcels(data);
      setLastUpdated(Date.now());
    } else {
      console.error('[Index] fetchParcels error:', error);
    }
  };

  const handleInsert = (row) => {
    setParcels((prev) =>
      prev.some((p) => p.id === row.id) ? prev : [row, ...prev]
    );
    setLastUpdated(Date.now());
  };
  const handleUpdate = (row) => {
    setParcels((prev) => {
      const idx = prev.findIndex((p) => p.id === row.id);
      if (idx === -1) return prev;
      const copy = prev.slice();
      copy[idx] = { ...prev[idx], ...row };
      return copy;
    });
    setLastUpdated(Date.now());
  };
  const handleDelete = (oldRow) => {
    setParcels((prev) => prev.filter((p) => p.id !== oldRow.id));
    setLastUpdated(Date.now());
  };

  useEffect(() => {
    let stopped = false;

    const startRealtime = async () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      await loadParcels();
      if (stopped) return;

      const ch = await subscribeParcels({
        onInsert: handleInsert,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      });
      channelRef.current = ch;

      // mini-poll de salvaguarda cada 2 min
      pollTimer.current = setInterval(loadParcels, 120_000);
    };

    const startPollingOnly = async () => {
      if (channelRef.current) {
        await unsubscribe(channelRef.current);
        channelRef.current = null;
      }
      await loadParcels();
      if (stopped) return;
      pollTimer.current = setInterval(loadParcels, 30_000);
    };

    (realtimeOn ? startRealtime : startPollingOnly)();

    return () => {
      stopped = true;
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [realtimeOn]);

  const tabs = [
    {
      key: 'mapa',
      label: 'Mapa',
      content: (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={loadParcels}>Actualizar ahora</button>
            <button
              onClick={() => setRealtimeOn((v) => !v)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '6px 10px',
              }}
            >
              {realtimeOn ? 'Desactivar Realtime' : 'Activar Realtime'}
            </button>
            <span
              style={{
                padding: '2px 6px',
                borderRadius: 6,
                fontSize: 12,
                background: realtimeOn ? '#e6ffed' : '#fff7ed',
                border: '1px solid #e5e7eb',
              }}
            >
              {realtimeOn ? 'Realtime ON' : 'Realtime OFF (poll 30s)'}
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              Última actualización:{' '}
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
            </span>
          </div>

          {/* Mini mapa con tus parcels */}
          <MiniMap parcels={parcels} />

          {/* Lista debajo del mapa */}
          <ParcelsList parcels={parcels} />
        </div>
      ),
    },
    {
      key: 'misiones',
      label: 'Misiones',
      content: <MissionsPanel />,
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>Pirate World · Inicio</h2>
      <Tabs tabs={tabs} initialKey="mapa" />
    </div>
  );
}
