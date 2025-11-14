// src/pages/Store.jsx
import React, { useEffect, useState } from "react";
import {
  ensureUser,
  getLastUserId,
  getUserState,
  listStoreItems,
  buyItem,
} from "../lib/supaApi.js";

function rarityLabel(rarity) {
  switch ((rarity || "").toLowerCase()) {
    case "common":
      return "Común";
    case "rare":
      return "Raro";
    case "epic":
      return "Épico";
    case "legendary":
      return "Legendario";
    default:
      return rarity || "Desconocido";
  }
}

export default function Store() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [buyingId, setBuyingId] = useState(null);

  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Cargar usuario desde last_user_id si existe
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoadingUser(true);
      setErrorMsg("");
      try {
        const lastId = getLastUserId();
        if (!lastId) return;

        const u = await getUserState({ userId: lastId });
        if (cancelled) return;

        setUser(u);
        setBalance(Number(u.soft_coins ?? 0));
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setErrorMsg(err?.message || "Error al cargar usuario.");
        }
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar ítems cuando haya usuario
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    async function fetchItems() {
      setLoadingItems(true);
      setErrorMsg("");
      try {
        const data = await listStoreItems();
        if (cancelled) return;
        setItems(data);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setErrorMsg(err?.message || "Error al cargar la tienda.");
        }
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleEnsureUser(e) {
    e?.preventDefault?.();
    setErrorMsg("");
    setInfoMsg("");

    const email = (emailInput || "").trim().toLowerCase();
    if (!email) {
      setErrorMsg("Escribe un email para continuar.");
      return;
    }

    try {
      const { user: u, created } = await ensureUser(email);
      setUser(u);
      setBalance(Number(u.soft_coins ?? 0));
      setInfoMsg(
        created
          ? "Usuario creado, ya puedes usar la tienda."
          : "Usuario cargado, ya puedes usar la tienda."
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "No se pudo crear/cargar el usuario.");
    }
  }

  async function handleBuy(item) {
    if (!user?.id) {
      setErrorMsg("Primero carga o crea un usuario.");
      return;
    }
    setErrorMsg("");
    setInfoMsg("");
    setBuyingId(item.id);

    try {
      const res = await buyItem({ userId: user.id, itemId: item.id });
      if (!res?.ok) {
        const reason =
          res?.error === "insufficient_funds"
            ? "Saldo insuficiente."
            : res?.error || "Compra rechazada.";
        setErrorMsg(reason);
        return;
      }
      // Actualizar saldo
      setBalance(Number(res.soft_coins ?? balance));
      setInfoMsg(`Compraste "${item.name}" por ${item.price} doblones.`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Error al comprar el ítem.");
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="store-page">
      <div className="card store-header">
        <h2 style={{ margin: "0 0 6px" }}>Tienda pirata</h2>
        <p className="muted" style={{ margin: 0 }}>
          Compra ítems cosméticos y objetos especiales usando tus doblones.
        </p>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div className="store-balance-pill">
            <span className="store-balance-label">Saldo</span>
            <span className="store-balance-value">{balance}</span>
            <span className="store-balance-unit">doblones</span>
          </div>

          {user?.email && (
            <span className="ledger-user-id">
              Usuario: <strong>{user.email}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Bloque para cargar/crear usuario */}
      {!user && (
        <div className="card store-auth-card">
          <h3 style={{ marginTop: 0 }}>Cargar usuario</h3>
          <p className="muted" style={{ fontSize: 14 }}>
            Escribe el email de tu pirata para crear/cargar su cuenta y poder
            usar la tienda.
          </p>
          <form
            onSubmit={handleEnsureUser}
            style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
          >
            <input
              className="input"
              type="email"
              placeholder="pirata@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <button type="submit">Entrar</button>
          </form>
        </div>
      )}

      {/* Mensajes */}
      {errorMsg && <p className="store-error">{errorMsg}</p>}
      {infoMsg && <p className="store-info">{infoMsg}</p>}

      {/* Grid de ítems */}
      {user && (
        <div className="card store-items-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Ítems disponibles</h3>
            {loadingItems && (
              <span className="muted" style={{ fontSize: 13 }}>
                Cargando tienda...
              </span>
            )}
          </div>

          {items.length === 0 && !loadingItems && (
            <p className="muted" style={{ fontSize: 14 }}>
              No hay ítems configurados en la tabla <code>store_items</code>.
            </p>
          )}

          <div className="store-grid">
            {items.map((item) => (
              <div key={item.id} className="store-card">
                <div className="store-card-header">
                  <span className="store-item-name">{item.name}</span>
                  <span className={`store-rarity store-rarity-${item.rarity}`}>
                    {rarityLabel(item.rarity)}
                  </span>
                </div>

                <div className="store-card-body">
                  <div className="store-price">
                    <span className="store-price-value">{item.price}</span>
                    <span className="store-price-label">doblones</span>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={buyingId === item.id}
                  >
                    {buyingId === item.id ? "Comprando..." : "Comprar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingUser && (
        <p className="muted" style={{ fontSize: 13 }}>
          Detectando usuario reciente...
        </p>
      )}
    </div>
  );
}
