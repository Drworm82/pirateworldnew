// UI de verificación para ECO-01 v0.1.2
// Renderiza un botón para sembrar + cerrar, y una tabla con validaciones.
// Ruta sugerida: /#/eco01

import { useState } from "react";
import { eco01SeedAndClose } from "../lib/economyApi";

export default function Eco01Runner() {
  const [rows, setRows] = useState([]);
  const [checks, setChecks] = useState({ revenue: 0, cap95: 0, totalPaid: 0, ok95: true });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleRun() {
    setLoading(true);
    setErr(null);
    try {
      const { rows, checks } = await eco01SeedAndClose({ revenueUsd: 20.0 });
      setRows(rows);
      setChecks(checks);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">ECO-01 · Runner</h1>
        <button
          onClick={handleRun}
          className="px-4 py-2 rounded-xl border shadow-sm hover:bg-gray-50"
          disabled={loading}
          aria-busy={loading ? "true" : "false"}
        >
          {loading ? "Procesando…" : "Sembrar + Cerrar hoy"}
        </button>
      </header>

      {err && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          {err.message || String(err)}
        </p>
      )}

      <section className="mb-6">
        <h2 className="font-medium mb-2">Pool diario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Card label="Ingreso (USD)" value={fmt(checks.revenue)} />
          <Card label="Cap 95% (USD)" value={fmt(checks.cap95)} />
          <Card label="Pagado total (USD)" value={fmt(checks.totalPaid)} />
          <Card label="Check 95%" value={checks.ok95 ? "OK ≤ 95%" : "VIOLA 95%"} ok={checks.ok95} />
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Pagos de hoy</h2>
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Email</Th>
                <Th className="text-right">Requested</Th>
                <Th className="text-right">Scaled</Th>
                <Th className="text-right">Pagado</Th>
                <Th className="text-right">Scale</Th>
                <Th>Cap $2/día</Th>
                <Th className="text-right">Paid 7d</Th>
                <Th>Cap $50/sem</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const okDaily = r.paid <= 2.0;
                const okWeekly = r.paid7 <= 50.0;
                return (
                  <tr key={r.email} className="border-t">
                    <Td>{r.email}</Td>
                    <Td num>{fmt(r.requested)}</Td>
                    <Td num>{fmt(r.scaled)}</Td>
                    <Td num>{fmt(r.paid)}</Td>
                    <Td num>{fmt(r.globalScale)}</Td>
                    <Td>
                      <Badge ok={okDaily}>{okDaily ? "OK ≤ $2" : "VIOLA $2"}</Badge>
                    </Td>
                    <Td num>{fmt(r.paid7)}</Td>
                    <Td>
                      <Badge ok={okWeekly}>{okWeekly ? "OK ≤ $50" : "VIOLA $50"}</Badge>
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-center py-6 text-gray-500">
                    Pulsa “Sembrar + Cerrar hoy” para generar y validar pagos.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function fmt(n) {
  const v = Number(n || 0);
  return v.toFixed(6);
}

function Card({ label, value, ok }) {
  return (
    <div className={`rounded-xl border p-3 ${ok === false ? "border-red-300" : ""}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "", num = false, colSpan }) {
  return (
    <td className={`px-3 py-2 ${num ? "text-right tabular-nums" : ""} ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
function Badge({ children, ok = true }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {children}
    </span>
  );
}
