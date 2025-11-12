// src/pages/UserDemo.jsx
import { useEffect, useState } from "react";
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

export default function UserDemo() {
  const [email, setEmail] = useState("worm_jim@hotmail.com");
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loc, setLoc] = useState(null); // { lat, lng } o null
  const [loading, setLoading] = useState(false);

  // Toast de compra
  const [toast, setToast] = useState({ show: false, msg: "" });

  // FE-12: burbujas de cambio de saldo (+1 / –100)
  const [bumps, setBumps] = useState([]); // [{ id, text, kind: "plus"|"minus" }]

  function showBump(text, kind = "plus") {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Math.random());
    setBumps((prev) => [...prev, { id, text, kind }]);
    // La animación CSS dura ~900ms; dejamos 1000ms para limpiar
    setTimeout(() => {
      setBumps((prev) => prev.filter((b) => b.id !== id));
    }, 1000);
  }

  // ---------- GPS robusto ----------
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const opts = { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 };

    const onOK = (pos) => {
      setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };
    const onErr = () => {
      // Sin alert para no molestar; dejamos loc en null
      setLoc(null);
    };

    // Primer fix rápido
    navigator.geolocation.getCurrentPosition(onOK, onErr, opts);

    // Seguimiento
    const id = navigator.geolocation.watchPosition(onOK, onErr, opts);
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  // ---------- /GPS ----------

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
      // FE-12: pop visual +1
      showBump("+1", "plus");
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
        // FE-10: toast
        setToast({
          show: true,
          msg: `🏝 Nueva parcela en lat=${lat}, lng=${lng}`,
        });
        // FE-12: pop visual –100
        showBump("–100", "minus");
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

  // Auxiliar: simular GPS CDMX (útil en desktop o si no da permiso)
  function simulateCDMX() {
    setLoc({ lat: 19.4326, lng: -99.1332 });
    alert("📍 Ubicación simulada: CDMX.");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Demo usuario</h1>

      <div className="mb-4">
        <div className="mb-2">Email de prueba</div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: 280 }}
        />
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
        <button onClick={simulateCDMX} className="ml-2">Simular GPS (CDMX)</button>
        <div className="mt-2 text-sm opacity-80">
          Ubicación detectada:{" "}
          {loc ? `lat=${round4(loc.lat)} · lng=${round4(loc.lng)}` : "(sin GPS)"}
        </div>
      </section>

      {/* FE-12: burbujas de cambio de saldo */}
      {bumps.map((b) => (
        <div key={b.id} className={`balance-bubble ${b.kind}`}>
          {b.text} doblón{b.text === "+1" ? "" : "es"}
        </div>
      ))}

      {/* FE-10: toast compra */}
      <ToastPurchase
        show={toast.show}
        message={toast.msg}
        onClose={() => setToast({ show: false, msg: "" })}
      />
    </div>
  );
}
