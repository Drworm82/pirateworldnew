// src/pages/TilesDemo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { cellsNear, buyParcel } from "../lib/supaApi.js";
import PurchaseOverlay from "../components/PurchaseOverlay.jsx";

const COLS = 16, ROWS = 10, STEP_DEG = 0.001, MATCH_EPS = STEP_DEG/2;

export default function TilesDemo() {
  const [center, setCenter] = useState({ lat: 19.4326, lng: -99.1332 });
  const [tilesDB, setTilesDB] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Listo.");
  const [userId, setUserId] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("last_user_id");
    if (uid) setUserId(uid);
  }, []);

  async function loadFromDB() {
    try {
      setBusy(true);
      setStatus("Cargando parcelas cercanas…");
      const data = await cellsNear(center.lat, center.lng, 2000, 200);
      setTilesDB(data || []);
      setStatus(`Parcelas encontradas: ${data?.length ?? 0}`);
    } catch (e) {
      console.error(e);
      setTilesDB([]);
      setStatus("Error al cargar parcelas: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { loadFromDB(); }, [center.lat, center.lng]);

  // vista compacta (grid pequeño) para la página
  const gridSmall = useMemo(() => {
    const db = tilesDB || [];
    const lat0 = center.lat + (ROWS / 2 - 0.5) * STEP_DEG;
    const lng0 = center.lng - (COLS / 2 - 0.5) * STEP_DEG;

    function match(lat,lng){
      return db.find(t => t.y!=null && t.x!=null &&
        Math.abs(t.y-lat)<=MATCH_EPS && Math.abs(t.x-lng)<=MATCH_EPS);
    }
    const out=[];
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const lat = lat0 - r*STEP_DEG;
        const lng = lng0 + c*STEP_DEG;
        const m = match(lat,lng);
        out.push({ key:`${r}-${c}`, lat,lng, owner:m?.owner_id, mine:(m?.owner_id===userId) });
      }
    }
    return out;
  }, [tilesDB, center, userId]);

  function colorOf(cell){
    if(!cell.owner) return "#22c55e";       // libre
    if(cell.mine) return "#3b82f6";         // tuya
    return "#4b5563";                       // ocupada
  }

  async function buyAt(lat,lng){
    if(!userId) { alert("Primero crea/carga tu usuario en «Demo usuario»."); return; }
    const ok = confirm(`¿Comprar por 100 doblones?\n(${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    if(!ok) return;
    try{
      setBusy(true); setStatus("Comprando parcela…");
      const res = await buyParcel(userId, lng, lat, 100);
      alert(JSON.stringify(res,null,2));
      await loadFromDB();
      setStatus("Compra completada ✅");
    }catch(e){
      console.error(e); alert("Error: "+e.message); setStatus("Error al comprar.");
    }finally{ setBusy(false); }
  }

  return (
    <section className="card">
      <h3>Mapa de parcelas</h3>
      <p className="muted">
        <span style={{color:"#22c55e"}}>■</span> Libres ·{" "}
        <span style={{color:"#3b82f6"}}>■</span> Tuyas ·{" "}
        <span style={{color:"#4b5563"}}>■</span> Ocupadas
      </p>

      <div className="row" style={{gap:8, marginBottom:8}}>
        <button className="btn" onClick={loadFromDB} disabled={busy}>🔄 Recargar parcelas</button>
        <button className="btn" onClick={()=>setShowOverlay(true)} disabled={busy}>🗺️ Modo compra</button>
        <button className="btn ghost" onClick={()=>setCenter({lat:19.4326, lng:-99.1332})}>📍 Centrar CDMX</button>
      </div>

      {/* grid pequeño embebido */}
      <div
        style={{
          display:"grid",
          gridTemplateColumns:`repeat(${COLS}, 24px)`,
          gap:"4px",
          background:"#000", padding:8, borderRadius:8, width:"min-content"
        }}
      >
        {gridSmall.map(cell=>(
          <div
            key={cell.key}
            title={`(${cell.lat.toFixed(5)}, ${cell.lng.toFixed(5)})`}
            style={{
              width:24, height:24, borderRadius:4,
              background: colorOf(cell),
              boxShadow:"0 0 4px rgba(0,0,0,.4)"
            }}
          />
        ))}
      </div>

      <pre className="pre" style={{marginTop:12, maxHeight:220, overflow:"auto"}}>
        {JSON.stringify(tilesDB, null, 2)}
      </pre>
      <p className="muted">{status}</p>

      {showOverlay && (
        <PurchaseOverlay
          center={center}
          tilesDB={tilesDB}
          userId={userId}
          onBuy={(lat,lng)=>buyAt(lat,lng)}
          onClose={()=>setShowOverlay(false)}
        />
      )}
    </section>
  );
}
