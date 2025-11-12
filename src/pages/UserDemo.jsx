// src/pages/UserDemo.jsx
import { useEffect, useState } from "react";
import {
  ensureUser,
  getUserState,
  getBalance,
  creditAd,
  buyParcel,
  round4,
  resetUserAndParcels, // si no lo usas, puedes quitar esta línea
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
            boxShadow: "0 0 0 2px rgba(34,197,94,.35), 0 10px 40px rgba(34,197,94,.25)",
          }}
        >
          <span style={{ fontSize: 56, lineHeight: 1 }}>✅</span>
        </div>
      </div>
    </>
  );
}

export default function UserDemo() {
  const [email, setEmail] = useState("worm_jim@hotmail.com");
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loc, setLoc] = useState(null); // { lat, lng } o null
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [showCelebration, setShowCelebration] = useState(false);

  /* --------------------------- Localización (GPS) --------------------------- */
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLoc({ lat, lng });
      },
      () => setLoc(null),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  /* ------------------------------- Helpers -------------------------------- */
  function fireConfetti() {
    // ráfaga breve y ligera (amigable con móvil)
    const duration = 900;
    const end = Date.now() + duration;

    const make = (originX) =>
      confetti({
        particleCount: 28,
        startVelocity: 40,
        spread: 70,
        ticks: 180,
        origin: { x: originX, y: 0.6 },
        scalar: 0.9,
      });

    const frame = () => {
      make(0.2);
      make(0.8);
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
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
      const { balance: b } = await creditAd(user.id);
      setBalance(b);
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
    const ok = window.confirm(`¿Comprar por 100 doblones en:\nlat=${lat}, lng=${lng}?`);
    if (!ok) return;

    try {
      const res = await buyParcel({ userId: user.id, cost: 100, x: lng, y: lat });
      if (res?.ok) {
        // Toast + confetti + overlay animado
        setToast({ show: true, msg: `🏝 Nueva parcela en lat=${lat}, lng=${lng}` });
        setShowCelebration(true);
        fireConfetti();

        // apaga el overlay en ~1.2 s
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
    const ok = window.confirm("¿Seguro que deseas reiniciar este usuario y borrar todas sus parcelas?");
    if (!ok) return;
    try {
      await resetUserAndParcels(user.id);
      alert("✅ Usuario y parcelas reiniciados.");
      window.location.reload();
    } catch (err) {
      alert("Error al reiniciar: " + err.message);
    }
  }

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Demo usuario</h1>

      <div className="mb-4">
        <div className="mb-2">Email de prueba</div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: 280 }} />
        <button className="ml-2" onClick={loadOrCreate} disabled={loading}>
          {loading ? "Cargando..." : "Crear / Cargar"}
        </button>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Usuario</h2>
        <pre className="bg-[#0d1c2a] p-3 rounded">
{JSON.stringify(user ?? { info: "(sin usuario)" }, null, 2)}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Saldo</h2>
        <div className="text-2xl font-bold mb-2">{balance}</div>
        <div className="mb-2">1 anuncio = 1 doblón · 100 doblones = 1 parcela</div>
        <button onClick={onAdClick} className="mr-2">Ver anuncio (+1)</button>
        <button onClick={refreshBalance} className="mr-2">Refrescar saldo</button>
        <button onClick={onResetUser}>Reiniciar usuario 🗑️</button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Compra de parcela (GPS)</h2>
        <p className="mb-2">Compra una parcela en tu ubicación actual. El backend redondea a 4dp.</p>
        <button onClick={onBuyHere}>Comprar parcela (−100)</button>
        <div className="mt-2 text-sm opacity-80">
          Ubicación detectada: {loc ? `lat=${round4(loc.lat)} · lng=${round4(loc.lng)}` : "(sin GPS)"}
        </div>
      </section>

      <ToastPurchase
        show={toast.show}
        message={toast.msg}
        onClose={() => setToast({ show: false, msg: "" })}
      />

      {/* Overlay de animación de éxito */}
      {showCelebration && <CelebrationOverlay />}
    </div>
  );
}
