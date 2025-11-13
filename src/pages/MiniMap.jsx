// src/pages/MiniMap.jsx
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix de íconos (Vite)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

// Supabase utils
import { getLastUserId, listMyParcels } from "../lib/supaApi.js";

/* ──────────────────────────────────────────────── */
/* FitBounds — centra el mapa en las parcelas       */
/* ──────────────────────────────────────────────── */
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return;

    const bounds = L.latLngBounds(points.map((p) => [p.y, p.x]));

    map.fitBounds(bounds.pad(0.2), {
      animate: true,
      duration: 0.8,
    });
  }, [points, map]);

  return null;
}

/* ──────────────────────────────────────────────── */
/* MapSizeFixer — arregla el problema de Leaflet     */
/* cuando el contenedor aparece por primera vez      */
/* ──────────────────────────────────────────────── */
function MapSizeFixer() {
  const map = useMap();

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 350);
    return () => clearTimeout(t);
  }, [map]);

  return null;
}

/* ──────────────────────────────────────────────── */
/* Componente principal                              */
/* ──────────────────────────────────────────────── */
export default function MiniMap() {
  const userId = getLastUserId();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultCenter = [19.4326, -99.1332]; // CDMX

  /* ─────────────── Cargar parcelas del usuario ─────────────── */
  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);
      try {
        const rows = await listMyParcels(userId);
        setParcels(rows || []);
      } catch (err) {
        alert("No se pudieron cargar tus parcelas: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  /* ─────────────── Filtrar coordenadas válidas ─────────────── */
  const points = useMemo(() => {
    return parcels
      .filter(
        (p) =>
          p.x != null &&
          p.y != null &&
          !isNaN(Number(p.x)) &&
          !isNaN(Number(p.y))
      )
      .map((p) => ({
        id: p.id,
        x: Number(p.x),
        y: Number(p.y),
      }));
  }, [parcels]);

  /* ─────────────── Render ─────────────── */
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        Mapa (tus parcelas)
      </h1>

      {!userId && (
        <div style={{ marginBottom: 12 }}>
          Primero crea/carga un usuario en “Demo usuario”.
        </div>
      )}

      <div
        style={{
          height: "70vh",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(255,255,255,.08)",
        }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcadores de parcelas */}
          {points.map((p) => (
            <Marker key={p.id} position={[p.y, p.x]}>
              <Popup>
                <div style={{ fontFamily: "monospace" }}>
                  <div>
                    <b>id:</b> {p.id}
                  </div>
                  <div>
                    <b>lat:</b> {p.y}
                  </div>
                  <div>
                    <b>lng:</b> {p.x}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Ajustar mapa a las parcelas */}
          {points.length > 0 && <FitBounds points={points} />}

          {/* Fix de tamaño */}
          <MapSizeFixer />
        </MapContainer>
      </div>

      <div style={{ marginTop: 8, opacity: 0.8, fontSize: 14 }}>
        {loading
          ? "Cargando tus parcelas..."
          : `Parcelas encontradas: ${points.length}`}
      </div>
    </div>
  );
}
