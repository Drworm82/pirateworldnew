// src/pages/BancoMundial.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function BancoMundial() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Banco Mundial</h1>

      {/* Estado económico */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Estado de la economía</h2>
        <p className="text-sm">
          Hoy la economía está: <strong>(placeholder)</strong>
        </p>
        <p className="text-sm opacity-70">
          Indicador de inflación: (placeholder)
        </p>
      </section>

      {/* Tasas */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Tasas actuales</h2>

        <ul className="text-sm space-y-1">
          <li>Compra: 1 USD = 100 doblones</li>
          <li>Retiro: (placeholder) doblones = 1 USD</li>
        </ul>
      </section>

      {/* Gráfico */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Evolución económica</h2>
        <div
          className="flex items-center justify-center text-sm opacity-70"
          style={{ height: 180 }}
        >
          Gráfico económico (placeholder)
        </div>
      </section>

      {/* Acciones */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Acciones</h2>

        <div className="flex flex-col gap-2 text-sm">
          <button className="border rounded px-2 py-1">
            Comprar doblones (placeholder)
          </button>
          <button className="border rounded px-2 py-1">
            Retirar a USD (placeholder)
          </button>
        </div>
      </section>
    </div>
  );
}
