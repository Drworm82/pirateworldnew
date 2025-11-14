// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold mb-3">PirateWorld</h1>
      <p className="mb-2">
        Bienvenido al panel de pruebas de PirateWorld. 👋
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
        <li>
          Ve a <strong>Demo usuario</strong> para crear/cargar un pirata y
          probar anuncios y compras de parcelas.
        </li>
        <li>
          Ve a <strong>Mis parcelas</strong> para listar tus parcelas compradas.
        </li>
        <li>
          Ve a <strong>Mapa</strong> para ver tus parcelas en el mapa Leaflet.
        </li>
        <li>
          Ve a <strong>Movimientos</strong> para ver el ledger (historial de
          cambios de saldo).
        </li>
      </ul>
    </div>
  );
}
