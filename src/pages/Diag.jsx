// src/pages/Diag.jsx
// Página de diagnóstico con botón “Ver anuncio (+1)”
// Flujo: ads_request_token → esperar 2s → ads_verify_token → refrescar saldo
// Normaliza ok de BE (true | "true" | "t" | 1) y éxito por delta de saldo.

import { useEffect, useRef, useState } from 'react';
import {
  isConfigured, saveRuntimeEnv,
  ensureUser, getUserState,
  adsRequestToken, adsVerifyToken,
} from '../lib/supaApi';

const DEFAULT_EMAIL = 'worm_jim@hotmail.com';

// ────────────── UI helpers ──────────────
const card = (extra={}) => ({ background:'#111722', padding:12, borderRadius:12, border:'1px solid #1f2937', ...extra });
const box  = (extra={}) => ({ background:'#0f1420', padding:12, borderRadius:10, border:'1px solid #1f2937', ...extra });
const row  = (extra={}) => ({ display:'flex', gap:8, alignItems:'center', ...extra });
const muted = { color:'#9aa6b2' };
const Big = ({children}) => <div style={{fontSize:36,fontWeight:800,margin:'8px 0'}}>{children}</div>;

const Pill = ({ status }) => {
  const map = {
    idle:  { text: 'Listo',        bg: '#0b3a2e', bd: '#134e4a' },
    req:   { text: 'Solicitando',  bg: '#1e293b', bd: '#334155' },
    play:  { text: 'Viendo…',      bg: '#1e293b', bd: '#334155' },
    ver:   { text: 'Verificando',  bg: '#1e293b', bd: '#334155' },
    ok:    { text: '¡+1 doblón!',  bg: '#0a2f19', bd: '#14532d' },
    fail:  { text: 'Falló',        bg: '#3b0a0a', bd: '#7f1d1d' },
  }[status] ?? { text: '—', bg: '#1f2937', bd: '#374151' };
  return (
    <span style={{ display:'inline-block', padding:'4px 10px', borderRadius:999,
      background: map.bg, border:`1px solid ${map.bd}`, fontSize:12 }}>
      {map.text}
    </span>
  );
};

const Toast = ({ kind='info', message, onClose }) => {
  const colors = {
    info:    { bg:'#0b1220', bd:'#334155', fg:'#e6edf3' },
    success: { bg:'#0a2f19', bd:'#14532d', fg:'#e6ffef' },
    error:   { bg:'#2b0f13', bd:'#7f1d1d', fg:'#ffe6e6' },
  }[kind];
  if (!message) return null;
  return (
    <div role="status" aria-live="polite" style={{
      position:'fixed', right:16, bottom:16, zIndex:50, maxWidth:420,
      background:colors.bg, color:colors.fg, border:`1px solid ${colors.bd}`,
      borderRadius:12, padding:'12px 14px', boxShadow:'0 6px 20px rgba(0,0,0,.35)'
    }}>
      <div style={{display:'flex', gap:10, alignItems:'start'}}>
        <div style={{fontSize:18}}>{kind === 'success' ? '✅' : kind === 'error' ? '❌' : 'ℹ️'}</div>
        <div style={{flex:1}}>{message}</div>
        <button onClick={onClose}
          style={{background:'transparent', color:colors.fg, border:'none', cursor:'pointer', fontSize:18}}
          aria-label="Cerrar notificación">×</button>
      </div>
    </div>
  );
};

// ────────────── Setup (runtime env) ──────────────
function SetupCard() {
  const [url,setUrl]=useState(localStorage.getItem('VITE_SUPABASE_URL')||'');
  const [key,setKey]=useState(localStorage.getItem('VITE_SUPABASE_ANON_KEY')||'');
  const [msg,setMsg]=useState('');
  return(
    <div style={{padding:16,maxWidth:720,margin:'0 auto',color:'#e6edf3',background:'#0b0f14',minHeight:'100vh'}}>
      <h1 style={{marginTop:0}}>Pirate World · Setup</h1>
      <p style={muted}>Faltan variables de entorno de Supabase.</p>
      <div style={card({display:'grid',gap:8})}>
        <label>VITE_SUPABASE_URL</label>
        <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co"
               style={{padding:'10px 12px',borderRadius:8,border:'1px solid #334155',background:'#0b1220',color:'#e6edf3'}}/>
        <label>VITE_SUPABASE_ANON_KEY</label>
        <input value={key} onChange={(e)=>setKey(e.target.value)} placeholder="eyJhbGciOiJI..."
               style={{padding:'10px 12px',borderRadius:8,border:'1px solid #334155',background:'#0b1220',color:'#e6edf3'}}/>
        <div style={row({marginTop:8})}>
          <button onClick={()=>{saveRuntimeEnv(url.trim(),key.trim());setMsg('Guardado. Recarga la página.');}}
                  style={{padding:'10px 14px',borderRadius:8,background:'#101826',color:'#e6edf3',border:'1px solid #334155',cursor:'pointer'}}>Guardar</button>
          <button onClick={()=>location.reload()}
                  style={{marginLeft:'auto',padding:'10px 14px',borderRadius:8,background:'#101826',color:'#e6edf3',border:'1px solid #334155',cursor:'pointer'}}>Recargar</button>
        </div>
        {msg && <p style={{color:'#93c5fd'}}>{msg}</p>}
      </div>
    </div>
  );
}

// ────────────── Página /Diag ──────────────
export default function Diag() {
  if (!isConfigured()) return <SetupCard />;

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [user, setUser]   = useState(null);           // { id, email, soft_coins }
  const [status, setStatus] = useState('Vista de diagnóstico mínima funcionando.');

  const [adStatus, setAdStatus] = useState('idle');   // idle | req | play | ver | ok | fail
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ kind:'info', message:'' });
  const hideTimer = useRef(null);

  const setToastAuto = (kind, message, ms = 3500) => {
    clearTimeout(hideTimer.current);
    setToast({ kind, message });
    if (kind !== 'error') hideTimer.current = setTimeout(() => setToast({ kind:'info', message:'' }), ms);
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const loadUser = async () => {
    setBusy(true);
    try {
      const { user: u, created } = await ensureUser(email.trim());
      setUser(u);
      setStatus(created ? `Usuario creado: ${u.email}` : `Usuario cargado: ${u.email}`);
      setToastAuto('success', 'Usuario cargado/creado correctamente.');
    } catch (e) {
      setStatus('Error: ' + (e.message || e));
      setToast({ kind:'error', message: 'No se pudo cargar/crear el usuario.' });
    } finally {
      setBusy(false);
    }
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const normalizeOk = (ok) => ok === true || ok === 'true' || ok === 't' || ok === 1;

  async function verifyOnce(pEmail, token) {
    return await adsVerifyToken(pEmail, token);
  }

  const refreshBalance = async () => {
    if (!user?.id) return null;
    const fresh = await getUserState({ userId: user.id });
    if (fresh?.soft_coins != null) {
      setUser(u => ({ ...(u ?? {}), soft_coins: fresh.soft_coins, id: fresh.user_id ?? user.id, email: fresh.email ?? user.email }));
    }
    return fresh;
  };

  // Flujo: pedir token → esperar 2s → verificar → si expiró, reintentar 1 vez
  const onWatchAd = async () => {
    if (!user?.email) {
      setToast({ kind:'error', message:'Primero carga o crea el usuario.' });
      return;
    }
    const before = Number(user?.soft_coins ?? 0);

    setAdStatus('req');
    setStatus('Solicitando token…');
    setToast({ kind:'info', message:'' });

    try {
      let tok = await adsRequestToken(user.email);
      if (!tok?.token) throw new Error('No se recibió token.');

      setAdStatus('play');
      setStatus('Reproduciendo anuncio…');
      await sleep(2000); // simular video

      setAdStatus('ver');
      setStatus('Verificando token…');

      let ver = await verifyOnce(user.email, String(tok.token));
      // reintento si el BE dice token inválido/expirado
      if (!normalizeOk(ver?.ok) && (ver?.reason === 'token_expired' || ver?.reason === 'invalid_token')) {
        const tok2 = await adsRequestToken(user.email);
        if (tok2?.token) ver = await verifyOnce(user.email, String(tok2.token));
      }

      // Siempre refrescamos saldo para decidir por delta
      const fresh = await refreshBalance();
      const after = Number(fresh?.soft_coins ?? user?.soft_coins ?? 0);
      const gained = after > before;

      if (normalizeOk(ver?.ok) || gained) {
        setAdStatus('ok');
        setStatus('Anuncio verificado (+1 doblón).');
        setToastAuto('success', '✅ +1 doblón ganado');
      } else {
        setAdStatus('fail');
        setStatus('Verificación fallida.');
        setToast({ kind:'error', message: `❌ ${ver?.reason || 'Token inválido o vencido'}` });
      }
    } catch (e) {
      setAdStatus('fail');
      setStatus('Error en flujo de anuncio.');
      setToast({ kind:'error', message: e?.message || String(e) });
      // Intentamos al menos reflejar saldo actual
      await refreshBalance();
    }
  };

  return (
    <div style={{padding:16,maxWidth:720,margin:'0 auto',color:'#e6edf3',background:'#0b0f14',minHeight:'100vh'}}>
      <h1 style={{margin:0, marginBottom:8}}>Pirate World · Diag</h1>
      <p style={{...muted, marginTop:0}}>{status}</p>

      <div style={row({ marginBottom:12 })}>
        <span style={muted}>Estado del anuncio:</span>
        <Pill status={adStatus}/>
      </div>

      <div style={card()}>
        <label>Email de prueba</label>
        <div style={row()}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            spellCheck={false}
            style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #334155',background:'#0b1220',color:'#e6edf3'}}
          />
          <button onClick={loadUser} disabled={busy}
            style={{padding:'10px 14px',borderRadius:8,background:'#101826',color:'#e6edf3',border:'1px solid #334155',cursor:'pointer',opacity:busy?0.7:1}}>
            {busy ? 'Cargando…' : 'Crear / Cargar'}
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12, marginTop:12}}>
          <div style={box()}>
            <h3 style={{margin:0,marginBottom:8}}>Usuario</h3>
            <pre style={{fontSize:12,whiteSpace:'pre-wrap'}}>{JSON.stringify(user ?? {info:'(sin usuario)'}, null, 2)}</pre>
          </div>

          <div style={box()}>
            <h3 style={{margin:0,marginBottom:8}}>Saldo</h3>
            <Big>{user?.soft_coins ?? 0}</Big>
            <p style={{...muted,margin:'4px 0'}}>1 anuncio = 1 doblón · 100 doblones = 1 parcela</p>
            <div style={{display:'flex', gap:10}}>
              <button onClick={onWatchAd} disabled={!user}
                style={{padding:'10px 14px',borderRadius:8,background:'#0ea5b1',color:'#02212a',border:'1px solid #155e75',cursor:'pointer'}}>
                Ver anuncio (+1)
              </button>
              <button onClick={async ()=>{ setStatus('Refrescando saldo…'); await (async()=>{await (await getUserState({userId:user?.id}))})(); await (async()=>{const fresh=await getUserState({userId:user?.id}); if(fresh?.soft_coins!=null){setUser(u=>({...u,soft_coins:fresh.soft_coins,id:fresh.user_id??u.id,email:fresh.email??u.email}))}})(); setStatus('Saldo actualizado.'); }}
                style={{padding:'10px 14px',borderRadius:8,background:'#101826',color:'#e6edf3',border:'1px solid #334155',cursor:'pointer'}}>
                ⟳ Refrescar saldo
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast kind={toast.kind} message={toast.message} onClose={() => setToast({ kind:'info', message:'' })} />
    </div>
  );
}
