// src/pages/Crew.jsx
import React, { useEffect, useState } from "react";
import { getSupa, ensureUser } from "../lib/supaApi.js";
import Toast from "../components/Toast.jsx";
import { subscribeToCrewRealtime } from "../lib/supaRealtime.js";

const FALLBACK_EMAIL = "worm_jim@hotmail.com";

// ----- Helpers de identidad / nombres ---------------------------------

// Email enmascarado para privacidad (por si no hay pirate_name)
function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  if (user.length <= 3) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 3)}***@${domain}`;
}

// Nombre que se muestra en tablas de tripulación
// 1) Usa pirate_name si existe
// 2) Si no, usa email enmascarado
function displayPirate(member) {
  if (!member) return "";
  if (member.pirate_name && member.pirate_name.trim() !== "") {
    return member.pirate_name.trim();
  }
  return maskEmail(member.email || "");
}

function getCurrentEmail() {
  if (typeof window === "undefined") return FALLBACK_EMAIL;

  const fromDemo = window.localStorage.getItem("demoEmail");
  const fromDemoUser = window.localStorage.getItem("demoUserEmail");
  const fromLegacy = window.localStorage.getItem("userEmail");

  const email = fromDemo || fromDemoUser || fromLegacy || FALLBACK_EMAIL;
  return email;
}

// label amigable para mostrar en “Mi rol” y en tablas
function roleLabel(userId, crew, members = []) {
  if (!crew) return "";
  if (userId === crew.captain_id) return "Capitán";

  const member = members.find((m) => m.user_id === userId);
  if (member?.role_name && member.role_name.trim() !== "") {
    return member.role_name.trim();
  }
  return "Miembro";
}

function shortId(id) {
  if (!id) return "-";
  return id.slice(0, 8) + "…";
}

export default function CrewPage() {
  const [loading, setLoading] = useState(true);
  const [crewState, setCrewState] = useState({
    inCrew: false,
    crew: null,
  });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [creatingName, setCreatingName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // Reparto (por usuario_id)
  const [sharesDraft, setSharesDraft] = useState({});
  const [savingShares, setSavingShares] = useState(false);
  const [lastShareEditAt, setLastShareEditAt] = useState(0);

  // Roles (por usuario_id) – aquí guardamos el ROLE_CODE
  const [roleDraft, setRoleDraft] = useState({});

  // autocierre del toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  // ------------------------------------------------------------------
  // Cargar usuario + crew actual
  // ------------------------------------------------------------------
  async function loadCrew(opts = {}) {
    const { silent = false } = opts;
    if (!silent) setLoading(true);
    setError("");

    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();
      const { data, error: err } = await supa.rpc("crew_get_my_crew", {
        p_user_id: u.id,
      });

      if (err) {
        console.error("crew_get_my_crew error:", err);
        throw err;
      }

      if (!data || data.in_crew === false) {
        setCrewState({ inCrew: false, crew: null });
        setSharesDraft({});
        setRoleDraft({});
      } else {
        const crew = data.crew || null;
        setCrewState({ inCrew: true, crew });

        // Prefill de reparto + roles
        if (crew && Array.isArray(crew.members)) {
          const draft = {};
          const roles = {};
          const hasAnyShare = crew.members.some(
            (m) => typeof m.share_percent === "number"
          );

          if (!hasAnyShare) {
            crew.members.forEach((m) => {
              if (m.user_id === crew.captain_id) {
                draft[m.user_id] = "100";
              } else {
                draft[m.user_id] = "0";
              }
            });
          } else {
            crew.members.forEach((m) => {
              if (typeof m.share_percent === "number") {
                draft[m.user_id] = String(m.share_percent);
              } else {
                draft[m.user_id] = "0";
              }
            });
          }

          // usamos role_code (para el <select>)
          crew.members.forEach((m) => {
            roles[m.user_id] = m.role_code || "member";
          });

          setSharesDraft(draft);
          setRoleDraft(roles);
        } else {
          setSharesDraft({});
          setRoleDraft({});
        }
      }
    } catch (err) {
      console.error("Error cargando tripulación:", err);
      setError(
        err.message || "No se pudo cargar la información de tripulación."
      );
      setCrewState({ inCrew: false, crew: null });
      setSharesDraft({});
      setRoleDraft({});
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadCrew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // Realtime FE-29: auto-refresco suave cuando cambie crews / crew_members
  // ------------------------------------------------------------------
  const crewId = crewState.crew?.id || null;

  useEffect(() => {
    if (!crewState.inCrew || !crewId) return;

    const channel = subscribeToCrewRealtime(crewId, () => {
      const now = Date.now();
      if (now - lastShareEditAt < 15000) return;
      loadCrew({ silent: true });
    });

    return () => {
      try {
        channel?.unsubscribe();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crewState.inCrew, crewId, lastShareEditAt]);

  // ------------------------------------------------------------------
  // Crear tripulación (capitán)
  // ------------------------------------------------------------------
  async function handleCreateCrew() {
    if (!creatingName.trim()) {
      setToast({
        type: "error",
        message: "Escribe un nombre para la tripulación.",
      });
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();
      const { data, error: err } = await supa.rpc("crew_create", {
        p_user_id: u.id,
        p_name: creatingName.trim(),
      });

      if (err) {
        console.error("crew_create error:", err);
        throw err;
      }

      setToast({
        type: "success",
        message: `Tripulación "${data?.name || creatingName.trim()}" creada.`,
      });
      setCreatingName("");
      await loadCrew();
    } catch (err) {
      console.error("Error al crear tripulación:", err);
      setToast({
        type: "error",
        message: err.message || "No se pudo crear la tripulación.",
      });
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------------------------------------
  // Unirse con join_code
  // ------------------------------------------------------------------
  async function handleJoinCrew() {
    if (!joinCode.trim()) {
      setToast({ type: "error", message: "Escribe un código de tripulación." });
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();
      const code = joinCode.trim().toUpperCase();
      const { data, error: err } = await supa.rpc("crew_join", {
        p_user_id: u.id,
        p_join_code: code,
      });

      if (err) {
        console.error("crew_join error:", err);
        const msg = err.message || "";
        if (msg.includes("invalid_join_code")) {
          setToast({
            type: "error",
            message: "Código inválido o tripulación no encontrada.",
          });
        } else if (msg.includes("already_in_crew")) {
          setToast({
            type: "error",
            message: "Ya perteneces a una tripulación.",
          });
        } else if (msg.includes("already_member")) {
          setToast({
            type: "error",
            message: "Ya eres miembro de esta tripulación.",
          });
        } else {
          setToast({
            type: "error",
            message: "No se pudo unir a la tripulación.",
          });
        }
        return;
      }

      setToast({
        type: "success",
        message: `Te uniste a "${data?.name || "la tripulación"}".`,
      });
      setJoinCode("");
      await loadCrew();
    } catch (err) {
      console.error("Error al unirse a tripulación:", err);
      setToast({
        type: "error",
        message: err.message || "No se pudo unir a la tripulación.",
      });
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------------------------------------
  // Salir del crew
  // ------------------------------------------------------------------
  async function handleLeaveCrew() {
    if (!crewState.inCrew || !crewState.crew) return;

    const ok = window.confirm("¿Seguro que quieres salir de la tripulación?");
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();
      const { data, error: err } = await supa.rpc("crew_leave", {
        p_user_id: u.id,
      });

      if (err) {
        console.error("crew_leave error:", err);
        const msg = err.message || "";
        if (msg.includes("captain_cannot_leave_with_members")) {
          setToast({
            type: "error",
            message:
              "No puedes salir de la tripulación siendo capitán mientras haya otros miembros.",
          });
        } else {
          setToast({
            type: "error",
            message: "No se pudo salir de la tripulación.",
          });
        }
        return;
      }

      if (data?.crew_deleted) {
        setToast({
          type: "success",
          message: "Saliste de la tripulación y esta se disolvió.",
        });
      } else {
        setToast({
          type: "success",
          message: "Saliste de la tripulación.",
        });
      }

      await loadCrew();
    } catch (err) {
      console.error("Error al salir de la tripulación:", err);
      setToast({
        type: "error",
        message: err.message || "No se pudo salir de la tripulación.",
      });
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------------------------------------
  // Kickear miembro (solo capitán)
  // ------------------------------------------------------------------
  async function handleKickMember(targetUserId) {
    if (!targetUserId) return;
    const { crew } = crewState;
    if (!crew || !crew.is_captain) return;
    if (targetUserId === crew.captain_id) return;

    const ok = window.confirm("¿Expulsar a este miembro de la tripulación?");
    if (!ok) return;

    setBusy(true);
    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();
      const { error: err } = await supa.rpc("crew_kick", {
        p_user_id: u.id,
        p_target_user_id: targetUserId,
      });

      if (err) {
        console.error("crew_kick error:", err);
        setToast({
          type: "error",
          message: err.message || "No se pudo expulsar al miembro.",
        });
        return;
      }

      setToast({ type: "success", message: "Miembro expulsado." });
      await loadCrew();
    } catch (err) {
      console.error("Error en kick miembro:", err);
      setToast({
        type: "error",
        message: err.message || "No se pudo expulsar al miembro.",
      });
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------------------------------------
  // Cambiar rol de un miembro (solo capitán) – ahora por ROLE_CODE
  // ------------------------------------------------------------------
  async function handleChangeMemberRole(targetUserId, newRoleCode) {
    const { crew } = crewState;
    if (!crew || !crew.is_captain) return;
    if (!targetUserId) return;
    if (!newRoleCode) return;

    // Actualizamos optimista en UI
    setRoleDraft((prev) => ({
      ...prev,
      [targetUserId]: newRoleCode,
    }));

    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();
      const { error: err } = await supa.rpc("crew_set_role", {
        p_user_id: u.id,
        p_target_user_id: targetUserId,
        p_role_code: newRoleCode,
      });

      if (err) {
        console.error("crew_set_role error:", err);
        const msg = err.message || "";
        if (msg.includes("not_captain")) {
          setToast({
            type: "error",
            message: "Solo el capitán puede cambiar los roles.",
          });
        } else if (msg.includes("invalid_role")) {
          setToast({
            type: "error",
            message: "Rol inválido, revisa la configuración de roles.",
          });
        } else if (msg.includes("member_not_found")) {
          setToast({
            type: "error",
            message: "No se encontró al miembro en esta tripulación.",
          });
        } else {
          setToast({
            type: "error",
            message: err.message || "No se pudo actualizar el rol.",
          });
        }
        await loadCrew({ silent: true });
        return;
      }

      setToast({ type: "success", message: "Rol actualizado." });
      await loadCrew({ silent: true });
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      setToast({
        type: "error",
        message: err.message || "No se pudo actualizar el rol.",
      });
      await loadCrew({ silent: true });
    }
  }

  // ------------------------------------------------------------------
  // Guardar reparto (RPC crew_set_shares)
  // ------------------------------------------------------------------
  async function handleSaveShares() {
    const crew = crewState.crew;
    if (!crew || !crew.is_captain) return;
    const members = crew.members || [];
    if (members.length === 0) return;

    setSavingShares(true);
    setError("");
    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      setUser(u);

      const supa = getSupa();

      const captainId = crew.captain_id;
      const sharesMap = {};
      let sumOthers = 0;

      members.forEach((m) => {
        if (m.user_id === captainId) return;
        const raw = sharesDraft[m.user_id];
        const num = Number.parseFloat(raw ?? "0");
        const clean = Number.isFinite(num) && num >= 0 ? num : 0;
        sharesMap[m.user_id] = clean;
        sumOthers += clean;
      });

      if (sumOthers > 100) {
        setToast({
          type: "error",
          message:
            "La suma de los miembros supera el 100%. Ajusta los valores.",
        });
        setSavingShares(false);
        return;
      }

      const captainShare = Math.max(0, 100 - sumOthers);
      sharesMap[captainId] = captainShare;

      const payload = members.map((m) => ({
        user_id: m.user_id,
        share_percent: sharesMap[m.user_id] ?? 0,
      }));

      const { error: err } = await supa.rpc("crew_set_shares", {
        p_user_id: u.id,
        p_shares_json: payload,
      });

      if (err) {
        console.error("crew_set_shares error:", err);
        setToast({
          type: "error",
          message: err.message || "No se pudo guardar el reparto.",
        });
        return;
      }

      setToast({ type: "success", message: "Reparto actualizado." });
      await loadCrew();
    } catch (err) {
      console.error("Error guardando reparto:", err);
      setToast({
        type: "error",
        message: err.message || "No se pudo guardar el reparto.",
      });
    } finally {
      setSavingShares(false);
    }
  }

  // ------------------------------------------------------------------
  // Cálculos de validación de reparto
  // ------------------------------------------------------------------
  const { inCrew, crew } = crewState;
  const members = crew?.members || [];

  const captainMember = members.find((m) => m.user_id === crew?.captain_id);
  const captainLabel =
    displayPirate(captainMember) || shortId(crew?.captain_id);

  const captainId = crew?.captain_id || null;

  let sumOthers = 0;
  let hasInvalidNumber = false;

  members.forEach((m) => {
    if (m.user_id === captainId) return;
    const raw = sharesDraft[m.user_id];
    if (raw === "" || raw == null) return;
    const num = Number.parseFloat(raw);
    if (!Number.isFinite(num) || num < 0) {
      hasInvalidNumber = true;
      return;
    }
    sumOthers += num;
  });

  if (sumOthers > 100) {
    hasInvalidNumber = true;
  }

  const captainShareLive =
    captainId && !hasInvalidNumber ? Math.max(0, 100 - sumOthers) : null;

  const totalRounded =
    captainShareLive != null ? sumOthers + captainShareLive : sumOthers;

  const sumIs100 =
    !hasInvalidNumber &&
    members.length > 0 &&
    Math.abs(totalRounded - 100) < 0.001;

  const canSaveShares =
    crew?.is_captain &&
    members.length > 0 &&
    sumIs100 &&
    !savingShares &&
    !busy;

  // Para mostrar mi reparto usando lo que venga del backend
  let mySharePercent = null;
  if (crew?.me?.user_id && typeof crew.me.share_percent === "number") {
    mySharePercent = crew.me.share_percent;
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="page-container">
      <Toast
        message={toast?.message}
        type={toast?.type || "success"}
        onClose={() => setToast(null)}
      />

      <h1>Tripulación</h1>

      {user && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="muted" style={{ fontSize: 13 }}>
            Capitán actual (tú en este dispositivo)
          </div>
          <strong>{user.email}</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Email (solo tú lo ves): {user.email}
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <p className="muted">Cargando información de tripulación…</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: "#b91c1c" }}>
          <div style={{ color: "#fecaca", fontSize: 14 }}>{error}</div>
        </div>
      )}

      {/* MODO SIN TRIPULACIÓN */}
      {!loading && !inCrew && !error && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Sin tripulación</h3>
            <p className="muted">
              Aún no perteneces a ninguna tripulación. Puedes crear una nueva o
              unirte con un código de invitación.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Crear tripulación</h3>
            <p className="muted">
              Serás el capitán de la nueva tripulación y podrás compartir el
              código con tus amigos.
            </p>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <input
                type="text"
                placeholder="Nombre de la tripulación"
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
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
              <button type="button" onClick={handleCreateCrew} disabled={busy}>
                Crear
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Unirse con código</h3>
            <p className="muted">
              Escribe el código de 6–8 caracteres que te compartió el capitán.
            </p>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <input
                type="text"
                placeholder="Código de tripulación"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  textTransform: "uppercase",
                  background: "#020617",
                  color: "#e5e7eb",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  padding: "8px 10px",
                  fontSize: 14,
                }}
              />
              <button type="button" onClick={handleJoinCrew} disabled={busy}>
                Unirse
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODO CON TRIPULACIÓN */}
      {!loading && inCrew && crew && (
        <>
          {/* Info general del crew */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Nombre de la tripulación
                </div>
                <h2 style={{ marginTop: 4, marginBottom: 0 }}>{crew.name}</h2>
                <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                  Capitán: <strong>{captainLabel}</strong>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="muted" style={{ fontSize: 13 }}>
                  Mi rol
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 999,
                    border: "1px solid #1d4ed8",
                    background:
                      "radial-gradient(circle at top, #1e3a8a, #020617)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {roleLabel(crew.me?.user_id, crew, members)}
                </div>
                {mySharePercent != null && (
                  <div
                    className="muted"
                    style={{ fontSize: 13, marginTop: 6 }}
                  >
                    Reparto:{" "}
                    <strong>{mySharePercent.toFixed(2)}%</strong>
                  </div>
                )}
                {crew.is_captain && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  >
                    <div className="muted">Código de invitación:</div>
                    <div
                      style={{
                        marginTop: 2,
                        fontFamily: "monospace",
                        fontSize: 14,
                      }}
                    >
                      {crew.join_code || "—"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={handleLeaveCrew}
                disabled={busy}
                className="btn ghost"
              >
                Salir de la tripulación
              </button>
            </div>
          </div>

          {/* Lista de miembros */}
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>
              Miembros de la tripulación
            </h3>
            {members.length === 0 && (
              <p className="muted">No hay miembros en esta tripulación.</p>
            )}
            {members.length > 0 && (
              <div className="ledger-table-wrap">
                <div className="ledger-table-scroll">
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>Pirata</th>
                        <th>Rol</th>
                        <th>% reparto</th>
                        {crew.is_captain && (
                          <th style={{ width: 80 }}>Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => {
                        const isCaptain = m.user_id === crew.captain_id;
                        const roleText = roleLabel(m.user_id, crew, members);

                        const rawDraft = sharesDraft[m.user_id];
                        let effectiveShare = null;
                        if (typeof m.share_percent === "number") {
                          effectiveShare = m.share_percent;
                        } else if (rawDraft != null && rawDraft !== "") {
                          const num = Number.parseFloat(rawDraft);
                          if (Number.isFinite(num)) effectiveShare = num;
                        }

                        const share =
                          typeof effectiveShare === "number"
                            ? `${effectiveShare.toFixed(2)}%`
                            : "—";

                        return (
                          <tr key={m.user_id}>
                            <td>{displayPirate(m)}</td>
                            <td>
                              {isCaptain ? (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    border: "1px solid #facc15",
                                    background:
                                      "radial-gradient(circle at top, #78350f, #020617)",
                                    fontSize: 11,
                                  }}
                                >
                                  Capitán
                                </span>
                              ) : crew.is_captain ? (
                                <select
                                  value={roleDraft[m.user_id] || "member"}
                                  onChange={(e) =>
                                    handleChangeMemberRole(
                                      m.user_id,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    background: "#020617",
                                    color: "#e5e7eb",
                                    borderRadius: 6,
                                    border: "1px solid #1f2937",
                                    padding: "2px 6px",
                                    fontSize: 12,
                                  }}
                                >
                                  {/* Opciones de rol se cargan del backend por code,
                                      aquí solo usamos lo que venga en roleDraft */}
                                  <option value="member">Miembro</option>
                                  <option value="first_officer">
                                    Primer oficial
                                  </option>
                                  <option value="navigator">Navegante</option>
                                  <option value="cook">Cocinero</option>
                                  <option value="shipwright">
                                    Carpintero de barcos
                                  </option>
                                  <option value="gunner">Artillero</option>
                                  <option value="doctor">Médico</option>
                                  <option value="rigger">Aparejador</option>
                                  <option value="helmsman">Timonel</option>
                                  <option value="lookout">Vigía</option>
                                  <option value="chronicler">Cronista</option>
                                  <option value="scholar">Erudito</option>
                                  <option value="cabin_boy">Grumete</option>
                                  <option value="blacksmith">Herrero</option>
                                  <option value="infantry">Infantería</option>
                                  <option value="merchant">Mercader</option>
                                  <option value="musician">Músico</option>
                                  <option value="quartermaster">
                                    Oficial de intendencia
                                  </option>
                                  <option value="tailor">Sastre</option>
                                  <option value="second_officer">
                                    Segundo de a bordo
                                  </option>
                                  <option value="cooper">Tonelero</option>
                                  <option value="janitor">Conserje</option>
                                  <option value="pet">Mascota</option>
                                </select>
                              ) : (
                                roleText
                              )}
                            </td>
                            <td>{share}</td>
                            {crew.is_captain && (
                              <td>
                                {!isCaptain && (
                                  <button
                                    type="button"
                                    className="btn ghost"
                                    style={{
                                      fontSize: 12,
                                      padding: "4px 8px",
                                    }}
                                    onClick={() =>
                                      handleKickMember(m.user_id)
                                    }
                                    disabled={busy}
                                  >
                                    Expulsar
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Configurar reparto (solo capitán) */}
          {crew.is_captain && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 4 }}>
                Configurar reparto de botín
              </h3>
              <p className="muted" style={{ marginBottom: 10 }}>
                Sube o baja el porcentaje de cada pirata. Lo que sobre (hasta
                100%) se asigna automáticamente al{" "}
                <strong>capitán</strong>. La suma total es siempre{" "}
                <strong>100%</strong>.
              </p>

              {members.length === 0 && (
                <p className="muted">
                  Invita al menos a un miembro más para configurar el reparto.
                </p>
              )}

              {members.length > 0 && (
                <>
                  <div className="ledger-table-wrap">
                    <div className="ledger-table-scroll">
                      <table className="ledger-table">
                        <thead>
                          <tr>
                            <th>Pirata</th>
                            <th>Rol</th>
                            <th style={{ width: 140 }}>% reparto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m) => {
                            const isCaptainRow =
                              m.user_id === crew.captain_id;
                            const raw = sharesDraft[m.user_id] ?? "";
                            let displayValue = raw;
                            let invalid = false;

                            if (isCaptainRow) {
                              const capShare =
                                captainShareLive != null
                                  ? captainShareLive
                                  : 0;
                              displayValue = capShare.toFixed(2);
                            } else {
                              const num = Number.parseFloat(raw);
                              invalid =
                                raw !== "" &&
                                (!Number.isFinite(num) || num < 0);
                            }

                            return (
                              <tr key={m.user_id}>
                                <td>{displayPirate(m)}</td>
                                <td>{roleLabel(m.user_id, crew, members)}</td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={displayValue}
                                    disabled={isCaptainRow}
                                    onChange={(e) => {
                                      const vStr = e.target.value;
                                      if (isCaptainRow) return;

                                      setSharesDraft((prev) => {
                                        const next = { ...prev };

                                        let vNum = Number.parseFloat(vStr);
                                        if (
                                          !Number.isFinite(vNum) ||
                                          vNum < 0
                                        )
                                          vNum = 0;

                                        // suma de otros miembros distintos a capitán y a este
                                        let sumOthersExcl = 0;
                                        members.forEach((mm) => {
                                          if (
                                            mm.user_id === crew.captain_id ||
                                            mm.user_id === m.user_id
                                          )
                                            return;
                                          const otherRaw =
                                            prev[mm.user_id] ?? "0";
                                          const otherNum =
                                            Number.parseFloat(otherRaw);
                                          if (
                                            Number.isFinite(otherNum) &&
                                            otherNum >= 0
                                          ) {
                                            sumOthersExcl += otherNum;
                                          }
                                        });

                                        const maxForThis = Math.max(
                                          0,
                                          100 - sumOthersExcl
                                        );
                                        if (vNum > maxForThis)
                                          vNum = maxForThis;

                                        next[m.user_id] =
                                          vNum.toFixed(2);

                                        return next;
                                      });

                                      setLastShareEditAt(Date.now());
                                    }}
                                    style={{
                                      width: "100%",
                                      textAlign: "right",
                                      background: "#020617",
                                      color: "#e5e7eb",
                                      borderRadius: 6,
                                      border: invalid
                                        ? "1px solid #b91c1c"
                                        : "1px solid #1f2937",
                                      padding: "4px 8px",
                                      fontSize: 13,
                                      opacity: isCaptainRow ? 0.8 : 1,
                                      cursor: isCaptainRow
                                        ? "default"
                                        : "text",
                                    }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div
                    className="row"
                    style={{
                      marginTop: 12,
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        className="muted"
                        style={{
                          fontSize: 13,
                          color:
                            sumIs100 && !hasInvalidNumber
                              ? "#4ade80"
                              : "#fecaca",
                        }}
                      >
                        Suma actual:{" "}
                        <strong>{totalRounded.toFixed(2)}%</strong>
                        {!sumIs100 && " (debe ser 100%)"}
                      </div>
                      <div
                        className="muted"
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                          opacity: 0.8,
                        }}
                      >
                        Consejo: sube o baja a tus piratas sin preocuparte por
                        las matemáticas; el juego ajusta automáticamente el
                        porcentaje del capitán.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveShares}
                      disabled={!canSaveShares}
                    >
                      {savingShares ? "Guardando…" : "Guardar reparto"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
