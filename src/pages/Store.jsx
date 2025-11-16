// src/pages/Store.jsx
import React, { useEffect, useState } from "react";
import {
  getLastUserId,
  getUserState,
  listStoreItems,
  buyItem,
  listInventory,
} from "../lib/supaApi.js";
import Toast from "../components/Toast.jsx";

function rarityLabel(rarity) {
  switch (rarity) {
    case "common":
      return "Común";
    case "rare":
      return "Raro";
    case "epic":
      return "Épico";
    case "legendary":
      return "Legendario";
    default:
      return rarity || "—";
  }
}

export default function StorePage() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");

  const [inventoryCounts, setInventoryCounts] = useState({});
  const [buyingId, setBuyingId] = useState(null);
  const [globalError, setGlobalError] = useState("");

  // 🔔 Toast estilo móvil
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-cerrar el toast después de ~3s
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  async function loadAll() {
    setUserLoading(true);
    setItemsLoading(true);
    setUserError("");
    setItemsError("");
    setGlobalError("");
    setInventoryCounts({});

    try {
      const lastId = getLastUserId();
      if (!lastId) {
        setUserError(
          "No hay usuario activo. Ve a 'Demo usuario' para crear / cargar uno."
        );
        setUserLoading(false);
        setItemsLoading(false);
        return;
      }

      const [u, storeItems, inv] = await Promise.all([
        getUserState({ userId: lastId }),
        listStoreItems(),
        listInventory(lastId),
      ]);

      setUser(u);
      setItems(storeItems);

      if (!inv.ok) {
        console.warn("Error al leer inventario:", inv.error);
        setInventoryCounts({});
      } else {
        const counts = {};
        for (const row of inv.rows) {
          counts[row.item_id] = (counts[row.item_id] || 0) + 1;
        }
        setInventoryCounts(counts);
      }
    } catch (err) {
      console.error("Error al cargar tienda:", err);
      setGlobalError(err.message || "Error al cargar la tienda.");
    } finally {
      setUserLoading(false);
      setItemsLoading(false);
    }
  }

  async function handleBuy(item) {
    if (!user) return;
    setGlobalError("");
    setBuyingId(item.id);

    try {
      const res = await buyItem({ userId: user.id, itemId: item.id });

      // Manejo de errores del RPC
      if (!res || !res.ok) {
        const code = res?.error;

        // Caso esperado: no hay suficientes monedas
        if (code === "insufficient_funds" || code === "not_enough_coins") {
          setToast({
            message: "No tienes suficientes doblones para comprar este ítem.",
            type: "error",
          });
          return; // 👈 No lanzamos excepción ni llenamos la consola
        }

        // Otros errores sí los tratamos como excepciones
        throw new Error(code || "Error al comprar ítem.");
      }

      // ✅ Actualizar saldo local
      setUser((prev) =>
        prev ? { ...prev, soft_coins: res.soft_coins ?? prev.soft_coins } : prev
      );

      // ✅ Incrementar conteo local del inventario
      setInventoryCounts((prev) => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1,
      }));

      // 🔔 Mostrar toast estilo móvil
      let msg = `Compraste "${item.name}" por ${item.price} doblones.`;
      if (res.first_buy && res.xp) {
        msg += ` +${res.xp} XP por tu primera compra.`;
      }
      setToast({ message: msg, type: "success" });
    } catch (err) {
      console.error("handleBuy error:", err);
      setToast({
        message: err.message || "Error al comprar ítem.",
        type: "error",
      });
    } finally {
      setBuyingId(null);
    }
  }

  const loading = userLoading || itemsLoading;

  return (
    <div className="page-container store-page">
      {/* 🔔 Toast flotando estilo móvil */}
      <Toast
        message={toast?.message}
        type={toast?.type || "success"}
        onClose={() => setToast(null)}
      />

      <h1>Tienda pirata</h1>

      {/* HEADER: saldo + usuario */}
      <div
        className="store-header row"
        style={{ justifyContent: "space-between" }}
      >
        <div className="row" style={{ gap: 12 }}>
          <div className="store-balance-pill">
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                opacity: 0.8,
              }}
            >
              Saldo
            </span>
            <strong>{user?.soft_coins ?? 0}</strong>
            <span style={{ fontSize: 12 }}>doblones</span>
          </div>
          <div className="store-user">
            Usuario:{" "}
            <strong>{user?.email || (!user && !userLoading ? "—" : "")}</strong>
          </div>
        </div>

        <button
          type="button"
          className="btn ghost"
          onClick={loadAll}
          disabled={loading}
        >
          Recargar
        </button>
      </div>

      <p className="muted" style={{ marginBottom: 16 }}>
        Compra ítems cosméticos y objetos especiales usando tus doblones. La
        cantidad que ya posees se muestra en cada carta.
      </p>

      {/* Mensajes de error generales */}
      {globalError && (
        <div className="card" style={{ borderColor: "#b91c1c" }}>
          <div style={{ color: "#fecaca", fontSize: 14 }}>{globalError}</div>
        </div>
      )}
      {userError && (
        <div className="card" style={{ borderColor: "#b45309" }}>
          <div style={{ color: "#fed7aa", fontSize: 14 }}>{userError}</div>
        </div>
      )}
      {itemsError && (
        <div className="card" style={{ borderColor: "#b91c1c" }}>
          <div style={{ color: "#fecaca", fontSize: 14 }}>{itemsError}</div>
        </div>
      )}

      {/* GRID DE ÍTEMS */}
      <div className="store-grid">
        {loading && items.length === 0 && (
          <div className="card">
            <div className="muted">Cargando tienda...</div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="card">
            <div className="muted">No hay ítems configurados en la tienda.</div>
          </div>
        )}

        {items.map((item) => {
          const owned = inventoryCounts[item.id] || 0;
          const disabled =
            !user || buyingId === item.id || (user?.soft_coins ?? 0) < item.price;

          return (
            <article key={item.id} className="store-card">
              <div className="store-card-main">
                <h3>{item.name}</h3>
                <div style={{ marginBottom: 8 }}>
                  <span
                    className={[
                      "store-rarity-pill",
                      item.rarity ? `store-rarity-${item.rarity}` : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {rarityLabel(item.rarity)}
                  </span>
                </div>

                {owned > 0 && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "#a5b4fc",
                      opacity: 0.9,
                    }}
                  >
                    Ya tienes <strong>x{owned}</strong> de este ítem.
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="store-price">{item.price}</div>
                <div className="store-price-label">doblones</div>
                <button
                  type="button"
                  style={{ marginTop: 10, minWidth: 100 }}
                  onClick={() => handleBuy(item)}
                  disabled={disabled}
                >
                  {buyingId === item.id ? "Comprando..." : "Comprar"}
                </button>
                {!user && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: "#fca5a5",
                      maxWidth: 160,
                    }}
                  >
                    Crea o carga un usuario en “Demo usuario” para comprar.
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
