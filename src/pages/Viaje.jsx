// =======================================================
// Viaje.jsx — PirateWorld (UX observa backend)
// =======================================================

import { useEffect, useState } from "react";
import {
  shipGetState,
  shipTravelComplete
} from "../lib/supaApi";

export default function Viaje() {
  const [state, setState] = useState(null);
  const [phase, setPhase] = useState("traveling"); // traveling | resolving | done
  const [result, setResult] = useState(null);

  useEffect(() => {
    let timer = null;

    async function poll() {
      const s = await shipGetState();
      setState(s);

      // 👉 SOLO reaccionamos al arrived
      if (s.status === "arrived" && phase === "traveling") {
        setPhase("resolving");

        setTimeout(async () => {
          const r = await shipTravelComplete();
          setResult(r);
          setPhase("done");
        }, 1200);
      }
    }

    poll();
    timer = setInterval(poll, 3000);

    return () => clearInterval(timer);
  }, [phase]);

  if (!state) {
    return <div className="page viaje">Cargando viaje…</div>;
  }

  if (phase === "resolving") {
    return (
      <div className="page viaje">
        <h1>El destino se decide…</h1>
        <p>El mar guarda silencio.</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="page viaje">
        <h1>Viaje completado</h1>
        <p>El viaje ha concluido.</p>
        <button onClick={() => (window.location.hash = "#/ui/gps")}>
          Regresar al mapa
        </button>
      </div>
    );
  }

  return (
    <div className="page viaje">
      <h1>En travesía</h1>
      <p>Estado: {state.status}</p>
      <p>Progreso: {Math.floor(state.percent || 0)}%</p>
      <p>El barco avanza entre las olas…</p>
    </div>
  );
}
