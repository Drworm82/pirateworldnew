// hooks/useShipPolling.js — polling avanzado con autonav

import { useEffect, useState } from "react";
import { getShipProgressV4, runAutonavV4, getMyShipRow } from "../lib/supaApi.js";

export function useShipPolling(interval = 2500) {
  const [ship, setShip] = useState(null);
  const [event, setEvent] = useState(null);

  async function refresh() {
    const prog = await getShipProgressV4();
    const db = await getMyShipRow();
    if (!prog || !db) return;

    setShip({
      ...db,
      percent: prog.percent ?? db.percent,
      lat: prog.lat,
      lng: prog.lng,
      eta: prog.eta
    });
  }

  async function tickAutonav() {
    const data = await runAutonavV4();
    if (data?.event) setEvent(data);
    await refresh();
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(() => tickAutonav(), interval);
    return () => clearInterval(timer);
  }, []);

  return { ship, event };
}
