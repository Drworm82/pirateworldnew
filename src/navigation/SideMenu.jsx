// src/navigation/SideMenu.jsx
export default function SideMenu() {
  function go(path) {
    window.location.hash = path;
  }

  return (
    <aside className="p-2 border-b border-gray-700">
      <button onClick={() => go("/ui/tripulacion")}>Tripulación</button>{" "}
      <button onClick={() => go("/ui/misiones")}>Misiones</button>{" "}
      <button onClick={() => go("/ui/perfil")}>Perfil</button>
    </aside>
  );
}
