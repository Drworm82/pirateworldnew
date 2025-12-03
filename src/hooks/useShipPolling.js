// ============================================
// useShipPolling.js — Hook de polling V4
// ============================================

import { useEffect, useState } from "react";
import { getShipProgress } from "../lib/supaApi.js";

export default function useShipPolling(userId) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function load() {
      const p = await getShipProgress(userId);
      if (active) setProgress(p);
    }

    // primera carga
    load();

    // polling cada 1.5 segundos
    const interval = setInterval(load, 1500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  return progress;
}
