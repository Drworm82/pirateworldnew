// src/pages/Ship.jsx
import React, { useEffect, useState } from "react";
import { getSupa, ensureUser } from "../lib/supaApi.js";

const FALLBACK_EMAIL = "worm_jim@hotmail.com";

function getCurrentEmail() {
  if (typeof window === "undefined") return FALLBACK_EMAIL;

  const fromDemo = window.localStorage.getItem("demoEmail");
  const fromDemoUser = window.localStorage.getItem("demoUserEmail");
  const fromLegacy = window.localStorage.getItem("userEmail");

  return fromDemo || fromDemoUser || fromLegacy || FALLBACK_EMAIL;
}

export default function ShipPage() {
  const [user, setUser] = useState(null);
  const [ship, setShip] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [customDestination, setCustomDestination] = useState("");

  // ----------------------------------------------------
  // Cargar usuario + estado del barco
  // ----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const { user: u } = await ensureUser(getCurrentEmail());
        if (cancelled) return;

        setUser(u);

        const supa = getSupa();
        const { data, error } = await supa.rpc("ship_get_state", {
          p_user_id: u.id,
        });

        if (error) {
          console.error("[ship] ship_get_state error:", error);
          throw error;
        }

        let payload;
        if (Array.isArray(data)) {
          const first = data[0] || {};
          payload = first.ship_get_state || first || {};
        } else {
          payload = data?.ship_get_state || data || {};
        }

        if (!payload || payload.ok === false) {
          // Si no hay barco, lo tratamos como "sin barco todavía"
          setShip(null);
          setStatus("ready");
          return;
        }

        setShip({
          userId: payload.user_id,
          currentLocation: payload.current_location || "Desconocido",
          status: payload.status || "idle",
          updatedAt: payload.updated_at || null,
        });
        setStatus("ready");
      } catch (err) {
        console.error("[ship] Error cargando estado:", err);
        if (!cancelled) {
          setErrorMsg(err.message || "No se pudo cargar el barco.");
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadShip() {
    if (!user) return;
    try {
      const supa = getSupa();
      const { data, error } = await supa.rpc("ship_get_state", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("[ship] reload ship_get_state error:", error);
        throw error;
      }

      let payload;
      if (Array.isArray(data)) {
        const first = data[0] || {};
        payload = first.ship_get_state || first || {};
      } else {
        payload = data?.ship_get_state || data || {};
      }

      if (!payload || payload.ok === false) {
        setShip(null);
        return;
      }

      setShip({
        userId: payload.user_id,
        currentLocation: payload.current_location || "Desconocido",
        status: payload.status || "idle",
        updatedAt: payload.updated_at || null,
      });
    } catch (err) {
      console.error("[ship] Error recargando estado:", err);
      setErrorMsg(err.message || "No se pudo recargar el barco.");
      setStatus("error");
    }
  }

  // ----------------------------------------------------
  // Viajes simples (RPC ship_travel_simple)
  // ----------------------------------------------------
  async function handleTravel(target) {
    if (!user) return;
    const trimmed = (target || "").trim();
    if (!trimmed) {
      alert("Escribe un destino.");
      return;
    }

    setBusy(true);
    setErrorMsg("");

    try {
      const supa = getSupa();
      const { data, error } = await supa.rpc("ship_travel_simple", {
        p_user_id: user.id,
        p_target_location: trimmed,
      });

      if (error) {
        console.error("[ship] ship_travel_simple error:", error);
        throw error;
      }

      let payload;
      if (Array.isArray(data)) {
        const first = data[0] || {};
        payload = first.ship_travel_simple || first || {};
      } else {
        payload = data?.ship_travel_simple || data || {};
      }

      if (!payload || payload.ok === false) {
        console.warn("[ship] viaje falló:", payload);
        setErrorMsg(
          (payload && payload.message) ||
            (payload && payload.error) ||
            "No se pudo completar el viaje."
        );
      } else {
        setShip({
          userId: payload.user_id,
          currentLocation: payload.current_location || trimmed,
          status: payload.status || "idle",
          updatedAt: payload.updated_at || null,
        });
      }
    } catch (err) {
      console.error("[ship] Error en viaje:", err);
      setErrorMsg(err.message || "No se pudo completar el viaje.");
    } finally {
      setBusy(false);
    }
  }

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  if (status === "loading") {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Barco</h1>
        <p className="muted">Cargando estado del barco…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Barco</h1>
        <p className="ledger-error">
          Ocurrió un error al cargar el barco:
          <br />
          <code>{errorMsg}</code>
        </p>
        <button
          type="button"
          onClick={reloadShip}
          style={{ marginTop: 12 }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="page-container ledger-page">
      <header className="ledger-header">
        <h1 className="big">Estado del barco</h1>
        <p className="ledger-subtitle">
          Aquí ves <strong>dónde está tu barco</strong> y puedes hacer viajes
          simples a otros destinos de prueba. Más adelante esto crecerá a un
          sistema de navegación con tiempos, costos y eventos.
        </p>
      </header>

      <div className="card ledger-card">
        {user && (
          <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
            Capitán: <strong>{user.email}</strong>
          </p>
        )}

        {ship ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Ubicación actual</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {ship.currentLocation}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Estado</div>
              <div style={{ fontSize: 14 }}>
                {ship.status === "idle" && "En reposo (sin viajar)"}
                {ship.status !== "idle" && ship.status}
              </div>
            </div>

            {ship.updatedAt && (
              <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                Última actualización:{" "}
                <code>{new Date(ship.updatedAt).toLocaleString()}</code>
              </div>
            )}
          </>
        ) : (
          <p className="muted">
            Aún no hay estado de barco registrado. Haz un viaje para crearlo.
          </p>
        )}

        {errorMsg && (
          <p className="ledger-error" style={{ marginTop: 8 }}>
            {errorMsg}
          </p>
        )}

        <hr style={{ margin: "16px 0", borderColor: "rgba(148,163,184,0.3)" }} />

        <h3 style={{ marginTop: 0 }}>Viajes rápidos de prueba</h3>
        <p className="muted" style={{ marginBottom: 8 }}>
          Estos destinos son solo textos lógicos (no GPS). Sirven para probar el
          sistema de viaje del barco.
        </p>

        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleTravel("Puerto inicial")}
          >
            Ir a Puerto inicial
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleTravel("Isla de pruebas")}
          >
            Ir a Isla de pruebas
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleTravel("Isla del tesoro")}
          >
            Ir a Isla del tesoro
          </button>
        </div>

        <h4 style={{ marginTop: 12, marginBottom: 6 }}>Destino personalizado</h4>
        <div className="row" style={{ gap: 8 }}>
          <input
            type="text"
            placeholder="Ej: Archipiélago Bribón"
            value={customDestination}
            onChange={(e) => setCustomDestination(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              background: "#020617",
              color: "#e5e7eb",
              borderRadius: 8,
              border: "1px solid #1f2937",
              padding: "8px 10px",
              fontSize: 14,
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => handleTravel(customDestination)}
          >
            Zarpar
          </button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
        Futuro: tiempos de viaje, consumo de recursos, eventos aleatorios en el
        mar y detección del vigía según la ruta.
      </p>
    </div>
  );
}
