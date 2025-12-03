// src/hooks/useShipTravel.js
import { useState, useEffect, useRef } from "react";
import {
  ensureUser,
  getShipProgress,
  autoNav,
  startShipTravel,
} from "../lib/supaApi.js";

// Interpolación suave entre dos puntos
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function useShipTravel() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Para animación suave
  const smoothLat = useRef(null);
  const smoothLng = useRef(null);
  const lastUpdate = useRef(Date.now());

  // Polling cada 2.5s
  useEffect(() => {
    let interval;

    async function load() {
      const user = await ensureUser();
      const res = await getShipProgress(user.id);
      if (res) updateState(res);
      setLoading(false);
    }

    load();
    interval = setInterval(load, 2500);

    return () => clearInterval(interval);
  }, []);

  function updateState(res) {
    const now = Date.now();
    lastUpdate.current = now;

    // Guardar ubicación interpolada
    if (!smoothLat.current) {
      smoothLat.current = res.lat;
      smoothLng.current = res.lng;
    }

    setState(res);
  }

  // INTERPOLACIÓN SUAVE — 60 FPS
  useEffect(() => {
    let anim;

    function animate() {
      if (state) {
        const t = 0.12; // suavidad

        smoothLat.current = lerp(smoothLat.current, state.lat, t);
        smoothLng.current = lerp(smoothLng.current, state.lng, t);

        // Trigger repaint
        setState((s) => ({ ...s }));
      }

      anim = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(anim);
  }, [state]);

  async function travelTo(key) {
    const user = await ensureUser();
    await startShipTravel(key, user.id);
  }

  async function forceAutoNav() {
    const user = await ensureUser();
    await autoNav(user.id);
  }

  return {
    loading,
    state,
    lat: smoothLat.current,
    lng: smoothLng.current,
    travelTo,
    forceAutoNav,
  };
}
