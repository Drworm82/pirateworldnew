import React, { useEffect, useState } from "react";
import { getLastUserId, listMyParcels } from "../lib/supaApi";

export default function MyParcels() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const id = getLastUserId();
    if (!id) { setErr("Primero crea/carga un usuario en 'Demo usuario'."); return; }
    (async () => {
      try {
        const data = await listMyParcels(id);
        setRows(data);
      } catch (e) {
        console.error(e); setErr(String(e.message || e));
      }
    })();
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mis parcelas</h2>
      {err && <div className="mb-4 text-red-300">{err}</div>}
      {!rows && !err && <div>Cargando…</div>}
      {rows && rows.length === 0 && <div>Sin parcelas.</div>}
      {rows && rows.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left opacity-80">
              <th className="py-2">Coord (x,y)</th>
              <th className="py-2">Creada</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-[#1b2a45]">
                <td className="py-2">{Number(r.x).toFixed(4)}, {Number(r.y).toFixed(4)}</td>
                <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
