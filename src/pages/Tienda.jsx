// src/pages/Tienda.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function Tienda() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tienda pirata</h1>

      {/* Saldo */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <p className="text-sm">
          Saldo actual: <strong>(placeholder) doblones</strong>
        </p>
      </section>

      {/* Categorías */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Categorías</h2>

        <div className="flex gap-2 flex-wrap text-sm">
          <button className="px-2 py-1 border rounded">Cosméticos</button>
          <button className="px-2 py-1 border rounded">Objetos</button>
          <button className="px-2 py-1 border rounded">Especiales</button>
        </div>
      </section>

      {/* Lista de objetos */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Objetos disponibles</h2>

        <div className="text-sm opacity-70 mb-4">
          No hay objetos configurados en la tienda.
        </div>

        {/* Ejemplo placeholder */}
        <div className="opacity-50 text-sm">
          [Aquí se mostrarán cartas de objetos con precio y botón Comprar]
        </div>
      </section>
    </div>
  );
}
