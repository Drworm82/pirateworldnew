// src/pages/MiniMap.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix de íconos (Vite)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker1x, shadowUrl: markerShadow });

import { getLastUserId, listMyParcels } from "../lib/supaApi.js";

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    const bounds = L.latLngBounds(points.map(p => [p.y, p.x]));
    map.fitBounds(bounds.pad(0.2), { animate: true });
  }, [points, map]);
  return null;
}

export default function MiniMap() {
  const userId = getLastUserId();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);

  // CDMX por defecto
  const defaultCenter = [19.4326, -99.1332];

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const rows = await listMyParcels(userId);
        setParcels(rows);
      } catch (e) {
        alert("No se pudieron cargar tus parcelas: " + (e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const points = useMemo(() => parcels.map(p => ({ x: Number(p.x), y: Number(p.y), id: p.id })), [parcels]);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Mapa (tus parcelas)</h1>
      {!userId && <div>Primero crea/carga un usuario en “Demo usuario”.</div>}
      <div style={{ height: "70vh", borderRadius: 12, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,.08)" }}>
        <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map(p => (
            <Marker key={p.id} position={[p.y, p.x]}>
              <Popup>
                <div style={{ fontFamily: "monospace" }}>
                  <div><b>id:</b> {p.id}</div>
                  <div><b>lat:</b> {p.y}</div>
                  <div><b>lng:</b> {p.x}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          {points.length > 0 ? <FitBounds points={points} /> : null}
        </MapContainer>
      </div>
      <div style={{ marginTop: 8, opacity: .8, fontSize: 14 }}>
        {loading ? "Cargando tus parcelas..." : `Parcelas: ${points.length}`}
      </div>
    </div>
  );
}
