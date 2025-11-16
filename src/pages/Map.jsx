// Map.jsx — compra con click usando react-leaflet
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  round4,
  listMyParcels,
  buyParcel,
  ensureUser,
  getUserState,
} from "../lib/supaApi.js";
import ConfettiOverlay from "../components/ConfettiOverlay.jsx";

// Fix de iconos en Leaflet
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

const CDMX = [19.4326, -99.1332];

function ClickToBuy({ onClickLatLng }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClickLatLng({ lat, lng });
    },
  });
  return null;
}

export default function MapPage() {
  const [email, setEmail] = useState("worm_jim@hotmail.com");
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const confettiRef = useRef(null);

  async function bootstrap() {
    setLoading(true);
    try {
      const { user: u } = await ensureUser(email);
      setUser(u);
      const rows = await listMyParcels(u.id);
      setParcels(rows || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClickBuy({ lat, lng }) {
    if (!user?.id) {
      alert("Primero crea/carga un usuario en la pestaña 'Demo usuario'.");
      return;
    }
    const y = round4(lat);
    const x = round4(lng);
    const ok = window.confirm(
      `¿Comprar parcela en:\nlat=${y}, lng=${x} (–100 doblones)?`
    );
    if (!ok) return;

    try {
      const res = await buyParcel({ userId: user.id, cost: 100, x, y });
      if (res?.ok) {
        confettiRef.current?.fire("buy");
        const rows = await listMyParcels(user.id);
        setParcels(rows || []);
        // refresca info usuario por si hay HUD en otras vistas
        const fresh = await getUserState({ userId: user.id });
        setUser(fresh);
      } else {
        alert(`Compra rechazada: ${res?.error || "rechazada"}`);
      }
    } catch (err) {
      alert("Error al comprar: " + (err.message || err));
    }
  }

  const markers = useMemo(
    () =>
      parcels.map((p) => <Marker key={p.id} position={[p.y, p.x]} />),
    [parcels]
  );

  return (
    <div className="container">
      <h1 className="big" style={{ marginBottom: 10 }}>
        Mapa (compra con click)
      </h1>
      <p className="muted" style={{ marginBottom: 12 }}>
        Tip: toca/clic en el mapa para comprar una parcela en esa coordenada
        (no requiere GPS).
      </p>

      <div className="map-wrap">
        <div className="map-frame">
          <MapContainer
            center={CDMX}
            zoom={14}
            scrollWheelZoom
            style={{ width: "100%", height: "100%" }}
            whenReady={(m) => {
              m.target.invalidateSize();
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickToBuy onClickLatLng={handleClickBuy} />
            {markers}
          </MapContainer>
        </div>
      </div>

      <ConfettiOverlay ref={confettiRef} />
    </div>
  );
}
