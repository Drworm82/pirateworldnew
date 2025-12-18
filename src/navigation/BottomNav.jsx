// src/navigation/BottomNav.jsx
export default function BottomNav() {
  function go(path) {
    window.location.hash = path;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 p-2 flex justify-around">
      <button onClick={() => go("/ui/inventario")}>Inventario</button>
      <button onClick={() => go("/ui/gps")}>GPS</button>
      <button onClick={() => go("/ui/zarpar")}>Zarpar</button>
      <button onClick={() => go("/ui/mapa")}>Mapa</button>
      <button onClick={() => go("/ui/tienda")}>Tienda</button>
    </nav>
  );
}
