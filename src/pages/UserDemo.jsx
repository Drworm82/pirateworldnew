// src/pages/UserDemo.jsx
import { useEffect, useState, useRef } from "react";
import {
  ensureUser,
  getUserState,
  getBalance,
  creditAd,
  buyParcel,
  round4,
  resetUserAndParcels,
} from "../lib/supaApi.js";
import ToastPurchase from "../components/ToastPurchase.jsx";
import confetti from "canvas-confetti";

/* ---------- Mini overlay de celebración (check con animación) ---------- */
function CelebrationOverlay() {
  return (
    <>
      <style>{`
        @keyframes popSuccess {
          0%   { transform: scale(.6); opacity: 0; }
          30%  { transform: scale(1.1); opacity: 1; }
          60%  { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(.95); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
        <div
          className="rounded-full border border-green-400/60 bg-green-500/20 backdrop-blur-sm"
          style={{
            padding: 24,
            animation: "popSuccess 1.2s ease-out forwards",
            boxShadow:
              "0 0 0 2px rgba(34,197,94,.35), 0 10px 40px rgba(34,197,94,.25)",
          }}
        >
          <span style={{ fontSize: 56, lineHeight: 1 }}>✅</span>
        </div>
      </div>
    </>
  );
}

/* ---------- Efecto visual de cambio de saldo (+ / −) ---------- */
function BalanceDelta({ delta }) {
  if (delta == null || delta === 0) return null;

  const isPositive = delta > 0;
  const sign = isPositive ? "+" : "−";
  const value = Math.abs(delta);

  return (
    <>
      <style>{`
        @keyframes balanceDeltaFloatUp {
          0%   { transform: translate(-50%, 10px); opacity: 0; }
          15%  { transform: translate(-50%, 0); opacity: 1; }
          70%  { transform: translate(-50%, -22px); opacity: 1; }
          100% { transform: translate(-50%, -34px); opacity: 0; }
        }
      `}</style>
      <span
        className="absolute pointer-events-none select-none"
        style={{
          left: "50%",
          bottom: "100%",
          marginBottom: 4,
          transform: "translate(-50%, 0)",
          color: isPositive ? "#4ade80" : "#f97373",
          fontSize: "1.6rem",
          fontWeight: 800,
          textShadow: "0 0 8px rgba(0,0,0,.7)",
          animation: "balanceDeltaFloatUp 1.2s ease-out forwards",
          zIndex: 5,
        }}
      >
        {sign}
        {value}
      </span>
    </>
  );
}

export default function UserDemo() {
  const [email, setEmail] = useState("worm_jim@hotmail.com");
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [balanceDelta, setBalanceDelta] = useState(null);
  const balanceDeltaTimeoutRef = useRef(null);

  const [loc, setLoc] = useState(null); // { lat, lng } o null
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [showCelebration, setShowCelebration] = useState(false);

  // ---------- GPS robusto ----------
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const opts = {
      enableHighAccuracy: true,
      maximumAge: 30_000,
      timeout: 15_000,
    };

    const onOK = (pos) => {
      setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };
    const onErr = () => {
      setLoc(null);
    };

    navigator.geolocation.getCurrentPosition(onOK, onErr, opts);
    const id = navigator.geolocation.watchPosition(onOK, onErr, opts);
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  // ---------- /GPS ----------

  /* --------------------------- Confetti helper --------------------------- */
  function fireConfetti() {
    const duration = 700;
    const end = Date.now() + duration;

    const make = (originX) =>
      confetti({
        particleCount: 45,
        startVelocity: 55,
        spread: 90,
        ticks: 140,
        origin: { x: originX, y: 0.6 },
        scalar: 1.0,
      });

    const frame = () => {
      make(0.2);
      make(0.5);
      make(0.8);
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }

  /* ---------------------- Helper para mostrar delta ---------------------- */
  function showBalanceDelta(value) {
    if (balanceDeltaTimeoutRef.current) {
      clearTimeout(balanceDeltaTimeoutRef.current);
    }
    setBalanceDelta(value);
    balanceDeltaTimeoutRef.current = setTimeout(() => {
      setBalanceDelta(null);
      balanceDeltaTimeoutRef.current = null;
    }, 1200);
  }

  async function loadOrCreate() {
    try {
      setLoading(true);
      const { user: u } = await ensureUser(email);
      setUser(u);
      const b = await getBalance(u.id);
      setBalance(b);
    } catch (err) {
      alert(`Error al crear/cargar usuario: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  async function refreshBalance() {
    if (!user?.id) return;
    try {
      const b = await getBalance(user.id);
      setBalance(b);
      const u = await getUserState({ userId: user.id });
      setUser(u);
    } catch (err) {
      alert(`No se pudo refrescar el saldo: ${err.message || err}`);
    }
  }

  async function onAdClick() {
    if (!user?.id) return alert("Primero crea/carga un usuario.");
    try {
      const before = balance;
      const { balance: b } = await creditAd(user.id);
      setBalance(b);
      showBalanceDelta(b - before); // normalmente +1
      const u = await getUserState({ userId: user.id });
      setUser(u);
    } catch (err) {
      alert(`Error al acreditar anuncio: ${err.message || err}`);
    }
  }

  async function onBuyHere() {
    if (!user?.id) return alert("Primero crea/carga un usuario.");
    if (!loc) return alert("Ubicación no disponible (sin GPS).");

    const lat = round4(loc.lat);
    const lng = round4(loc.lng);
    const ok = window.confirm(
      `¿Comprar por 100 doblones en:\nlat=${lat}, lng=${lng}?`
    );
    if (!ok) return;

    const before = balance;

    try {
      const res = await buyParcel({
        userId: user.id,
        cost: 100,
        x: lng,
        y: lat,
      });

      if (res?.ok) {
        const newBalance =
          typeof res.soft_coins === "number" ? res.soft_coins : before - 100;

        setBalance(newBalance);
        showBalanceDelta(newBalance - before); // debería ser -100

        setToast({
          show: true,
          msg: `🏝 Nueva parcela en lat=${lat}, lng=${lng}`,
        });
        setShowCelebration(true);
        fireConfetti();
        setTimeout(() => setShowCelebration(false), 1200);
      } else {
        const reason = res?.error || "rechazada";
        alert(`Compra rechazada: ${reason}`);
      }
    } catch (err) {
      alert(`Error al comprar: ${err.message || err}`);
    } finally {
      await refreshBalance();
    }
  }

  async function onResetUser() {
    if (!user?.id) return alert("Primero crea/carga un usuario.");
    const ok = window.confirm(
      "¿Seguro que deseas reiniciar este usuario y borrar todas sus parcelas?"
    );
    if (!ok) return;
    try {
      await resetUserAndParcels(user.id);
      alert("✅ Usuario y parcelas reiniciados.");
      window.location.reload();
    } catch (err) {
      alert("Error al reiniciar: " + err.message);
    }
  }

  function simulateCDMX() {
    const baseLat = 19.4326;
    const baseLng = -99.1332;
    const jitter = () => (Math.random() - 0.5) * 0.002;
    const lat = baseLat + jitter();
    const lng = baseLng + jitter();
    setLoc({ lat, lng });
    alert(
      `📍 Ubicación simulada: CDMX.\nlat=${round4(lat)}, lng=${round4(lng)}`
    );
  }

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="page-container">
      <h1 className="big" style={{ marginBottom: 16 }}>
        Demo usuario
      </h1>

      {/* Card: email + datos de usuario */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="mb-4">
          <div className="mb-2">Email de prueba</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            style={{ maxWidth: 320 }}
          />
          <button
            className="ml-2"
            onClick={loadOrCreate}
            disabled={loading}
            type="button"
          >
            {loading ? "Cargando..." : "Crear / Cargar"}
          </button>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-2">Usuario</h2>
          <pre className="pre">
            {JSON.stringify(user ?? { info: "(sin usuario)" }, null, 2)}
          </pre>
        </section>
      </div>

      {/* Card: saldo */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="text-xl font-semibold mb-2">Saldo</h2>
        <div
          className="inline-flex items-center mb-2"
          style={{ position: "relative" }}
        >
          <span className="text-2xl font-bold">{balance}</span>
          <BalanceDelta delta={balanceDelta} />
        </div>
        <div className="mb-2">
          1 anuncio = 1 doblón · 100 doblones = 1 parcela
        </div>
        <button onClick={onAdClick} className="mr-2" type="button">
          Ver anuncio (+1)
        </button>
        <button onClick={refreshBalance} className="mr-2" type="button">
          Refrescar saldo
        </button>
        <button onClick={onResetUser} type="button">
          Reiniciar usuario 🗑️
        </button>
      </div>

      {/* Card: compra por GPS */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">
          Compra de parcela (GPS)
        </h2>
        <p className="mb-2">
          Compra una parcela en tu ubicación actual. El backend redondea a 4dp.
        </p>
        <button onClick={onBuyHere} type="button">
          Comprar parcela (−100)
        </button>
        <button onClick={simulateCDMX} className="ml-2" type="button">
          Simular GPS (CDMX)
        </button>
        <div className="mt-2 text-sm opacity-80">
          Ubicación detectada:{" "}
          {loc
            ? `lat=${round4(loc.lat)} · lng=${round4(loc.lng)}`
            : "(sin GPS)"}
        </div>
      </div>

      <ToastPurchase
        show={toast.show}
        message={toast.msg}
        onClose={() => setToast({ show: false, msg: "" })}
      />

      {showCelebration && <CelebrationOverlay />}
    </div>
  );
}
