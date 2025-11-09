// src/pages/Diag.jsx
import { useState } from 'react';
import { isConfigured, saveRuntimeEnv, ensureUser, getUserState } from '../lib/supaApi';

const DEFAULT_EMAIL = 'worm_jim@hotmail.com';
const card = (extra={}) => ({ background:'#111722', padding:12, borderRadius:12, border:'1px solid #1f2937', ...extra });
const row  = (extra={}) => ({ display:'flex', gap:8, alignItems:'center', ...extra });
const muted = { color:'#9aa6b2' };

function SetupCard() {
  const [url, setUrl] = useState(localStorage.getItem('VITE_SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '');
  const [msg, setMsg] = useState('');
  return (
    <div style={{padding:16,maxWidth:720,margin:'0 auto',color:'#e6edf3',background:'#0b0f14',minHeight:'100vh'}}>
      <h1 style={{marginTop:0}}>Pirate World · Setup</h1>
      <p style={muted}>Faltan variables de entorno de Supabase.</p>
      <div style={card({display:'grid',gap:8})}>
        <label>VITE_SUPABASE_URL</label>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co"
               style={{padding:'10px 12px',borderRadius:8,border:'1px solid #334155',background:'#0b1220',color:'#e6edf3'}}/>
        <label>VITE_SUPABASE_ANON_KEY</label>
        <input value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGciOiJI..."
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

export default function Diag() {
  if (!isConfigured()) return <SetupCard />;

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [user, setUser]   = useState(null);
  const [busy, setBusy]   = useState(false);
  const [status, setStatus] = useState('Listo');

  const onLoadOrCreate = async () => {
    setBusy(true);
    setStatus('Solicitando RPC ensure_user…');
    try {
      const { user: u } = await ensureUser(email.trim());
      setUser(u);
      setStatus('Usuario cargado/creado por RPC.');
    } catch (e) {
      setStatus('Error: ' + (e?.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  const onRefreshBalance = async () => {
    if (!user?.email && !email) return;
    setBusy(true);
    setStatus('Actualizando saldo…');
    try {
      const fresh = await getUserState({ email: user?.email || email.trim() });
      if (fresh) {
        setUser((u) => u ? { ...u, id: fresh.user_id ?? u.id, email: fresh.email ?? u.email, soft_coins: fresh.soft_coins } : { id: fresh.user_id, email: fresh.email, soft_coins: fresh.soft_coins });
        setStatus('Saldo actualizado.');
      } else {
        setStatus('Usuario no encontrado.');
      }
    } catch (e) {
      setStatus('Error: ' + (e?.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  const softCoins = user?.soft_coins ?? 0;

  return (
    <div style={{padding:16,maxWidth:720,margin:'0 auto',color:'#e6edf3',background:'#0b0f14',minHeight:'100vh'}}>
      <h1 style={{margin:0, marginBottom:8}}>Pirate World · Diag</h1>
      <p style={{...muted, marginTop:0}}>{status}</p>

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
          <button onClick={onLoadOrCreate} disabled={busy}
            style={{padding:'10px 14px',borderRadius:8,background:'#101826',color:'#e6edf3',border:'1px solid #334155',cursor:'pointer',opacity:busy?0.7:1}}>
            {busy ? 'Cargando…' : 'Crear / Cargar'}
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12, marginTop:12}}>
          <div style={{background:'#0f1420',border:'1px solid #1f2937',borderRadius:10,padding:12}}>
            <h3 style={{margin:0,marginBottom:6}}>Usuario</h3>
            <pre style={{fontSize:12,whiteSpace:'pre-wrap'}}>{JSON.stringify(user ?? { info: '(sin usuario)' }, null, 2)}</pre>
          </div>

          <div style={{background:'#0f1420',border:'1px solid #1f2937',borderRadius:10,padding:12}}>
            <h3 style={{margin:0,marginBottom:6}}>Saldo</h3>
            <div style={{fontSize:36,fontWeight:800,margin:'8px 0'}}>{softCoins}</div>
            <p style={{...muted, margin:'4px 0'}}>1 anuncio = 1 doblón · 100 doblones = 1 parcela</p>
            <button onClick={onRefreshBalance} disabled={busy}
              style={{padding:'10px 14px',borderRadius:8,background:'#101826',color:'#e6edf3',border:'1px solid #334155',cursor:'pointer',opacity:busy?0.7:1}}>
              {busy ? 'Actualizando…' : 'Refrescar saldo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
